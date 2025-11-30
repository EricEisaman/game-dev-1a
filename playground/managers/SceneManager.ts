// ============================================================================
// SCENE MANAGER
// ============================================================================

// /// <reference path="../types/babylon.d.ts" />

import { CONFIG } from '../config/game-config';
import { ASSETS } from '../config/assets';
import { CharacterController } from '../controllers/CharacterController';
import { SmoothFollowCameraController } from '../controllers/SmoothFollowCameraController';
import { EffectsManager } from './EffectsManager';
import { HUDManager } from './HUDManager';
import { CollectiblesManager } from './CollectiblesManager';
import { InventoryManager } from './InventoryManager';
import { NodeMaterialManager } from './NodeMaterialManager';
import { BehaviorManager } from './BehaviorManager';
import { CameraManager } from './CameraManager';
import type { Character } from '../types/character';
import type { Environment, LightConfig, PointLightConfig, DirectionalLightConfig, SpotLightConfig, HemisphericLightConfig, RectangularAreaLightConfig, ColliderType } from '../types/environment';
import { SkyManager } from './SkyManager';
import { OBJECT_ROLE } from '../types/environment';
import type { EffectType } from '../types/effects';

// Animation Groups - Global object for managing player animations
const playerAnimations: Record<string, BABYLON.AnimationGroup | undefined> = {};

export class SceneManager {
    private readonly scene: BABYLON.Scene;
    private readonly camera: BABYLON.TargetCamera;
    private characterController: CharacterController | null = null;
    private smoothFollowController: SmoothFollowCameraController | null = null;
    private currentEnvironment: string = "Level Test"; // Track current environment
    
    // Character caching for performance
    private characterCache: Map<string, BABYLON.AbstractMesh[]> = new Map();
    private currentCharacterName: string | null = null;
    private readonly zeroVector = new BABYLON.Vector3(0, 0, 0);
    
    // Environment lights tracking
    private environmentLights: BABYLON.Light[] = [];
    
    // Default light tracking
    private defaultLight: BABYLON.HemisphericLight | null = null;

    constructor(engine: BABYLON.Engine, _canvas: HTMLCanvasElement) {
        this.scene = new BABYLON.Scene(engine);
        this.camera = new BABYLON.TargetCamera("camera1", CONFIG.CAMERA.START_POSITION, this.scene);
        
        this.initializeScene();
    }

    private async initializeScene(): Promise<void> {
        this.setupLighting();
        this.setupPhysics();
        this.setupSky();
        await this.setupEffects();
        await this.loadEnvironment("Level Test");
        this.setupCharacter();
        this.loadCharacterModel();
        await this.setupEnvironmentItems();
        
        // Initialize inventory system
        if (this.characterController) {
            InventoryManager.initialize(this.scene, this.characterController);
        }
    }

    private setupLighting(): void {
        this.defaultLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    }

    private setupPhysics(): void {
        const hk = new BABYLON.HavokPlugin(false);
        this.scene.enablePhysics(CONFIG.PHYSICS.GRAVITY, hk);
    }

    private setupSky(): void {
        // Sky will be set up when environment is loaded
    }

    private setupCharacter(): void {
        this.characterController = new CharacterController(this.scene);

        this.smoothFollowController = new SmoothFollowCameraController(
            this.scene,
            this.camera,
            this.characterController.getDisplayCapsule()
        );

        // Connect the character controller to the camera controller
        this.characterController.setCameraController(this.smoothFollowController);
        
        // Initialize CameraManager
        CameraManager.initialize(this.smoothFollowController);
        
        // Initialize HUD
        HUDManager.initialize(this.scene, this.characterController);

        // Initialize Collectibles after character is set up
        CollectiblesManager.initialize(this.scene, this.characterController);
        
        // Initialize BehaviorManager after character is set up
        if (this.characterController) {
            BehaviorManager.initialize(this.scene, this.characterController);
        }
        
        // Force activate smooth follow camera
        this.smoothFollowController.forceActivateSmoothFollow();
    }

    private loadCharacterModel(character?: Character, preservedPosition?: BABYLON.Vector3 | null): void {
        // Load the specified character or the first character from the CHARACTERS array
        const characterToLoad = character ?? ASSETS.CHARACTERS[0];
        this.loadCharacter(characterToLoad, preservedPosition);
    }

    private loadCharacter(character: Character, preservedPosition?: BABYLON.Vector3 | null): void {
        if (!this.characterController) {
            return;
        }

        // Check if character is already cached
        if (this.currentCharacterName === character.name && this.characterCache.has(character.name)) {
            this.activateCachedCharacter(character, preservedPosition);
            return;
        }

        // Disable current character if switching
        if (this.currentCharacterName && this.currentCharacterName !== character.name) {
            this.disableCurrentCharacter();
        }

        // Remove all animation groups from the scene before loading a new character
        this.scene.animationGroups.slice().forEach(group => { group.dispose(); });

        BABYLON.ImportMeshAsync(character.model, this.scene)
            .then(async result => {
                // Process node materials for character meshes
                await NodeMaterialManager.processImportResult(result);

                // Rename the root node to "player" for better organization
                if (result.meshes.length > 0) {
                    // Find the root mesh (the one without a parent)
                    const rootMesh = result.meshes.find(mesh => !mesh.parent);
                    if (rootMesh) {
                        rootMesh.name = "player";
                    }
                }

                if (this.characterController) {
                    // Apply character scale to all meshes
                    result.meshes.forEach(mesh => {
                        mesh.scaling.setAll(character.scale);
                    });

                    // Cache the character meshes
                    this.characterCache.set(character.name, result.meshes);
                    this.currentCharacterName = character.name;

                    this.characterController.setPlayerMesh(result.meshes[0]);

                    // Determine position for new character
                    let characterPosition: BABYLON.Vector3;
                    if (preservedPosition) {
                        // Use preserved position when switching characters
                        characterPosition = preservedPosition;
                    } else {
                        // Use spawn point when loading character for the first time or after environment change
                        const currentEnvironment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
                        characterPosition = currentEnvironment ? currentEnvironment.spawnPoint : new BABYLON.Vector3(0, 0, 0);
                    }

                    // Update character physics with determined position
                    this.characterController.updateCharacterPhysics(character, characterPosition);
                    
                    // Set character rotation only when not preserving position
                    if (!preservedPosition) {
                        const currentEnvironment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
                        const characterRotation = currentEnvironment ? currentEnvironment.spawnRotation : new BABYLON.Vector3(0, 0, 0);
                        this.characterController.setRotation(characterRotation);
                    }

                    // Setup animations using character's animation mapping with fallbacks
                    playerAnimations.walk = result.animationGroups.find(a => a.name === character.animations.walk) ??
                        result.animationGroups.find(a => a.name.toLowerCase().includes('walk')) ??
                        result.animationGroups.find(a => a.name.toLowerCase().includes('run')) ??
                        result.animationGroups.find(a => a.name.toLowerCase().includes('move'));

                    playerAnimations.idle = result.animationGroups.find(a => a.name === character.animations.idle) ??
                        result.animationGroups.find(a => a.name.toLowerCase().includes('idle')) ??
                        result.animationGroups.find(a => a.name.toLowerCase().includes('stand'));

                    // Stop animations initially
                    playerAnimations.walk?.stop();
                    playerAnimations.idle?.stop();

                    // Set character in animation controller
                    this.characterController.animationController.setCharacter(character);

                    // Create particle system attached to player mesh
                    const playerParticleSystem = await EffectsManager.createParticleSystem(CONFIG.EFFECTS.DEFAULT_PARTICLE, result.meshes[0]);
                    if (playerParticleSystem) {
                        this.characterController.setPlayerParticleSystem(playerParticleSystem);
                    }

                    // Set up thruster sound for character controller
                    const thrusterSound = EffectsManager.getSound("Thruster");
                    if (thrusterSound) {
                        this.characterController.setThrusterSound(thrusterSound);
                    }
                }
            })
            .catch(_error => {
                // Ignore character loading errors for playground compatibility
            });
    }

    private async setupEffects(): Promise<void> {
        EffectsManager.initialize(this.scene);
        NodeMaterialManager.initialize(this.scene);
        await EffectsManager.createSound("Thruster");
    }


    public getScene(): BABYLON.Scene {
        return this.scene;
    }

    public getCurrentCharacterName(): string | null {
        return this.currentCharacterName;
    }

    public getCurrentEnvironment(): string {
        return this.currentEnvironment;
    }

    public async loadEnvironment(environmentName: string): Promise<void> {
        // Find the environment by name
        const environment = ASSETS.ENVIRONMENTS.find(env => env.name === environmentName);
        if (!environment) {
            return;
        }

        // Disable character during environment switch
        if (this.characterController) {
            this.characterController.pausePhysics();
            
            // Set character to transition position/rotation if provided
            if (environment.transitionPosition !== undefined) {
                this.characterController.setPosition(environment.transitionPosition);
            }
            if (environment.transitionRotation !== undefined) {
                this.characterController.setRotation(environment.transitionRotation);
            }
            
            // Also hide the character mesh
            const playerMesh = this.characterController.getPlayerMesh();
            if (playerMesh) {
                playerMesh.isVisible = false;
                playerMesh.setEnabled(false);
            }
        }

        // Clear existing environment particles before creating new ones
        EffectsManager.removeEnvironmentParticles();
        // Also clear ambient sounds before switching
        EffectsManager.removeAmbientSounds();
        // Dispose existing environment lights
        this.disposeEnvironmentLights();

        try {
            const result = await BABYLON.ImportMeshAsync(environment.model, this.scene);

            // Process node materials for environment meshes
            await NodeMaterialManager.processImportResult(result);

            // Rename the root node to "environment" for better organization
            if (result.meshes.length > 0) {
                // Find the root mesh (the one without a parent)
                const rootMesh = result.meshes.find(mesh => !mesh.parent);
                if (rootMesh) {
                    rootMesh.name = "environment";
                    if (environment.scale !== 1) {
                        rootMesh.scaling.x = -environment.scale; // invert X-axis to fix handedness
                        rootMesh.scaling.y = environment.scale;
                        rootMesh.scaling.z = environment.scale;
                    }
                }
            }

            // Handle background music crossfade
            try {
                if (environment.backgroundMusic) {
                    await EffectsManager.crossfadeBackgroundMusic(environment.backgroundMusic.url, environment.backgroundMusic.volume, 1000);
                } else {
                    await EffectsManager.stopAndDisposeBackgroundMusic(1000);
                }
            } catch (_error) {
                // Ignore background music errors
            }

            // Set up environment-specific sky if configured
            if (environment.sky !== undefined) {
                try {
                    SkyManager.createSky(this.scene, environment.sky);
                } catch (_error) {
                    // Ignore sky creation errors
                }
            }

            this.setupEnvironmentPhysics(environment);

            // Set up environment-specific lights if configured
            this.setupEnvironmentLights(environment);

            // Set up environment-specific particles if configured
            if (environment.particles) {
                try {
                    for (const particle of environment.particles) {
                        const particleSystem = await EffectsManager.createParticleSystem(particle.name, particle.position);

                        // Apply environment-specific settings if provided
                        if (particleSystem != null && particle.updateSpeed !== undefined) {
                            particleSystem.updateSpeed = particle.updateSpeed;
                        }
                    }
                } catch (_error) {
                    // Ignore particle creation errors
                }
            }

            // Process any existing meshes for node materials
            await NodeMaterialManager.processMeshesForNodeMaterials();

            // Ambient sounds setup (positional, looped)
            if (environment.ambientSounds && environment.ambientSounds.length > 0) {
                try {
                    await EffectsManager.setupAmbientSounds(environment.ambientSounds);
                } catch (_error) {
                    // Ignore ambient sound setup errors
                }
            }

            // Environment items will be set up after character is fully loaded
            // This ensures CollectiblesManager is properly initialized

            // Update current environment tracking
            this.currentEnvironment = environmentName;
            
            // Set up environment items for the new environment
            await this.setupEnvironmentItems();

            // Re-enable character after environment switch is complete
            if (this.characterController) {
                this.characterController.resumePhysics();
                // Also show the character mesh
                const playerMesh = this.characterController.getPlayerMesh();
                if (playerMesh) {
                    playerMesh.isVisible = true;
                    playerMesh.setEnabled(true);
                }
            }

            // Apply environment-specific camera offset if configured
            if (environment.cameraOffset !== undefined) {
                CameraManager.setOffset(environment.cameraOffset);
            }
        } catch (_error) {
            // Ignore environment loading errors for playground compatibility
            // Re-enable character even if there was an error
            if (this.characterController) {
                this.characterController.resumePhysics();
                // Also show the character mesh
                const playerMesh = this.characterController.getPlayerMesh();
                if (playerMesh) {
                    playerMesh.isVisible = true;
                    playerMesh.setEnabled(true);
                }
            }
        }
    }

    private setupEnvironmentPhysics(environment: Environment): void {
        this.setupLightmappedMeshes(environment);
        this.setupPhysicsObjects(environment);
        this.setupJoints(environment);

        // Fallback: If no physics objects or lightmapped meshes are configured,
        // create physics bodies for all environment meshes to prevent falling through
        if (environment.physicsObjects.length === 0 && environment.lightmappedMeshes.length === 0) {
            this.setupFallbackPhysics(environment);
        }
    }

    private setupLightmappedMeshes(environment: Environment): void {
        if (!environment.lightmap) return;
        
        const lightmap = new BABYLON.Texture(environment.lightmap, this.scene);

        environment.lightmappedMeshes.forEach(lightmappedMesh => {
            const mesh = this.scene.getMeshByName(lightmappedMesh.name);
            if (!mesh) return;

            // Add friction to ground meshes - CRITICAL: both objects need friction for it to work
            new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.9 });
            mesh.isPickable = false;

            if (mesh.material != null) {
                if (mesh.material instanceof BABYLON.StandardMaterial) {
                    mesh.material.lightmapTexture = lightmap;
                    mesh.material.useLightmapAsShadowmap = true;
                    // @ts-ignore
                    (mesh.material.lightmapTexture as BABYLON.Texture).uAng = Math.PI;
                    mesh.material.lightmapTexture.level = lightmappedMesh.level;
                    mesh.material.lightmapTexture.coordinatesIndex = 1;
                } else if (mesh.material instanceof BABYLON.PBRMaterial) {
                    mesh.material.lightmapTexture = lightmap;
                    mesh.material.useLightmapAsShadowmap = true;
                    // @ts-ignore
                    (mesh.material.lightmapTexture as BABYLON.Texture).uAng = Math.PI;
                    mesh.material.lightmapTexture.level = lightmappedMesh.level;
                    mesh.material.lightmapTexture.coordinatesIndex = 1;
                }
            }

            mesh.freezeWorldMatrix();
            mesh.doNotSyncBoundingInfo = true;
        });
    }

    private setupPhysicsObjects(environment: Environment): void {
        environment.physicsObjects.forEach(physicsObject => {
            const mesh = this.scene.getMeshByName(physicsObject.name);
            if (mesh) {
                // Apply scaling if specified
                if (physicsObject.scale !== 1) {
                    mesh.scaling.setAll(physicsObject.scale);
                }

                const shapeType = this.getPhysicsShapeType(physicsObject.colliderType);
                const options: { mass: number; friction?: number } = { mass: physicsObject.mass };
                if (physicsObject.friction !== undefined) {
                    options.friction = physicsObject.friction;
                }
                new BABYLON.PhysicsAggregate(mesh, shapeType, options);

                // Apply glow effect if specified
                if (physicsObject.effect === "GLOW" satisfies EffectType && mesh instanceof BABYLON.Mesh) {
                    EffectsManager.applyGlow(mesh);
                }

                // Register behavior if specified
                if (physicsObject.behavior) {
                    BehaviorManager.registerInstance(physicsObject.name, mesh, physicsObject.behavior);
                }
            }
        });
    }

    private getPhysicsShapeType(colliderType: ColliderType | undefined): BABYLON.PhysicsShapeType {
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

    private setupJoints(environment: Environment): void {
        // Find objects with PIVOT_BEAM role
        const pivotBeams = environment.physicsObjects.filter(obj => obj.role === OBJECT_ROLE.PIVOT_BEAM);

        pivotBeams.forEach(pivotBeam => {
            const beamMesh = this.scene.getMeshByName(pivotBeam.name);
            if (!beamMesh) return;
            
            beamMesh.scaling.set(3, 0.05, 1);

            // Find a fixed mass object to attach the hinge to
            // Accept both DYNAMIC_BOX (backward compatibility) and DYNAMIC (generic role)
            const fixedMassObject = environment.physicsObjects.find(obj => 
                (obj.role === OBJECT_ROLE.DYNAMIC_BOX || obj.role === OBJECT_ROLE.DYNAMIC) && obj.mass === 0
            );
            if (!fixedMassObject) return;

            const fixedMesh = this.scene.getMeshByName(fixedMassObject.name);
            if (!fixedMesh) return;

            // Create physics aggregates if they don't exist
            // Add friction to static ground mesh - CRITICAL: both objects need friction for it to work
            const fixedMass = new BABYLON.PhysicsAggregate(fixedMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.9 });
            const beam = new BABYLON.PhysicsAggregate(beamMesh, BABYLON.PhysicsShapeType.BOX, { mass: pivotBeam.mass });

            // Create hinge constraint
            const joint = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0.75, 0, 0),
                new BABYLON.Vector3(-0.25, 0, 0),
                new BABYLON.Vector3(0, 0, -1),
                new BABYLON.Vector3(0, 0, 1),
                this.scene
            );

            fixedMass.body.addConstraint(beam.body, joint);
        });
    }

    private setupFallbackPhysics(_environment: Environment): void {
        // Find the root environment mesh
        const rootEnvironmentMesh = this.scene.getMeshByName("environment");
        if (!rootEnvironmentMesh) return;

        // Collect all meshes in the environment
        const allEnvironmentMeshes: BABYLON.AbstractMesh[] = [];
        const collectMeshes = (mesh: BABYLON.AbstractMesh) => {
            allEnvironmentMeshes.push(mesh);
            mesh.getChildMeshes().forEach(collectMeshes);
        };
        collectMeshes(rootEnvironmentMesh);

        // Create physics bodies for all meshes with geometry
        allEnvironmentMeshes.forEach(mesh => {
            if (mesh instanceof BABYLON.Mesh && mesh.geometry != null && mesh.geometry.getTotalVertices() > 0) {
                // Create a static physics body (mass = 0) for environment geometry
                // Add friction to ground meshes - CRITICAL: both objects need friction for it to work
                // The physics shape will automatically account for the mesh's current scaling
                new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.9 });
                mesh.isPickable = false;
            }
        });
    }

    public async setupEnvironmentItems(): Promise<void> {
        const environment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
        if (environment?.items) {
            try {
                await CollectiblesManager.setupEnvironmentItems(environment);
            } catch (_error) {
                // Ignore setup errors for playground compatibility
            }
        }
    }

    public pausePhysics(): void {
        if (this.characterController) {
            this.characterController.pausePhysics();
        }
    }

    public changeCharacter(characterIndexOrName: number | string): void {
        // Find character by index or name
        let character;
        if (typeof characterIndexOrName === 'number') {
            character = ASSETS.CHARACTERS[characterIndexOrName];
        } else {
            character = ASSETS.CHARACTERS.find(c => c.name === characterIndexOrName);
        }

        if (!character) {
            return;
        }

        // Save current character position before switching
        let currentPosition: BABYLON.Vector3 | null = null;
        if (this.characterController) {
            currentPosition = this.characterController.getPosition().clone();
        }

        // Load the new character with preserved position
        this.loadCharacterModel(character, currentPosition);
    }

    public clearEnvironment(): void {
        // Clear all environment-related meshes
        const environmentMeshes = this.scene.meshes.filter(mesh => 
            mesh.name.includes('environment') || 
            mesh.name.includes('ground') || 
            mesh.name.includes('terrain')
        );
        environmentMeshes.forEach(mesh => {
            mesh.dispose();
        });
    }

    public clearItems(): void {
        // Clear collectibles without disposing of the CollectiblesManager
        CollectiblesManager.clearCollectibles();

        // Also clear any other item meshes that might not be managed by CollectiblesManager
        const itemMeshes = this.scene.meshes.filter(mesh =>
            (mesh.name.startsWith("fallback_") ||
                mesh.name.startsWith("crate_") ||
                mesh.name.startsWith("item_") ||
                mesh.name.includes("collectible") ||
                mesh.name.includes("pickup") ||
                mesh.name.includes("treasure") ||
                mesh.name.includes("coin") ||
                mesh.name.includes("gem") ||
                mesh.name.includes("crystal")) &&
            !mesh.name.includes("player") && // Don't clear player character
            !mesh.name.includes("CharacterDisplay") // Don't clear character display capsule
        );

        itemMeshes.forEach(mesh => {
            // Dispose physics body if it exists
            if ((mesh as any).physicsImpostor) {
                (mesh as any).physicsImpostor.dispose();
            }
            mesh.dispose();
        });
    }

    public clearParticles(): void {
        // Remove only environment-related particle systems
        EffectsManager.removeEnvironmentParticles();

        // Remove only item-related particle systems  
        EffectsManager.removeItemParticles();

        // Also clear any unmanaged particle systems that might not be in EffectsManager
        const particleSystems = this.scene.particleSystems;
        const unmanagedParticleSystems = particleSystems.filter(ps =>
            !ps.name.includes("PLAYER") &&
            !ps.name.includes("player") &&
            !ps.name.includes("character") &&
            !ps.name.includes("thruster") &&
            !ps.name.includes("boost")
        );

        unmanagedParticleSystems.forEach(ps => {
            ps.stop();
            ps.dispose();
        });
    }

    public repositionCharacter(): void {
        if (this.characterController) {
            // Get the current environment's spawn point
            const environment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
            const spawnPoint = environment?.spawnPoint ?? new BABYLON.Vector3(0, 1, 0);
            this.characterController.setPosition(spawnPoint);
        }
    }

    public forceActivateSmoothFollow(): void {
        if (this.smoothFollowController != null) {
            this.smoothFollowController.forceActivateSmoothFollow();
        }
    }

    public resumePhysics(): void {
        if (this.characterController) {
            this.characterController.resumePhysics();
        }
    }

    public isPhysicsPaused(): boolean {
        return this.characterController?.isPhysicsPaused() ?? false;
    }

    public resetToStartPosition(): void {
        if (this.characterController) {
            const environment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
            const spawnPoint = environment?.spawnPoint ?? this.zeroVector;
            this.characterController.setPosition(spawnPoint);
            this.characterController.setVelocity(this.zeroVector);
            this.characterController.resetInputDirection();
        }
    }

    /**
     * Disables the current character by hiding all its meshes
     */
    private disableCurrentCharacter(): void {
        if (this.currentCharacterName && this.characterCache.has(this.currentCharacterName)) {
            const cachedMeshes = this.characterCache.get(this.currentCharacterName)!;
            cachedMeshes.forEach(mesh => {
                mesh.setEnabled(false);
            });
        }
    }

    /**
     * Activates a cached character by showing its meshes and setting up the controller
     */
    private activateCachedCharacter(character: Character, preservedPosition?: BABYLON.Vector3 | null): void {
        if (!this.characterController || !this.characterCache.has(character.name)) return;

        const cachedMeshes = this.characterCache.get(character.name)!;
        
        // Enable all cached meshes
        cachedMeshes.forEach(mesh => {
            mesh.setEnabled(true);
        });

        // Set up the character controller with cached mesh
        this.characterController.setPlayerMesh(cachedMeshes[0]);

        // Determine position for character
        let characterPosition: BABYLON.Vector3;
        if (preservedPosition) {
            // Use preserved position when switching characters
            characterPosition = preservedPosition;
        } else {
            // Use spawn point when loading character for the first time or after environment change
            const currentEnvironment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
            characterPosition = currentEnvironment ? currentEnvironment.spawnPoint : new BABYLON.Vector3(0, 0, 0);
        }

        // Update character physics with determined position
        this.characterController.updateCharacterPhysics(character, characterPosition);
        
        // Set character rotation only when not preserving position
        if (!preservedPosition) {
            const currentEnvironment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
            const characterRotation = currentEnvironment ? currentEnvironment.spawnRotation : new BABYLON.Vector3(0, 0, 0);
            this.characterController.setRotation(characterRotation);
        }

        // Note: Animation groups are handled by the original loadCharacter method
        // For cached characters, we rely on the existing animation setup

        // Set character in animation controller
        this.characterController.animationController.setCharacter(character);
    }

    /**
     * Disposes all environment-specific lights
     */
    private disposeEnvironmentLights(): void {
        // Enable default light before disposing environment lights
        // This ensures default light is available when switching to environment without lights
        if (this.defaultLight !== null) {
            this.defaultLight.setEnabled(true);
        }
        
        for (const light of this.environmentLights) {
            light.dispose();
        }
        this.environmentLights = [];
    }

    /**
     * Creates a light from a LightConfig using discriminated union
     * @param config The light configuration
     * @returns The created light or null if creation failed
     */
    private createLightFromConfig(config: LightConfig): BABYLON.Light | null {
        try {
            let light: BABYLON.Light;

            switch (config.lightType) {
                case "POINT": {
                    light = new BABYLON.PointLight(
                        config.name ?? "PointLight",
                        config.position,
                        this.scene
                    );
                    if (config.range !== undefined) {
                        const pointLight = light;
                        if (pointLight instanceof BABYLON.PointLight) {
                            pointLight.range = config.range;
                        }
                    }
                    if (config.radius !== undefined) {
                        const pointLight = light;
                        if (pointLight instanceof BABYLON.PointLight) {
                            pointLight.radius = config.radius;
                        }
                    }
                    break;
                }
                case "DIRECTIONAL": {
                    light = new BABYLON.DirectionalLight(
                        config.name ?? "DirectionalLight",
                        config.direction,
                        this.scene
                    );
                    break;
                }
                case "SPOT": {
                    light = new BABYLON.SpotLight(
                        config.name ?? "SpotLight",
                        config.position,
                        config.direction,
                        config.angle ?? Math.PI / 3,
                        config.exponent ?? 2,
                        this.scene
                    );
                    if (config.range !== undefined) {
                        const spotLight = light;
                        if (spotLight instanceof BABYLON.SpotLight) {
                            spotLight.range = config.range;
                        }
                    }
                    break;
                }
                case "HEMISPHERIC": {
                    light = new BABYLON.HemisphericLight(
                        config.name ?? "HemisphericLight",
                        config.direction,
                        this.scene
                    );
                    break;
                }
                case "RECTANGULAR_AREA": {
                    light = new BABYLON.RectAreaLight(
                        config.name ?? "RectangularAreaLight",
                        config.position,
                        config.width ?? 1,
                        config.height ?? 1,
                        this.scene
                    );
                    break;
                }
                default: {
                    return null;
                }
            }

            // Apply common properties
            if (config.diffuseColor !== undefined) {
                light.diffuse = config.diffuseColor;
            }
            if (config.intensity !== undefined) {
                light.intensity = config.intensity;
            }
            if (config.specularColor !== undefined) {
                light.specular = config.specularColor;
            }

            return light;
        } catch {
            return null;
        }
    }

    /**
     * Sets up environment-specific lights from configuration
     * @param environment The environment configuration
     */
    private setupEnvironmentLights(environment: Environment): void {
        if (environment.lights && environment.lights.length > 0) {
            // Environment has lights configured - disable default light
            if (this.defaultLight !== null) {
                this.defaultLight.setEnabled(false);
            }
            
            // Create environment lights
            for (const lightConfig of environment.lights) {
                const light = this.createLightFromConfig(lightConfig);
                if (light !== null) {
                    this.environmentLights.push(light);
                }
            }
        } else {
            // Environment has no lights configured - enable default light
            if (this.defaultLight !== null) {
                this.defaultLight.setEnabled(true);
            }
        }
    }

    public dispose(): void {
        if (this.characterController) {
            this.characterController.dispose();
        }
        if (this.smoothFollowController) {
            this.smoothFollowController.dispose();
        }
        
        CameraManager.dispose();
        
        // Dispose cached character meshes
        this.characterCache.forEach(meshes => {
            meshes.forEach(mesh => mesh.dispose());
        });
        this.characterCache.clear();
        
        EffectsManager.removeAllSounds();
        this.scene.dispose();
    }
}
