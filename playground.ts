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

interface ItemInstance {
    readonly position: BABYLON.Vector3;
    readonly scale: number;
    readonly rotation: BABYLON.Vector3;
    readonly mass: number;
}

interface ItemConfig {
    readonly name: string;
    readonly url: string;
    readonly collectible: boolean;
    readonly creditValue: number;
    readonly minImpulseForCollection: number;
    readonly instances: readonly ItemInstance[];
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
    readonly MOBILE: {
        readonly SHOW_COORDINATES: boolean;
        readonly SHOW_TIME: boolean;
        readonly SHOW_FPS: boolean;
        readonly SHOW_STATE: boolean;
        readonly SHOW_BOOST_STATUS: boolean;
        readonly SHOW_CREDITS: boolean;
    };
}

type UIElementType = "toggle" | "dropdown";
type VisibilityType = "all" | "mobile" | "iPadWithKeyboard";

interface SettingsSection {
    readonly title: string;
    readonly uiElement: UIElementType;
    readonly visibility: VisibilityType;
    readonly defaultValue?: boolean | string;
    readonly options?: string[]; // For dropdown elements
    readonly onChange?: (value: boolean | string) => void | Promise<void>;
}

interface SettingsConfig {
    readonly HEADING_TEXT: string;
    readonly PANEL_WIDTH_RATIO: number;
    readonly FULL_SCREEN_THRESHOLD: number;
    readonly Z_INDEX: number;
    readonly BUTTON_Z_INDEX: number;
    readonly SECTIONS: readonly SettingsSection[];
}

interface GameConfig {
    readonly CHARACTER: CharacterConfig;
    readonly CAMERA: CameraConfig;
    readonly PHYSICS: PhysicsConfig;
    readonly ANIMATION: AnimationConfig;
    readonly DEBUG: DebugConfig;
    readonly EFFECTS: EffectsConfig;
    readonly HUD: HUDConfig;
    readonly SETTINGS: SettingsConfig;
}

// Environment Types
const OBJECT_ROLE = {
    DYNAMIC_BOX: "DYNAMIC_BOX",
    PIVOT_BEAM: "PIVOT_BEAM"
} as const;

type ObjectRole = typeof OBJECT_ROLE[keyof typeof OBJECT_ROLE];

interface LightmappedMesh {
    readonly name: string;
    readonly level: number;
}

interface PhysicsObject {
    readonly name: string;
    readonly mass: number;
    readonly scale: number;
    readonly role: ObjectRole;
}

interface Environment {
    readonly name: string;
    readonly model: string;
    readonly lightmap: string;
    readonly scale: number;
    readonly lightmappedMeshes: readonly LightmappedMesh[];
    readonly physicsObjects: readonly PhysicsObject[];
    readonly sky?: SkyConfig; // Optional sky configuration for this environment
    readonly spawnPoint: BABYLON.Vector3; // Spawn point for this environment
    readonly particles?: readonly EnvironmentParticle[]; // Optional environment particles
    readonly items?: readonly ItemConfig[]; // Optional items configuration for this environment
}

interface EnvironmentParticle {
    readonly name: string; // Name of the particle snippet to use
    readonly position: BABYLON.Vector3; // Position where the particle should be created
    readonly updateSpeed?: number; // Optional update speed for the particle system
}

// Asset Types
interface CharacterAnims {
    readonly idle: string;
    readonly walk: string;
}

interface Character {
    readonly name: string;
    readonly model: string;
    readonly animations: CharacterAnims;
    readonly scale: number;
    readonly animationBlend?: number; // Animation blend time in milliseconds, defaults to 400
}

// Asset URLs
const ASSETS = {
    CHARACTERS: [
        {
            name: "Red",
            model: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/characters/amongUs/among_us_anims.glb",
            animations: {
                idle: "idle",
                walk: "walk"
            },
            scale: 1,
            animationBlend: 400
        },
        {
            name: "Tech Girl",
            model: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/characters/techGirl/tech_girl.glb",
            animations: {
                idle: "Idel",
                walk: "Walk"
            },
            scale: 1.7,
            animationBlend: 400
        },
        {
            name: "Zombie",
            model: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/characters/zombie/zombie.glb",
            animations: {
                idle: "Idle",
                walk: "Run_InPlace"
            },
            scale: 1.25,
            animationBlend: 400
        }
    ] as readonly Character[],
    ENVIRONMENTS: [
        {
            name: "Level Test",
            model: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/environments/levelTest/levelTest.glb",
            lightmap: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/environments/levelTest/lightmap.jpg",
            scale: 1,
            lightmappedMeshes: [
                { name: "level_primitive0", level: 1.6 },
                { name: "level_primitive1", level: 1.6 },
                { name: "level_primitive2", level: 1.6 }
            ],
            physicsObjects: [
                { name: "Cube", mass: 0.1, scale: 1, role: OBJECT_ROLE.DYNAMIC_BOX },
                { name: "Cube.001", mass: 0.1, scale: 1, role: OBJECT_ROLE.DYNAMIC_BOX },
                { name: "Cube.002", mass: 0.1, scale: 1, role: OBJECT_ROLE.DYNAMIC_BOX },
                { name: "Cube.003", mass: 0.1, scale: 1, role: OBJECT_ROLE.DYNAMIC_BOX },
                { name: "Cube.004", mass: 0.1, scale: 1, role: OBJECT_ROLE.DYNAMIC_BOX },
                { name: "Cube.005", mass: 0.1, scale: 1, role: OBJECT_ROLE.DYNAMIC_BOX },
                { name: "Cube.006", mass: 0.01, scale: 1, role: OBJECT_ROLE.PIVOT_BEAM },
                { name: "Cube.007", mass: 0, scale: 1, role: OBJECT_ROLE.DYNAMIC_BOX }
            ],
            sky: {
                TEXTURE_URL: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/images/skies/cartoon-river-with-orange-sky.jpg",
                ROTATION_Y: 0,
                BLUR: 0.3,
                TYPE: "SPHERE" as SkyType
            },
            spawnPoint: new BABYLON.Vector3(3, 0.3, -8),
            particles: [
                {
                    name: "Magic Sparkles",
                    position: new BABYLON.Vector3(-2, 0, -8), // Left of player start
                    updateSpeed: 0.007
                }
            ],
            items: [
                {
                    name: "Crate",
                    url: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/items/stylized_crate_asset.glb",
                    collectible: true,
                    creditValue: 100,
                    minImpulseForCollection: 0.5,
                    instances: [
                        {
                            position: new BABYLON.Vector3(1, 0.5, -8),
                            scale: 0.5,
                            rotation: new BABYLON.Vector3(0, 0, 0),
                            mass: 0.5
                        },
                        {
                            position: new BABYLON.Vector3(5, 0.5, -8),
                            scale: 0.5,
                            rotation: new BABYLON.Vector3(0, 0, 0),
                            mass: 0.5
                        },
                        {
                            position: new BABYLON.Vector3(0, 0.5, -5),
                            scale: 0.5,
                            rotation: new BABYLON.Vector3(0, 0, 0),
                            mass: 0.5
                        },
                        {
                            position: new BABYLON.Vector3(1, 0.5, -11),
                            scale: 0.5,
                            rotation: new BABYLON.Vector3(0, 0, 0),
                            mass: 0.5
                        },
                        {
                            position: new BABYLON.Vector3(5, 3.5, -11),
                            scale: 0.5,
                            rotation: new BABYLON.Vector3(0, 0, 0),
                            mass: 0.5
                        }
                    ]
                }
            ]
        },
        {
            name: "Firefox Reality",
            model: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/environments/firefoxReality/firefox_reality.glb",
            lightmap: "",
            scale: 1.5,
            lightmappedMeshes: [],
            physicsObjects: [],
            sky: {
                TEXTURE_URL: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/images/skies/orange-desert-night.png",
                ROTATION_Y: 0,
                BLUR: 0.2,
                TYPE: "SPHERE" as SkyType
            },
            spawnPoint: new BABYLON.Vector3(0, 5, 0) // Higher spawn point for Firefox Reality
        },
        {
            name: "Joy Town",
            model: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/models/environments/joyTown/joy_town.glb",
            lightmap: "",
            scale: 10,
            lightmappedMeshes: [],
            physicsObjects: [],
            sky: {
                TEXTURE_URL: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/images/skies/happy_fluffy_sky.png",
                ROTATION_Y: 0,
                BLUR: 0.2,
                TYPE: "SPHERE" as SkyType
            },
            spawnPoint: new BABYLON.Vector3(-15, 15, 0)
        }
    ] as readonly Environment[]
} as const;

// Configuration Constants
const CONFIG = {
    // Character Settings
    CHARACTER: {
        HEIGHT: 1.8,
        RADIUS: 0.6,
        START_POSITION: new BABYLON.Vector3(3, 0.3, -8),
        SPEED: {
            IN_AIR: 25.0,
            ON_GROUND: 25.0,
            BOOST_MULTIPLIER: 8.0
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
        UPDATE_INTERVAL: 100, // milliseconds
        MOBILE: {
            SHOW_COORDINATES: false,
            SHOW_TIME: false,
            SHOW_FPS: false,
            SHOW_STATE: true,
            SHOW_BOOST_STATUS: true,
            SHOW_CREDITS: true
        }
    },



    // Settings Panel Configuration
    SETTINGS: {
        HEADING_TEXT: "Settings",
        PANEL_WIDTH_RATIO: 1 / 3,
        FULL_SCREEN_THRESHOLD: 500,
        Z_INDEX: 1800,
        BUTTON_Z_INDEX: 2000,
        SECTIONS: [
            {
                title: "Screen Controls",
                uiElement: "toggle",
                visibility: "iPadWithKeyboard",
                defaultValue: true, // Default to showing controls
                onChange: (value: boolean | string) => {
                    // Control mobile input visibility
                    if (typeof MobileInputManager !== 'undefined' && typeof value === 'boolean') {
                        MobileInputManager.setVisibility(value);
                    }
                }
            },
            {
                title: "Character",
                uiElement: "dropdown",
                visibility: "all",
                defaultValue: "Red", // Default to first character (Red)
                options: ASSETS.CHARACTERS.map((character, index) => character.name),
                onChange: async (value: boolean | string) => {
                    if (typeof value === 'string' && !SettingsUI.isInitializing) {
                        await SettingsUI.changeCharacter(value);
                    }
                }
            },
            {
                title: "Environment",
                uiElement: "dropdown",
                visibility: "all",
                defaultValue: "Level Test", // Default to first environment
                options: ASSETS.ENVIRONMENTS.map((environment, index) => environment.name),
                onChange: async (value: boolean | string) => {
                    if (typeof value === 'string') {
                        await SettingsUI.changeEnvironment(value);
                    }
                }
            }
        ]
    }
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

// Mobile Touch Controls Configuration
const MOBILE_CONTROLS = {
    JOYSTICK_RADIUS: 60,
    JOYSTICK_DEADZONE: 10,
    BUTTON_SIZE: 80,
    BUTTON_SPACING: 20,
    OPACITY: 0.7,
    COLORS: {
        JOYSTICK_BG: '#333333',
        JOYSTICK_STICK: '#ffffff',
        BUTTON_BG: '#444444',
        BUTTON_ACTIVE: '#00ff88',
        BUTTON_TEXT: '#ffffff'
    },
    POSITIONS: {
        JOYSTICK: {
            BOTTOM: 120,
            LEFT: 0
        },
        JUMP_BUTTON: {
            BOTTOM: 220, // Above boost button
            RIGHT: 0
        },
        BOOST_BUTTON: {
            BOTTOM: 120, // Bottom right
            RIGHT: 0
        }
    },
    VISIBILITY: {
        SHOW_JOYSTICK: true,
        SHOW_JUMP_BUTTON: true,
        SHOW_BOOST_BUTTON: true
    }
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
// ANIMATION CONTROLLER
// ============================================================================

class AnimationController {
    private scene: BABYLON.Scene;
    private currentCharacter: Character | null = null;
    private currentAnimation: string | null = null;
    private previousAnimation: string | null = null;
    private blendStartTime: number = 0;
    private blendDuration: number = 400; // Default blend duration in milliseconds
    private isBlending: boolean = false;
    private weightedAnimation: BABYLON.AnimationGroup | null = null;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
    }

    /**
     * Sets the current character and its animation blend settings
     */
    public setCharacter(character: Character): void {
        this.currentCharacter = character;
        this.blendDuration = character.animationBlend || 400;
        
        // Reset animation state when character changes
        this.currentAnimation = null;
        this.previousAnimation = null;
        this.isBlending = false;
        this.weightedAnimation = null;
        
        // Don't stop all animations here - let the character loading process handle it
        // The new character's animations will be set up properly in loadCharacter
    }

    /**
     * Updates the animation state based on character movement
     */
    public updateAnimation(isMoving: boolean): void {
        if (!this.currentCharacter) return;

        const targetAnimationName = isMoving ? this.currentCharacter.animations.walk : this.currentCharacter.animations.idle;
        
        // If animation is already playing and no change needed, do nothing
        if (this.currentAnimation === targetAnimationName && !this.isBlending) {
            return;
        }

        // If no animation is currently playing, start the target animation
        if (!this.currentAnimation) {
            this.startAnimation(targetAnimationName);
            return;
        }

        // If we're already blending, let the blend complete
        if (this.isBlending) {
            return;
        }

        // If the character has animationBlend set to 0, skip weighted blending
        if (this.currentCharacter.animationBlend === 0) {
            this.switchAnimationDirectly(targetAnimationName);
            return;
        }

        // Start weighted blending between current and target animation
        this.startWeightedBlend(targetAnimationName);
    }

    /**
     * Starts a new animation directly (no blending)
     */
    private startAnimation(animationName: string): void {
        // First try to find the animation by exact name
        let animation = this.scene.getAnimationGroupByName(animationName);
        
        // If not found, try to find it by partial name match
        if (!animation) {
            animation = this.scene.animationGroups.find(anim => 
                anim.name.toLowerCase().includes(animationName.toLowerCase()) ||
                animationName.toLowerCase().includes(anim.name.toLowerCase())
            );
        }
        
        // If still not found, try common fallbacks
        if (!animation) {
            if (animationName.toLowerCase().includes('idle')) {
                animation = this.scene.animationGroups.find(anim => 
                    anim.name.toLowerCase().includes('idle') || 
                    anim.name.toLowerCase().includes('stand')
                );
            } else if (animationName.toLowerCase().includes('walk')) {
                animation = this.scene.animationGroups.find(anim => 
                    anim.name.toLowerCase().includes('walk') || 
                    anim.name.toLowerCase().includes('run') ||
                    anim.name.toLowerCase().includes('move')
                );
            }
        }
        
        if (!animation) {
            console.warn(`Animation not found: ${animationName}. Available animations:`, 
                this.scene.animationGroups.map(a => a.name));
            return;
        }

        // Stop all other animation groups in the scene
        this.scene.animationGroups.forEach(anim => {
            if (anim !== animation) {
                anim.stop();
            }
        });

        // Start the new animation
        animation.start(true);
        this.currentAnimation = animation.name; // Use the actual animation name
        this.previousAnimation = null;
        this.isBlending = false;
        this.weightedAnimation = null;
    }

    /**
     * Switches animation directly without blending
     */
    private switchAnimationDirectly(targetAnimation: string): void {
        const currentAnim = this.scene.getAnimationGroupByName(this.currentAnimation!);
        let targetAnim = this.scene.getAnimationGroupByName(targetAnimation);

        // If target animation not found, try partial match
        if (!targetAnim) {
            targetAnim = this.scene.animationGroups.find(anim => 
                anim.name.toLowerCase().includes(targetAnimation.toLowerCase()) ||
                targetAnimation.toLowerCase().includes(anim.name.toLowerCase())
            );
        }

        // If still not found, try common fallbacks
        if (!targetAnim) {
            if (targetAnimation.toLowerCase().includes('idle')) {
                targetAnim = this.scene.animationGroups.find(anim => 
                    anim.name.toLowerCase().includes('idle') || 
                    anim.name.toLowerCase().includes('stand')
                );
            } else if (targetAnimation.toLowerCase().includes('walk')) {
                targetAnim = this.scene.animationGroups.find(anim => 
                    anim.name.toLowerCase().includes('walk') || 
                    anim.name.toLowerCase().includes('run') ||
                    anim.name.toLowerCase().includes('move')
                );
            }
        }

        if (!currentAnim || !targetAnim) {
            console.warn(`Animation not found: current=${this.currentAnimation}, target=${targetAnimation}`);
            return;
        }

        // Stop current animation
        currentAnim.stop();

        // Start target animation
        targetAnim.start(true);

        this.previousAnimation = this.currentAnimation;
        this.currentAnimation = targetAnim.name; // Use the actual animation name
        this.isBlending = false;
        this.weightedAnimation = null;
    }

    /**
     * Starts weighted blending between two animations
     */
    private startWeightedBlend(targetAnimation: string): void {
        const currentAnim = this.scene.getAnimationGroupByName(this.currentAnimation!);
        let targetAnim = this.scene.getAnimationGroupByName(targetAnimation);

        // If target animation not found, try partial match
        if (!targetAnim) {
            targetAnim = this.scene.animationGroups.find(anim => 
                anim.name.toLowerCase().includes(targetAnimation.toLowerCase()) ||
                targetAnimation.toLowerCase().includes(anim.name.toLowerCase())
            );
        }

        // If still not found, try common fallbacks
        if (!targetAnim) {
            if (targetAnimation.toLowerCase().includes('idle')) {
                targetAnim = this.scene.animationGroups.find(anim => 
                    anim.name.toLowerCase().includes('idle') || 
                    anim.name.toLowerCase().includes('stand')
                );
            } else if (targetAnimation.toLowerCase().includes('walk')) {
                targetAnim = this.scene.animationGroups.find(anim => 
                    anim.name.toLowerCase().includes('walk') || 
                    anim.name.toLowerCase().includes('run') ||
                    anim.name.toLowerCase().includes('move')
                );
            }
        }

        if (!currentAnim || !targetAnim) {
            console.warn(`Animation not found: current=${this.currentAnimation}, target=${targetAnimation}`);
            return;
        }

        // For now, use a simpler approach: start both animations with different weights
        // and gradually adjust them over time
        currentAnim.start(true);
        targetAnim.start(true);

        // Set initial weights
        currentAnim.weight = 1.0;
        targetAnim.weight = 0.0;

        // Set up blend state
        this.previousAnimation = this.currentAnimation;
        this.currentAnimation = targetAnim.name; // Use the actual animation name
        this.blendStartTime = Date.now();
        this.isBlending = true;
    }

    /**
     * Updates the weighted animation blend weights
     */
    public updateBlend(): void {
        if (!this.isBlending) return;

        const elapsedTime = Date.now() - this.blendStartTime;
        const blendProgress = Math.min(elapsedTime / this.blendDuration, 1.0);

        // Calculate weights using smooth easing
        const previousWeight = 1.0 - this.easeInOutCubic(blendProgress);
        const currentWeight = this.easeInOutCubic(blendProgress);

        // Update animation weights
        if (this.previousAnimation && this.currentAnimation) {
            const previousAnim = this.scene.getAnimationGroupByName(this.previousAnimation);
            const currentAnim = this.scene.getAnimationGroupByName(this.currentAnimation);

            if (previousAnim && currentAnim) {
                // Update weights directly on the animation groups
                previousAnim.weight = previousWeight;
                currentAnim.weight = currentWeight;
            }
        }

        // Check if blend is complete
        if (blendProgress >= 1.0) {
            this.completeBlend();
        }
    }

    /**
     * Completes the animation blend
     */
    private completeBlend(): void {
        if (!this.currentAnimation) return;

        // Stop the previous animation
        if (this.previousAnimation) {
            const previousAnim = this.scene.getAnimationGroupByName(this.previousAnimation);
            if (previousAnim) {
                previousAnim.stop();
            }
        }

        // Ensure the target animation is running with full weight
        const targetAnim = this.scene.getAnimationGroupByName(this.currentAnimation);
        if (targetAnim) {
            targetAnim.weight = 1.0;
        }

        // Reset blend state
        this.isBlending = false;
        this.weightedAnimation = null;
        this.previousAnimation = null;
    }

    /**
     * Smooth easing function for animation blending
     */
    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Stops all animations
     */
    public stopAllAnimations(): void {
        this.scene.animationGroups.forEach(anim => {
            anim.stop();
        });

        this.currentAnimation = null;
        this.previousAnimation = null;
        this.isBlending = false;
        this.weightedAnimation = null;
    }

    /**
     * Gets the current animation state
     */
    public getCurrentAnimation(): string | null {
        return this.currentAnimation;
    }

    /**
     * Checks if currently blending animations
     */
    public isCurrentlyBlending(): boolean {
        return this.isBlending;
    }
}

// ============================================================================
// MOBILE INPUT MANAGER
// ============================================================================

class MobileInputManager {
    private static isInitialized = false;
    private static joystickContainer: HTMLDivElement | null = null;
    private static joystickStick: HTMLDivElement | null = null;
    private static joystickCenter: { x: number, y: number } = { x: 0, y: 0 };
    private static joystickActive = false;
    private static joystickTouchId: number | null = null;

    private static jumpButton: HTMLDivElement | null = null;
    private static boostButton: HTMLDivElement | null = null;
    private static jumpActive = false;
    private static boostActive = false;
    private static jumpTouchId: number | null = null;
    private static boostTouchId: number | null = null;

    private static inputDirection = new BABYLON.Vector3(0, 0, 0);
    private static wantJump = false;
    private static wantBoost = false;

    /**
     * Initializes mobile touch controls
     * @param canvas The Babylon.js canvas element
     */
    public static initialize(canvas: HTMLCanvasElement): void {
        if (this.isInitialized) {
            return;
        }

        // Clean up any existing controls first
        this.cleanupExistingControls();

        // Ensure canvas takes full screen on mobile
        this.setupMobileCanvas(canvas);

        this.createJoystick(canvas);
        this.createActionButtons(canvas);
        this.setupTouchEventListeners(canvas);

        // Apply visibility settings from config
        this.applyVisibilitySettings();



        this.isInitialized = true;
    }

    /**
     * Cleans up any existing mobile controls to prevent duplicates
     */
    private static cleanupExistingControls(): void {
        // Remove any existing joystick containers
        const existingJoysticks = document.querySelectorAll('#mobile-joystick');
        existingJoysticks.forEach(element => {
            element.remove();
        });

        // Remove any existing jump buttons
        const existingJumpButtons = document.querySelectorAll('#mobile-jump-button');
        existingJumpButtons.forEach(element => {
            element.remove();
        });

        // Remove any existing boost buttons
        const existingBoostButtons = document.querySelectorAll('#mobile-boost-button');
        existingBoostButtons.forEach(element => {
            element.remove();
        });

        // Reset state
        this.joystickContainer = null;
        this.joystickStick = null;
        this.jumpButton = null;
        this.boostButton = null;
        this.joystickActive = false;
        this.jumpActive = false;
        this.boostActive = false;
        this.joystickTouchId = null;
        this.jumpTouchId = null;
        this.boostTouchId = null;
        this.inputDirection.set(0, 0, 0);
        this.wantJump = false;
        this.wantBoost = false;
    }

    /**
     * Sets up canvas for full-screen mobile display
     * @param canvas The canvas element
     */
    private static setupMobileCanvas(canvas: HTMLCanvasElement): void {
        // Get the canvas container
        const container = canvas.parentElement;
        if (!container) return;

        // Set canvas to full screen on mobile
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1';

        // Ensure container doesn't interfere
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.margin = '0';
        container.style.padding = '0';
        container.style.overflow = 'hidden';

        // Prevent body scrolling on mobile
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';

        // Force canvas resize using window resize event
        window.dispatchEvent(new Event('resize'));

        // Handle orientation changes
        this.setupOrientationHandler(canvas);
    }

    /**
     * Sets up orientation change handling for mobile
     * @param canvas The canvas element
     */
    private static setupOrientationHandler(canvas: HTMLCanvasElement): void {
        const handleOrientationChange = () => {
            // Small delay to ensure orientation change is complete
            setTimeout(() => {
                // Force canvas resize using window resize event
                window.dispatchEvent(new Event('resize'));
            }, 100);
        };

        // Listen for orientation changes
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
    }

    /**
     * Creates the virtual joystick for movement
     * @param canvas The canvas element
     */
    private static createJoystick(canvas: HTMLCanvasElement): void {
        const container = canvas.parentElement;
        if (!container) return;

        // Create joystick container
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.id = 'mobile-joystick';
        this.joystickContainer.style.cssText = `
            position: fixed;
            bottom: ${MOBILE_CONTROLS.POSITIONS.JOYSTICK.BOTTOM}px;
            left: ${MOBILE_CONTROLS.POSITIONS.JOYSTICK.LEFT}px;
            width: ${MOBILE_CONTROLS.JOYSTICK_RADIUS * 2}px;
            height: ${MOBILE_CONTROLS.JOYSTICK_RADIUS * 2}px;
            border-radius: 50%;
            background-color: ${MOBILE_CONTROLS.COLORS.JOYSTICK_BG};
            opacity: ${MOBILE_CONTROLS.OPACITY};
            border: 2px solid rgba(255, 255, 255, 0.3);
            z-index: 1000;
            pointer-events: auto;
            user-select: none;
            touch-action: none;
        `;

        // Create joystick stick
        this.joystickStick = document.createElement('div');
        this.joystickStick.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: ${MOBILE_CONTROLS.COLORS.JOYSTICK_STICK};
            transform: translate(-50%, -50%);
            pointer-events: none;
            transition: transform 0.1s ease;
        `;

        this.joystickContainer.appendChild(this.joystickStick);
        container.appendChild(this.joystickContainer);

        // Store center position after element is in DOM
        setTimeout(() => {
            const rect = this.joystickContainer?.getBoundingClientRect();
            if (rect) {
                this.joystickCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            }
        }, 0);
    }

    /**
     * Creates action buttons (jump, boost)
     * @param canvas The canvas element
     */
    private static createActionButtons(canvas: HTMLCanvasElement): void {
        const container = canvas.parentElement;
        if (!container) return;

        // Create jump button
        this.jumpButton = document.createElement('div');
        this.jumpButton.id = 'mobile-jump-button';
        this.jumpButton.textContent = 'JUMP';
        this.jumpButton.style.cssText = `
            position: fixed;
            bottom: ${MOBILE_CONTROLS.POSITIONS.JUMP_BUTTON.BOTTOM}px;
            right: ${MOBILE_CONTROLS.POSITIONS.JUMP_BUTTON.RIGHT}px;
            width: ${MOBILE_CONTROLS.BUTTON_SIZE}px;
            height: ${MOBILE_CONTROLS.BUTTON_SIZE}px;
            border-radius: 50%;
            background-color: ${MOBILE_CONTROLS.COLORS.BUTTON_BG};
            color: ${MOBILE_CONTROLS.COLORS.BUTTON_TEXT};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            opacity: ${MOBILE_CONTROLS.OPACITY};
            border: 2px solid rgba(255, 255, 255, 0.3);
            z-index: 1000;
            pointer-events: auto;
            user-select: none;
            touch-action: none;
            transition: all 0.2s ease;
        `;

        // Create boost button
        this.boostButton = document.createElement('div');
        this.boostButton.id = 'mobile-boost-button';
        this.boostButton.textContent = 'BOOST';
        this.boostButton.style.cssText = `
            position: fixed;
            bottom: ${MOBILE_CONTROLS.POSITIONS.BOOST_BUTTON.BOTTOM}px;
            right: ${MOBILE_CONTROLS.POSITIONS.BOOST_BUTTON.RIGHT}px;
            width: ${MOBILE_CONTROLS.BUTTON_SIZE}px;
            height: ${MOBILE_CONTROLS.BUTTON_SIZE}px;
            border-radius: 50%;
            background-color: ${MOBILE_CONTROLS.COLORS.BUTTON_BG};
            color: ${MOBILE_CONTROLS.COLORS.BUTTON_TEXT};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            opacity: ${MOBILE_CONTROLS.OPACITY};
            border: 2px solid rgba(255, 255, 255, 0.3);
            z-index: 1000;
            pointer-events: auto;
            user-select: none;
            touch-action: none;
            transition: all 0.2s ease;
        `;

        container.appendChild(this.jumpButton);
        container.appendChild(this.boostButton);
    }

    /**
     * Sets up touch event listeners
     * @param canvas The canvas element
     */
    private static setupTouchEventListeners(canvas: HTMLCanvasElement): void {
        // Joystick touch events
        if (this.joystickContainer) {
            this.joystickContainer.addEventListener('touchstart', this.handleJoystickTouchStart.bind(this), { passive: false });
            this.joystickContainer.addEventListener('touchmove', this.handleJoystickTouchMove.bind(this), { passive: false });
            this.joystickContainer.addEventListener('touchend', this.handleJoystickTouchEnd.bind(this), { passive: false });
            this.joystickContainer.addEventListener('touchcancel', this.handleJoystickTouchEnd.bind(this), { passive: false });
            this.joystickContainer.addEventListener('pointerdown', this.handleJoystickTouchStart.bind(this), { passive: false });
            this.joystickContainer.addEventListener('pointermove', this.handleJoystickTouchMove.bind(this), { passive: false });
            this.joystickContainer.addEventListener('pointerup', this.handleJoystickTouchEnd.bind(this), { passive: false });
            this.joystickContainer.addEventListener('mouseup', this.handleJoystickTouchEnd.bind(this), { passive: false });
        }

        // Button touch events
        if (this.jumpButton) {
            this.jumpButton.addEventListener('touchstart', this.handleJumpTouchStart.bind(this), { passive: false });
            this.jumpButton.addEventListener('touchend', this.handleJumpTouchEnd.bind(this), { passive: false });
            this.jumpButton.addEventListener('touchcancel', this.handleJumpTouchEnd.bind(this), { passive: false });
            this.jumpButton.addEventListener('pointerdown', this.handleJumpTouchStart.bind(this), { passive: false });
            this.jumpButton.addEventListener('pointerup', this.handleJumpTouchEnd.bind(this), { passive: false });
            this.jumpButton.addEventListener('mouseup', this.handleJumpTouchEnd.bind(this), { passive: false });
        }

        if (this.boostButton) {
            this.boostButton.addEventListener('touchstart', this.handleBoostTouchStart.bind(this), { passive: false });
            this.boostButton.addEventListener('touchend', this.handleBoostTouchEnd.bind(this), { passive: false });
            this.boostButton.addEventListener('touchcancel', this.handleBoostTouchEnd.bind(this), { passive: false });
            this.boostButton.addEventListener('pointerdown', this.handleBoostTouchStart.bind(this), { passive: false });
            this.boostButton.addEventListener('pointerup', this.handleBoostTouchEnd.bind(this), { passive: false });
            this.boostButton.addEventListener('mouseup', this.handleBoostTouchEnd.bind(this), { passive: false });
        }

        // Global touch end handler to catch any missed touch events
        document.addEventListener('touchend', this.handleGlobalTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleGlobalTouchEnd.bind(this), { passive: false });
        document.addEventListener('pointerup', this.handleGlobalTouchEnd.bind(this), { passive: false });
        document.addEventListener('mouseup', this.handleGlobalTouchEnd.bind(this), { passive: false });

        // Add specific boost area touch end handler
        if (this.boostButton) {
            const boostArea = this.boostButton.parentElement;
            if (boostArea) {
                boostArea.addEventListener('touchend', this.handleBoostTouchEnd.bind(this), { passive: false });
                boostArea.addEventListener('touchcancel', this.handleBoostTouchEnd.bind(this), { passive: false });
                boostArea.addEventListener('pointerup', this.handleBoostTouchEnd.bind(this), { passive: false });
                boostArea.addEventListener('mouseup', this.handleBoostTouchEnd.bind(this), { passive: false });
            }
        }


    }

    /**
     * Handles joystick touch/pointer start
     * @param e Touch or Pointer event
     */
    private static handleJoystickTouchStart(e: TouchEvent | PointerEvent): void {
        e.preventDefault();
        if ('touches' in e && e.touches.length > 0) {
            this.joystickActive = true;
            this.joystickTouchId = e.touches[0].identifier;
            this.updateJoystickPosition(e.touches[0]);
        } else if ('pointerId' in e) {
            this.joystickActive = true;
            this.joystickTouchId = e.pointerId;
            this.updateJoystickPositionFromPointer(e);
        }
    }

    /**
     * Handles joystick touch/pointer move
     * @param e Touch or Pointer event
     */
    private static handleJoystickTouchMove(e: TouchEvent | PointerEvent): void {
        e.preventDefault();
        if (!this.joystickActive) return;

        if ('touches' in e) {
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === this.joystickTouchId) {
                    this.updateJoystickPosition(e.touches[i]);
                    break;
                }
            }
        } else if ('pointerId' in e && e.pointerId === this.joystickTouchId) {
            this.updateJoystickPositionFromPointer(e);
        }
    }

    /**
     * Handles joystick touch/pointer end
     * @param e Touch or Pointer event
     */
    private static handleJoystickTouchEnd(e: TouchEvent | PointerEvent): void {
        e.preventDefault();
        this.joystickActive = false;
        this.joystickTouchId = null;
        this.resetJoystick();

        // Force reset movement input to ensure it stops
        this.inputDirection.set(0, 0, 0);
    }

    /**
     * Updates joystick position and calculates input direction
     * @param touch Touch object
     */
    private static updateJoystickPosition(touch: Touch): void {
        if (!this.joystickStick || !this.joystickContainer) return;

        // Update joystick center position dynamically
        this.updateJoystickCenterPosition();

        const rect = this.joystickContainer.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        const deltaX = touchX - centerX;
        const deltaY = touchY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Apply deadzone
        if (distance < MOBILE_CONTROLS.JOYSTICK_DEADZONE) {
            this.resetJoystick();
            return;
        }

        // Clamp to joystick radius
        const maxDistance = MOBILE_CONTROLS.JOYSTICK_RADIUS - 15; // Leave space for stick
        const clampedDistance = Math.min(distance, maxDistance);

        // Calculate normalized direction
        const normalizedX = deltaX / distance;
        const normalizedY = deltaY / distance;

        // Update stick position - use percentage-based positioning
        const stickX = (normalizedX * clampedDistance);
        const stickY = (normalizedY * clampedDistance);

        this.joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;

        // Update input direction (invert Y for forward/backward)
        this.inputDirection.x = normalizedX;
        this.inputDirection.z = -normalizedY;
    }

    /**
     * Updates joystick position based on pointer event
     * @param e Pointer event
     */
    private static updateJoystickPositionFromPointer(e: PointerEvent): void {
        if (!this.joystickStick || !this.joystickContainer) return;

        // Update joystick center position dynamically
        this.updateJoystickCenterPosition();

        const rect = this.joystickContainer.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const touchX = e.clientX - rect.left;
        const touchY = e.clientY - rect.top;

        const deltaX = touchX - centerX;
        const deltaY = touchY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Apply deadzone
        if (distance < MOBILE_CONTROLS.JOYSTICK_DEADZONE) {
            this.resetJoystick();
            return;
        }

        // Clamp to joystick radius
        const maxDistance = MOBILE_CONTROLS.JOYSTICK_RADIUS - 15; // Leave space for stick
        const clampedDistance = Math.min(distance, maxDistance);

        // Calculate normalized direction
        const normalizedX = deltaX / distance;
        const normalizedY = deltaY / distance;

        // Update stick position - use percentage-based positioning
        const stickX = (normalizedX * clampedDistance);
        const stickY = (normalizedY * clampedDistance);

        this.joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;

        // Update input direction (invert Y for forward/backward)
        this.inputDirection.x = normalizedX;
        this.inputDirection.z = -normalizedY;
    }

    /**
     * Updates joystick center position based on current element position
     */
    private static updateJoystickCenterPosition(): void {
        if (!this.joystickContainer) return;

        const rect = this.joystickContainer.getBoundingClientRect();
        this.joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    /**
     * Resets joystick to center position
     */
    private static resetJoystick(): void {
        if (this.joystickStick) {
            this.joystickStick.style.transform = 'translate(-50%, -50%)';
        }
        this.inputDirection.set(0, 0, 0);
    }

    /**
     * Handles jump button touch/pointer start
     * @param e Touch or Pointer event
     */
    private static handleJumpTouchStart(e: TouchEvent | PointerEvent): void {
        e.preventDefault();
        this.jumpActive = true;
        this.wantJump = true;

        if ('touches' in e && e.touches.length > 0) {
            this.jumpTouchId = e.touches[0].identifier;
        } else if ('pointerId' in e) {
            this.jumpTouchId = e.pointerId;
        }

        if (this.jumpButton) {
            this.jumpButton.style.backgroundColor = MOBILE_CONTROLS.COLORS.BUTTON_ACTIVE;
        }
    }

    /**
     * Handles jump button touch/pointer end
     * @param e Touch or Pointer event
     */
    private static handleJumpTouchEnd(e: TouchEvent | PointerEvent): void {
        e.preventDefault();
        this.jumpActive = false;
        this.wantJump = false;
        this.jumpTouchId = null;

        if (this.jumpButton) {
            this.jumpButton.style.backgroundColor = MOBILE_CONTROLS.COLORS.BUTTON_BG;
        }

        // Force reset jump input to ensure it stops
        this.wantJump = false;
    }

    /**
     * Handles boost button touch/pointer start
     * @param e Touch or Pointer event
     */
    private static handleBoostTouchStart(e: TouchEvent | PointerEvent): void {
        e.preventDefault();
        this.boostActive = true;
        this.wantBoost = true;

        if ('touches' in e && e.touches.length > 0) {
            this.boostTouchId = e.touches[0].identifier;
        } else if ('pointerId' in e) {
            this.boostTouchId = e.pointerId;
        }

        if (this.boostButton) {
            this.boostButton.style.backgroundColor = MOBILE_CONTROLS.COLORS.BUTTON_ACTIVE;
        }


    }

    /**
     * Handles boost button touch/pointer end
     * @param e Touch or Pointer event
     */
    private static handleBoostTouchEnd(e: TouchEvent | PointerEvent): void {
        e.preventDefault();
        e.stopPropagation();

        // Reset all boost states immediately
        this.boostActive = false;
        this.wantBoost = false;
        this.boostTouchId = null;

        // Reset visual state
        if (this.boostButton) {
            this.boostButton.style.backgroundColor = MOBILE_CONTROLS.COLORS.BUTTON_BG;
        }

        // Force reset boost input to ensure it stops
        this.wantBoost = false;
        this.boostActive = false;


    }



    /**
     * Global touch/pointer end handler to catch any missed touch events
     * @param e Touch or Pointer event
     */
    private static handleGlobalTouchEnd(e: TouchEvent | PointerEvent): void {
        // Reset all inputs when any touch ends to prevent stuck controls
        this.wantJump = false;
        this.wantBoost = false;
        this.boostActive = false;
        this.inputDirection.set(0, 0, 0);
    }

    /**
     * Gets the current input direction from mobile controls
     * @returns Input direction vector
     */
    public static getInputDirection(): BABYLON.Vector3 {
        return this.inputDirection.clone();
    }

    /**
     * Gets whether jump is requested from mobile controls
     * @returns True if jump is requested
     */
    public static getWantJump(): boolean {
        return this.wantJump;
    }

    /**
     * Gets whether boost is requested from mobile controls
     * @returns True if boost is requested
     */
    public static getWantBoost(): boolean {
        return this.wantBoost;
    }

    /**
     * Checks if mobile controls are active
     * @returns True if mobile controls are being used
     */
    public static isMobileActive(): boolean {
        return this.joystickActive || this.jumpActive || this.boostActive;
    }

    /**
     * Shows or hides mobile controls
     * @param visible Whether to show the controls
     */
    public static setVisibility(visible: boolean): void {
        if (this.joystickContainer) {
            this.joystickContainer.style.display = visible ? 'block' : 'none';
        }
        if (this.jumpButton) {
            this.jumpButton.style.display = visible ? 'flex' : 'none';
        }
        if (this.boostButton) {
            this.boostButton.style.display = visible ? 'flex' : 'none';
        }
    }

    public static isVisible(): boolean {
        if (this.joystickContainer) {
            return this.joystickContainer.style.display !== 'none';
        }
        return false;
    }

    /**
     * Updates the position of mobile controls
     * @param controlType The type of control ('joystick', 'jump', 'boost')
     * @param position The new position object with top/bottom/left/right properties
     */
    public static updateControlPosition(controlType: 'joystick' | 'jump' | 'boost', position: { top?: number, bottom?: number, left?: number, right?: number }): void {
        let element: HTMLDivElement | null = null;

        switch (controlType) {
            case 'joystick':
                element = this.joystickContainer;
                break;
            case 'jump':
                element = this.jumpButton;
                break;
            case 'boost':
                element = this.boostButton;
                break;
        }

        if (element) {
            if (position.top !== undefined) {
                element.style.top = `${position.top}px`;
            }
            if (position.bottom !== undefined) {
                element.style.bottom = `${position.bottom}px`;
            }
            if (position.left !== undefined) {
                element.style.left = `${position.left}px`;
            }
            if (position.right !== undefined) {
                element.style.right = `${position.right}px`;
            }


        }
    }

    /**
     * Updates the visibility of individual controls
     * @param controlType The type of control ('joystick', 'jump', 'boost')
     * @param visible Whether to show the control
     */
    public static setControlVisibility(controlType: 'joystick' | 'jump' | 'boost', visible: boolean): void {
        let element: HTMLDivElement | null = null;

        switch (controlType) {
            case 'joystick':
                element = this.joystickContainer;
                break;
            case 'jump':
                element = this.jumpButton;
                break;
            case 'boost':
                element = this.boostButton;
                break;
        }

        if (element) {
            element.style.display = visible ? (controlType === 'joystick' ? 'block' : 'flex') : 'none';

        }
    }

    /**
     * Gets the current position of a mobile control
     * @param controlType The type of control ('joystick', 'jump', 'boost')
     * @returns The current position object
     */
    public static getControlPosition(controlType: 'joystick' | 'jump' | 'boost'): { top?: number, bottom?: number, left?: number, right?: number } {
        let element: HTMLDivElement | null = null;

        switch (controlType) {
            case 'joystick':
                element = this.joystickContainer;
                break;
            case 'jump':
                element = this.jumpButton;
                break;
            case 'boost':
                element = this.boostButton;
                break;
        }

        if (element) {
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top,
                bottom: window.innerHeight - rect.bottom,
                left: rect.left,
                right: window.innerWidth - rect.right
            };
        }

        return {};
    }

    /**
     * Resets all mobile controls to their default positions
     */
    public static resetToDefaultPositions(): void {
        this.updateControlPosition('joystick', {
            bottom: MOBILE_CONTROLS.POSITIONS.JOYSTICK.BOTTOM,
            left: MOBILE_CONTROLS.POSITIONS.JOYSTICK.LEFT
        });

        this.updateControlPosition('jump', {
            bottom: MOBILE_CONTROLS.POSITIONS.JUMP_BUTTON.BOTTOM,
            right: MOBILE_CONTROLS.POSITIONS.JUMP_BUTTON.RIGHT
        });

        this.updateControlPosition('boost', {
            bottom: MOBILE_CONTROLS.POSITIONS.BOOST_BUTTON.BOTTOM,
            right: MOBILE_CONTROLS.POSITIONS.BOOST_BUTTON.RIGHT
        });


    }

    /**
     * Applies visibility settings from the config
     */
    private static applyVisibilitySettings(): void {
        this.setControlVisibility('joystick', MOBILE_CONTROLS.VISIBILITY.SHOW_JOYSTICK);
        this.setControlVisibility('jump', MOBILE_CONTROLS.VISIBILITY.SHOW_JUMP_BUTTON);
        this.setControlVisibility('boost', MOBILE_CONTROLS.VISIBILITY.SHOW_BOOST_BUTTON);
    }

    /**
     * Forces a reset of all mobile control states
     * Call this if controls get stuck
     */
    public static forceResetAllStates(): void {
        // Reset all active states
        this.joystickActive = false;
        this.jumpActive = false;
        this.boostActive = false;

        // Reset all touch IDs
        this.joystickTouchId = null;
        this.jumpTouchId = null;
        this.boostTouchId = null;

        // Reset input direction
        this.inputDirection.set(0, 0, 0);

        // Reset button states
        this.wantJump = false;
        this.wantBoost = false;

        // Reset joystick visual
        this.resetJoystick();

        // Reset button colors
        if (this.jumpButton) {
            this.jumpButton.style.backgroundColor = MOBILE_CONTROLS.COLORS.BUTTON_BG;
        }
        if (this.boostButton) {
            this.boostButton.style.backgroundColor = MOBILE_CONTROLS.COLORS.BUTTON_BG;
        }
    }



    /**
     * Disposes mobile input manager
     */
    public static dispose(): void {


        // Remove event listeners
        document.removeEventListener('touchend', this.handleGlobalTouchEnd.bind(this));
        document.removeEventListener('touchcancel', this.handleGlobalTouchEnd.bind(this));

        // Clean up all existing controls
        this.cleanupExistingControls();

        // Reset initialization flag
        this.isInitialized = false;


    }
}

// ============================================================================
// EFFECTS MANAGER
// ============================================================================

class EffectsManager {
    private static activeParticleSystems: Map<string, BABYLON.IParticleSystem> = new Map();
    private static environmentParticleSystems: Map<string, BABYLON.IParticleSystem> = new Map();
    private static itemParticleSystems: Map<string, BABYLON.IParticleSystem> = new Map();
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
            // Parse the snippet from the online editor
            const particleSystem = await BABYLON.ParticleHelper.ParseFromSnippetAsync(snippet.snippetId, this.scene, false);

            if (particleSystem && emitter) {
                particleSystem.emitter = emitter;
            }

            if (particleSystem) {
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
            }

            return particleSystem;
        } catch (error) {
            console.error(`Failed to create particle system "${snippetName}":`, error);
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
    private static categorizeParticleSystem(name: string, particleSystem: BABYLON.IParticleSystem, category: ParticleSnippet['category']): void {
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
        else {
    
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

            };

            this.activeSounds.set(soundName, sound);

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
        skyConfig: SkyConfig
    ): BABYLON.Mesh {
        // Remove existing sky if present
        this.removeSky(scene);

        // Create sky texture
        this.skyTexture = new BABYLON.Texture(skyConfig.TEXTURE_URL, scene);

        // Apply blur if specified
        if (skyConfig.BLUR > 0) {
            this.skyTexture.level = skyConfig.BLUR;
        }

        // Create sky based on type
        if (skyConfig.TYPE.toUpperCase() === "SPHERE") {
            this.createSkySphere(scene, skyConfig.ROTATION_Y);
        } else {
            this.createSkyBox(scene, skyConfig.ROTATION_Y);
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
        // Clean up any existing HUD before creating a new one
        if (this.hudContainer) {
            this.dispose();
        }

        this.scene = scene;
        this.characterController = characterController;
        this.startTime = Date.now();
        this.createHUD();

        // Detect if this is a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);

        // Set initial visibility for all HUD elements based on device type
        if (isMobile) {
            // Mobile: Only show state, boost, and credits
            this.setElementVisibility('coordinates', false);
            this.setElementVisibility('time', false);
            this.setElementVisibility('fps', false);
            this.setElementVisibility('state', true);
            this.setElementVisibility('boost', true);
            this.setElementVisibility('credits', true);
        } else {
            // Desktop: Show all elements
            this.setElementVisibility('coordinates', CONFIG.HUD.SHOW_COORDINATES);
            this.setElementVisibility('time', CONFIG.HUD.SHOW_TIME);
            this.setElementVisibility('fps', CONFIG.HUD.SHOW_FPS);
            this.setElementVisibility('state', CONFIG.HUD.SHOW_STATE);
            this.setElementVisibility('boost', CONFIG.HUD.SHOW_BOOST_STATUS);
            this.setElementVisibility('credits', CONFIG.HUD.SHOW_CREDITS);
        }

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
        element.style.cssText = this.getHUDElementStyles() + 'display: none;'; // Start hidden

        const labelSpan = document.createElement('span');
        labelSpan.className = 'hud-label';
        labelSpan.textContent = label;
        labelSpan.style.color = CONFIG.HUD.SECONDARY_COLOR;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'hud-value';
        valueSpan.id = `hud-${id}-value`;
        valueSpan.style.color = CONFIG.HUD.PRIMARY_COLOR;
        // Prevent awkward wrapping for coordinates
        if (id === 'coordinates') {
            valueSpan.style.whiteSpace = 'nowrap';
            valueSpan.style.minWidth = '180px';
            valueSpan.style.display = 'inline-block';
        }

        element.appendChild(labelSpan);
        // Only add <br> for non-coordinates elements
        if (id !== 'coordinates') {
            element.appendChild(document.createElement('br'));
        } else {
            // Add a little space between label and value for coordinates
            labelSpan.style.marginRight = '8px';
        }
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

        // Detect if this is a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);

        // Update coordinates
        if (isMobile ? CONFIG.HUD.MOBILE.SHOW_COORDINATES : CONFIG.HUD.SHOW_COORDINATES) {
            this.updateCoordinates();
        }

        // Update time
        if (isMobile ? CONFIG.HUD.MOBILE.SHOW_TIME : CONFIG.HUD.SHOW_TIME) {
            this.updateTime();
        }

        // Update FPS
        if (isMobile ? CONFIG.HUD.MOBILE.SHOW_FPS : CONFIG.HUD.SHOW_FPS) {
            this.updateFPS();
        }

        // Update state
        if (isMobile ? CONFIG.HUD.MOBILE.SHOW_STATE : CONFIG.HUD.SHOW_STATE) {
            this.updateState();
        }

        // Update boost status
        if (isMobile ? CONFIG.HUD.MOBILE.SHOW_BOOST_STATUS : CONFIG.HUD.SHOW_BOOST_STATUS) {
            this.updateBoostStatus();
        }

        // Update credits
        if (isMobile ? CONFIG.HUD.MOBILE.SHOW_CREDITS : CONFIG.HUD.SHOW_CREDITS) {
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
            // Always format on a single line
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
        // Update element styles (but preserve display property)
        this.hudElements.forEach((element, id) => {
            const currentDisplay = element.style.display;
            element.style.cssText = this.getHUDElementStyles();
            // Preserve the current display state
            if (currentDisplay) {
                element.style.display = currentDisplay;
            }
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
    private static physicsShape: BABYLON.PhysicsShape | null = null; // Reusable physics shape

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

        // Simple delay to allow physics to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
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

        // Initialize with empty state - items will be loaded per environment
        return Promise.resolve();
    }

    public static async setupEnvironmentItems(environment: Environment): Promise<void> {
        if (!this.scene || !environment.items) {
            console.warn("CollectiblesManager not properly initialized or no items in environment");
            return;
        }

        // Clear any existing state
        this.collectibles.clear();
        this.collectibleBodies.clear();
        this.collectedItems.clear();

        // Set up collectibles for this environment
        await this.setupCollectiblesForEnvironment(environment);
    }

    /**
     * Sets up collectibles for a specific environment
     */
    private static async setupCollectiblesForEnvironment(environment: Environment): Promise<void> {
        if (!this.scene || !environment.items) {
            console.warn("Scene or items not available in setupCollectiblesForEnvironment");
            return;
        }

        // Wait for physics to be properly initialized
        await this.waitForPhysicsInitialization();

        // Create collection sound (using default sound for now)
        this.collectionSound = new BABYLON.Sound(
            "collectionSound",
            "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/main/assets/sounds/effects/collect.m4a",
            this.scene,
            null,
            { volume: 0.7 }
        );

        // Iterate through all items in environment
        for (const itemConfig of environment.items) {
            // Only process collectible items
            if (itemConfig.collectible) {
                await this.loadItemModel(itemConfig);

                // Create instances for this item
                for (let i = 0; i < itemConfig.instances.length; i++) {
                    const instance = itemConfig.instances[i];
                    const instanceId = `${itemConfig.name.toLowerCase()}_instance_${i + 1}`;
                    await this.createCollectibleInstance(instanceId, instance);
                }
            }
        }

        // Set up physics collision detection
        this.setupCollisionDetection();
    }

    /**
     * Loads an item model to use as instance basis
     */
    private static async loadItemModel(itemConfig: ItemConfig): Promise<void> {
        if (!this.scene) {
            console.warn("Scene not available in loadItemModel");
            return;
        }

        try {
            const result = await BABYLON.ImportMeshAsync(itemConfig.url, this.scene);

            // Rename the root node for better organization
            if (result.meshes && result.meshes.length > 0) {
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
                    return mesh.geometry && mesh.geometry.getTotalVertices() > 0;
                }
                return false;
            });

            if (meshWithGeometry) {
                // Use the first mesh with geometry as the instance basis
                this.instanceBasis = meshWithGeometry as BABYLON.Mesh;

                // Make the instance basis invisible and disable it in the scene
                this.instanceBasis.isVisible = false;
                this.instanceBasis.setEnabled(false);



                // Create reusable physics shape for better performance
                const boundingInfo = this.instanceBasis.getBoundingInfo();
                if (boundingInfo) {
                    const size = boundingInfo.boundingBox.maximumWorld.subtract(boundingInfo.boundingBox.minimumWorld);
                    this.physicsShape = new BABYLON.PhysicsShapeBox(
                        BABYLON.Vector3.Zero(), // Center - use static zero
                        BABYLON.Quaternion.Identity(), // Rotation - use static identity
                        size.scale(0.5), // Half-size for box shape
                        this.scene
                    );

                } else {
                    // Fallback to default size
                    this.physicsShape = new BABYLON.PhysicsShapeBox(
                        BABYLON.Vector3.Zero(), // Center - use static zero
                        BABYLON.Quaternion.Identity(), // Rotation - use static identity
                        BABYLON.Vector3.One(), // Size - use static one
                        this.scene
                    );

                }

            } else {
                console.warn("No meshes with geometry found in item model, creating fallback");
                this.createFallbackInstanceBasis();
            }
        } catch (error) {
            console.error("Failed to load item model:", error);

            this.createFallbackInstanceBasis();
        }
    }

    /**
     * Creates a fallback instance basis using a simple box
     */
    private static createFallbackInstanceBasis(): void {
        if (!this.scene) return;

        // Create a fallback item using a simple box - CAST TO MESH!
        this.instanceBasis = BABYLON.MeshBuilder.CreateBox("fallback_item_basis", { size: 2 }, this.scene) as BABYLON.Mesh; // Larger size

        // Create a bright baby blue material to make it very visible
        const material = new BABYLON.StandardMaterial("fallback_item_basis_material", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1); // Baby blue
        material.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.3); // Subtle blue glow
        material.specularColor = new BABYLON.Color3(1, 1, 1); // Shiny
        this.instanceBasis.material = material;

        // Instance basis should not be scaled - scaling will be applied to individual instances

        // Make the instance basis invisible and disable it in the scene
        this.instanceBasis.isVisible = false;
        this.instanceBasis.setEnabled(false);

        // Create reusable physics shape for fallback items
        this.physicsShape = new BABYLON.PhysicsShapeBox(
            BABYLON.Vector3.Zero(), // Center - use static zero
            BABYLON.Quaternion.Identity(), // Rotation - use static identity
            BABYLON.Vector3.One(), // Size - use static one
            this.scene
        );

    }

    /**
     * Creates a collectible instance from the instance basis
     * @param id Unique identifier for the collectible
     * @param instance ItemInstance configuration for the collectible
     */
    private static async createCollectibleInstance(id: string, instance: ItemInstance): Promise<void> {
        if (!this.scene || !this.instanceBasis) {
            console.error("No scene or instance basis available for creating collectible instance");
            return;
        }

        try {
            // Create an instance from the loaded model
            const meshInstance = this.instanceBasis.createInstance(id);

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
            const boundingBox = meshInstance.getBoundingInfo();
            const scaledSize = boundingBox.boundingBox.extendSize.scale(2); // Multiply by 2 to get full size

            // Create physics body with dynamic box shape based on scaled dimensions
            const physicsAggregate = new BABYLON.PhysicsAggregate(
                meshInstance,
                BABYLON.PhysicsShapeType.BOX,
                { mass: instance.mass }
            );

            // Note: Physics shape size is determined by the mesh's bounding box
            // The scaling applied to the mesh will automatically affect the physics shape

            // Store references
            this.collectibles.set(id, meshInstance);
            if (physicsAggregate.body) {
                this.collectibleBodies.set(id, physicsAggregate.body);
            }

            // Add rotation animation
            this.addRotationAnimation(meshInstance);
        } catch (error) {
            console.error(`Failed to create collectible instance ${id}:`, error);
        }
    }

    /**
     * Creates a collectible item (legacy method - kept for fallback)
     * @param id Unique identifier for the collectible
     * @param instance ItemInstance configuration for the collectible
     */
    private static async createCollectible(id: string, instance: ItemInstance): Promise<void> {
        // Since we've moved to environment-specific items, this method is no longer used
        // The createCollectibleInstance method handles individual item creation
        console.warn(`createCollectible method is deprecated. Use createCollectibleInstance instead.`);
        return;
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
        const collectionRadius = 1.5; // Default collection radius

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

        // For now, use a default item config since we don't have access to the environment items here
        // In a more complete implementation, we would store the item config with each collectible
        const itemConfig = {
            name: "Crate",
            collectible: true,
            creditValue: 100,
            minImpulseForCollection: 0.5
        } as ItemConfig;

        if (!itemConfig) {
            console.warn(`No item config found for collectible ${collectibleId}`);
            return;
        }

        const characterVelocity = this.characterController.getVelocity();
        const speed = characterVelocity.length();

        if (speed >= itemConfig.minImpulseForCollection) {
            this.collectItem(collectibleId, collectibleMesh, itemConfig);
        }
    }

    /**
     * Collects an item and adds credits
     * @param collectibleId The ID of the collectible
     * @param collectibleMesh The mesh of the collectible
     */
    private static collectItem(collectibleId: string, collectibleMesh: BABYLON.AbstractMesh, itemConfig: ItemConfig): void {
        // Mark as collected to prevent multiple collections
        this.collectedItems.add(collectibleId);

        // Add credits
        this.totalCredits += itemConfig.creditValue;

        // Play collection sound
        if (this.collectionSound) {
            this.collectionSound.play();
        }

        // Show collection effects
        if (true) { // Default to showing collection effects
            this.showCollectionEffects(collectibleMesh.position);
        }

        // Remove the collectible
        this.removeCollectible(collectibleId);


    }

    /**
     * Shows collection effects at the specified position
     * @param position Position to show effects
     */
    private static async showCollectionEffects(position: BABYLON.Vector3): Promise<void> {
        if (!this.scene) return;

        // Create a particle effect for collection
        const particleSystem = new BABYLON.ParticleSystem("Magic Sparkles_ITEMS", 50, this.scene);

        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);
        particleSystem.emitter = position;
        // Use direct object creation for better performance
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

        particleSystem.start();
        
        // Add to item particle systems for proper cleanup
        EffectsManager.addItemParticleSystem("Magic Sparkles_ITEMS", particleSystem);

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
     * Clears all collectibles without disposing of the manager
     */
    public static clearCollectibles(): void {
        // Remove all collectibles
        for (const [id, mesh] of this.collectibles.entries()) {
            this.removeCollectible(id);
        }

        // Clear collections but keep manager initialized
        this.collectibles.clear();
        this.collectibleBodies.clear();
        this.collectedItems.clear();

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
        const rotatedOffset = this.offset.rotateByQuaternionToRef(yRot, BABYLON.Vector3.Zero());
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

    /**
     * Force activate smooth following, useful after environment transitions
     */
    public forceActivateSmoothFollow(): void {
        this.shouldStartRotationOnWalk = false;
        this.isRotatingCharacter = false;
        this.isDragging = false;
        this.dragDeltaX = 0;
        this.dragDeltaZ = 0;
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
    public animationController: AnimationController;

    // Mobile device detection - computed once at initialization
    private readonly isMobileDevice: boolean;
    private readonly isIPadWithKeyboard: boolean;
    private readonly isIPad: boolean;
    private keyboardEventCount: number = 0;
    private keyboardDetectionTimeout: number | null = null;
    private physicsPaused: boolean = false;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;

        // Enhanced device detection
        this.isMobileDevice = this.detectMobileDevice();
        this.isIPad = this.detectIPad();
        this.isIPadWithKeyboard = this.detectIPadWithKeyboard();

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

        // Initialize animation controller
        this.animationController = new AnimationController(scene);

        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.scene.onKeyboardObservable.add(this.handleKeyboard);
        this.scene.onBeforeRenderObservable.add(this.updateCharacter);
        this.scene.onAfterPhysicsObservable.add(this.updatePhysics);

        // Initialize mobile controls if on mobile device
        if (this.isMobileDevice) {
            MobileInputManager.initialize(this.scene.getEngine().getRenderingCanvas()!);
        }
    }

    private detectMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);
    }

    private detectIPad(): boolean {
        // More specific iPad detection
        return /iPad/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0);
    }

    private detectIPadWithKeyboard(): boolean {
        if (!this.isIPad) return false;

        // Check for keyboard presence using various methods
        const hasKeyboard = this.checkForKeyboardPresence();
        const hasExternalKeyboard = this.checkForExternalKeyboard();

        return hasKeyboard || hasExternalKeyboard;
    }

    private checkForKeyboardPresence(): boolean {
        // Method 1: Check if virtual keyboard is likely present
        // This is not 100% reliable but gives us a good indication
        const viewportHeight = window.innerHeight;
        const screenHeight = window.screen.height;
        const keyboardLikelyPresent = viewportHeight < screenHeight * 0.8;

        return keyboardLikelyPresent;
    }

    private checkForExternalKeyboard(): boolean {
        // Method 2: Check for external keyboard events
        // We'll track if we receive keyboard events that suggest an external keyboard
        this.keyboardEventCount = 0;
        const keyboardThreshold = 3; // Number of events to consider keyboard present

        const checkKeyboardEvents = (event: KeyboardEvent) => {
            // Only count events that are likely from a physical keyboard
            // (not virtual keyboard events which often have different characteristics)
            if (event.key.length === 1 ||
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Shift'].includes(event.key)) {
                this.keyboardEventCount++;

                if (this.keyboardEventCount >= keyboardThreshold) {
                    // Remove the listener once we've confirmed keyboard presence
                    document.removeEventListener('keydown', checkKeyboardEvents);
                    if (this.keyboardDetectionTimeout) {
                        clearTimeout(this.keyboardDetectionTimeout);
                    }
                    return true;
                }
            }
            return false;
        };

        // Add listener for a short period to detect keyboard
        document.addEventListener('keydown', checkKeyboardEvents);

        // Remove listener after 5 seconds if no keyboard detected
        this.keyboardDetectionTimeout = window.setTimeout(() => {
            document.removeEventListener('keydown', checkKeyboardEvents);
        }, 5000);

        return false; // Will be updated by the event listener
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

        // Only update mobile input for iPads with keyboards, not for regular keyboard input
        if (this.isIPadWithKeyboard) {
            this.updateMobileInput();
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

        // Only update mobile input for iPads with keyboards, not for regular keyboard input
        if (this.isIPadWithKeyboard) {
            this.updateMobileInput();
        }
    }

    private updateMobileInput(): void {
        // Only update mobile input if this is a mobile device
        if (this.isMobileDevice) {
            // Get mobile input direction
            const mobileDirection = MobileInputManager.getInputDirection();

            // For iPads with keyboards, allow both keyboard and touch input to work together
            if (this.isIPadWithKeyboard) {
                // Always allow touch input for rotation (X-axis)
                if (Math.abs(mobileDirection.x) > 0.1) {
                    this.targetRotationY += mobileDirection.x * CONFIG.CHARACTER.ROTATION_SPEED;
                }

                // For movement (Z-axis), use keyboard if available, otherwise use touch
                const hasKeyboardMovement = this.keysDown.has('w') || this.keysDown.has('s') ||
                    this.keysDown.has('arrowup') || this.keysDown.has('arrowdown');

                if (!hasKeyboardMovement && Math.abs(mobileDirection.z) > 0.1) {
                    // Use touch input for forward/backward movement when no keyboard movement
                    this.inputDirection.z = mobileDirection.z;
                } else if (!hasKeyboardMovement) {
                    // Reset Z movement when no input
                    this.inputDirection.z = 0;
                }

                // For actions (jump/boost), allow both keyboard and touch
                const mobileWantJump = MobileInputManager.getWantJump();
                const mobileWantBoost = MobileInputManager.getWantBoost();

                // Use keyboard input if available, otherwise use touch input
                if (!this.keysDown.has(' ') && mobileWantJump) {
                    this.wantJump = true;
                } else if (!this.keysDown.has(' ') && !mobileWantJump) {
                    this.wantJump = false;
                }
                if (!this.keysDown.has('shift') && mobileWantBoost) {
                    this.boostActive = true;
                } else if (!this.keysDown.has('shift') && !mobileWantBoost) {
                    this.boostActive = false;
                }
            } else {
                // Standard mobile behavior - replace keyboard input with touch input
                this.inputDirection.copyFrom(mobileDirection);

                // Update player rotation based on X-axis (left/right)
                if (Math.abs(mobileDirection.x) > 0.1) {
                    this.targetRotationY += mobileDirection.x * CONFIG.CHARACTER.ROTATION_SPEED;
                }

                // Set forward/backward movement based on Y-axis
                if (Math.abs(mobileDirection.z) > 0.1) {
                    this.inputDirection.z = mobileDirection.z;
                } else {
                    this.inputDirection.z = 0;
                }

                // Clear X movement since we're using it for rotation
                this.inputDirection.x = 0;

                // Use mobile input for actions
                this.wantJump = MobileInputManager.getWantJump();
                this.boostActive = MobileInputManager.getWantBoost();
            }

            // Always update particle system to ensure proper on/off state
            this.updateParticleSystem();
        }
    }



    private toggleDebugDisplay(): void {
        this.displayCapsule.isVisible = !this.displayCapsule.isVisible;
    }

    private toggleHUD(): void {
        // This would need to be connected to HUDManager

    }

    private cycleHUDPosition(): void {
        // This would need to be connected to HUDManager

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
        // Update mobile input every frame
        this.updateMobileInput();

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
        const isMoving = this.isAnyMovementKeyPressed();

        // Update animation controller
        this.animationController.updateAnimation(isMoving);

        // Update blend weights if currently blending
        this.animationController.updateBlend();

        // Check for walk activation to trigger character rotation
        if (isMoving && this.cameraController) {
            this.cameraController.checkForWalkActivation();
        }
    }

    private isAnyMovementKeyPressed(): boolean {
        // Check keyboard input
        const keyboardMoving = INPUT_KEYS.FORWARD.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.BACKWARD.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.LEFT.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.RIGHT.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.STRAFE_LEFT.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.STRAFE_RIGHT.some(key => this.keysDown.has(key));

        // Check mobile input
        if (this.isMobileDevice) {
            const mobileMoving = MobileInputManager.isMobileActive() &&
                (MobileInputManager.getInputDirection().length() > 0.1);

            // For iPads with keyboards, either input can trigger movement
            if (this.isIPadWithKeyboard) {
                return keyboardMoving || mobileMoving;
            } else {
                // For pure mobile, only mobile input matters
                return mobileMoving;
            }
        }

        return keyboardMoving;
    }

    private updatePhysics = (): void => {
        if (!this.scene.deltaTime) return;

        const deltaTime = this.scene.deltaTime / 1000.0;
        if (deltaTime === 0) return;

        // Skip physics updates if paused
        if (this.physicsPaused) return;

        const down = BABYLON.Vector3.Down();
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

        const forwardLocalSpace = BABYLON.Vector3.Forward();
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
            BABYLON.Vector3.Zero(), desiredVelocity, upWorld
        );

        // Add minimal air resistance to reduce sliding in air
        const airResistance = 0.98; // Reduced air resistance (was 0.95)
        outputVelocity.scaleInPlace(airResistance);

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

        // Add minimal friction and damping to reduce sliding
        const friction = 0.95; // Reduce velocity by only 5% each frame (was 15%)
        const maxSpeed = speed * 2.0; // Allow higher max speed (was 1.2)

        // Apply friction
        outputVelocity.scaleInPlace(friction);

        // Clamp velocity to prevent excessive sliding
        const currentSpeed = outputVelocity.length();
        if (currentSpeed > maxSpeed) {
            outputVelocity.normalize().scaleInPlace(maxSpeed);
        }

        // Add minimal damping when no input is detected
        if (this.inputDirection.length() < 0.1) {
            outputVelocity.scaleInPlace(0.9); // Reduced damping when not moving (was 0.7)
        }

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

    public setPlayerParticleSystem(particleSystem: BABYLON.IParticleSystem | null): void {
        this.playerParticleSystem = particleSystem;
        // Start with particle system stopped if it exists
        if (particleSystem) {
            particleSystem.stop();
        }
    }

    public getPlayerParticleSystem(): BABYLON.IParticleSystem | null {
        return this.playerParticleSystem;
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

    public setPosition(position: BABYLON.Vector3): void {
        this.characterController.setPosition(position);
    }

    public setVelocity(velocity: BABYLON.Vector3): void {
        this.characterController.setVelocity(velocity);
    }

    /**
     * Pauses physics updates for the character
     */
    public pausePhysics(): void {
        this.physicsPaused = true;
        // Set velocity to zero to stop movement
        this.characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
    }

    /**
     * Resumes physics updates for the character
     */
    public resumePhysics(): void {
        this.physicsPaused = false;
    }

    /**
     * Checks if physics is currently paused
     */
    public isPhysicsPaused(): boolean {
        return this.physicsPaused;
    }

    /**
     * Resets the character to the starting position
     */
    public resetToStartPosition(): void {
        this.characterController.setPosition(CONFIG.CHARACTER.START_POSITION);
        this.characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
        this.inputDirection.setAll(0);
        this.wantJump = false;
        this.boostActive = false;
        this.state = CHARACTER_STATES.IN_AIR;
    }

    public dispose(): void {


        // Dispose mobile input manager
        MobileInputManager.dispose();


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
    private currentEnvironment: string = "Level Test"; // Track current environment

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
        await this.loadEnvironment("Level Test");
        this.setupCharacter();
        this.loadCharacterModel();
        
        // Set up environment items after character is fully loaded
        await this.setupEnvironmentItems();
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
        // Sky will be set up when environment is loaded
    }

    private async setupEffects(): Promise<void> {
        try {
            EffectsManager.initialize(this.scene);

            // Create thruster sound
            await EffectsManager.createSound("Thruster");
        } catch (error) {
            console.warn("Failed to setup effects:", error);
        }
    }

    public async loadEnvironment(environmentName: string): Promise<void> {
        // Find the environment by name
        const environment = ASSETS.ENVIRONMENTS.find(env => env.name === environmentName);
        if (!environment) {
            console.error(`Environment "${environmentName}" not found in ASSETS.ENVIRONMENTS`);
            return;
        }

        // Clear existing environment particles before creating new ones
        this.clearParticles();

        try {
            const result = await BABYLON.ImportMeshAsync(environment.model, this.scene);

            // Rename the root node to "environment" for better organization
            if (result.meshes && result.meshes.length > 0) {
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

            // Set up environment-specific sky if configured
            if (environment.sky) {
                try {
                    SkyManager.createSky(this.scene, environment.sky);
                } catch (error) {
                    console.warn("Failed to create environment sky:", error);
                }
            }

            this.setupEnvironmentPhysics(environment);

            // Set up environment-specific particles if configured
            if (environment.particles) {
                try {
                    for (const particle of environment.particles) {
                        const particleSystem = await EffectsManager.createParticleSystem(particle.name, particle.position);
                        
                        // Apply environment-specific settings if provided
                        if (particleSystem && particle.updateSpeed !== undefined) {
                            particleSystem.updateSpeed = particle.updateSpeed;
                        }
                    }
                } catch (error) {
                    console.warn("Failed to create environment particles:", error);
                }
            }

            // Environment items will be set up after character is fully loaded
            // This ensures CollectiblesManager is properly initialized

            // Update current environment tracking
            this.currentEnvironment = environmentName;
        } catch (error) {
            console.error("Failed to load environment:", error);
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
        const lightmap = new BABYLON.Texture(environment.lightmap);

        environment.lightmappedMeshes.forEach(lightmappedMesh => {
            const mesh = this.scene.getMeshByName(lightmappedMesh.name);
            if (!mesh) return;

            new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH);
            mesh.isPickable = false;

            if (mesh.material instanceof BABYLON.StandardMaterial || mesh.material instanceof BABYLON.PBRMaterial) {
                mesh.material.lightmapTexture = lightmap;
                mesh.material.useLightmapAsShadowmap = true;
                (mesh.material.lightmapTexture as BABYLON.Texture).uAng = Math.PI;
                (mesh.material.lightmapTexture as BABYLON.Texture).level = lightmappedMesh.level;
                (mesh.material.lightmapTexture as BABYLON.Texture).coordinatesIndex = 1;
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

                new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: physicsObject.mass });
            }
        });
    }

    private setupJoints(environment: Environment): void {
        // Find objects with PIVOT_BEAM role
        const pivotBeams = environment.physicsObjects.filter(obj => obj.role === OBJECT_ROLE.PIVOT_BEAM);

        pivotBeams.forEach(pivotBeam => {
            const beamMesh = this.scene.getMeshByName(pivotBeam.name);
            beamMesh.scaling.set(3, 0.05, 1);
            if (!beamMesh) return;

            // Find a fixed mass object to attach the hinge to
            const fixedMassObject = environment.physicsObjects.find(obj => obj.role === OBJECT_ROLE.DYNAMIC_BOX && obj.mass === 0);
            if (!fixedMassObject) return;

            const fixedMesh = this.scene.getMeshByName(fixedMassObject.name);
            if (!fixedMesh) return;

            // Create physics aggregates if they don't exist
            const fixedMass = new BABYLON.PhysicsAggregate(fixedMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0 });
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

    private setupFallbackPhysics(environment: Environment): void {
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
            if (mesh instanceof BABYLON.Mesh && mesh.geometry && mesh.geometry.getTotalVertices() > 0) {
                // Create a static physics body (mass = 0) for environment geometry
                // The physics shape will automatically account for the mesh's current scaling
                new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0 });
                mesh.isPickable = false;
            }
        });
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
        // Load the first character from the CHARACTERS array
        const character = ASSETS.CHARACTERS[0];
        if (!character) {
            console.error("No character found in ASSETS.CHARACTERS");
            return;
        }

        this.loadCharacter(character);
    }

    private loadCharacter(character: Character): void {
        // Remove all animation groups from the scene before loading a new character
        this.scene.animationGroups.slice().forEach(group => group.dispose());
        
        BABYLON.ImportMeshAsync(character.model, this.scene)
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
                    // Apply character scale to all meshes
                    result.meshes.forEach(mesh => {
                        mesh.scaling.setAll(character.scale);
                    });

                    this.characterController.setPlayerMesh(result.meshes[0]);

                                    // Setup animations using character's animation mapping with fallbacks
                playerAnimations.walk = result.animationGroups.find(a => a.name === character.animations.walk) ||
                    result.animationGroups.find(a => a.name.toLowerCase().includes('walk')) ||
                    result.animationGroups.find(a => a.name.toLowerCase().includes('run')) ||
                    result.animationGroups.find(a => a.name.toLowerCase().includes('move'));
                
                playerAnimations.idle = result.animationGroups.find(a => a.name === character.animations.idle) ||
                    result.animationGroups.find(a => a.name.toLowerCase().includes('idle')) ||
                    result.animationGroups.find(a => a.name.toLowerCase().includes('stand'));

                // Debug: Log animation setup results
                if (!playerAnimations.walk || !playerAnimations.idle) {
                    console.warn(`Animation setup for ${character.name}:`, {
                        available: result.animationGroups.map(a => a.name),
                        found: {
                            walk: playerAnimations.walk?.name || 'NOT FOUND',
                            idle: playerAnimations.idle?.name || 'NOT FOUND'
                        }
                    });
                }

                // Stop animations initially
                playerAnimations.walk?.stop();
                playerAnimations.idle?.stop();

                    // Set character in animation controller
                    this.characterController.animationController.setCharacter(character);

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
                console.error(`Failed to load character model (${character.name}):`, error);
            });
    }

    public getScene(): BABYLON.Scene {
        return this.scene;
    }

    public getCurrentEnvironment(): string {
        return this.currentEnvironment;
    }

    /**
     * Sets up environment items after character is fully loaded
     */
    public async setupEnvironmentItems(): Promise<void> {
        const environment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
        
        if (environment && environment.items) {
            try {
                await CollectiblesManager.setupEnvironmentItems(environment);
            } catch (error) {
                console.warn("Failed to setup environment items:", error);
            }
        }
    }

    /**
     * Repositions the character to a safe location in the new environment
     */
    public repositionCharacter(): void {
        if (!this.characterController) return;

        // Get the current environment's spawn point
        const environment = ASSETS.ENVIRONMENTS.find(env => env.name === this.currentEnvironment);
        const spawnPoint = environment?.spawnPoint || CONFIG.CHARACTER.START_POSITION;

        // Reset character to environment-specific spawn position
        this.characterController.setPosition(spawnPoint);
        this.characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));

        // Also reset the display capsule position
        const displayCapsule = this.characterController.getDisplayCapsule();
        if (displayCapsule) {
            displayCapsule.position.copyFrom(spawnPoint);
        }
    }

    public changeCharacter(characterIndexOrName: number | string): void {
        let character: Character | undefined;

        if (typeof characterIndexOrName === 'number') {
            // Handle numeric index
            if (characterIndexOrName < 0 || characterIndexOrName >= ASSETS.CHARACTERS.length) {
                console.error(`Invalid character index: ${characterIndexOrName}`);
                return;
            }
            character = ASSETS.CHARACTERS[characterIndexOrName];
        } else {
            // Handle character name
            character = ASSETS.CHARACTERS.find(char => char.name === characterIndexOrName);
        }

        if (!character) {
            console.error(`Character not found: ${characterIndexOrName}`);
            return;
        }

        // Remove existing player mesh if it exists
        const existingPlayer = this.scene.getMeshByName("player");
        if (existingPlayer) {
            existingPlayer.dispose();
        }

        // Load the new character
        this.loadCharacter(character);
    }

    /**
     * Clears all environment meshes and their physics objects
     */
    public clearEnvironment(): void {
        // Find the root environment mesh (always named "environment" by our loading process)
        const rootEnvironmentMesh = this.scene.getMeshByName("environment");

        if (rootEnvironmentMesh) {
            // Get all child meshes recursively
            const allEnvironmentMeshes: BABYLON.AbstractMesh[] = [];
            const collectMeshes = (mesh: BABYLON.AbstractMesh) => {
                allEnvironmentMeshes.push(mesh);
                mesh.getChildMeshes().forEach(collectMeshes);
            };

            collectMeshes(rootEnvironmentMesh);

            // Dispose all environment meshes and their physics objects
            allEnvironmentMeshes.forEach(mesh => {
                // Dispose physics body if it exists
                if (mesh.physicsImpostor) {
                    mesh.physicsImpostor.dispose();
                }
                mesh.dispose();
            });
        } else {
            // Fallback: if no "environment" mesh found, clear any meshes that might be environment-related
            const potentialEnvironmentMeshes = this.scene.meshes.filter(mesh =>
                !mesh.name.includes("player") &&
                !mesh.name.includes("camera") &&
                !mesh.name.includes("light") &&
                !mesh.name.includes("sky") &&
                !mesh.name.includes("capsule") &&
                !mesh.name.includes("fallback_") &&
                !mesh.name.includes("crate_") &&
                !mesh.name.includes("item_") &&
                !mesh.name.includes("CharacterDisplay") && // Don't clear character display capsule
                mesh !== this.characterController?.getDisplayCapsule()
            );

            potentialEnvironmentMeshes.forEach(mesh => {
                // Dispose physics body if it exists
                if (mesh.physicsImpostor) {
                    mesh.physicsImpostor.dispose();
                }
                mesh.dispose();
            });
        }
    }

    /**
     * Clears all items and their instances
     */
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
            if (mesh.physicsImpostor) {
                mesh.physicsImpostor.dispose();
            }
            mesh.dispose();
        });
    }

    /**
     * Clears environment and item particle systems, preserving player particles
     */
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

    /**
     * Pauses physics for the player character to prevent falling
     */
    public pausePhysics(): void {
        if (this.characterController) {
            this.characterController.pausePhysics();
        }
    }

    /**
     * Resumes physics for the player character
     */
    public resumePhysics(): void {
        if (this.characterController) {
            this.characterController.resumePhysics();
        }
    }

    /**
     * Checks if physics is currently paused for the player character
     */
    public isPhysicsPaused(): boolean {
        if (this.characterController) {
            return this.characterController.isPhysicsPaused();
        }
        return false;
    }

    /**
     * Force activate smooth camera following, useful after environment transitions
     */
    public forceActivateSmoothFollow(): void {
        if (this.smoothFollowController) {
            this.smoothFollowController.forceActivateSmoothFollow();
        }
    }

    /**
     * Example usage for environment and item management:
     * 
     * // Pause physics to prevent character from falling
     * sceneManager.pausePhysics();
     * 
     * // Clear environment, items, and particles
     * sceneManager.clearEnvironment();
     * sceneManager.clearItems();
     * sceneManager.clearParticles();
     * 
     * // Load new environment or items here...
     * 
     * // Resume physics when ready
     * sceneManager.resumePhysics();
     */

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
            this.characterController.dispose();
        }
    }
}

// ============================================================================
// MAIN PLAYGROUND CLASS
// ============================================================================

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        const sceneManager = new SceneManager(engine, canvas);

        // Initialize settings UI with scene manager
        SettingsUI.initialize(canvas, sceneManager);

        return sceneManager.getScene();
    }
}

// ============================================================================
// SETTINGS UI

class SettingsUI {
    private static settingsButton: HTMLDivElement | null = null;
    private static settingsPanel: HTMLDivElement | null = null;
    private static isPanelOpen = false;
    private static sceneManager: SceneManager | null = null;
    public static isInitializing = false; // Flag to prevent onChange during initialization

    // Device detection methods
    private static isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    private static isIPad(): boolean {
        // Modern iPad detection (including iPad Pro)
        const userAgent = navigator.userAgent;
        const isIPadUA = /iPad/i.test(userAgent);
        const isMacWithTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        const isIPadPro = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

        return isIPadUA || isMacWithTouch || isIPadPro;
    }

    private static isIPadWithKeyboard(): boolean {
        // Check if it's an iPad first
        if (!this.isIPad()) {
            return false;
        }

        // Multiple detection methods for iPad with keyboard
        const isLandscape = window.innerHeight < window.innerWidth;
        const hasExternalKeyboard = this.detectExternalKeyboard();
        const hasKeyboardEvents = this.detectKeyboardEvents();

        // Show if any of these conditions are met
        return isLandscape || hasExternalKeyboard || hasKeyboardEvents;
    }

    private static detectExternalKeyboard(): boolean {
        // Check for external keyboard indicators
        // This is a simplified check - in real scenarios you might need more sophisticated detection
        return navigator.maxTouchPoints === 0 ||
            (navigator.maxTouchPoints === 1 && window.innerWidth > 1024);
    }

    private static detectKeyboardEvents(): boolean {
        // Check if keyboard events have been detected recently
        // This would require tracking keyboard events over time
        // For now, we'll use a simpler approach
        return false; // Placeholder for future keyboard event tracking
    }

    private static shouldShowSection(visibility: VisibilityType): boolean {


        switch (visibility) {
            case "all":
                return true;
            case "mobile":
                return this.isMobileDevice();
            case "iPadWithKeyboard":
                return this.isIPadWithKeyboard();
            default:
                return false;
        }
    }

    public static initialize(canvas: HTMLCanvasElement, sceneManager?: SceneManager): void {
        this.isInitializing = true; // Prevent onChange during initialization
        this.sceneManager = sceneManager || null;
        this.createSettingsButton(canvas);
        this.createSettingsPanel(canvas);
        this.setupEventListeners();
        this.isInitializing = false; // Allow onChange after initialization
    }

    private static createSettingsButton(canvas: HTMLCanvasElement): void {
        // Create settings button
        this.settingsButton = document.createElement('div');
        this.settingsButton.id = 'settings-button';
        this.settingsButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7195 9.31074 19.5149 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.74206 9.96512 4.01128 9.77251C4.2805 9.5799 4.48514 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        // Style the button
        this.settingsButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            z-index: 2000;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        // Add hover effects
        this.settingsButton.addEventListener('mouseenter', () => {
            this.settingsButton!.style.background = 'rgba(0, 0, 0, 0.9)';
            this.settingsButton!.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            this.settingsButton!.style.transform = 'scale(1.1)';
        });

        this.settingsButton.addEventListener('mouseleave', () => {
            this.settingsButton!.style.background = 'rgba(0, 0, 0, 0.7)';
            this.settingsButton!.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            this.settingsButton!.style.transform = 'scale(1)';
        });

        document.body.appendChild(this.settingsButton);
    }

    private static createSettingsPanel(canvas: HTMLCanvasElement): void {
        // Create settings panel
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.id = 'settings-panel';

        // Calculate panel width (1/3 of view width with minimum 500px)
        const viewWidth = window.innerWidth;
        const panelWidth = Math.max(viewWidth / 3, 500);

        // Generate sections HTML
        const sectionsHTML = this.generateSectionsHTML();

        this.settingsPanel.innerHTML = `
            <div class="settings-header">
                <h2>${CONFIG.SETTINGS.HEADING_TEXT}</h2>
            </div>
            <div class="settings-content">
                ${sectionsHTML}
            </div>
        `;

        // Style the panel
        this.settingsPanel.style.cssText = `
            position: fixed;
            top: 0;
            left: -${panelWidth}px;
            width: ${panelWidth}px;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
            border-right: 2px solid rgba(255, 255, 255, 0.2);
            z-index: ${CONFIG.SETTINGS.Z_INDEX};
            transition: left 0.3s ease;
            color: white;
            font-family: Arial, sans-serif;
            overflow-y: auto;
        `;

        // Style the header
        const header = this.settingsPanel.querySelector('.settings-header') as HTMLElement;
        header.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
            box-sizing: border-box;
            max-width: 100%;
        `;

        // Style the header title
        const headerTitle = header.querySelector('h2') as HTMLElement;
        headerTitle.style.cssText = `
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: white;
        `;



        // Style the content area
        const content = this.settingsPanel.querySelector('.settings-content') as HTMLElement;
        content.style.cssText = `
            padding: 20px;
            box-sizing: border-box;
            max-width: 100%;
            overflow-x: hidden;
        `;

        // Style sections
        const sections = this.settingsPanel.querySelectorAll('.settings-section');
        sections.forEach(section => {
            (section as HTMLElement).style.cssText = `
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
        });

        // Style section headers
        const sectionHeaders = this.settingsPanel.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            (header as HTMLElement).style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            `;
        });

        // Style section titles
        const sectionTitles = this.settingsPanel.querySelectorAll('.section-header h3');
        sectionTitles.forEach(title => {
            (title as HTMLElement).style.cssText = `
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: white;
            `;
        });

        // Style toggle switches
        const toggleSwitches = this.settingsPanel.querySelectorAll('.toggle-switch');
        toggleSwitches.forEach(toggleSwitch => {
            (toggleSwitch as HTMLElement).style.cssText = `
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            `;
        });

        const toggleInputs = this.settingsPanel.querySelectorAll('.toggle-switch input');
        toggleInputs.forEach(input => {
            (input as HTMLElement).style.cssText = `
                opacity: 0;
                width: 0;
                height: 0;
            `;
        });

        const toggleSliders = this.settingsPanel.querySelectorAll('.toggle-slider');
        toggleSliders.forEach(slider => {
            (slider as HTMLElement).style.cssText = `
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.3);
                transition: 0.3s;
                border-radius: 24px;
            `;

            // Add pseudo-element for the toggle circle
            slider.innerHTML = '<span style="position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.3s; border-radius: 50%;"></span>';
        });

        // Style dropdowns
        const selects = this.settingsPanel.querySelectorAll('select');
        selects.forEach(select => {
            (select as HTMLElement).style.cssText = `
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                color: white;
                font-size: 14px;
                cursor: pointer;
            `;
        });

        document.body.appendChild(this.settingsPanel);

        // Setup section event listeners
        this.setupSectionEventListeners();

        // Listen for orientation changes to re-evaluate section visibility
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.regenerateSections();
            }, 100); // Small delay to ensure orientation change is complete
        });

        // Also listen for resize events
        window.addEventListener('resize', () => {
            this.regenerateSections();
        });
    }

    private static regenerateSections(): void {
        if (!this.settingsPanel) return;

        // Regenerate sections HTML
        const sectionsHTML = this.generateSectionsHTML();
        const content = this.settingsPanel.querySelector('.settings-content');
        if (content) {
            content.innerHTML = sectionsHTML;
        }

        // Re-setup event listeners and toggle state handlers
        this.setupSectionEventListeners();
        this.setupToggleStateHandlers();
    }

    private static generateSectionsHTML(): string {
        let sectionsHTML = '';

        CONFIG.SETTINGS.SECTIONS.forEach((section: SettingsSection, index) => {
            // Check if section should be visible
            if (!this.shouldShowSection(section.visibility)) {
                return;
            }

            const sectionId = `section-${index}`;

            if (section.uiElement === 'toggle') {
                // Get current state for mobile controls
                let defaultValue = section.defaultValue as boolean ?? false;
                if (section.title === "Screen Controls") {
                    // For Screen Controls, always default to true (visible) since controls are shown by default
                    defaultValue = true;
                }

                sectionsHTML += `
                    <div class="settings-section" id="${sectionId}">
                        <div class="section-header">
                            <h3>${section.title}</h3>
                            <label class="toggle-switch">
                                <input type="checkbox" ${defaultValue ? 'checked' : ''} data-section-index="${index}">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                `;
            } else if (section.uiElement === 'dropdown') {
                const defaultValue = section.defaultValue as string ?? (section.options?.[0] ?? '');

                // Special handling for Character and Environment dropdowns to show names
                let optionsHTML = '';
                if (section.title === "Character") {
                    optionsHTML = ASSETS.CHARACTERS.map((character) =>
                        `<option value="${character.name}" ${character.name === defaultValue ? 'selected' : ''}>${character.name}</option>`
                    ).join('');
                } else if (section.title === "Environment") {
                    optionsHTML = ASSETS.ENVIRONMENTS.map((environment) =>
                        `<option value="${environment.name}" ${environment.name === defaultValue ? 'selected' : ''}>${environment.name}</option>`
                    ).join('');
                } else {
                    optionsHTML = section.options?.map(option =>
                        `<option value="${option}" ${option === defaultValue ? 'selected' : ''}>${option}</option>`
                    ).join('') || '';
                }

                sectionsHTML += `
                    <div class="settings-section" id="${sectionId}">
                        <div class="section-header">
                            <h3>${section.title}</h3>
                            <select data-section-index="${index}">
                                ${optionsHTML}
                            </select>
                        </div>
                    </div>
                `;
            }
        });

        return sectionsHTML;
    }

    private static setupSectionEventListeners(): void {
        // Setup toggle switches
        const toggles = this.settingsPanel!.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', async (e) => {
                const target = e.target as HTMLInputElement;
                const sectionIndex = parseInt(target.dataset.sectionIndex!);
                const section: SettingsSection = CONFIG.SETTINGS.SECTIONS[sectionIndex];

                if (section && section.onChange) {
                    await section.onChange(target.checked);
                }
            });
        });

        // Setup dropdown selects
        const selects = this.settingsPanel!.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', async (e) => {
                const target = e.target as HTMLSelectElement;
                const sectionIndex = parseInt(target.dataset.sectionIndex!);
                const section: SettingsSection = CONFIG.SETTINGS.SECTIONS[sectionIndex];

                if (section && section.onChange && !this.isInitializing) {
                    await section.onChange(target.value);
                }
            });
        });

        // Add toggle state change handlers
        this.setupToggleStateHandlers();
    }

    private static setupToggleStateHandlers(): void {
        const toggleInputs = this.settingsPanel!.querySelectorAll('.toggle-switch input');
        toggleInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const slider = target.nextElementSibling as HTMLElement;
                const toggleCircle = slider.querySelector('span') as HTMLElement;

                if (target.checked) {
                    slider.style.backgroundColor = 'rgba(0, 255, 136, 0.8)';
                    toggleCircle.style.transform = 'translateX(26px)';
                } else {
                    slider.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    toggleCircle.style.transform = 'translateX(0)';
                }
            });
        });
    }

    private static setupEventListeners(): void {
        // Settings button click
        this.settingsButton!.addEventListener('click', () => {
            this.togglePanel();
        });



        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen &&
                !this.settingsPanel!.contains(e.target as Node) &&
                !this.settingsButton!.contains(e.target as Node)) {
                this.closePanel();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isPanelOpen) {
                this.updatePanelWidth();
            }
        });
    }

    private static togglePanel(): void {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    private static openPanel(): void {
        this.settingsPanel!.style.left = '0px';
        this.isPanelOpen = true;
        // Keep the button visible and on top
        this.settingsButton!.style.transform = 'scale(1.1)';
        this.settingsButton!.style.background = 'rgba(0, 0, 0, 0.9)';
        this.settingsButton!.style.zIndex = CONFIG.SETTINGS.BUTTON_Z_INDEX.toString(); // Ensure button stays on top
    }

    private static closePanel(): void {
        const panelWidth = this.settingsPanel!.offsetWidth;
        this.settingsPanel!.style.left = `-${panelWidth}px`;
        this.isPanelOpen = false;
        this.settingsButton!.style.transform = 'scale(1)';
        this.settingsButton!.style.background = 'rgba(0, 0, 0, 0.7)';
        this.settingsButton!.style.zIndex = CONFIG.SETTINGS.BUTTON_Z_INDEX.toString(); // Reset z-index
    }

    private static updatePanelWidth(): void {
        const viewWidth = window.innerWidth;

        // If screen width is less than threshold, use full viewport width (100vw)
        // Otherwise use the configured ratio
        if (viewWidth < CONFIG.SETTINGS.FULL_SCREEN_THRESHOLD) {
            this.settingsPanel!.style.width = '100vw';
            // Ensure no horizontal overflow on small screens
            this.settingsPanel!.style.boxSizing = 'border-box';
            this.settingsPanel!.style.padding = '0';
            this.settingsPanel!.style.margin = '0';
        } else {
            const panelWidth = Math.max(viewWidth * CONFIG.SETTINGS.PANEL_WIDTH_RATIO, CONFIG.SETTINGS.FULL_SCREEN_THRESHOLD);
            this.settingsPanel!.style.width = `${panelWidth}px`;
            // Reset to normal styling for larger screens
            this.settingsPanel!.style.boxSizing = '';
            this.settingsPanel!.style.padding = '';
            this.settingsPanel!.style.margin = '';
        }

        if (!this.isPanelOpen) {
            const currentWidth = this.settingsPanel!.style.width;
            this.settingsPanel!.style.left = `-${currentWidth}`;
        }
    }

    public static dispose(): void {
        if (this.settingsButton) {
            this.settingsButton.remove();
            this.settingsButton = null;
        }
        if (this.settingsPanel) {
            this.settingsPanel.remove();
            this.settingsPanel = null;
        }
    }

    public static async changeCharacter(characterIndexOrName: number | string): Promise<void> {
        if (this.sceneManager && !this.isInitializing) {
            this.sceneManager.changeCharacter(characterIndexOrName);
        }
    }

    public static async changeEnvironment(environmentName: string): Promise<void> {
        if (this.sceneManager) {
            // Check if the environment is actually different from current
            const currentEnvironment = this.sceneManager.getCurrentEnvironment();
            if (currentEnvironment === environmentName) {
    
                return; // No change needed
            }



            // Pause physics to prevent character from falling during environment change
            this.sceneManager.pausePhysics();

            // Clear existing environment, items, and particles
            this.sceneManager.clearEnvironment();
            this.sceneManager.clearItems();
            this.sceneManager.clearParticles();

            // Load the new environment

            await this.sceneManager.loadEnvironment(environmentName);

            // Set up environment items for the new environment

            await this.sceneManager.setupEnvironmentItems();

            // Reposition character to safe location in new environment
            this.sceneManager.repositionCharacter();

            // Force activate smooth camera following after environment transition
            this.sceneManager.forceActivateSmoothFollow();

            // Resume physics after environment is loaded
            this.sceneManager.resumePhysics();
            

        }
    }
}


