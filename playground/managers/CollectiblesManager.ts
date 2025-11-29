// ============================================================================
// COLLECTIBLES MANAGER
// ============================================================================

import type { CharacterController } from '../controllers/CharacterController';
import type { Environment, ItemConfig, ItemInstance, ColliderType } from '../types/environment';
import { InventoryManager } from './InventoryManager';
import { InventoryUI } from '../ui/InventoryUI';
import { EffectsManager } from './EffectsManager';
import { BehaviorManager } from './BehaviorManager';
import type { EffectType } from '../types/effects';

export class CollectiblesManager {
    private static scene: BABYLON.Scene | null = null;
    private static characterController: CharacterController | null = null;
    private static collectibles: Map<string, BABYLON.AbstractMesh> = new Map();
    private static collectibleBodies: Map<string, BABYLON.PhysicsAggregate> = new Map();
    private static collectionSound: BABYLON.Sound | null = null;
    private static totalCredits: number = 0;
    private static collectionObserver: BABYLON.Observer<BABYLON.Scene> | null = null;
    private static collectedItems: Set<string> = new Set();
    private static instanceBasis: BABYLON.Mesh | null = null;
    private static itemConfigs: Map<string, ItemConfig> = new Map();
    
    // Tracking for non-collectible physics items
    private static physicsItems: Map<string, BABYLON.AbstractMesh> = new Map();
    private static physicsItemBodies: Map<string, BABYLON.PhysicsAggregate> = new Map();
    
    // Cached particle systems for efficiency
    private static cachedParticleSystem: BABYLON.ParticleSystem | null = null;
    private static particleSystemPool: BABYLON.ParticleSystem[] = [];
    private static readonly MAX_POOL_SIZE = 5;
    private static particleSystemReturnObservers: Map<BABYLON.ParticleSystem, BABYLON.Observer<BABYLON.Scene>> = new Map();

    /**
     * Initializes the CollectiblesManager with a scene and character controller
     */
    public static initialize(scene: BABYLON.Scene, characterController: CharacterController): Promise<void> {
        this.scene = scene;
        this.characterController = characterController;
        this.totalCredits = 0;
        return Promise.resolve();
    }

    /**
     * Sets up environment items for the given environment
     */
    public static async setupEnvironmentItems(environment: Environment): Promise<void> {
        if (!this.scene || !environment.items) {
            return;
        }

        // Clear existing collectibles (dispose instances and instanceBasis)
        this.clearCollectibles();

        // Set up collectibles for this environment
        await this.setupCollectiblesForEnvironment(environment);
    }

    /**
     * Sets up collectibles for a specific environment
     */
    private static async setupCollectiblesForEnvironment(environment: Environment): Promise<void> {
        if (!this.scene || !environment.items) {
            return;
        }

        // Wait for physics to be properly initialized
        await this.waitForPhysicsInitialization();

        // Create collection sound (using default sound for now)
        this.collectionSound = new BABYLON.Sound(
            "collectionSound",
            "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/sounds/effects/collect.m4a",
            this.scene,
            undefined,
            { volume: 0.7 }
        );

        // Iterate through all items in environment
        for (const itemConfig of environment.items) {
            await this.loadItemModel(itemConfig);

            // Create instances for this item
            for (let i = 0; i < itemConfig.instances.length; i++) {
                const instance = itemConfig.instances[i];
                const instanceId = `${itemConfig.name.toLowerCase()}_instance_${i + 1}`;
                
                if (itemConfig.collectible) {
                    // Process as collectible item
                    await this.createCollectibleInstance(instanceId, instance, itemConfig);
                } else {
                    // Process as non-collectible physics item
                    await this.createPhysicsInstance(instanceId, instance, itemConfig);
                }
            }
        }

        // Set up collision detection only for collectible items
        this.setupCollisionDetection();
    }

    /**
     * Waits for physics to be properly initialized
     */
    private static async waitForPhysicsInitialization(): Promise<void> {
        if (!this.scene) return;

        // Physics is initialized synchronously in SceneManager.setupPhysics()
        // before setupEnvironmentItems() is called, so no wait is needed
        return Promise.resolve();
    }

    /**
     * Loads an item model to use as instance basis
     */
    private static async loadItemModel(itemConfig: ItemConfig): Promise<void> {
        if (!this.scene) {
            return;
        }


        try {
            const result = await BABYLON.ImportMeshAsync(itemConfig.url, this.scene);

            // Process node materials for item meshes
            // await NodeMaterialManager.processImportResult(result);

            // Rename the root node for better organization
            if (result.meshes.length > 0) {
                // Find the root mesh (the one without a parent)
                const rootMesh = result.meshes.find(mesh => !mesh.parent);
                if (rootMesh) {
                    rootMesh.name = `${itemConfig.name.toLowerCase()}_basis`;
                    rootMesh.setEnabled(false);
                }
            }

            // Check if any mesh has proper geometry
            const meshWithGeometry = result.meshes.find(mesh => {
                if (mesh instanceof BABYLON.Mesh) {
                    return mesh.geometry != null && mesh.geometry.getTotalVertices() > 0;
                }
                return false;
            });

            if (meshWithGeometry instanceof BABYLON.Mesh) {
                // Use the first mesh with geometry as the instance basis
                this.instanceBasis = meshWithGeometry;

                // Make the instance basis invisible and disable it in the scene
                this.instanceBasis.isVisible = false;
                this.instanceBasis.setEnabled(false);
            } else {
                // If no mesh with geometry found, use the first mesh as fallback
                if (result.meshes.length > 0) {
                    this.instanceBasis = result.meshes[0] as BABYLON.Mesh;
                    this.instanceBasis.isVisible = false;
                    this.instanceBasis.setEnabled(false);
                }
            }
        } catch (_error) {
            // Ignore item loading errors for playground compatibility
        }
    }

    /**
     * Creates a collectible instance from the loaded model
     */
    private static async createCollectibleInstance(id: string, instance: ItemInstance, itemConfig: ItemConfig): Promise<void> {
        if (!this.scene || !this.instanceBasis) {
            return;
        }

        try {
            // Create an instance from the loaded model
            const meshInstance = this.instanceBasis.createInstance(id);

            // Set the mesh name to instanceName if provided, otherwise use the generated ID
            meshInstance.name = instance.instanceName ?? id;

            // Set metadata to mark this as a collectible
            meshInstance.metadata = { isCollectible: true };

            // Remove the instance from its parent to make it independent
            if (meshInstance.parent) {
                meshInstance.setParent(null);
            }

            // Apply instance properties
            meshInstance.position = instance.position;
            meshInstance.scaling.setAll(instance.scale);
            meshInstance.rotation = instance.rotation;

            // Make it visible and enabled
            meshInstance.isVisible = true;
            meshInstance.setEnabled(true);

            // Get the scaled bounding box dimensions after applying instance scaling
            // const boundingBox = meshInstance.getBoundingInfo();
            // const scaledSize = boundingBox.boundingBox.extendSize.scale(2); // Multiply by 2 to get full size

            // Create physics body with appropriate shape type
            const shapeType = this.getPhysicsShapeType(instance.colliderType);
            const options: { mass: number; friction?: number } = { mass: instance.mass };
            if (instance.friction !== undefined) {
                options.friction = instance.friction;
            }
            const physicsAggregate = new BABYLON.PhysicsAggregate(
                meshInstance,
                shapeType,
                options
            );

            // Store references
            this.collectibles.set(id, meshInstance);
            this.collectibleBodies.set(id, physicsAggregate);

            // Store the item config for this collectible
            this.itemConfigs.set(id, itemConfig);

            // Add rotation animation
            this.addRotationAnimation(meshInstance);

            // Apply glow effect if specified
            if (instance.effect === "GLOW" satisfies EffectType && meshInstance instanceof BABYLON.Mesh) {
                EffectsManager.applyGlow(meshInstance);
            }

            // Register behavior if specified
            if (instance.behavior) {
                BehaviorManager.registerInstance(id, meshInstance, instance.behavior);
            }
        } catch (_error) {
            // Ignore collectible creation errors for playground compatibility
        }
    }

    /**
     * Creates a non-collectible physics instance from the loaded model
     */
    private static async createPhysicsInstance(id: string, instance: ItemInstance, itemConfig: ItemConfig): Promise<void> {
        if (!this.scene || !this.instanceBasis) {
            return;
        }

        try {
            // Create an instance from the loaded model
            const meshInstance = this.instanceBasis.createInstance(id);

            // Set the mesh name to instanceName if provided, otherwise use the generated ID
            meshInstance.name = instance.instanceName ?? id;

            // Remove the instance from its parent to make it independent
            if (meshInstance.parent) {
                meshInstance.setParent(null);
            }

            // Apply instance properties
            meshInstance.position = instance.position;
            meshInstance.scaling.setAll(instance.scale);
            meshInstance.rotation = instance.rotation;

            // Make it visible and enabled
            meshInstance.isVisible = true;
            meshInstance.setEnabled(true);

            // Create physics body with appropriate shape type
            const shapeType = this.getPhysicsShapeType(instance.colliderType);
            const options: { mass: number; friction?: number } = { mass: instance.mass };
            if (instance.friction !== undefined) {
                options.friction = instance.friction;
            }
            const physicsAggregate = new BABYLON.PhysicsAggregate(
                meshInstance,
                shapeType,
                options
            );

            // Store references for cleanup
            this.physicsItems.set(id, meshInstance);
            this.physicsItemBodies.set(id, physicsAggregate);

            // Apply glow effect if specified
            if (instance.effect === "GLOW" satisfies EffectType && meshInstance instanceof BABYLON.Mesh) {
                EffectsManager.applyGlow(meshInstance);
            }

            // Register behavior if specified
            if (instance.behavior) {
                BehaviorManager.registerInstance(id, meshInstance, instance.behavior);
            }
        } catch (_error) {
            // Ignore physics item creation errors for playground compatibility
        }
    }

    /**
     * Adds a rotation animation to make collectibles more visible
     */
    private static addRotationAnimation(mesh: BABYLON.AbstractMesh): void {
        if (!this.scene) return;

        const animation = new BABYLON.Animation(
            "rotationAnimation",
            "rotation.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keyFrames = [
            { frame: 0, value: 0 },
            { frame: 30, value: 2 * Math.PI }
        ];

        animation.setKeys(keyFrames);
        mesh.animations = [animation];

        this.scene.beginAnimation(mesh, 0, 30, true);
    }

    /**
     * Sets up collision detection for collectibles
     */
    private static setupCollisionDetection(): void {
        if (!this.scene || !this.characterController) return;

        // Set up collision detection using scene collision observer
        this.collectionObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.checkCollisions();
        });
    }

    /**
     * Checks for collisions between character and collectibles
     */
    private static checkCollisions(): void {
        if (!this.characterController) return;

        const characterPosition = this.characterController.getDisplayCapsule().position;
        const collectionRadius = 1.5; // Default collection radius

        for (const [id, collectible] of this.collectibles) {
            if (this.collectedItems.has(id)) continue;

            const distance = BABYLON.Vector3.Distance(characterPosition, collectible.position);
            if (distance < collectionRadius) {
                this.collectItem(id);
            }
        }
    }

    /**
     * Collects an item and adds it to inventory
     */
    private static collectItem(id: string): void {
        const collectible = this.collectibles.get(id);
        const itemConfig = this.itemConfigs.get(id);
        
        if (collectible == null || itemConfig == null) return;

        // Mark as collected
        this.collectedItems.add(id);

        // Remove physics body from simulation (must be done before disposing)
        const physicsAggregate = this.collectibleBodies.get(id);
        if (physicsAggregate && this.scene) {
            const physicsEngine = this.scene.getPhysicsEngine();
            if (physicsEngine) {
                const havokPlugin = physicsEngine as unknown as BABYLON.HavokPlugin;
                // Remove body from physics engine first
                havokPlugin.removeBody(physicsAggregate.body);
            }
            // Dispose the physics aggregate to free resources
            physicsAggregate.dispose();
            // Clear physics body reference from mesh if it exists
            if ('physicsBody' in collectible && collectible.physicsBody) {
                (collectible as { physicsBody: BABYLON.PhysicsBody | null }).physicsBody = null;
            }
            // Remove from map since it's disposed
            this.collectibleBodies.delete(id);
        }

        // Hide the collectible
        collectible.setEnabled(false);

        // Play collection sound
        if (this.collectionSound) {
            this.collectionSound.play();
        }

        // Show collection effects
        this.showCollectionEffects(collectible.position);

        // Add to inventory only if it's an inventory item
        if (itemConfig.inventory && itemConfig.itemEffectKind && itemConfig.thumbnail) {
            InventoryManager.addItem(itemConfig.name, 1, itemConfig.thumbnail);
            // Refresh inventory UI to show the new item
            InventoryUI.refreshInventory();
        }
        
        // ALWAYS update inventory button opacity after ANY collection
        InventoryUI.updateInventoryButton();

        // Add credits (default to 0 if not specified or if not collectible)
        const creditValue = itemConfig.collectible ? (itemConfig.creditValue ?? 0) : 0;
        this.totalCredits += creditValue;
    }

    /**
     * Creates a reusable particle system template for collection effects
     */
    private static createParticleSystemTemplate(): BABYLON.ParticleSystem {
        if (!this.scene) throw new Error("Scene not initialized");

        const particleSystem = new BABYLON.ParticleSystem("CollectionEffect", 50, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);

        particleSystem.color1 = new BABYLON.Color4(0.5, 0.8, 1, 1); // Baby blue
        particleSystem.color2 = new BABYLON.Color4(0.2, 0.6, 0.9, 1); // Darker baby blue
        particleSystem.colorDead = new BABYLON.Color4(0, 0.3, 0.6, 0); // Fade to dark blue

        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;

        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.8;

        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

        particleSystem.direction1 = new BABYLON.Vector3(-2, -2, -2);
        particleSystem.direction2 = new BABYLON.Vector3(2, 2, 2);

        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.016;

        return particleSystem;
    }

    /**
     * Gets a particle system from the pool or creates a new one
     */
    private static getParticleSystemFromPool(): BABYLON.ParticleSystem | null {
        if (!this.scene) return null;

        // Try to get from pool first
        if (this.particleSystemPool.length > 0) {
            return this.particleSystemPool.pop()!;
        }

        // Create new one if pool is empty
        return this.createParticleSystemTemplate();
    }

    /**
     * Returns a particle system to the pool for reuse
     */
    private static returnParticleSystemToPool(particleSystem: BABYLON.ParticleSystem): void {
        if (this.particleSystemPool.length < this.MAX_POOL_SIZE) {
            particleSystem.stop();
            this.particleSystemPool.push(particleSystem);
        } else {
            particleSystem.dispose();
        }
    }

    /**
     * Shows collection particle effects at the specified position (optimized with pooling)
     */
    private static showCollectionEffects(position: BABYLON.Vector3): void {
        if (!this.scene) return;

        // Get particle system from pool
        const particleSystem = this.getParticleSystemFromPool();
        if (!particleSystem) return;

        // Set position and start
        particleSystem.emitter = position;
        particleSystem.targetStopDuration = 1.0;
        particleSystem.start();

        // Set up observer to return to pool when particle system stops
        // Check approximately every 60 frames (1 second at 60fps)
        let frameCount = 0;
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            frameCount++;
            if (frameCount >= 60) {
                this.scene?.onBeforeRenderObservable.remove(observer);
                this.particleSystemReturnObservers.delete(particleSystem);
                this.returnParticleSystemToPool(particleSystem);
            }
        });
        this.particleSystemReturnObservers.set(particleSystem, observer);
    }

    /**
     * Removes a collectible from the scene
     */
    private static removeCollectible(collectibleId: string): void {
        const mesh = this.collectibles.get(collectibleId);
        const physicsAggregate = this.collectibleBodies.get(collectibleId);

        if (mesh) {
            // Unregister behavior if registered
            BehaviorManager.unregisterInstance(collectibleId);
            
            // Dispose physics body if it exists
            if (physicsAggregate) {
                physicsAggregate.dispose();
                this.collectibleBodies.delete(collectibleId);
            }
            mesh.dispose();
            this.collectibles.delete(collectibleId);
        }
    }

    /**
     * Clears all collectibles and non-collectible physics items
     */
    public static clearCollectibles(): void {
        // Collect all tracked collectible IDs before clearing the map
        const trackedIds = new Set<string>();
        for (const id of this.collectibles.keys()) {
            trackedIds.add(id);
        }

        // Remove all collectibles from the map
        for (const [id, mesh] of this.collectibles.entries()) {
            this.removeCollectible(id);
        }

        // Remove all non-collectible physics items
        for (const [id, mesh] of this.physicsItems.entries()) {
            // Unregister behavior if registered
            BehaviorManager.unregisterInstance(id);
            
            const physicsBody = this.physicsItemBodies.get(id);
            if (physicsBody) {
                physicsBody.dispose();
            }
            mesh.dispose();
        }
        this.physicsItems.clear();
        this.physicsItemBodies.clear();

        // Also manually dispose any collectible meshes that might not be in the map
        // (in case the manager was reinitialized and lost references)
        if (this.scene) {
            const collectibleMeshes = this.scene.meshes.filter(mesh =>
                mesh.metadata && 
                typeof mesh.metadata === 'object' && 
                'isCollectible' in mesh.metadata &&
                mesh.metadata.isCollectible === true &&
                !mesh.name.includes("player") &&
                !mesh.name.includes("CharacterDisplay") &&
                !mesh.name.includes("environment") &&
                !mesh.name.includes("sky") &&
                !mesh.name.includes("basis")
            );

            collectibleMeshes.forEach(mesh => {
                // Dispose physics body if it exists
                if (mesh.physicsImpostor) {
                    mesh.physicsImpostor.dispose();
                }
                mesh.dispose();
            });
        }

        // Clear collections but keep manager initialized
        this.collectibles.clear();
        this.collectibleBodies.clear();
        this.itemConfigs.clear();
        this.collectedItems.clear();
        
        // Stop and dispose any active particle systems from collection effects
        this.particleSystemPool.forEach(ps => {
            ps.stop();
            ps.dispose();
        });
        this.particleSystemPool.length = 0;
        
        // Dispose instance basis (like playground.ts)
        if (this.instanceBasis) {
            this.instanceBasis.dispose();
            this.instanceBasis = null;
        }
        
        // Remove collision detection observer
        if (this.collectionObserver) {
            this.scene?.onBeforeRenderObservable.remove(this.collectionObserver);
            this.collectionObserver = null;
        }
    }

    /**
     * Gets the total credits collected
     */
    public static getTotalCredits(): number {
        return this.totalCredits;
    }

    /**
     * Gets the physics shape type based on collider type
     */
    private static getPhysicsShapeType(colliderType: ColliderType | undefined): BABYLON.PhysicsShapeType {
        if (!colliderType) {
            return BABYLON.PhysicsShapeType.BOX;
        }

        switch (colliderType) {
            case "SPHERE":
                return BABYLON.PhysicsShapeType.SPHERE;
            case "CAPSULE":
                return BABYLON.PhysicsShapeType.CAPSULE;
            case "CYLINDER":
                return BABYLON.PhysicsShapeType.CYLINDER;
            case "CONVEX_HULL":
                return BABYLON.PhysicsShapeType.CONVEX_HULL;
            case "MESH":
                return BABYLON.PhysicsShapeType.MESH;
            case "BOX":
                return BABYLON.PhysicsShapeType.BOX;
        }
    }

    /**
     * Disposes of the CollectiblesManager
     */
    public static dispose(): void {
        this.clearCollectibles();
        if (this.collectionObserver) {
            this.scene?.onBeforeRenderObservable.remove(this.collectionObserver);
            this.collectionObserver = null;
        }

        // Dispose collection sound
        if (this.collectionSound) {
            this.collectionSound.dispose();
            this.collectionSound = null;
        }

        // Dispose cached particle system
        if (this.cachedParticleSystem) {
            this.cachedParticleSystem.dispose();
            this.cachedParticleSystem = null;
        }

        // Remove all particle system return observers
        this.particleSystemReturnObservers.forEach((observer) => {
            this.scene?.onBeforeRenderObservable.remove(observer);
        });
        this.particleSystemReturnObservers.clear();

        // Dispose particle system pool
        this.particleSystemPool.forEach(ps => ps.dispose());
        this.particleSystemPool.length = 0;

        // Dispose the instance basis mesh
        if (this.instanceBasis) {
            this.instanceBasis.dispose();
            this.instanceBasis = null;
        }

        this.scene = null;
        this.characterController = null;
    }
}
