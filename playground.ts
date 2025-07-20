// ============================================================================
// BABYLON.JS PLAYGROUND - CHARACTER CONTROLLER WITH PHYSICS
// ============================================================================

// Configuration Type Definitions
interface CharacterSpeed {
    readonly IN_AIR: number;
    readonly ON_GROUND: number;
    readonly BOOST_MULTIPLIER: number;
}

interface CharacterConfig {
    readonly HEIGHT: number;
    readonly RADIUS: number;
    readonly START_POSITION: BABYLON.Vector3;
    readonly SPEED: CharacterSpeed;
    readonly JUMP_HEIGHT: number;
    readonly ROTATION_SPEED: number;
    readonly ROTATION_SMOOTHING: number;
}

interface CameraConfig {
    readonly START_POSITION: BABYLON.Vector3;
    readonly OFFSET: BABYLON.Vector3;
    readonly DRAG_SENSITIVITY: number;
    readonly ZOOM_MIN: number;
    readonly ZOOM_MAX: number;
    readonly FOLLOW_SMOOTHING: number;
}

interface PhysicsConfig {
    readonly GRAVITY: BABYLON.Vector3;
    readonly CHARACTER_GRAVITY: BABYLON.Vector3;
}

interface AnimationConfig {
    readonly PLAYER_SCALE: number;
    readonly PLAYER_Y_OFFSET: number;
}

interface DebugConfig {
    readonly CAPSULE_VISIBLE: boolean;
}

type SkyType = "BOX" | "SPHERE";

interface SkyConfig {
    readonly TEXTURE_URL: string;
    readonly ROTATION_Y: number;
    readonly BLUR: number;
    readonly TYPE: SkyType;
}

interface ParticleSnippet {
    readonly name: string;
    readonly description: string;
    readonly snippetId: string;
    readonly category: "fire" | "magic" | "nature" | "tech" | "cosmic";
}

interface SoundEffect {
    readonly name: string;
    readonly url: string;
    readonly volume: number;
    readonly loop: boolean;
}

interface EffectsConfig {
    readonly PARTICLE_SNIPPETS: readonly ParticleSnippet[];
    readonly DEFAULT_PARTICLE: string;
    readonly AUTO_SPAWN: boolean;
    readonly SOUND_EFFECTS: readonly SoundEffect[];
}

interface ItemConfig {
    readonly name: string;
    readonly url: string;
    readonly mass: number;
    readonly collectible: boolean;
    readonly creditValue: number;
    readonly minImpulseForCollection: number;
    readonly scale: number;
}

interface ItemsConfig {
    readonly ITEMS: readonly ItemConfig[];
    readonly COLLECTION_RADIUS: number;
    readonly COLLECTION_SOUND: string;
    readonly SHOW_COLLECTION_EFFECTS: boolean;
}

type HUDPosition = "top" | "bottom" | "left" | "right";

interface HUDConfig {
    readonly POSITION: HUDPosition;
    readonly FONT_FAMILY: string;
    readonly PRIMARY_COLOR: string;
    readonly SECONDARY_COLOR: string;
    readonly HIGHLIGHT_COLOR: string;
    readonly BACKGROUND_COLOR: string;
    readonly BACKGROUND_OPACITY: number;
    readonly PADDING: number;
    readonly BORDER_RADIUS: number;
    readonly SHOW_COORDINATES: boolean;
    readonly SHOW_TIME: boolean;
    readonly SHOW_FPS: boolean;
            readonly SHOW_STATE: boolean;
        readonly SHOW_BOOST_STATUS: boolean;
        readonly SHOW_CREDITS: boolean;
        readonly UPDATE_INTERVAL: number;
}

interface GameConfig {
    readonly CHARACTER: CharacterConfig;
    readonly CAMERA: CameraConfig;
    readonly PHYSICS: PhysicsConfig;
    readonly ANIMATION: AnimationConfig;
    readonly DEBUG: DebugConfig;
    readonly SKY: SkyConfig;
    readonly EFFECTS: EffectsConfig;
    readonly HUD: HUDConfig;
    readonly ITEMS: ItemsConfig;
}

// Configuration Constants
const CONFIG: GameConfig = {
    // Character Settings
    CHARACTER: {
        HEIGHT: 1.8,
        RADIUS: 0.6,
        START_POSITION: new BABYLON.Vector3(3, 0.3, -8),
        SPEED: {
            IN_AIR: 8.0,
            ON_GROUND: 10.0,
            BOOST_MULTIPLIER: 2.0
        },
        JUMP_HEIGHT: 2.0,
        ROTATION_SPEED: BABYLON.Tools.ToRadians(3),
        ROTATION_SMOOTHING: 0.2
    },
    
    // Camera Settings
    CAMERA: {
        START_POSITION: new BABYLON.Vector3(0, 5, -10),
        OFFSET: new BABYLON.Vector3(0, 1.2, -3),
        DRAG_SENSITIVITY: 0.02,
        ZOOM_MIN: -15,
        ZOOM_MAX: -2,
        FOLLOW_SMOOTHING: 0.1
    },
    
    // Physics Settings
    PHYSICS: {
        GRAVITY: new BABYLON.Vector3(0, -9.8, 0),
        CHARACTER_GRAVITY: new BABYLON.Vector3(0, -18, 0)
    },
    
    // Animation Settings
    ANIMATION: {
        PLAYER_SCALE: 0.7,
        PLAYER_Y_OFFSET: -0.9
    },
    
    // Debug Settings
    DEBUG: {
        CAPSULE_VISIBLE: false
    },
    
    // Sky Settings
    SKY: {
        TEXTURE_URL: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/images/skies/cartoon-river-with-orange-sky.jpg",
        ROTATION_Y: 0,
        BLUR: 0.3,
        TYPE: "SPHERE" as SkyType
    },
    
    // Effects Settings
    EFFECTS: {
        PARTICLE_SNIPPETS: [
            {
                name: "Fire Trail",
                description: "Realistic fire particle system with heat distortion",
                category: "fire",
                snippetId: "HYB2FR"
            },
            {
                name: "Magic Sparkles",
                description: "Enchanting sparkle effect with rainbow colors",
                category: "magic",
                snippetId: "T54JV7"
            },
            {
                name: "Dust Storm",
                description: "Atmospheric dust particles with wind effect",
                category: "nature",
                snippetId: "X8Y9Z1"
            },
            {
                name: "Energy Field",
                description: "Sci-fi energy field with electric arcs",
                category: "tech",
                snippetId: "A2B3C4"
            },
            {
                name: "Stardust",
                description: "Cosmic stardust with twinkling effect",
                category: "cosmic",
                snippetId: "D5E6F7"
            },
            {
                name: "Smoke Trail",
                description: "Realistic smoke with fade effect",
                category: "nature",
                snippetId: "G8H9I0"
            },
            {
                name: "Portal Effect",
                description: "Mystical portal with swirling particles",
                category: "magic",
                snippetId: "J1K2L3"
            },
            {
                name: "Laser Beam",
                description: "Sci-fi laser beam with energy core",
                category: "tech",
                snippetId: "M4N5O6"
            },
            {
                name: "Nebula Cloud",
                description: "Cosmic nebula with colorful gas clouds",
                category: "cosmic",
                snippetId: "P7Q8R9"
            },
            {
                name: "Explosion",
                description: "Dramatic explosion with debris",
                category: "fire",
                snippetId: "S0T1U2"
            }
        ] as const,
        DEFAULT_PARTICLE: "Magic Sparkles",
        AUTO_SPAWN: true,
        SOUND_EFFECTS: [
            {
                name: "Thruster",
                url: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/sounds/effects/thruster.m4a",
                volume: 0.5,
                loop: true
            }
        ] as const
    },
    
    // HUD Settings
    HUD: {
        POSITION: "top" as HUDPosition,
        FONT_FAMILY: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        PRIMARY_COLOR: "#ffffff",
        SECONDARY_COLOR: "#cccccc",
        HIGHLIGHT_COLOR: "#00ff88",
        BACKGROUND_COLOR: "#000000",
        BACKGROUND_OPACITY: 0.7,
        PADDING: 15,
        BORDER_RADIUS: 8,
        SHOW_COORDINATES: true,
        SHOW_TIME: true,
        SHOW_FPS: true,
        SHOW_STATE: true,
        SHOW_BOOST_STATUS: true,
        SHOW_CREDITS: true,
        UPDATE_INTERVAL: 100 // milliseconds
    },
    
    // Items Settings
    ITEMS: {
        ITEMS: [
            {
                name: "Crate",
                url: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/items/stylized_crate_asset.glb",
                mass: 0.5,
                collectible: true,
                creditValue: 100,
                minImpulseForCollection: 0.5,
                scale: 0.5
            }
        ],
        COLLECTION_RADIUS: 1.5,
        COLLECTION_SOUND: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/sounds/effects/collect.m4a",
        SHOW_COLLECTION_EFFECTS: true
    }
} as const;

// Asset URLs
const ASSETS = {
    CHARACTER_MODEL: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/characters/amongUs/among_us_anims.glb",
    LEVEL_MODEL: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/environments/levelTest/levelTest.glb",
    LIGHTMAP_TEXTURE: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/environments/levelTest/lightmap.jpg"
} as const;

// Input Mapping
const INPUT_KEYS = {
    FORWARD: ['w', 'arrowup'],
    BACKWARD: ['s', 'arrowdown'],
    LEFT: ['a', 'arrowleft'],
    RIGHT: ['d', 'arrowright'],
    STRAFE_LEFT: ['q'],
    STRAFE_RIGHT: ['e'],
    JUMP: [' '],
    BOOST: ['shift'],
    DEBUG: ['0'],
    HUD_TOGGLE: ['h'],
    HUD_POSITION: ['p']
} as const;

// Character States
const CHARACTER_STATES = {
    IN_AIR: "IN_AIR",
    ON_GROUND: "ON_GROUND",
    START_JUMP: "START_JUMP"
} as const;

type CharacterState = typeof CHARACTER_STATES[keyof typeof CHARACTER_STATES];

// Animation Groups
const playerAnimations: Record<string, BABYLON.AnimationGroup | undefined> = {};

// ============================================================================
// EFFECTS MANAGER
// ============================================================================

class EffectsManager {
    private static activeParticleSystems: Map<string, BABYLON.IParticleSystem> = new Map();
    private static activeSounds: Map<string, BABYLON.Sound> = new Map();
    private static scene: BABYLON.Scene | null = null;
    
    /**
     * Initializes the EffectsManager with a scene
     * @param scene The Babylon.js scene
     */
    public static initialize(scene: BABYLON.Scene): void {
        this.scene = scene;
    }
    
    /**
     * Creates a particle system from a snippet by name
     * @param snippetName Name of the particle snippet to create
     * @param emitter Optional emitter (mesh or position) for the particle system
     * @returns The created particle system or null if not found
     */
    public static async createParticleSystem(snippetName: string, emitter?: BABYLON.AbstractMesh | BABYLON.Vector3): Promise<BABYLON.IParticleSystem | null> {
        if (!this.scene) {
            console.warn("EffectsManager not initialized. Call initialize() first.");
            return null;
        }
        
        const snippet = CONFIG.EFFECTS.PARTICLE_SNIPPETS.find(s => s.name === snippetName);
        if (!snippet) {
            console.warn(`Particle snippet "${snippetName}" not found.`);
            return null;
        }
        
        try {
            // Create a unique name for the particle system
            const uniqueName = `${snippetName}_${Date.now()}`;
            
            // Parse the snippet from the online editor
            const particleSystem = await BABYLON.ParticleHelper.ParseFromSnippetAsync(snippet.snippetId, this.scene, false);
            
            if (particleSystem && emitter) {
                particleSystem.emitter = emitter;
            }
            
            if (particleSystem) {
                this.activeParticleSystems.set(uniqueName, particleSystem);
                console.log(`Created particle system: ${uniqueName}`);
            }
            
            return particleSystem;
        } catch (error) {
            console.error(`Failed to create particle system "${snippetName}":`, error);
            return null;
        }
    }
    
    /**
     * Creates a particle system at a specific position
     * @param snippetName Name of the particle snippet
     * @param position Position for the particle system
     * @returns The created particle system
     */
    public static async createParticleSystemAt(snippetName: string, position: BABYLON.Vector3): Promise<BABYLON.IParticleSystem | null> {
        return this.createParticleSystem(snippetName, position);
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
            console.log(`Removed particle system: ${systemName}`);
        }
    }
    
    /**
     * Stops and removes all active particle systems
     */
    public static removeAllParticleSystems(): void {
        this.activeParticleSystems.forEach((particleSystem, name) => {
            particleSystem.stop();
            particleSystem.dispose();
        });
        this.activeParticleSystems.clear();
        console.log("Removed all particle systems");
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
        return CONFIG.EFFECTS.PARTICLE_SNIPPETS.find(snippet => snippet.name === snippetName) || null;
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
            console.warn("EffectsManager not initialized. Call initialize() first.");
            return null;
        }
        
        const soundConfig = CONFIG.EFFECTS.SOUND_EFFECTS.find(s => s.name === soundName);
        if (!soundConfig) {
            console.warn(`Sound effect "${soundName}" not found.`);
            return null;
        }
        
        try {
            const sound = new BABYLON.Sound(soundName, soundConfig.url, this.scene, null, {
                volume: soundConfig.volume,
                loop: soundConfig.loop
            });
            
            // Add basic sound event handling
            sound.onended = () => {
                console.log(`Sound "${soundName}" ended`);
            };
            
            this.activeSounds.set(soundName, sound);
            console.log(`Created sound: ${soundName}`);
            return sound;
        } catch (error) {
            console.error(`Failed to create sound "${soundName}":`, error);
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
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    /**
     * Gets a sound effect by name
     * @param soundName Name of the sound effect
     * @returns The sound or null if not found
     */
    public static getSound(soundName: string): BABYLON.Sound | null {
        return this.activeSounds.get(soundName) || null;
    }

    /**
     * Stops and removes all active sounds
     */
    public static removeAllSounds(): void {
        this.activeSounds.forEach((sound, name) => {
            sound.stop();
            sound.dispose();
        });
        this.activeSounds.clear();
        console.log("Removed all sounds");
    }
}

// ============================================================================
// SKY MANAGER
// ============================================================================

class SkyManager {
    private static sky: BABYLON.Mesh | null = null;
    private static skyTexture: BABYLON.Texture | null = null;
    
    /**
     * Creates and applies a sky to the scene
     * @param scene The Babylon.js scene
     * @param textureUrl URL of the sky texture
     * @param rotationY Y-axis rotation in radians
     * @param blur Blur amount (0-1)
     * @param type Type of sky ("BOX" or "SPHERE")
     * @returns The created sky mesh
     */
    public static createSky(
        scene: BABYLON.Scene, 
        textureUrl: string = CONFIG.SKY.TEXTURE_URL,
        rotationY: number = CONFIG.SKY.ROTATION_Y,
        blur: number = CONFIG.SKY.BLUR,
        type: string = CONFIG.SKY.TYPE
    ): BABYLON.Mesh {
        // Remove existing sky if present
        this.removeSky(scene);
        
        // Create sky texture
        this.skyTexture = new BABYLON.Texture(textureUrl, scene);
        
        // Apply blur if specified
        if (blur > 0) {
            this.skyTexture.level = blur;
        }
        
        // Create sky based on type
        if (type.toUpperCase() === "SPHERE") {
            this.createSkySphere(scene, rotationY);
        } else {
            this.createSkyBox(scene, rotationY);
        }
        
        return this.sky!;
    }
    
    /**
     * Creates a sky sphere (360-degree sphere)
     * @param scene The Babylon.js scene
     * @param rotationY Y-axis rotation in radians
     */
    private static createSkySphere(scene: BABYLON.Scene, rotationY: number): void {
        // Create sphere mesh
        this.sky = BABYLON.MeshBuilder.CreateSphere("skySphere", { 
            diameter: 1000.0,
            segments: 32
        }, scene);
        
        // Create sky material for sphere
        const skyMaterial = new BABYLON.StandardMaterial("skySphere", scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.diffuseTexture = this.skyTexture;
        skyMaterial.disableLighting = true;
        skyMaterial.emissiveTexture = this.skyTexture;
        skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        
        // Apply material to sky
        this.sky.material = skyMaterial;
        
        // Fix upside-down issue by rotating 180 degrees around X-axis
        this.sky.rotation.x = Math.PI;
        
        // Apply additional rotation
        if (rotationY !== 0) {
            this.sky.rotation.y = rotationY;
        }
    }
    
    /**
     * Creates a sky box (standard cube skybox)
     * @param scene The Babylon.js scene
     * @param rotationY Y-axis rotation in radians
     */
    private static createSkyBox(scene: BABYLON.Scene, rotationY: number): void {
        // Set texture coordinates mode for cube skybox
        this.skyTexture!.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        
        // Create box mesh
        this.sky = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
        
        // Create sky material for box
        const skyMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.diffuseTexture = this.skyTexture;
        skyMaterial.disableLighting = true;
        skyMaterial.emissiveTexture = this.skyTexture;
        skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        
        // Apply material to sky
        this.sky.material = skyMaterial;
        
        // Apply rotation
        if (rotationY !== 0) {
            this.sky.rotation.y = rotationY;
        }
    }
    
    /**
     * Removes the sky from the scene
     * @param scene The Babylon.js scene
     */
    public static removeSky(scene: BABYLON.Scene): void {
        if (this.sky) {
            this.sky.dispose();
            this.sky = null;
        }
        
        if (this.skyTexture) {
            this.skyTexture.dispose();
            this.skyTexture = null;
        }
    }
    
    /**
     * Updates the sky rotation
     * @param rotationY Y-axis rotation in radians
     */
    public static setRotation(rotationY: number): void {
        if (this.sky) {
            this.sky.rotation.y = rotationY;
        }
    }
    
    /**
     * Updates the sky blur
     * @param blur Blur amount (0-1)
     */
    public static setBlur(blur: number): void {
        if (this.skyTexture) {
            this.skyTexture.level = blur;
        }
    }
    
    /**
     * Gets the current sky mesh
     * @returns The sky mesh or null if not created
     */
    public static getSky(): BABYLON.Mesh | null {
        return this.sky;
    }
    
    /**
     * Checks if a sky exists
     * @returns True if sky exists, false otherwise
     */
    public static hasSky(): boolean {
        return this.sky !== null;
    }
}

// ============================================================================
// HUD MANAGER
// ============================================================================

class HUDManager {
    private static hudContainer: HTMLDivElement | null = null;
    private static hudElements: Map<string, HTMLDivElement> = new Map();
    private static scene: BABYLON.Scene | null = null;
    private static characterController: CharacterController | null = null;
    private static startTime: number = 0;
    private static lastUpdateTime: number = 0;
    private static updateInterval: number | null = null;
    private static fpsCounter: number = 0;
    private static fpsLastTime: number = 0;
    private static currentFPS: number = 0;
    
    /**
     * Initializes the HUD with a scene and character controller
     * @param scene The Babylon.js scene
     * @param characterController The character controller
     */
    public static initialize(scene: BABYLON.Scene, characterController: CharacterController): void {
        this.scene = scene;
        this.characterController = characterController;
        this.startTime = Date.now();
        this.createHUD();
        this.startUpdateLoop();
    }
    
    /**
     * Creates the HUD container and elements
     */
    private static createHUD(): void {
        if (!this.scene) return;
        
        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (!canvas) return;
        
        // Create HUD container
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'game-hud';
        this.hudContainer.style.cssText = this.getHUDContainerStyles();
        
        // Create HUD elements
        this.createHUDElement('coordinates', 'Coordinates');
        this.createHUDElement('time', 'Time');
        this.createHUDElement('fps', 'FPS');
        this.createHUDElement('state', 'State');
        this.createHUDElement('boost', 'Boost');
        this.createHUDElement('credits', 'Credits');
        
        // Add CSS animations
        this.addHUDAnimations();
        
        // Add HUD to canvas parent
        const canvasParent = canvas.parentElement;
        if (canvasParent) {
            canvasParent.appendChild(this.hudContainer);
        }
        
        // Set up FPS counter
        this.scene.onBeforeRenderObservable.add(() => {
            this.fpsCounter++;
            const currentTime = Date.now();
            if (currentTime - this.fpsLastTime >= 1000) {
                this.currentFPS = this.fpsCounter;
                this.fpsCounter = 0;
                this.fpsLastTime = currentTime;
            }
        });
    }
    
    /**
     * Adds CSS animations for HUD effects
     */
    private static addHUDAnimations(): void {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1); }
            }
            
            .hud-element {
                transition: all 0.2s ease;
            }
            
            .hud-element:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Gets the CSS styles for the HUD container based on position
     * @returns CSS styles string
     */
    private static getHUDContainerStyles(): string {
        const config = CONFIG.HUD;
        const position = config.POSITION;
        
        let positionStyles = '';
        switch (position) {
            case 'top':
                positionStyles = 'top: 0; left: 0; right: 0; flex-direction: row; justify-content: space-between;';
                break;
            case 'bottom':
                positionStyles = 'bottom: 0; left: 0; right: 0; flex-direction: row; justify-content: space-between;';
                break;
            case 'left':
                positionStyles = 'top: 0; left: 0; bottom: 0; flex-direction: column; justify-content: flex-start;';
                break;
            case 'right':
                positionStyles = 'top: 0; right: 0; bottom: 0; flex-direction: column; justify-content: flex-start;';
                break;
        }
        
        return `
            position: absolute;
            ${positionStyles}
            display: flex;
            padding: ${config.PADDING}px;
            font-family: ${config.FONT_FAMILY};
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            pointer-events: none;
        `;
    }
    
    /**
     * Creates a HUD element
     * @param id Element ID
     * @param label Element label
     */
    private static createHUDElement(id: string, label: string): void {
        if (!this.hudContainer) return;
        
        const element = document.createElement('div');
        element.id = `hud-${id}`;
        element.className = 'hud-element';
        element.style.cssText = this.getHUDElementStyles();
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'hud-label';
        labelSpan.textContent = label;
        labelSpan.style.color = CONFIG.HUD.SECONDARY_COLOR;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'hud-value';
        valueSpan.id = `hud-${id}-value`;
        valueSpan.style.color = CONFIG.HUD.PRIMARY_COLOR;
        
        element.appendChild(labelSpan);
        element.appendChild(document.createElement('br'));
        element.appendChild(valueSpan);
        
        this.hudContainer.appendChild(element);
        this.hudElements.set(id, element);
    }
    
    /**
     * Gets the CSS styles for HUD elements
     * @returns CSS styles string
     */
    private static getHUDElementStyles(): string {
        const config = CONFIG.HUD;
        return `
            background-color: ${config.BACKGROUND_COLOR};
            background-opacity: ${config.BACKGROUND_OPACITY};
            background: rgba(0, 0, 0, ${config.BACKGROUND_OPACITY});
            color: ${config.PRIMARY_COLOR};
            padding: 8px 12px;
            margin: 2px;
            border-radius: ${config.BORDER_RADIUS}px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            min-width: 80px;
            text-align: center;
            transition: all 0.2s ease;
        `;
    }
    
    /**
     * Starts the HUD update loop
     */
    private static startUpdateLoop(): void {
        this.updateInterval = window.setInterval(() => {
            this.updateHUD();
        }, CONFIG.HUD.UPDATE_INTERVAL);
    }
    
    /**
     * Updates all HUD elements
     */
    private static updateHUD(): void {
        if (!this.scene || !this.characterController) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime < CONFIG.HUD.UPDATE_INTERVAL) return;
        this.lastUpdateTime = currentTime;
        
        // Update coordinates
        if (CONFIG.HUD.SHOW_COORDINATES) {
            this.updateCoordinates();
        }
        
        // Update time
        if (CONFIG.HUD.SHOW_TIME) {
            this.updateTime();
        }
        
        // Update FPS
        if (CONFIG.HUD.SHOW_FPS) {
            this.updateFPS();
        }
        
        // Update state
        if (CONFIG.HUD.SHOW_STATE) {
            this.updateState();
        }
        
        // Update boost status
        if (CONFIG.HUD.SHOW_BOOST_STATUS) {
            this.updateBoostStatus();
        }
        
        // Update credits
        if (CONFIG.HUD.SHOW_CREDITS) {
            this.updateCredits();
        }
    }
    
    /**
     * Updates the coordinates display
     */
    private static updateCoordinates(): void {
        const element = this.hudElements.get('coordinates');
        if (!element) return;
        
        const position = this.characterController!.getDisplayCapsule().position;
        const valueElement = element.querySelector('#hud-coordinates-value') as HTMLSpanElement;
        if (valueElement) {
            valueElement.textContent = `X: ${position.x.toFixed(2)} Y: ${position.y.toFixed(2)} Z: ${position.z.toFixed(2)}`;
        }
    }
    
    /**
     * Updates the time display
     */
    private static updateTime(): void {
        const element = this.hudElements.get('time');
        if (!element) return;
        
        const elapsed = Date.now() - this.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const timeString = hours > 0 
            ? `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
            : `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        
        const valueElement = element.querySelector('#hud-time-value') as HTMLSpanElement;
        if (valueElement) {
            valueElement.textContent = timeString;
        }
    }
    
    /**
     * Updates the FPS display
     */
    private static updateFPS(): void {
        const element = this.hudElements.get('fps');
        if (!element) return;
        
        const valueElement = element.querySelector('#hud-fps-value') as HTMLSpanElement;
        if (valueElement) {
            valueElement.textContent = `${this.currentFPS} FPS`;
            
            // Color code FPS
            if (this.currentFPS >= 55) {
                valueElement.style.color = CONFIG.HUD.HIGHLIGHT_COLOR;
            } else if (this.currentFPS >= 30) {
                valueElement.style.color = CONFIG.HUD.PRIMARY_COLOR;
            } else {
                valueElement.style.color = '#ff4444';
            }
        }
    }
    
    /**
     * Updates the state display
     */
    private static updateState(): void {
        const element = this.hudElements.get('state');
        if (!element) return;
        
        const valueElement = element.querySelector('#hud-state-value') as HTMLSpanElement;
        if (valueElement) {
            // Get character state (this would need to be exposed from CharacterController)
            const isMoving = this.isCharacterMoving();
            const isOnGround = this.isCharacterOnGround();
            
            let stateText = '';
            if (isMoving && isOnGround) {
                stateText = 'Walking';
                valueElement.style.color = CONFIG.HUD.PRIMARY_COLOR;
            } else if (isMoving && !isOnGround) {
                stateText = 'Flying';
                valueElement.style.color = CONFIG.HUD.HIGHLIGHT_COLOR;
            } else if (!isOnGround) {
                stateText = 'In Air';
                valueElement.style.color = CONFIG.HUD.SECONDARY_COLOR;
            } else {
                stateText = 'Idle';
                valueElement.style.color = CONFIG.HUD.SECONDARY_COLOR;
            }
            
            valueElement.textContent = stateText;
        }
    }
    
    /**
     * Updates the boost status display
     */
    private static updateBoostStatus(): void {
        const element = this.hudElements.get('boost');
        if (!element) return;
        
        const valueElement = element.querySelector('#hud-boost-value') as HTMLSpanElement;
        if (valueElement) {
            // This would need to be exposed from CharacterController
            const isBoosting = this.isCharacterBoosting();
            
            if (isBoosting) {
                valueElement.textContent = 'ACTIVE';
                valueElement.style.color = CONFIG.HUD.HIGHLIGHT_COLOR;
                element.style.animation = 'pulse 0.5s ease-in-out infinite alternate';
            } else {
                valueElement.textContent = 'Inactive';
                valueElement.style.color = CONFIG.HUD.SECONDARY_COLOR;
                element.style.animation = 'none';
            }
        }
    }
    
    /**
     * Checks if character is moving
     */
    private static isCharacterMoving(): boolean {
        return this.characterController?.isMoving() || false;
    }
    
    /**
     * Checks if character is on ground
     */
    private static isCharacterOnGround(): boolean {
        return this.characterController?.isOnGround() || false;
    }
    
    /**
     * Checks if character is boosting
     */
    private static isCharacterBoosting(): boolean {
        return this.characterController?.isBoosting() || false;
    }
    
    /**
     * Updates the credits display
     */
    private static updateCredits(): void {
        const element = this.hudElements.get('credits');
        if (!element) return;
        
        const totalCredits = CollectiblesManager.getTotalCredits();
        const valueElement = element.querySelector('#hud-credits-value') as HTMLSpanElement;
        if (valueElement) {
            valueElement.textContent = `${totalCredits}`;
            
            // Highlight when credits increase
            if (totalCredits > 0) {
                valueElement.style.color = CONFIG.HUD.HIGHLIGHT_COLOR;
            } else {
                valueElement.style.color = CONFIG.HUD.PRIMARY_COLOR;
            }
        }
    }
    
    /**
     * Shows or hides HUD elements
     * @param elementId Element ID to toggle
     * @param visible Whether to show the element
     */
    public static setElementVisibility(elementId: string, visible: boolean): void {
        const element = this.hudElements.get(elementId);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    }
    
    /**
     * Updates HUD configuration
     * @param newConfig New HUD configuration
     */
    public static updateConfig(newConfig: Partial<HUDConfig>): void {
        // Update container styles
        if (this.hudContainer && newConfig.POSITION) {
            this.hudContainer.style.cssText = this.getHUDContainerStyles();
        }
        
        // Update element styles
        this.hudElements.forEach((element, id) => {
            element.style.cssText = this.getHUDElementStyles();
        });
        
        // Update visibility
        if (newConfig.SHOW_COORDINATES !== undefined) {
            this.setElementVisibility('coordinates', newConfig.SHOW_COORDINATES);
        }
        if (newConfig.SHOW_TIME !== undefined) {
            this.setElementVisibility('time', newConfig.SHOW_TIME);
        }
        if (newConfig.SHOW_FPS !== undefined) {
            this.setElementVisibility('fps', newConfig.SHOW_FPS);
        }
        if (newConfig.SHOW_STATE !== undefined) {
            this.setElementVisibility('state', newConfig.SHOW_STATE);
        }
        if (newConfig.SHOW_BOOST_STATUS !== undefined) {
            this.setElementVisibility('boost', newConfig.SHOW_BOOST_STATUS);
        }
        if (newConfig.SHOW_CREDITS !== undefined) {
            this.setElementVisibility('credits', newConfig.SHOW_CREDITS);
        }
    }
    
    /**
     * Changes HUD position dynamically
     * @param position New position ('top', 'bottom', 'left', 'right')
     */
    public static setPosition(position: HUDPosition): void {
        this.updateConfig({ POSITION: position });
    }
    
    /**
     * Changes HUD colors dynamically
     * @param primaryColor Primary color
     * @param secondaryColor Secondary color
     * @param highlightColor Highlight color
     */
    public static setColors(primaryColor: string, secondaryColor: string, highlightColor: string): void {
        // This would require updating the CONFIG object or creating a new config
        // For now, we'll update the elements directly
        this.hudElements.forEach((element, id) => {
            const label = element.querySelector('.hud-label') as HTMLSpanElement;
            const value = element.querySelector('.hud-value') as HTMLSpanElement;
            
            if (label) label.style.color = secondaryColor;
            if (value) value.style.color = primaryColor;
        });
    }
    
    /**
     * Toggles HUD visibility
     * @param visible Whether to show the HUD
     */
    public static setVisibility(visible: boolean): void {
        if (this.hudContainer) {
            this.hudContainer.style.display = visible ? 'flex' : 'none';
        }
    }
    
    /**
     * Disposes the HUD
     */
    public static dispose(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.hudContainer) {
            this.hudContainer.remove();
            this.hudContainer = null;
        }
        
        this.hudElements.clear();
        this.scene = null;
        this.characterController = null;
    }
}

// ============================================================================
// COLLECTIBLES MANAGER
// ============================================================================

class CollectiblesManager {
    private static scene: BABYLON.Scene | null = null;
    private static characterController: CharacterController | null = null;
    private static collectibles: Map<string, BABYLON.AbstractMesh> = new Map();
    private static collectibleBodies: Map<string, BABYLON.PhysicsBody> = new Map();
    private static collectionSound: BABYLON.Sound | null = null;
    private static totalCredits: number = 0;
    private static collectionObserver: BABYLON.Observer<BABYLON.Scene> | null = null;
    private static collectedItems: Set<string> = new Set();
    private static instanceBasis: BABYLON.Mesh | null = null;
    
    // Custom physics ready event system
    private static physicsReadyObservable = new BABYLON.Observable<void>();
    private static physicsReadyObserver: BABYLON.Observer<BABYLON.Scene> | null = null;
    
    /**
     * Waits for physics to be properly initialized
     * @returns Promise that resolves when physics is ready
     */
    private static async waitForPhysicsInitialization(): Promise<void> {
        if (!this.scene) {
            throw new Error("Scene not available for physics initialization check");
        }
        
        // Check if physics is already initialized
        if (this.isPhysicsReady()) {
            console.log("Physics already initialized");
            return;
        }
        
        // Set up physics ready detection
        this.setupPhysicsReadyDetection();
        
        // Wait for physics ready event
        return new Promise((resolve) => {
            this.physicsReadyObservable.addOnce(() => {
                console.log("Physics ready event received");
                resolve();
            });
        });
    }
    
    /**
     * Sets up detection for when physics becomes ready
     */
    private static setupPhysicsReadyDetection(): void {
        if (!this.scene || this.physicsReadyObserver) return;
        
        // Monitor scene for physics engine changes
        this.physicsReadyObserver = this.scene.onBeforeRenderObservable.add(() => {
            if (this.isPhysicsReady()) {
                console.log("Physics ready detected");
                this.physicsReadyObservable.notifyObservers();
                
                // Clean up observer
                if (this.physicsReadyObserver) {
                    this.scene!.onBeforeRenderObservable.remove(this.physicsReadyObserver);
                    this.physicsReadyObserver = null;
                }
            }
        });
    }
    
    /**
     * Checks if physics is properly initialized
     * @returns True if physics is ready, false otherwise
     */
    private static isPhysicsReady(): boolean {
        if (!this.scene) return false;
        
        const physicsEngine = this.scene.getPhysicsEngine();
        if (!physicsEngine) return false;
        
        // Check if physics engine has essential methods and properties
        return !!(physicsEngine.setGravity && 
                 physicsEngine.getTimeStep && 
                 physicsEngine.getSubTimeStep);
    }
    
    /**
     * Initializes the CollectiblesManager with a scene and character controller
     * @param scene The Babylon.js scene
     * @param characterController The character controller
     */
    public static initialize(scene: BABYLON.Scene, characterController: CharacterController): Promise<void> {
        this.scene = scene;
        this.characterController = characterController;
        this.totalCredits = 0;
        
        return this.setupCollectibles();
    }
    
    /**
     * Sets up collectibles in the environment
     */
    private static async setupCollectibles(): Promise<void> {
        if (!this.scene) return;
        
        // Wait for physics to be properly initialized
        await this.waitForPhysicsInitialization();
        
        // Create collection sound
        this.collectionSound = new BABYLON.Sound(
            "collectionSound", 
            CONFIG.ITEMS.COLLECTION_SOUND, 
            this.scene, 
            null, 
            { volume: 0.7 }
        );
        
        // Load the crate model once to use as instance basis
        await this.loadCrateModel();
        
        // Create 5 crate instances at different positions - closer to player
        const cratePositions = [
            new BABYLON.Vector3(4, 0.5, -8),  // Right side of player
            new BABYLON.Vector3(-4, 0.5, -8), // Left side of player
            new BABYLON.Vector3(0, 0.5, -5),  // In front of player
            new BABYLON.Vector3(4, 0.5, -11), // Behind and right
            new BABYLON.Vector3(-4, 0.5, -11) // Behind and left
        ];
        
        console.log("Creating crates at positions:", cratePositions);
        
        for (let i = 0; i < cratePositions.length; i++) {
            console.log(`Creating crate ${i} at position ${cratePositions[i].toString()}`);
            await this.createCollectibleInstance(`crate_instance_${i + 1}`, cratePositions[i]);
        }
        
        console.log("Total collectibles created:", this.collectibles.size);
        
        // Set up physics collision detection
        this.setupCollisionDetection();
    }
    
    /**
     * Loads the crate model once to use as instance basis
     */
    private static async loadCrateModel(): Promise<void> {
        if (!this.scene) return;
        
        const itemConfig = CONFIG.ITEMS.ITEMS[0]; // Use the crate configuration
        
        try {
            console.log(`Loading crate model from: ${itemConfig.url}`);
            const result = await BABYLON.ImportMeshAsync(itemConfig.url, this.scene);
            
            // Rename the root node to "crate_basis" for better organization
            if (result.meshes && result.meshes.length > 0) {
                // Find the root mesh (the one without a parent)
                const rootMesh = result.meshes.find(mesh => !mesh.parent);
                if (rootMesh) {
                    rootMesh.name = "crate_basis";
                }
            }
            
            console.log(`Crate model loaded successfully. Meshes found: ${result.meshes.length}`);
            
            // Check if any mesh has proper geometry
            const meshWithGeometry = result.meshes.find(mesh => {
                if (mesh instanceof BABYLON.Mesh) {
                    return mesh.geometry && mesh.geometry.getTotalVertices() > 0;
                }
                return false;
            });
            
            if (meshWithGeometry) {
                // Use the first mesh with geometry as the instance basis
                this.instanceBasis = meshWithGeometry as BABYLON.Mesh;
                
                // Scale the instance basis - make it larger and more visible
                this.instanceBasis.scaling.setAll(itemConfig.scale); // Use original scale
                
                // Make the instance basis invisible and disable it in the scene
                this.instanceBasis.isVisible = false;
                this.instanceBasis.setEnabled(false);
                
                console.log("Crate instance basis created and disabled");
                console.log("Mesh geometry vertices:", this.instanceBasis.geometry?.getTotalVertices());
                console.log("Mesh bounding box:", this.instanceBasis.getBoundingInfo()?.boundingBox);
            } else {
                console.warn("No meshes with geometry found in crate model, creating fallback");
                this.createFallbackInstanceBasis();
            }
        } catch (error) {
            console.error("Failed to load crate model:", error);
            console.log("Creating fallback crate basis");
            this.createFallbackInstanceBasis();
        }
    }
    
    /**
     * Creates a fallback instance basis using a simple box
     */
    private static createFallbackInstanceBasis(): void {
        if (!this.scene) return;
        
        const itemConfig = CONFIG.ITEMS.ITEMS[0];
        
        // Create a fallback crate using a simple box - CAST TO MESH!
        this.instanceBasis = BABYLON.MeshBuilder.CreateBox("fallback_crate_basis", { size: 2 }, this.scene) as BABYLON.Mesh; // Larger size
        
        // Create a bright baby blue material to make it very visible
        const material = new BABYLON.StandardMaterial("fallback_crate_basis_material", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1); // Baby blue
        material.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.3); // Subtle blue glow
        material.specularColor = new BABYLON.Color3(1, 1, 1); // Shiny
        this.instanceBasis.material = material;
        
        // Scale the instance basis - make it larger and more visible
        this.instanceBasis.scaling.setAll(itemConfig.scale); // Use original scale
        
        // Make the instance basis invisible and disable it in the scene
        this.instanceBasis.isVisible = false;
        this.instanceBasis.setEnabled(false);
        
        console.log("Fallback crate instance basis created and disabled");
    }
    
    /**
     * Creates a collectible instance from the instance basis
     * @param id Unique identifier for the collectible
     * @param position Position to place the collectible
     */
    private static async createCollectibleInstance(id: string, position: BABYLON.Vector3): Promise<void> {
        if (!this.scene || !this.instanceBasis) {
            console.error("No scene or instance basis available for creating collectible instance");
            return;
        }
        
        console.log(`Creating collectible instance ${id} at ${position.toString()}`);
        
        try {
            // Create an instance from the loaded crate model
            const instance = this.instanceBasis.createInstance(id);
            
            // Remove the instance from its parent to make it independent
            if (instance.parent) {
                instance.setParent(null);
            }
            
            // Set position and make it visible
            instance.position = position;
            instance.isVisible = true;
            instance.setEnabled(true);
            
            // Ensure the instance is properly scaled
            const itemConfig = CONFIG.ITEMS.ITEMS[0]; // Get the crate configuration
            instance.scaling.setAll(itemConfig.scale);
            
            console.log(`Crate instance positioned at: ${instance.position.toString()}`);
            console.log(`Crate instance visibility: ${instance.isVisible}`);
            
            // Create physics body for the instance
            const physicsAggregate = new BABYLON.PhysicsAggregate(instance, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
            
            // Ensure the physics body is positioned correctly
            if (physicsAggregate.body) {
                physicsAggregate.body.setMassProperties({ mass: 0.1 });
                console.log(`Physics body created for ${id} at ${position.toString()}`);
            } else {
                console.warn(`Failed to create physics body for ${id}`);
            }
            
            // Store references
            this.collectibles.set(id, instance);
            this.collectibleBodies.set(id, physicsAggregate.body);
            
            // Add rotation animation
            this.addRotationAnimation(instance);
            
            console.log(`Created collectible instance: ${id} at ${position.toString()}`);
            console.log(`Instance visibility: ${instance.isVisible}, enabled: ${instance.isEnabled()}`);
            console.log(`Instance scale: ${instance.scaling.toString()}`);
            console.log(`Instance material: ${instance.material ? 'present' : 'missing'}`);
        } catch (error) {
            console.error(`Failed to create collectible instance ${id}:`, error);
        }
    }
    
    /**
     * Creates a collectible item (legacy method - kept for fallback)
     * @param id Unique identifier for the collectible
     * @param position Position to place the collectible
     */
    private static async createCollectible(id: string, position: BABYLON.Vector3): Promise<void> {
        if (!this.scene) {
            console.error("No scene available for creating collectible");
            return;
        }
        
        console.log(`Starting to create collectible ${id} at ${position.toString()}`);
        
        const itemConfig = CONFIG.ITEMS.ITEMS[0]; // Use the crate configuration
        
        try {
            console.log(`Attempting to load model from: ${itemConfig.url}`);
            // Import the item model
            const result = await BABYLON.ImportMeshAsync(itemConfig.url, this.scene);
            
            console.log(`Model loaded successfully. Meshes found: ${result.meshes.length}`);
            
            if (result.meshes.length > 0) {
                const mesh = result.meshes[0];
                mesh.name = id;
                
                // Scale the mesh appropriately and make it more visible
                mesh.scaling.setAll(itemConfig.scale);
                
                // Set position BEFORE creating physics body
                mesh.position = position;
                console.log(`Model crate positioned at: ${mesh.position.toString()}`);
                
                // Make sure the mesh is visible
                mesh.isVisible = true;
                console.log(`Model crate visibility: ${mesh.isVisible}`);
                
                // Create physics body exactly like environment meshes
                const physicsAggregate = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
                
                // Ensure the physics body is positioned correctly
                if (physicsAggregate.body) {
                    physicsAggregate.body.setMassProperties({ mass: 0.1 });
                    console.log(`Physics body created for ${id} at ${position.toString()}`);
                } else {
                    console.warn(`Failed to create physics body for ${id}`);
                }
                
                // Store references
                this.collectibles.set(id, mesh);
                
                // Add rotation animation
                this.addRotationAnimation(mesh);
                
                console.log(`Created collectible: ${id} at ${position.toString()}`);
            } else {
                console.warn(`No meshes found in ${itemConfig.url} for ${id}`);
            }
        } catch (error) {
            console.error(`Failed to create collectible ${id}:`, error);
            console.log("Creating fallback crate instead...");
            
            // Create a fallback crate using a simple box
            const fallbackCrate = BABYLON.MeshBuilder.CreateBox(`fallback_${id}`, { size: 1 }, this.scene);
            console.log(`Created fallback crate mesh: ${fallbackCrate.name}`);
            
            // Create a simple material to make it visible
            const material = new BABYLON.StandardMaterial(`fallback_${id}_material`, this.scene);
            material.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2); // Brown color
            material.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0); // Slight glow
            fallbackCrate.material = material;
            
            // Set position and visibility BEFORE creating physics body
            fallbackCrate.position = position;
            fallbackCrate.isVisible = true;
            console.log(`Fallback crate positioned at: ${fallbackCrate.position.toString()}, visible: ${fallbackCrate.isVisible}`);
            
            // Create physics body exactly like environment meshes
            const physicsAggregate = new BABYLON.PhysicsAggregate(fallbackCrate, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
            
            // Ensure the physics body is positioned correctly
            if (physicsAggregate.body) {
                physicsAggregate.body.setMassProperties({ mass: 0.1 });
                console.log(`Physics body created for fallback ${id} at ${position.toString()}`);
            } else {
                console.warn(`Failed to create physics body for fallback ${id}`);
            }
            
            // Store references
            this.collectibles.set(id, fallbackCrate);
            
            // Add rotation animation
            this.addRotationAnimation(fallbackCrate);
            
            console.log(`Created fallback collectible: ${id} at ${position.toString()}`);
        }
    }
    
    /**
     * Adds a rotation animation to make collectibles more visible
     * @param mesh The mesh to animate
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
        const collectionRadius = CONFIG.ITEMS.COLLECTION_RADIUS;
        
        for (const [id, mesh] of this.collectibles.entries()) {
            // Skip if already collected
            if (this.collectedItems.has(id)) continue;
            
            const distance = BABYLON.Vector3.Distance(characterPosition, mesh.position);
            
            if (distance <= collectionRadius) {
                this.attemptCollection(id, mesh);
            }
        }
    }
    
    /**
     * Attempts to collect an item based on velocity
     * @param collectibleId The ID of the collectible
     * @param collectibleMesh The mesh of the collectible
     */
    private static attemptCollection(collectibleId: string, collectibleMesh: BABYLON.AbstractMesh): void {
        if (!this.characterController) return;
        
        const itemConfig = CONFIG.ITEMS.ITEMS[0]; // Use crate configuration
        const characterVelocity = this.characterController.getVelocity();
        const speed = characterVelocity.length();
        
        if (speed >= itemConfig.minImpulseForCollection) {
            this.collectItem(collectibleId, collectibleMesh);
        }
    }
    
    /**
     * Collects an item and adds credits
     * @param collectibleId The ID of the collectible
     * @param collectibleMesh The mesh of the collectible
     */
    private static collectItem(collectibleId: string, collectibleMesh: BABYLON.AbstractMesh): void {
        const itemConfig = CONFIG.ITEMS.ITEMS[0]; // Use crate configuration
        
        // Mark as collected to prevent multiple collections
        this.collectedItems.add(collectibleId);
        
        // Add credits
        this.totalCredits += itemConfig.creditValue;
        
        // Play collection sound
        if (this.collectionSound) {
            this.collectionSound.play();
        }
        
        // Show collection effects
        if (CONFIG.ITEMS.SHOW_COLLECTION_EFFECTS) {
            this.showCollectionEffects(collectibleMesh.position);
        }
        
        // Remove the collectible
        this.removeCollectible(collectibleId);
        
        console.log(`Collected ${itemConfig.name}! Credits: ${this.totalCredits}`);
    }
    
    /**
     * Shows collection effects at the specified position
     * @param position Position to show effects
     */
    private static async showCollectionEffects(position: BABYLON.Vector3): Promise<void> {
        if (!this.scene) return;
        
        // Create a particle effect for collection
        const particleSystem = new BABYLON.ParticleSystem("collectionParticles", 50, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);
        particleSystem.emitter = position;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);
        
        particleSystem.color1 = new BABYLON.Color4(0.5, 1, 0, 1); // Lime green
        particleSystem.color2 = new BABYLON.Color4(0.2, 0.8, 0, 1); // Darker lime green
        particleSystem.colorDead = new BABYLON.Color4(0, 0.5, 0, 0); // Fade to dark green
        
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
        
        particleSystem.start();
        
        // Stop the particle system after a short time
        setTimeout(() => {
            particleSystem.stop();
            particleSystem.dispose();
        }, 1000);
    }
    
    /**
     * Removes a collectible from the scene
     * @param collectibleId The ID of the collectible to remove
     */
    private static removeCollectible(collectibleId: string): void {
        const mesh = this.collectibles.get(collectibleId);
        
        if (mesh) {
            mesh.dispose();
            this.collectibles.delete(collectibleId);
        }
    }
    
    /**
     * Gets the total credits collected
     * @returns Total credits
     */
    public static getTotalCredits(): number {
        return this.totalCredits;
    }
    
    /**
     * Adds credits manually (for testing or other purposes)
     * @param amount Amount of credits to add
     */
    public static addCredits(amount: number): void {
        this.totalCredits += amount;
    }
    
    /**
     * Gets all active collectibles
     * @returns Map of collectible IDs to meshes
     */
    public static getCollectibles(): Map<string, BABYLON.AbstractMesh> {
        return new Map(this.collectibles);
    }
    
    /**
     * Disposes the CollectiblesManager
     */
    public static dispose(): void {
        // Remove all collectibles
        for (const [id, mesh] of this.collectibles.entries()) {
            this.removeCollectible(id);
        }
        
        // Remove collision observer
        if (this.collectionObserver && this.scene) {
            this.scene.onBeforeRenderObservable.remove(this.collectionObserver);
            this.collectionObserver = null;
        }
        
        // Remove physics ready observer
        if (this.physicsReadyObserver && this.scene) {
            this.scene.onBeforeRenderObservable.remove(this.physicsReadyObserver);
            this.physicsReadyObserver = null;
        }
        
        // Clear physics ready observable
        this.physicsReadyObservable.clear();
        
        // Dispose collection sound
        if (this.collectionSound) {
            this.collectionSound.dispose();
            this.collectionSound = null;
        }
        
        // Dispose instance basis
        if (this.instanceBasis) {
            this.instanceBasis.dispose();
            this.instanceBasis = null;
        }
        
        this.scene = null;
        this.characterController = null;
        this.totalCredits = 0;
        this.collectedItems.clear();
    }
}

// ============================================================================
// SMOOTH FOLLOW CAMERA CONTROLLER
// ============================================================================

class SmoothFollowCameraController {
    private readonly scene: BABYLON.Scene;
    private readonly camera: BABYLON.TargetCamera;
    private readonly target: BABYLON.Mesh;
    private readonly offset: BABYLON.Vector3;
    private readonly dragSensitivity: number;
    
    public isDragging = false;
    public dragDeltaX = 0;
    public dragDeltaZ = 0;
    
    private pointerObserver: BABYLON.Observer<BABYLON.PointerInfo>;
    private beforeRenderObserver: BABYLON.Observer<BABYLON.Scene>;
    private lastPointerX = 0;
    private lastPointerY = 0;
    private isTwoFingerPanning = false;
    private lastPanPositions: [number, number, number, number] | null = null;
    private canvas: HTMLCanvasElement | null = null;
    
    // Character rotation lerp variables
    public isRotatingCharacter = false;
    private characterRotationStartY = 0;
    private characterRotationTargetY = 0;
    private characterRotationStartTime = 0;
    private characterRotationDuration = 0.5; // 0.5 seconds
    private shouldStartRotationOnWalk = false;

    constructor(
        scene: BABYLON.Scene,
        camera: BABYLON.TargetCamera,
        target: BABYLON.Mesh,
        offset: BABYLON.Vector3 = CONFIG.CAMERA.OFFSET,
        dragSensitivity: number = CONFIG.CAMERA.DRAG_SENSITIVITY
    ) {
        this.scene = scene;
        this.camera = camera;
        this.target = target;
        this.offset = offset.clone();
        this.dragSensitivity = dragSensitivity;
        
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.pointerObserver = this.scene.onPointerObservable.add(this.handlePointer);
        this.beforeRenderObserver = this.scene.onBeforeRenderObservable.add(this.updateCamera);
        
        this.canvas = this.scene.getEngine().getRenderingCanvas();
        if (this.canvas) {
            this.canvas.addEventListener("touchstart", this.handleTouchStart, { passive: false });
            this.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });
            this.canvas.addEventListener("touchend", this.handleTouchEnd, { passive: false });
            this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
        }
    }

    private handlePointer = (pointerInfo: BABYLON.PointerInfo): void => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                this.isDragging = true;
                this.lastPointerX = pointerInfo.event.clientX;
                this.lastPointerY = pointerInfo.event.clientY;
                this.dragDeltaX = 0;
                this.dragDeltaZ = 0;
                break;
                
            case BABYLON.PointerEventTypes.POINTERUP:
                this.isDragging = false;
                this.dragDeltaX = 0;
                this.dragDeltaZ = 0;
                // Mark that we should start rotation lerp on first walk activation
                this.shouldStartRotationOnWalk = true;
                break;
                
            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (this.isDragging) {
                    this.handlePointerMove(pointerInfo);
                }
                break;
        }
    };

    private handlePointerMove(pointerInfo: BABYLON.PointerInfo): void {
        const deltaX = pointerInfo.event.movementX || (pointerInfo.event.clientX - this.lastPointerX);
        const deltaY = pointerInfo.event.movementY || (pointerInfo.event.clientY - this.lastPointerY);

        this.lastPointerX = pointerInfo.event.clientX;
        this.lastPointerY = pointerInfo.event.clientY;

        this.dragDeltaX = -deltaX * this.dragSensitivity;
        this.dragDeltaZ = deltaY * this.dragSensitivity;

        this.updateCameraPosition();
    }

    private updateCameraPosition(): void {
        const right = this.camera.getDirection(BABYLON.Vector3.Right());
        this.camera.position.addInPlace(right.scale(this.dragDeltaX));
        
        const up = this.camera.getDirection(BABYLON.Vector3.Up());
        this.camera.position.addInPlace(up.scale(this.dragDeltaZ));
        
        this.camera.setTarget(this.target.position);
    }

    private handleWheel = (e: WheelEvent): void => {
        e.preventDefault();
        this.offset.z += e.deltaX * this.dragSensitivity * 6;
        this.offset.z = BABYLON.Scalar.Clamp(
            this.offset.z, 
            CONFIG.CAMERA.ZOOM_MIN, 
            CONFIG.CAMERA.ZOOM_MAX
        );
    };

    private handleTouchStart = (e: TouchEvent): void => {
        if (e.touches.length === 2) {
            this.isTwoFingerPanning = true;
            this.lastPanPositions = [
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            ] as [number, number, number, number];
        }
    };

    private handleTouchMove = (e: TouchEvent): void => {
        if (!this.isTwoFingerPanning || e.touches.length !== 2 || !this.lastPanPositions) {
            return;
        }

        e.preventDefault();
        this.handleTwoFingerPan(e);
    };

    private handleTwoFingerPan(e: TouchEvent): void {
        const currentPositions = [
            e.touches[0].clientX, e.touches[0].clientY,
            e.touches[1].clientX, e.touches[1].clientY
        ] as [number, number, number, number];

        const lastMidX = (this.lastPanPositions![0] + this.lastPanPositions![2]) / 2;
        const lastMidY = (this.lastPanPositions![1] + this.lastPanPositions![3]) / 2;
        const currMidX = (currentPositions[0] + currentPositions[2]) / 2;
        const currMidY = (currentPositions[1] + currentPositions[3]) / 2;

        const deltaX = currMidX - lastMidX;
        const deltaY = currMidY - lastMidY;

        const right = this.camera.getDirection(BABYLON.Vector3.Right());
        const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
        
        this.offset.addInPlace(right.scale(-deltaX * this.dragSensitivity * 4));
        this.offset.addInPlace(forward.scale(deltaY * this.dragSensitivity * 4));

        this.lastPanPositions = currentPositions;
    }

    private handleTouchEnd = (e: TouchEvent): void => {
        if (e.touches.length < 2) {
            this.isTwoFingerPanning = false;
            this.lastPanPositions = null;
        }
    };

    private updateCamera = (): void => {
        if (!this.isDragging) {
            // Only smooth follow if we're not waiting for walk activation
            if (!this.shouldStartRotationOnWalk) {
                this.smoothFollowTarget();
            }
        } else {
            this.updateOffsetY();
        }
        
        // Update character rotation lerp
        this.updateCharacterRotationLerp();
    };

    private smoothFollowTarget(): void {
        // If character is rotating, pause the smooth follow camera
        if (this.isRotatingCharacter) {
            return;
        }
        
        const yRot = BABYLON.Quaternion.FromEulerAngles(0, this.target.rotation.y, 0);
        const rotatedOffset = this.offset.rotateByQuaternionToRef(yRot, new BABYLON.Vector3());
        const desiredPos = this.target.position.add(rotatedOffset);
        
        // Calculate dynamic smoothing based on offset.z
        // Closer camera (smaller offset.z) = more responsive (higher smoothing value)
        // Farther camera (larger offset.z) = more relaxed (lower smoothing value)
        const normalizedOffset = (this.offset.z - CONFIG.CAMERA.ZOOM_MIN) / (CONFIG.CAMERA.ZOOM_MAX - CONFIG.CAMERA.ZOOM_MIN);
        const dynamicSmoothing = BABYLON.Scalar.Lerp(0.05, 0.25, normalizedOffset);
        
        BABYLON.Vector3.LerpToRef(
            this.camera.position, 
            desiredPos, 
            dynamicSmoothing, 
            this.camera.position
        );
        
        this.camera.lockedTarget = this.target;
    }

    private updateOffsetY(): void {
        this.offset.y = this.camera.position.y - this.target.position.y;
    }

    private startCharacterRotationLerp(): void {
        // Calculate direction from character to camera
        const toCamera = this.camera.position.subtract(this.target.position).normalize();
        
        // Calculate the desired Y rotation (yaw) to face AWAY from the camera
        const targetYaw = Math.atan2(-toCamera.x, -toCamera.z);
        
        // Calculate the shortest rotation path
        const currentYaw = this.target.rotation.y;
        let rotationDifference = targetYaw - currentYaw;
        
        // Normalize to shortest path (-π to π)
        while (rotationDifference > Math.PI) rotationDifference -= 2 * Math.PI;
        while (rotationDifference < -Math.PI) rotationDifference += 2 * Math.PI;
        
        // Start the lerp with the shortest path
        this.isRotatingCharacter = true;
        this.characterRotationStartY = currentYaw;
        this.characterRotationTargetY = currentYaw + rotationDifference;
        this.characterRotationStartTime = Date.now();
    }

    private updateCharacterRotationLerp(): void {
        if (!this.isRotatingCharacter) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.characterRotationStartTime) / 1000; // Convert to seconds
        const progress = Math.min(elapsed / this.characterRotationDuration, 1.0);
        
        // Use smooth easing function
        const easedProgress = this.easeInOutCubic(progress);
        
        // Lerp the rotation
        const currentRotation = BABYLON.Scalar.Lerp(
            this.characterRotationStartY, 
            this.characterRotationTargetY, 
            easedProgress
        );
        
        this.target.rotation.y = currentRotation;
        
        // Update quaternion if needed
        if (this.target.rotationQuaternion) {
            BABYLON.Quaternion.FromEulerAnglesToRef(
                this.target.rotation.x,
                currentRotation,
                this.target.rotation.z,
                this.target.rotationQuaternion
            );
        }
        
        // Stop lerping when complete
        if (progress >= 1.0) {
            this.isRotatingCharacter = false;
        }
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public checkForWalkActivation(): void {
        if (this.shouldStartRotationOnWalk) {
            this.shouldStartRotationOnWalk = false;
            this.startCharacterRotationLerp();
        }
    }

    public dispose(): void {
        this.scene.onPointerObservable.remove(this.pointerObserver);
        this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
        
        if (this.canvas) {
            this.canvas.removeEventListener("touchstart", this.handleTouchStart);
            this.canvas.removeEventListener("touchmove", this.handleTouchMove);
            this.canvas.removeEventListener("touchend", this.handleTouchEnd);
            this.canvas.removeEventListener("wheel", this.handleWheel);
        }
    }
}

// ============================================================================
// CHARACTER CONTROLLER
// ============================================================================

class CharacterController {
    private readonly scene: BABYLON.Scene;
    private readonly characterController: BABYLON.PhysicsCharacterController;
    private readonly displayCapsule: BABYLON.Mesh;
    private playerMesh: BABYLON.AbstractMesh;
    
    private state: CharacterState = CHARACTER_STATES.IN_AIR;
    private wantJump = false;
    private inputDirection = new BABYLON.Vector3(0, 0, 0);
    private targetRotationY = 0;
    private keysDown = new Set<string>();
    private cameraController: SmoothFollowCameraController | null = null;
    private boostActive = false;
    private playerParticleSystem: BABYLON.IParticleSystem | null = null;
    private thrusterSound: BABYLON.Sound | null = null;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        
        // Create character physics controller
        this.characterController = new BABYLON.PhysicsCharacterController(
            CONFIG.CHARACTER.START_POSITION,
            { 
                capsuleHeight: CONFIG.CHARACTER.HEIGHT, 
                capsuleRadius: CONFIG.CHARACTER.RADIUS 
            },
            scene
        );

        // Create display capsule for debug
        this.displayCapsule = BABYLON.MeshBuilder.CreateCapsule(
            "CharacterDisplay", 
            { 
                height: CONFIG.CHARACTER.HEIGHT, 
                radius: CONFIG.CHARACTER.RADIUS 
            }, 
            scene
        );
        this.displayCapsule.isVisible = CONFIG.DEBUG.CAPSULE_VISIBLE;
        
        // Initialize player mesh (will be replaced by loaded model)
        this.playerMesh = this.displayCapsule;
        
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.scene.onKeyboardObservable.add(this.handleKeyboard);
        this.scene.onBeforeRenderObservable.add(this.updateCharacter);
        this.scene.onAfterPhysicsObservable.add(this.updatePhysics);
    }

    private handleKeyboard = (kbInfo: any): void => {
        const key = kbInfo.event.key.toLowerCase();
        
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                this.keysDown.add(key);
                this.handleKeyDown(key);
                break;
                
            case BABYLON.KeyboardEventTypes.KEYUP:
                this.keysDown.delete(key);
                this.handleKeyUp(key);
                break;
        }
    };

    private handleKeyDown(key: string): void {
        // Movement input
        if (INPUT_KEYS.FORWARD.includes(key as any)) {
            this.inputDirection.z = 1;
        } else if (INPUT_KEYS.BACKWARD.includes(key as any)) {
            this.inputDirection.z = -1;
        } else if (INPUT_KEYS.STRAFE_LEFT.includes(key as any)) {
            this.inputDirection.x = -1;
        } else if (INPUT_KEYS.STRAFE_RIGHT.includes(key as any)) {
            this.inputDirection.x = 1;
        } else if (INPUT_KEYS.JUMP.includes(key as any)) {
            this.wantJump = true;
        } else if (INPUT_KEYS.BOOST.includes(key as any)) {
            this.boostActive = true;
            this.updateParticleSystem();
        } else if (INPUT_KEYS.DEBUG.includes(key as any)) {
            this.toggleDebugDisplay();
        } else if (INPUT_KEYS.HUD_TOGGLE.includes(key as any)) {
            this.toggleHUD();
        } else if (INPUT_KEYS.HUD_POSITION.includes(key as any)) {
            this.cycleHUDPosition();
        }
    }

    private handleKeyUp(key: string): void {
        // Reset movement input
        if (INPUT_KEYS.FORWARD.includes(key as any) || INPUT_KEYS.BACKWARD.includes(key as any)) {
            this.inputDirection.z = 0;
        }
        if (INPUT_KEYS.LEFT.includes(key as any) || INPUT_KEYS.RIGHT.includes(key as any)) {
            this.inputDirection.x = 0;
        }
        if (INPUT_KEYS.STRAFE_LEFT.includes(key as any) || INPUT_KEYS.STRAFE_RIGHT.includes(key as any)) {
            this.inputDirection.x = 0;
        }
        if (INPUT_KEYS.JUMP.includes(key as any)) {
            this.wantJump = false;
        }
        if (INPUT_KEYS.BOOST.includes(key as any)) {
            this.boostActive = false;
            this.updateParticleSystem();
        }
    }

    private toggleDebugDisplay(): void {
        this.displayCapsule.isVisible = !this.displayCapsule.isVisible;
    }

    private toggleHUD(): void {
        // This would need to be connected to HUDManager
        console.log("HUD toggle pressed - implement HUDManager.setVisibility()");
    }

    private cycleHUDPosition(): void {
        // This would need to be connected to HUDManager
        console.log("HUD position cycle pressed - implement HUDManager.setPosition()");
    }

    private updateParticleSystem(): void {
        if (this.playerParticleSystem) {
            if (this.boostActive) {
                this.playerParticleSystem.start();
            } else {
                this.playerParticleSystem.stop();
            }
        }
        
        // Update thruster sound
        if (this.thrusterSound) {
            if (this.boostActive) {
                if (!this.thrusterSound.isPlaying) {
                    this.thrusterSound.play();
                }
            } else {
                if (this.thrusterSound.isPlaying) {
                    this.thrusterSound.stop();
                }
            }
        }
    }

    private updateCharacter = (): void => {
        this.updateRotation();
        this.updatePosition();
        this.updateAnimations();
    };

    private updateRotation(): void {
        // If camera is controlling rotation, don't interfere
        if (this.cameraController && this.cameraController.isRotatingCharacter) {
            // Update target rotation to match current rotation to prevent jerking
            this.targetRotationY = this.displayCapsule.rotation.y;
            return;
        }
        
        // Handle rotation based on input
        if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) {
            this.targetRotationY -= CONFIG.CHARACTER.ROTATION_SPEED;
        }
        if (this.keysDown.has('d') || this.keysDown.has('arrowright')) {
            this.targetRotationY += CONFIG.CHARACTER.ROTATION_SPEED;
        }
        
        this.displayCapsule.rotation.y += (this.targetRotationY - this.displayCapsule.rotation.y) * CONFIG.CHARACTER.ROTATION_SMOOTHING;
    }

    private updatePosition(): void {
        // Update display capsule position
        this.displayCapsule.position.copyFrom(this.characterController.getPosition());
        
        // Update player mesh position
        this.playerMesh.position.copyFrom(this.characterController.getPosition());
        this.playerMesh.position.y += CONFIG.ANIMATION.PLAYER_Y_OFFSET;
        
        // Update player mesh rotation
        if (this.displayCapsule.rotationQuaternion) {
            if (!this.playerMesh.rotationQuaternion) {
                this.playerMesh.rotationQuaternion = new BABYLON.Quaternion();
            }
            this.playerMesh.rotationQuaternion.copyFrom(this.displayCapsule.rotationQuaternion);
        } else {
            this.playerMesh.rotationQuaternion = null;
            this.playerMesh.rotation.copyFrom(this.displayCapsule.rotation);
        }
    }

    private updateAnimations(): void {
        if (!playerAnimations.walk || !playerAnimations.idle) return;

        const isMoving = this.isAnyMovementKeyPressed();
        
        if (isMoving) {
            if (!playerAnimations.walk.isPlaying) {
                playerAnimations.idle.stop();
                playerAnimations.walk.start(true);
                // Check for walk activation to trigger character rotation
                if (this.cameraController) {
                    this.cameraController.checkForWalkActivation();
                }
            }
        } else {
            if (!playerAnimations.idle.isPlaying) {
                playerAnimations.walk.stop();
                playerAnimations.idle.start(true);
            }
        }
    }

    private isAnyMovementKeyPressed(): boolean {
        return INPUT_KEYS.FORWARD.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.BACKWARD.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.LEFT.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.RIGHT.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.STRAFE_LEFT.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.STRAFE_RIGHT.some(key => this.keysDown.has(key));
    }

    private updatePhysics = (): void => {
        if (!this.scene.deltaTime) return;
        
        const deltaTime = this.scene.deltaTime / 1000.0;
        if (deltaTime === 0) return;

        const down = new BABYLON.Vector3(0, -1, 0);
        const support = this.characterController.checkSupport(deltaTime, down);

        const characterOrientation = BABYLON.Quaternion.FromEulerAngles(0, this.displayCapsule.rotation.y, 0);
        const desiredVelocity = this.calculateDesiredVelocity(deltaTime, support, characterOrientation);
        
        this.characterController.setVelocity(desiredVelocity);
        this.characterController.integrate(deltaTime, support, CONFIG.PHYSICS.CHARACTER_GRAVITY);
    };

    private calculateDesiredVelocity(
        deltaTime: number, 
        supportInfo: BABYLON.CharacterSurfaceInfo, 
        characterOrientation: BABYLON.Quaternion
    ): BABYLON.Vector3 {
        const nextState = this.getNextState(supportInfo);
        if (nextState !== this.state) {
            this.state = nextState;
        }

        const upWorld = CONFIG.PHYSICS.CHARACTER_GRAVITY.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        
        const forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
        const forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation);
        const currentVelocity = this.characterController.getVelocity();

        switch (this.state) {
            case CHARACTER_STATES.IN_AIR:
                return this.calculateAirVelocity(deltaTime, forwardWorld, upWorld, currentVelocity, characterOrientation);
                
            case CHARACTER_STATES.ON_GROUND:
                return this.calculateGroundVelocity(deltaTime, forwardWorld, upWorld, currentVelocity, supportInfo, characterOrientation);
                
            case CHARACTER_STATES.START_JUMP:
                return this.calculateJumpVelocity(currentVelocity, upWorld);
                
            default:
                return BABYLON.Vector3.Zero();
        }
    }

    private calculateAirVelocity(
        deltaTime: number,
        forwardWorld: BABYLON.Vector3,
        upWorld: BABYLON.Vector3,
        currentVelocity: BABYLON.Vector3,
        characterOrientation: BABYLON.Quaternion
    ): BABYLON.Vector3 {
        const speed = this.boostActive ? CONFIG.CHARACTER.SPEED.IN_AIR * CONFIG.CHARACTER.SPEED.BOOST_MULTIPLIER : CONFIG.CHARACTER.SPEED.IN_AIR;
        const desiredVelocity = this.inputDirection.scale(speed).applyRotationQuaternion(characterOrientation);
        const outputVelocity = this.characterController.calculateMovement(
            deltaTime, forwardWorld, upWorld, currentVelocity, 
            BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld
        );
        
        outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
        outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
        outputVelocity.addInPlace(CONFIG.PHYSICS.CHARACTER_GRAVITY.scale(deltaTime));
        
        return outputVelocity;
    }

    private calculateGroundVelocity(
        deltaTime: number,
        forwardWorld: BABYLON.Vector3,
        upWorld: BABYLON.Vector3,
        currentVelocity: BABYLON.Vector3,
        supportInfo: BABYLON.CharacterSurfaceInfo,
        characterOrientation: BABYLON.Quaternion
    ): BABYLON.Vector3 {
        const speed = this.boostActive ? CONFIG.CHARACTER.SPEED.ON_GROUND * CONFIG.CHARACTER.SPEED.BOOST_MULTIPLIER : CONFIG.CHARACTER.SPEED.ON_GROUND;
        const desiredVelocity = this.inputDirection.scale(speed).applyRotationQuaternion(characterOrientation);
        const outputVelocity = this.characterController.calculateMovement(
            deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity,
            supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld
        );
        
        outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
        
        const inv1k = 1e-3;
        if (outputVelocity.dot(upWorld) > inv1k) {
            const velLen = outputVelocity.length();
            outputVelocity.normalizeFromLength(velLen);
            const horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
            const c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
            const newOutputVelocity = c.cross(upWorld);
            newOutputVelocity.scaleInPlace(horizLen);
            return newOutputVelocity;
        }
        
        outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
        return outputVelocity;
    }

    private calculateJumpVelocity(currentVelocity: BABYLON.Vector3, upWorld: BABYLON.Vector3): BABYLON.Vector3 {
        const jumpHeight = this.boostActive ? 10.0 : CONFIG.CHARACTER.JUMP_HEIGHT;
        const u = Math.sqrt(2 * CONFIG.PHYSICS.CHARACTER_GRAVITY.length() * jumpHeight);
        const curRelVel = currentVelocity.dot(upWorld);
        return currentVelocity.add(upWorld.scale(u - curRelVel));
    }

    private getNextState(supportInfo: BABYLON.CharacterSurfaceInfo): CharacterState {
        switch (this.state) {
            case CHARACTER_STATES.IN_AIR:
                return supportInfo.supportedState === BABYLON.CharacterSupportedState.SUPPORTED 
                    ? CHARACTER_STATES.ON_GROUND 
                    : CHARACTER_STATES.IN_AIR;
                    
            case CHARACTER_STATES.ON_GROUND:
                if (supportInfo.supportedState !== BABYLON.CharacterSupportedState.SUPPORTED) {
                    return CHARACTER_STATES.IN_AIR;
                }
                return this.wantJump ? CHARACTER_STATES.START_JUMP : CHARACTER_STATES.ON_GROUND;
                
            case CHARACTER_STATES.START_JUMP:
                return CHARACTER_STATES.IN_AIR;
                
            default:
                return CHARACTER_STATES.IN_AIR;
        }
    }

    public setPlayerMesh(mesh: BABYLON.AbstractMesh): void {
        this.playerMesh = mesh;
        mesh.scaling.setAll(CONFIG.ANIMATION.PLAYER_SCALE);
    }

    public getDisplayCapsule(): BABYLON.Mesh {
        return this.displayCapsule;
    }

    public setCameraController(cameraController: SmoothFollowCameraController): void {
        this.cameraController = cameraController;
    }

    public setPlayerParticleSystem(particleSystem: BABYLON.IParticleSystem): void {
        this.playerParticleSystem = particleSystem;
        // Start with particle system stopped
        particleSystem.stop();
    }

    public setThrusterSound(sound: BABYLON.Sound): void {
        this.thrusterSound = sound;
        // Start with sound stopped
        sound.stop();
    }

    /**
     * Gets whether the character is currently moving
     * @returns True if character is moving, false otherwise
     */
    public isMoving(): boolean {
        return this.isAnyMovementKeyPressed();
    }

    /**
     * Gets whether the character is currently boosting
     * @returns True if character is boosting, false otherwise
     */
    public isBoosting(): boolean {
        return this.boostActive;
    }

    /**
     * Gets the current character state
     * @returns The current character state
     */
    public getState(): CharacterState {
        return this.state;
    }

    /**
     * Gets whether the character is on the ground
     * @returns True if character is on ground, false otherwise
     */
    public isOnGround(): boolean {
        return this.state === CHARACTER_STATES.ON_GROUND;
    }
    
    /**
     * Gets the physics body of the character controller
     * @returns The physics body or null if not available
     */
    public getPhysicsBody(): BABYLON.PhysicsBody | null {
        // PhysicsCharacterController doesn't expose its physics body directly
        // We'll use the display capsule for collision detection instead
        return null;
    }
    
    /**
     * Gets the current velocity of the character
     * @returns The current velocity vector
     */
    public getVelocity(): BABYLON.Vector3 {
        return this.characterController.getVelocity();
    }
}

// ============================================================================
// SCENE MANAGER
// ============================================================================

class SceneManager {
    private readonly scene: BABYLON.Scene;
    private readonly camera: BABYLON.TargetCamera;
    private characterController: CharacterController | null = null;
    private smoothFollowController: SmoothFollowCameraController | null = null;

    constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
        this.scene = new BABYLON.Scene(engine);
        this.camera = new BABYLON.TargetCamera("camera1", CONFIG.CAMERA.START_POSITION, this.scene);
        
        this.initializeScene().catch(error => {
            console.error("Failed to initialize scene:", error);
        });
    }

    private async initializeScene(): Promise<void> {
        this.setupLighting();
        this.setupPhysics();
        this.setupSky();
        await this.setupEffects();
        this.loadLevel();
    }

    private setupLighting(): void {
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
    }

    private setupPhysics(): void {
        const hk = new BABYLON.HavokPlugin(false);
        this.scene.enablePhysics(CONFIG.PHYSICS.GRAVITY, hk);
    }

    private setupSky(): void {
        try {
            SkyManager.createSky(this.scene);
        } catch (error) {
            console.warn("Failed to create sky:", error);
        }
    }

    private async setupEffects(): Promise<void> {
        try {
            EffectsManager.initialize(this.scene);
            await EffectsManager.createDefaultParticleSystem();
            
            // Create thruster sound
            await EffectsManager.createSound("Thruster");
        } catch (error) {
            console.warn("Failed to setup effects:", error);
        }
    }

    private loadLevel(): void {
        BABYLON.ImportMeshAsync(ASSETS.LEVEL_MODEL, this.scene)
            .then((result) => {
                // Rename the root node to "environment" for better organization
                if (result.meshes && result.meshes.length > 0) {
                    // Find the root mesh (the one without a parent)
                    const rootMesh = result.meshes.find(mesh => !mesh.parent);
                    if (rootMesh) {
                        rootMesh.name = "environment";
                    }
                }
                
                this.setupLevelPhysics();
                this.setupCharacter();
                this.loadCharacterModel();
            })
            .catch(error => {
                console.error("Failed to load level:", error);
            });
    }

    private setupLevelPhysics(): void {
        this.setupLightmappedMeshes();
        this.setupPhysicsObjects();
        this.setupJoints();
    }

    private setupLightmappedMeshes(): void {
        const lightmap = new BABYLON.Texture(ASSETS.LIGHTMAP_TEXTURE);
        const lightmappedMeshes = ["level_primitive0", "level_primitive1", "level_primitive2"];
        
        lightmappedMeshes.forEach(meshName => {
            const mesh = this.scene.getMeshByName(meshName);
            if (!mesh) return;
            
            new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH);
            mesh.isPickable = false;
            
            if (mesh.material instanceof BABYLON.StandardMaterial || mesh.material instanceof BABYLON.PBRMaterial) {
                mesh.material.lightmapTexture = lightmap;
                mesh.material.useLightmapAsShadowmap = true;
                (mesh.material.lightmapTexture as BABYLON.Texture).uAng = Math.PI;
                (mesh.material.lightmapTexture as BABYLON.Texture).level = 1.6;
                (mesh.material.lightmapTexture as BABYLON.Texture).coordinatesIndex = 1;
            }
            
            mesh.freezeWorldMatrix();
            mesh.doNotSyncBoundingInfo = true;
        });
    }

    private setupPhysicsObjects(): void {
        const cubes = ["Cube", "Cube.001", "Cube.002", "Cube.003", "Cube.004", "Cube.005"];
        cubes.forEach(meshName => {
            const mesh = this.scene.getMeshByName(meshName);
            if (mesh) {
                new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
            }
        });
        
        const planeMesh = this.scene.getMeshByName("Cube.006");
        if (planeMesh) {
            planeMesh.scaling.set(0.03, 3, 1);
            new BABYLON.PhysicsAggregate(planeMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
        }
    }

    private setupJoints(): void {
        const fixedMass = new BABYLON.PhysicsAggregate(
            this.scene.getMeshByName("Cube.007"), 
            BABYLON.PhysicsShapeType.BOX, 
            { mass: 0 }
        );
        
        const planeMesh = this.scene.getMeshByName("Cube.006");
        if (planeMesh) {
            const plane = new BABYLON.PhysicsAggregate(planeMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
            
            const joint = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0.75, 0, 0),
                new BABYLON.Vector3(-0.25, 0, 0),
                new BABYLON.Vector3(0, 0, -1),
                new BABYLON.Vector3(0, 0, 1),
                this.scene
            );
            
            fixedMass.body.addConstraint(plane.body, joint);
        }
    }

    private setupCharacter(): void {
        this.characterController = new CharacterController(this.scene);
        
        if (this.characterController) {
            this.smoothFollowController = new SmoothFollowCameraController(
                this.scene,
                this.camera,
                this.characterController.getDisplayCapsule()
            );
            
            // Connect the character controller to the camera controller
            this.characterController.setCameraController(this.smoothFollowController);
            
            // Initialize HUD
            HUDManager.initialize(this.scene, this.characterController);
            
            // Initialize Collectibles after character is set up
            CollectiblesManager.initialize(this.scene, this.characterController);
        }
    }

    private loadCharacterModel(): void {
        BABYLON.ImportMeshAsync(ASSETS.CHARACTER_MODEL, this.scene)
            .then(async result => {
                // Rename the root node to "player" for better organization
                if (result.meshes && result.meshes.length > 0) {
                    // Find the root mesh (the one without a parent)
                    const rootMesh = result.meshes.find(mesh => !mesh.parent);
                    if (rootMesh) {
                        rootMesh.name = "player";
                    }
                }
                
                if (this.characterController && result.meshes[0]) {
                    this.characterController.setPlayerMesh(result.meshes[0]);
                    
                    // Setup animations
                    playerAnimations.walk = result.animationGroups.find(a => a.name === 'walk');
                    playerAnimations.idle = result.animationGroups.find(a => a.name === 'idle');
                    
                    // Stop animations initially
                    playerAnimations.walk?.stop();
                    playerAnimations.idle?.stop();
                    
                    // Create particle system attached to player mesh
                    const playerParticleSystem = await EffectsManager.createParticleSystem(CONFIG.EFFECTS.DEFAULT_PARTICLE, result.meshes[0]);
                    if (playerParticleSystem && this.characterController) {
                        this.characterController.setPlayerParticleSystem(playerParticleSystem);
                    }
                    
                    // Set up thruster sound for character controller
                    const thrusterSound = EffectsManager.getSound("Thruster");
                    if (thrusterSound && this.characterController) {
                        this.characterController.setThrusterSound(thrusterSound);
                    }
                }
            })
            .catch(error => {
                console.error("Failed to load character model:", error);
            });
    }

    public getScene(): BABYLON.Scene {
        return this.scene;
    }

    /**
     * Disposes all resources
     */
    public dispose(): void {
        HUDManager.dispose();
        CollectiblesManager.dispose();
        if (this.smoothFollowController) {
            this.smoothFollowController.dispose();
        }
        if (this.characterController) {
            // Character controller cleanup would go here if needed
        }
    }
}

// ============================================================================
// MAIN PLAYGROUND CLASS
// ============================================================================

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        const sceneManager = new SceneManager(engine, canvas);
        return sceneManager.getScene();
    }
}

// ============================================================================
// HUD USAGE EXAMPLES
// ============================================================================

/*
// Example: Change HUD position
HUDManager.setPosition('bottom');

// Example: Change HUD colors
HUDManager.setColors('#00ff00', '#888888', '#ffff00');

// Example: Toggle HUD visibility
HUDManager.setVisibility(false);

// Example: Update HUD configuration
HUDManager.updateConfig({
    SHOW_COORDINATES: false,
    SHOW_FPS: true,
    POSITION: 'right'
});

// Example: Show/hide specific HUD elements
HUDManager.setElementVisibility('coordinates', false);
HUDManager.setElementVisibility('boost', true);
*/
