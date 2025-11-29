// ============================================================================
// BEHAVIOR MANAGER
// ============================================================================

import type { CharacterController } from '../controllers/CharacterController';
import type { BehaviorConfig, CheckPeriod, ProximityTriggerConfig } from '../types/behaviors';
import { EffectsManager } from './EffectsManager';

/**
 * Internal tracking structure for behavior instances
 */
interface BehaviorInstance {
    readonly identifier: string;
    readonly mesh: BABYLON.AbstractMesh;
    readonly config: BehaviorConfig;
    behaviorActive: boolean;
    lastCheckTime: number;
}

export class BehaviorManager {
    private static scene: BABYLON.Scene | null = null;
    private static characterController: CharacterController | null = null;
    private static instances: Map<string, BehaviorInstance> = new Map();
    private static updateObserver: BABYLON.Observer<BABYLON.Scene> | null = null;

    /**
     * Initializes the BehaviorManager with a scene and character controller
     */
    public static initialize(scene: BABYLON.Scene, characterController: CharacterController): void {
        this.scene = scene;
        this.characterController = characterController;
        this.instances.clear();
        this.startUpdateLoop();
    }

    /**
     * Registers an instance with a behavior configuration
     */
    public static registerInstance(identifier: string, mesh: BABYLON.AbstractMesh, behaviorConfig: BehaviorConfig): void {
        if (!this.scene) {
            return;
        }

        const instance: BehaviorInstance = {
            identifier,
            mesh,
            config: behaviorConfig,
            behaviorActive: false,
            lastCheckTime: Date.now()
        };

        this.instances.set(identifier, instance);
    }

    /**
     * Unregisters an instance and removes any active behaviors
     */
    public static unregisterInstance(identifier: string): void {
        const instance = this.instances.get(identifier);
        if (instance) {
            if (instance.behaviorActive) {
                this.removeBehavior(instance);
            }
            this.instances.delete(identifier);
        }
    }

    /**
     * Disposes of the BehaviorManager and cleans up all instances
     */
    public static dispose(): void {
        this.stopUpdateLoop();
        
        // Remove all active behaviors
        this.instances.forEach(instance => {
            if (instance.behaviorActive) {
                this.removeBehavior(instance);
            }
        });

        this.instances.clear();
        this.scene = null;
        this.characterController = null;
    }

    /**
     * Starts the update loop that checks trigger conditions
     */
    private static startUpdateLoop(): void {
        if (!this.scene || this.updateObserver) {
            return;
        }

        this.updateObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.updateBehaviors();
        });
    }

    /**
     * Stops the update loop
     */
    private static stopUpdateLoop(): void {
        if (this.updateObserver && this.scene) {
            this.scene.onBeforeRenderObservable.remove(this.updateObserver);
            this.updateObserver = null;
        }
    }

    /**
     * Updates all behavior instances based on their trigger conditions
     */
    private static updateBehaviors(): void {
        if (!this.scene || !this.characterController) {
            return;
        }

        const currentTime = Date.now();

        this.instances.forEach(instance => {
            const shouldCheck = this.shouldCheckInstance(instance, currentTime);
            if (!shouldCheck) {
                return;
            }

            instance.lastCheckTime = currentTime;

            const triggerResult = this.evaluateTrigger(instance);
            
            if (triggerResult && !instance.behaviorActive) {
                this.applyBehavior(instance);
            } else if (!triggerResult && instance.behaviorActive) {
                this.removeBehavior(instance);
            }
        });
    }

    /**
     * Determines if an instance should be checked based on its check period
     */
    private static shouldCheckInstance(instance: BehaviorInstance, currentTime: number): boolean {
        const checkPeriod = this.getCheckPeriod(instance.config);
        
        if (checkPeriod.type === "everyFrame") {
            return true;
        }

        const elapsed = currentTime - instance.lastCheckTime;
        return elapsed >= checkPeriod.milliseconds;
    }

    /**
     * Gets the check period for a behavior config, defaulting to "everyFrame"
     */
    private static getCheckPeriod(config: BehaviorConfig): CheckPeriod {
        if (config.triggerKind === "proximity") {
            return config.checkPeriod ?? { type: "everyFrame" };
        }
        return { type: "everyFrame" };
    }

    /**
     * Evaluates the trigger condition for an instance
     */
    private static evaluateTrigger(instance: BehaviorInstance): boolean {
        if (instance.config.triggerKind === "proximity") {
            return this.evaluateProximityTrigger(instance);
        }
        return false;
    }

    /**
     * Evaluates proximity trigger condition
     */
    private static evaluateProximityTrigger(instance: BehaviorInstance): boolean {
        if (!this.characterController || instance.config.triggerKind !== "proximity") {
            return false;
        }

        const config = instance.config;
        const characterPosition = this.characterController.getPosition();
        const instancePosition = instance.mesh.position;

        const distance = BABYLON.Vector3.Distance(characterPosition, instancePosition);
        return distance <= config.radius;
    }

    /**
     * Applies the behavior to an instance
     */
    private static applyBehavior(instance: BehaviorInstance): void {
        if (instance.config.triggerKind === "proximity") {
            this.applyGlowBehavior(instance);
        }
    }

    /**
     * Applies glow behavior to an instance
     */
    private static applyGlowBehavior(instance: BehaviorInstance): void {
        if (instance.config.triggerKind !== "proximity") {
            return;
        }

        const config: ProximityTriggerConfig = instance.config;
        const edgeColor = config.edgeColor ?? new BABYLON.Color4(1, 0, 0, 1);
        const edgeWidth = config.edgeWidth ?? 5;

        const result = EffectsManager.applyGlow(instance.mesh.name, edgeColor, edgeWidth);
        if (result.success) {
            instance.behaviorActive = true;
        }
    }

    /**
     * Removes the behavior from an instance
     */
    private static removeBehavior(instance: BehaviorInstance): void {
        if (instance.config.triggerKind === "proximity") {
            EffectsManager.removeGlow(instance.mesh.name);
            instance.behaviorActive = false;
        }
    }
}

