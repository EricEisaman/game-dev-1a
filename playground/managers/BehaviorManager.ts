// ============================================================================
// BEHAVIOR MANAGER
// ============================================================================

import type { CharacterController } from '../controllers/CharacterController';
import type { BehaviorConfig, CheckPeriod, ProximityTriggerConfig, BehaviorAction } from '../types/behaviors';
import { EffectsManager } from './EffectsManager';
import { CollectiblesManager } from './CollectiblesManager';
import { switchToEnvironment } from '../utils/switch-environment';

/**
 * Internal tracking structure for behavior instances
 */
interface BehaviorInstance {
    readonly identifier: string;
    readonly mesh: BABYLON.AbstractMesh | null;
    readonly particleSystem: BABYLON.IParticleSystem | null;
    readonly position: BABYLON.Vector3 | null;
    readonly config: BehaviorConfig;
    behaviorActive: boolean;
    lastCheckTime: number;
    lastActionTime: number;
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
    public static registerInstance(
        identifier: string,
        target: BABYLON.AbstractMesh | BABYLON.IParticleSystem,
        behaviorConfig: BehaviorConfig,
        position?: BABYLON.Vector3
    ): void {
        if (!this.scene) {
            return;
        }

        const isMesh = target instanceof BABYLON.AbstractMesh;
        const instance: BehaviorInstance = {
            identifier,
            mesh: isMesh ? target : null,
            particleSystem: isMesh ? null : target,
            position: position ?? null,
            config: behaviorConfig,
            behaviorActive: false,
            lastCheckTime: Date.now(),
            lastActionTime: 0
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
                this.removeEffects(instance);
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
                this.removeEffects(instance);
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
            // Always check trigger every frame to detect enter/leave proximity
            const triggerResult = this.evaluateTrigger(instance);

            if (triggerResult && !instance.behaviorActive) {
                // Entering proximity - apply effects and execute action immediately
                this.applyEffects(instance);
                this.executeActionIfNeeded(instance, currentTime, true);
                instance.behaviorActive = true;
                instance.lastCheckTime = currentTime;
            } else if (triggerResult && instance.behaviorActive) {
                // Already in proximity - execute action based on its own timing
                // Action execution timing is independent of trigger check timing
                this.executeActionIfNeeded(instance, currentTime, false);
                instance.lastCheckTime = currentTime;
            } else if (!triggerResult && instance.behaviorActive) {
                // Leaving proximity - remove effects
                this.removeEffects(instance);
                instance.behaviorActive = false;
            }
        });
    }

    /**
     * Gets the check period for a behavior config, defaulting to "everyFrame"
     */
    private static getCheckPeriod(config: BehaviorConfig): CheckPeriod {
        const proximityConfig: ProximityTriggerConfig = config;
        return proximityConfig.checkPeriod ?? { type: "everyFrame" };
    }

    /**
     * Evaluates the trigger condition for an instance
     */
    private static evaluateTrigger(instance: BehaviorInstance): boolean {
        return this.evaluateProximityTrigger(instance);
    }

    /**
     * Evaluates proximity trigger condition
     */
    private static evaluateProximityTrigger(instance: BehaviorInstance): boolean {
        if (!this.characterController) {
            return false;
        }

        const config: ProximityTriggerConfig = instance.config;
        const characterPosition = this.characterController.getPosition();

        let instancePosition: BABYLON.Vector3;
        if (instance.mesh) {
            instancePosition = instance.mesh.position;
        } else if (instance.position) {
            // Use stored position for particle systems
            instancePosition = instance.position;
        } else if (instance.particleSystem) {
            // Fallback to reading from emitter if position not stored
            const emitter = instance.particleSystem.emitter;
            if (emitter instanceof BABYLON.Vector3) {
                instancePosition = emitter;
            } else if (emitter instanceof BABYLON.AbstractMesh) {
                instancePosition = emitter.position;
            } else {
                return false;
            }
        } else {
            return false;
        }

        const distance = BABYLON.Vector3.Distance(characterPosition, instancePosition);
        const isWithinRadius = distance <= config.radius;

        if (config.triggerOutOfRange === true) {
            return !isWithinRadius;
        }

        return isWithinRadius;
    }

    /**
     * Applies visual effects to an instance (called once when entering proximity)
     */
    private static applyEffects(instance: BehaviorInstance): void {
        const config: ProximityTriggerConfig = instance.config;

        // Apply glow behavior if mesh is available
        if (instance.mesh) {
            const edgeColor = config.edgeColor ?? new BABYLON.Color4(1, 0, 0, 1);
            const edgeWidth = config.edgeWidth ?? 5;
            EffectsManager.applyGlow(instance.mesh.name, edgeColor, edgeWidth);
        }
    }

    /**
     * Removes visual effects from an instance (called when leaving proximity)
     */
    private static removeEffects(instance: BehaviorInstance): void {
        if (instance.mesh) {
            EffectsManager.removeGlow(instance.mesh.name);
        }
    }

    /**
     * Checks if action should execute and executes it if needed
     * Called periodically while in proximity
     * @param forceImmediate If true, execute immediately regardless of check period (for first entry)
     */
    private static executeActionIfNeeded(instance: BehaviorInstance, currentTime: number, forceImmediate: boolean): void {
        const config: ProximityTriggerConfig = instance.config;
        if (!config.action) {
            return;
        }

        const checkPeriod = this.getCheckPeriod(instance.config);

        // Check if action should execute based on check period
        if (checkPeriod.type === "interval") {
            if (forceImmediate) {
                // Execute immediately on first entry into proximity
                this.executeAction(instance, config.action);
                instance.lastActionTime = currentTime;
            } else {
                // Execute periodically based on interval while in proximity
                const elapsed = currentTime - instance.lastActionTime;
                if (elapsed >= checkPeriod.milliseconds) {
                    this.executeAction(instance, config.action);
                    instance.lastActionTime = currentTime;
                }
            }
        } else {
            // For everyFrame, execute every frame while in proximity
            this.executeAction(instance, config.action);
            instance.lastActionTime = currentTime;
        }
    }

    /**
     * Executes an action for a behavior instance
     */
    private static executeAction(_instance: BehaviorInstance, action: BehaviorAction): void {
        if (action.actionType == "adjustCredits") {
            CollectiblesManager.adjustCredits(action.amount);
        } else if (action.actionType == "portal") {
            switchToEnvironment(action.target);
        }
    }
}

