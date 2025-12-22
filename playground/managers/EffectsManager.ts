    // ============================================================================
    // EFFECTS MANAGER
    // ============================================================================

    // /// <reference path="../types/babylon.d.ts" />

    import type { ParticleSnippet } from '../types/effects';
    import type { AmbientSoundConfig } from '../types/environment';
    import { CONFIG } from '../config/game-config';

    /**
     * Result type for glow effect operations
     */
    export type GlowResult = 
        | { success: true; material: null }
        | { success: false; error: string; details?: string };

    export class EffectsManager {
        private static activeParticleSystems: Map<string, BABYLON.IParticleSystem> = new Map();
        private static environmentParticleSystems: Map<string, BABYLON.IParticleSystem> = new Map();
        private static itemParticleSystems: Map<string, BABYLON.IParticleSystem> = new Map();
        private static activeSounds: Map<string, BABYLON.Sound> = new Map();
        private static scene: BABYLON.Scene | null = null;
        private static backgroundMusic: BABYLON.Sound | null = null;
        private static ambientSounds: BABYLON.Sound[] = [];
        private static originalEdgeSettings: Map<string, { width?: number; color?: BABYLON.Color4; enabled?: boolean }> = new Map();

        /**
         * Initializes the EffectsManager with a scene
         * @param scene The Babylon.js scene
         */
        public static initialize(scene: BABYLON.Scene): void {
            this.scene = scene;
        }

        // Fades a sound's volume from -> to over ms; resolves when complete
        private static async fade(sound: BABYLON.Sound, from: number, to: number, ms: number): Promise<void> {
            if (!this.scene || ms <= 0) {
                sound.setVolume(to);
                return Promise.resolve();
            }
            const startTime = Date.now();
            sound.setVolume(from);
            return new Promise<void>((resolve) => {
                if (!this.scene) return Promise.resolve();
                const obs = this.scene.onBeforeRenderObservable.add(() => {
                    const elapsed = Date.now() - startTime;
                    const t = Math.min(1, elapsed / ms);
                    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    const current = from + (to - from) * eased;
                    sound.setVolume(current);
                    if (t >= 1) {
                        if (this.scene) this.scene.onBeforeRenderObservable.remove(obs);
                        resolve();
                    }
                });
            });
        }

        public static async crossfadeBackgroundMusic(url: string, volume: number, fadeMs: number = 1000): Promise<void> {
            if (!this.scene) {
                return;
            }
            // Fade out and dispose existing
            if (this.backgroundMusic) {
                try {
                    await this.fade(this.backgroundMusic, this.backgroundMusic.getVolume(), 0, fadeMs);
                } catch { /* no-op */ }
                this.backgroundMusic.stop();
                this.backgroundMusic.dispose();
                this.backgroundMusic = null;
            }
            // Create new non-positional looping sound
            const bgm = new BABYLON.Sound("environment_bgm", url, this.scene, undefined, {
                loop: true,
                autoplay: true,
                spatialSound: false,
                volume: 0
            });
            this.backgroundMusic = bgm;
            await this.fade(bgm, 0, volume, fadeMs);
        }

        public static async stopAndDisposeBackgroundMusic(fadeMs: number = 1000): Promise<void> {
            if (!this.backgroundMusic) return;
            try {
                await this.fade(this.backgroundMusic, this.backgroundMusic.getVolume(), 0, fadeMs);
            } catch { /* no-op */ }
            this.backgroundMusic.stop();
            this.backgroundMusic.dispose();
            this.backgroundMusic = null;
        }

        public static async setupAmbientSounds(configs: readonly AmbientSoundConfig[]): Promise<void> {
            if (!this.scene) {
                return;
            }
            // Ensure previous are cleared first
            this.removeAmbientSounds();
            for (const cfg of configs) {
                try {
                    const s = new BABYLON.Sound("ambient", cfg.url, this.scene, undefined, {
                        loop: true,
                        autoplay: true,
                        spatialSound: true,
                        volume: cfg.volume
                    });
                    s.setPosition(cfg.position);
                    // Defaults: rollOff=2, maxDistance=40
                    if (typeof s.rolloffFactor === 'number') {
                        s.rolloffFactor = (cfg.rollOff ?? 2);
                    }
                    if (typeof s.maxDistance === 'number') {
                        s.maxDistance = (cfg.maxDistance ?? 40);
                    }
                    this.ambientSounds.push(s);
                } catch (_e) {
                    // Ignore sound loading errors
                }
            }
        }

        public static removeAmbientSounds(): void {
            if (this.ambientSounds.length === 0) return;
            for (const s of this.ambientSounds) {
                try { s.stop(); } catch { /* no-op */ }
                try { s.dispose(); } catch { /* no-op */ }
            }
            this.ambientSounds = [];
        }

        /**
         * Creates a particle system from a snippet by name
         * @param snippetName Name of the particle snippet to create
         * @param emitter Optional emitter (mesh or position) for the particle system
         * @param options Optional configuration including targetStopDuration
         * @returns The created particle system or null if not found
         */
        public static async createParticleSystem(
            snippetName: string, 
            emitter?: BABYLON.AbstractMesh | BABYLON.Vector3,
            options?: { targetStopDuration?: number }
        ): Promise<BABYLON.IParticleSystem | null> {
            if (!this.scene) {
                return null;
            }

            const snippet = CONFIG.EFFECTS.PARTICLE_SNIPPETS.find(s => s.name === snippetName);
            if (!snippet) {
                return null;
            }

            try {
                let particleSystem: BABYLON.IParticleSystem | null = null;

                // Handle different particle system types using discriminated union
                if (snippet.type === "legacy") {
                    // Parse legacy particle system from snippet
                    particleSystem = await BABYLON.ParticleHelper.ParseFromSnippetAsync(snippet.snippetId, this.scene);
                } else if (snippet.type === "nodes") {
                    // Parse node particle system set from snippet
                    const nodeParticleSystemSet = await BABYLON.NodeParticleSystemSet.ParseFromSnippetAsync(snippet.snippetId);
                    const particleSystemSet = await nodeParticleSystemSet.buildAsync(this.scene);
                    particleSystemSet.start();
                    
                    // Get the first particle system from the set to return
                    // Check if systems property exists and has elements
                    if ('systems' in particleSystemSet) {
                        const systemsProperty = particleSystemSet['systems'];
                        if (Array.isArray(systemsProperty) && systemsProperty.length > 0) {
                            const firstSystem = systemsProperty[0];
                            // Verify firstSystem has required IParticleSystem properties
                            if (firstSystem && 
                                'start' in firstSystem && 
                                'stop' in firstSystem && 
                                'emitter' in firstSystem &&
                                'name' in firstSystem) {
                                // TypeScript should accept this as IParticleSystem based on property checks
                                particleSystem = firstSystem;
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }

                if (!particleSystem) {
                    return null;
                }

                if (emitter) {
                    particleSystem.emitter = emitter;
                }

                // Set automatic stop duration if provided
                if (options?.targetStopDuration != null) {
                    particleSystem.targetStopDuration = options.targetStopDuration;
                }

                // Special handling for Magic Sparkles - if it has a mesh emitter, it's for the player
                let usageCategory = this.determineUsageCategory(snippetName, snippet.category);
                if (snippetName === "Magic Sparkles" && emitter && emitter instanceof BABYLON.AbstractMesh) {
                    usageCategory = "PLAYER";
                }

                const descriptiveName = `${snippetName}_${usageCategory}`;

                // Set a descriptive name for the particle system
                particleSystem.name = descriptiveName;

                this.activeParticleSystems.set(descriptiveName, particleSystem);

                // Categorize the particle system based on its usage
                this.categorizeParticleSystem(descriptiveName, particleSystem, snippet.category);

                return particleSystem;
            } catch (_error) {
                return null;
            }
        }

        /**
         * Determines the usage category of a particle system based on its name and category
         * @param snippetName The name of the particle snippet
         * @param category The category of the particle snippet
         * @returns The usage category (ENVIRONMENT, ITEMS, or PLAYER)
         */
        private static determineUsageCategory(snippetName: string, category: ParticleSnippet['category']): string {
            // Environment particles are typically ambient, atmospheric, or background effects
            if (snippetName.includes("environment") ||
                snippetName.includes("ambient") ||
                snippetName.includes("atmosphere") ||
                snippetName.includes("background") ||
                category === "nature") {
                return "ENVIRONMENT";
            }
            // Item particles are typically collection effects, pickups, or item-related
            else if (snippetName.includes("item") ||
                snippetName.includes("collectible") ||
                snippetName.includes("collection") ||
                snippetName.includes("pickup") ||
                (category === "magic" && snippetName !== "Magic Sparkles")) {
                return "ITEMS";
            }
            // Magic Sparkles is special - it can be either ENVIRONMENT (at startup) or PLAYER (for boost)
            // We'll determine this based on whether it has an emitter (player) or not (environment)
            else if (snippetName === "Magic Sparkles") {
                return "ENVIRONMENT"; // Default to environment, will be overridden for player
            }
            // Player particles (boost, thruster, etc.) - default to PLAYER
            else {
                return "PLAYER";
            }
        }

        /**
         * Categorizes a particle system based on its name and category
         * @param name The name of the particle system
         * @param particleSystem The particle system to categorize
         * @param category The category of the particle snippet
         */
        private static categorizeParticleSystem(name: string, particleSystem: BABYLON.IParticleSystem, _category: ParticleSnippet['category']): void {
            // Environment particles are typically ambient, atmospheric, or background effects
            if (name.includes("ENVIRONMENT")) {
                this.environmentParticleSystems.set(name, particleSystem);
            }
            // Item particles are typically collection effects, pickups, or item-related
            else if (name.includes("ITEMS")) {
                this.itemParticleSystems.set(name, particleSystem);
            }
            // Player particles (boost, thruster, etc.) are not categorized - they stay in activeParticleSystems only
            // This ensures they're never disposed by the focused removal methods
        }

        /**
         * Creates a particle system at a specific position
         * @param snippetName Name of the particle snippet
         * @param position Position for the particle system
         * @param options Optional configuration including targetStopDuration
         * @returns The created particle system
         */
        public static async createParticleSystemAt(
            snippetName: string, 
            position: BABYLON.Vector3,
            options?: { targetStopDuration?: number }
        ): Promise<BABYLON.IParticleSystem | null> {
            return this.createParticleSystem(snippetName, position, options);
        }

        /**
         * Stops and removes a particle system by name
         * @param systemName Name of the particle system to remove
         */
        public static removeParticleSystem(systemName: string): void {
            const particleSystem = this.activeParticleSystems.get(systemName);
            if (particleSystem) {
                particleSystem.stop();
                particleSystem.dispose();
                this.activeParticleSystems.delete(systemName);
            }
        }

        /**
         * Stops and removes all active particle systems
         */
        public static removeAllParticleSystems(): void {
            this.activeParticleSystems.forEach((particleSystem, _name) => {
                particleSystem.stop();
                particleSystem.dispose();
            });
            this.activeParticleSystems.clear();
        }

        /**
         * Removes only environment-related particle systems
         */
        public static removeEnvironmentParticles(): void {
            // Remove all cached environment particle systems
            this.environmentParticleSystems.forEach((particleSystem, name) => {
                particleSystem.stop();
                particleSystem.dispose();
                this.activeParticleSystems.delete(name);
            });

            // Clear the environment cache
            this.environmentParticleSystems.clear();
        }

        /**
         * Removes only item/collectible-related particle systems
         */
        public static removeItemParticles(): void {
            // Remove all cached item particle systems
            this.itemParticleSystems.forEach((particleSystem, name) => {
                particleSystem.stop();
                particleSystem.dispose();
                this.activeParticleSystems.delete(name);
            });

            // Clear the item cache
            this.itemParticleSystems.clear();
        }

        /**
         * Adds a particle system to the active systems with a given name
         * @param name The name for the particle system
         * @param particleSystem The particle system to add
         */
        public static addParticleSystem(name: string, particleSystem: BABYLON.IParticleSystem): void {
            this.activeParticleSystems.set(name, particleSystem);
        }

        /**
         * Adds a particle system to the environment category
         * @param name The name for the particle system
         * @param particleSystem The particle system to add
         */
        public static addEnvironmentParticleSystem(name: string, particleSystem: BABYLON.IParticleSystem): void {
            this.activeParticleSystems.set(name, particleSystem);
            this.environmentParticleSystems.set(name, particleSystem);
        }

        /**
         * Adds a particle system to the item category
         * @param name The name for the particle system
         * @param particleSystem The particle system to add
         */
        public static addItemParticleSystem(name: string, particleSystem: BABYLON.IParticleSystem): void {
            this.activeParticleSystems.set(name, particleSystem);
            this.itemParticleSystems.set(name, particleSystem);
        }

        /**
         * Gets all available particle snippet names
         * @returns Array of snippet names
         */
        public static getAvailableSnippets(): string[] {
            return CONFIG.EFFECTS.PARTICLE_SNIPPETS.map(snippet => snippet.name);
        }

        /**
         * Gets particle snippets by category
         * @param category Category to filter by
         * @returns Array of snippet names in the category
         */
        public static getSnippetsByCategory(category: ParticleSnippet['category']): string[] {
            return CONFIG.EFFECTS.PARTICLE_SNIPPETS
                .filter(snippet => snippet.category === category)
                .map(snippet => snippet.name);
        }

        /**
         * Gets particle snippet details by name
         * @param snippetName Name of the snippet
         * @returns Snippet details or null if not found
         */
        public static getSnippetDetails(snippetName: string): ParticleSnippet | null {
            return CONFIG.EFFECTS.PARTICLE_SNIPPETS.find(snippet => snippet.name === snippetName) ?? null;
        }

        /**
         * Gets all active particle systems
         * @returns Map of active particle systems
         */
        public static getActiveParticleSystems(): Map<string, BABYLON.IParticleSystem> {
            return new Map(this.activeParticleSystems);
        }

        /**
         * Pauses all active particle systems
         */
        public static pauseAllParticleSystems(): void {
            this.activeParticleSystems.forEach(particleSystem => {
                particleSystem.stop();
            });
        }

        /**
         * Resumes all active particle systems
         */
        public static resumeAllParticleSystems(): void {
            this.activeParticleSystems.forEach(particleSystem => {
                particleSystem.start();
            });
        }

        /**
         * Creates the default particle system if auto-spawn is enabled
         */
        public static async createDefaultParticleSystem(): Promise<void> {
            if (CONFIG.EFFECTS.AUTO_SPAWN && this.scene) {
                const defaultPosition = new BABYLON.Vector3(-2, 0, -8); // Left of player start
                await this.createParticleSystem(CONFIG.EFFECTS.DEFAULT_PARTICLE, defaultPosition);
            }
        }

        /**
         * Creates a sound effect by name
         * @param soundName Name of the sound effect to create
         * @returns The created sound or null if not found
         */
        public static async createSound(soundName: string): Promise<BABYLON.Sound | null> {
            if (!this.scene) {
                return null;
            }

            const soundConfig = CONFIG.EFFECTS.SOUND_EFFECTS.find(s => s.name === soundName);
            if (!soundConfig) {
                return null;
            }

            try {
                const sound = new BABYLON.Sound(soundName, soundConfig.url, this.scene, undefined, {
                    volume: soundConfig.volume,
                    loop: soundConfig.loop
                });

                // Add basic sound event handling
                sound.onended = () => {
                    // Sound ended
                };

                this.activeSounds.set(soundName, sound);

                return sound;
            } catch (_error) {
                return null;
            }
        }

        /**
         * Plays a sound effect by name
         * @param soundName Name of the sound effect to play
         */
        public static playSound(soundName: string): void {
            const sound = this.activeSounds.get(soundName);
            if (sound && !sound.isPlaying) {
                sound.play();
            }
        }

        /**
         * Stops a sound effect by name
         * @param soundName Name of the sound effect to stop
         */
        public static stopSound(soundName: string): void {
            const sound = this.activeSounds.get(soundName);
            if (sound?.isPlaying === true) {
                sound.stop();
            }
        }

        /**
         * Gets a sound effect by name
         * @param soundName Name of the sound effect
         * @returns The sound or null if not found
         */
        public static getSound(soundName: string): BABYLON.Sound | null {
            return this.activeSounds.get(soundName) ?? null;
        }

        /**
         * Stops and removes all active sounds
         */
        public static removeAllSounds(): void {
            this.activeSounds.forEach((sound, _name) => {
                sound.stop();
                sound.dispose();
            });
            this.activeSounds.clear();

            // Also stop/dispose BGM and ambient managed separately
            if (this.backgroundMusic) {
                try { this.backgroundMusic.stop(); } catch { /* no-op */ }
                try { this.backgroundMusic.dispose(); } catch { /* no-op */ }
                this.backgroundMusic = null;
            }
            this.removeAmbientSounds();
        }

        /**
         * Gets a mesh from an identifier (mesh or string name)
         * @param identifier Mesh or instance name
         * @returns The mesh or null if not found
         */
        private static getMeshFromIdentifier(identifier: BABYLON.Mesh | string): BABYLON.AbstractMesh | null {
            if (!this.scene) {
                return null;
            }

            if (typeof identifier === 'string') {
                // Try getMeshByName first
                let mesh = this.scene.getMeshByName(identifier);
                
                // If not found, search through all meshes in scene (fallback for InstancedMesh)
                if (!mesh && this.scene.meshes) {
                    mesh = this.scene.meshes.find(m => m.name === identifier) || null;
                }
                
                if (!mesh) {
                    return null;
                }
                
                // Check if it's a Mesh instance
                if (mesh instanceof BABYLON.Mesh) {
                    return mesh;
                }
                
                // Check if it's an InstancedMesh (has sourceMesh property)
                // InstancedMesh extends AbstractMesh, not Mesh
                // Edge rendering works on AbstractMesh, so we can return it directly
                if ('sourceMesh' in mesh && mesh["sourceMesh"] !== undefined) {
                    return mesh;
                }
                
                // If it's any other AbstractMesh, return it (edge rendering works on AbstractMesh)
                return mesh;
            }

            if (identifier instanceof BABYLON.Mesh) {
                return identifier;
            }

            return null;
        }


        /**
         * Applies a glow effect to a mesh or instance by name using edge rendering
         * @param identifier Mesh or instance name
         * @param edgeColor Edge color for the glow effect
         * @param edgeWidth Edge width for the glow effect
         * @returns Success result, or error result with details
         */
        public static applyGlow(
            identifier: BABYLON.Mesh | string,
            edgeColor: BABYLON.Color4 = new BABYLON.Color4(1, 0, 0, 1),
            edgeWidth: number = 5
        ): GlowResult {
            if (!this.scene) {
                return { success: false, error: "Scene not initialized", details: "EffectsManager.initialize() must be called first" };
            }

            const meshName = typeof identifier === 'string' ? identifier : identifier.name;
            const mesh = this.getMeshFromIdentifier(identifier);
            if (!mesh) {
                return { success: false, error: "Mesh not found", details: `Mesh with name "${meshName}" not found in scene` };
            }

            try {
                const meshKey = mesh.name;
                
                // Store original edge settings if they exist
                const originalSettings: { width?: number; color?: BABYLON.Color4; enabled?: boolean } = {};
                
                // Detect if edge rendering is already enabled BEFORE we enable it
                // Check if edgesWidth is set and > 0, which indicates edges are enabled
                let edgesWereEnabled = false;
                if ("edgesWidth" in mesh) {
                    const edgesWidthValue = mesh["edgesWidth"];
                    if (typeof edgesWidthValue === "number" && edgesWidthValue > 0) {
                        edgesWereEnabled = true;
                        originalSettings.width = edgesWidthValue;
                    }
                }
                if ("edgesColor" in mesh) {
                    const edgesColorValue = mesh["edgesColor"];
                    if (edgesColorValue instanceof BABYLON.Color4) {
                        originalSettings.color = edgesColorValue.clone();
                    }
                }
                originalSettings.enabled = edgesWereEnabled;
                
                // Store original settings for restoration
                this.originalEdgeSettings.set(meshKey, originalSettings);
                
            // Enable edge rendering on the mesh/instance directly
            mesh.enableEdgesRendering();
                
                // Set edge width
                if ("edgesWidth" in mesh) {
                    mesh["edgesWidth"] = edgeWidth;
                }
                
                // Set edge color
                if ("edgesColor" in mesh) {
                    mesh["edgesColor"] = edgeColor;
                }
                
                return { success: true, material: null };
            } catch (error) {
                // Return detailed error information
                const errorMessage = error instanceof Error ? error.message : String(error);
                return { success: false, error: "Failed to apply glow effect", details: errorMessage };
            }
        }

        /**
         * Removes glow effect from a mesh or instance by name
         * Disables edge rendering and restores original edge settings if any
         * @param identifier Mesh or instance name
         */
        public static removeGlow(identifier: BABYLON.Mesh | string): void {
            if (!this.scene) {
                return;
            }

            const mesh = this.getMeshFromIdentifier(identifier);
            if (!mesh) {
                return;
            }

            try {
                const meshKey = mesh.name;

                // Set edge width to 0 as a safety measure before disabling
                if ("edgesWidth" in mesh) {
                    mesh["edgesWidth"] = 0;
                }

                // ALWAYS disable edge rendering completely
                mesh.disableEdgesRendering();

                // Clean up stored settings if they exist
                if (this.originalEdgeSettings.has(meshKey)) {
                    this.originalEdgeSettings.delete(meshKey);
                }
            } catch {
                // Silently handle errors
            }
        }
    }
