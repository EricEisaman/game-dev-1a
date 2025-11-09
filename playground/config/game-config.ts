// ============================================================================
// GAME CONFIGURATION
// ============================================================================

import type { 
    GameConfig, 
    HUDPosition
} from '../types/config';
import { ASSETS } from './assets';

import { MobileInputManager } from '../input/MobileInputManager';
import { SettingsUI } from '../ui/SettingsUI';

export const CONFIG: GameConfig = {
    // Character Settings
    CHARACTER: {
        SPEED: {
            WALK: 2.0,
            RUN: 4.0,
            JUMP: 8.0,
        },
        CAPSULE_HEIGHT: 1.8,
        CAPSULE_RADIUS: 0.4,
        MASS: 1.0,
        FRICTION: 0.2,
        RESTITUTION: 0.0,
        ROTATION_SMOOTHING: 0.1,
        ANIMATION_BLEND: 400,
        JUMP_DELAY: 100,
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
        POSITION: "top" satisfies HUDPosition,
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
                options: ASSETS.CHARACTERS.map((character) => character.name),
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
                options: ASSETS.ENVIRONMENTS.map((environment) => environment.name),
                onChange: async (value: boolean | string) => {
                    if (typeof value === 'string') {
                        await SettingsUI.changeEnvironment(value);
                    }
                }
            },
            {
                title: "Babylon Playground UI",
                uiElement: "toggle",
                visibility: "all",
                defaultValue: true, // Default to showing playground UI elements
                onChange: (value: boolean | string) => {
                    if (typeof value === 'boolean') {
                        SettingsUI.togglePlaygroundUI(value);
                    }
                }
            },
            {
                title: "Full Screen",
                uiElement: "toggle",
                visibility: "all",
                defaultValue: false, // Default state, will be synced with actual element state
                onChange: (value: boolean | string) => {
                    if (typeof value === 'boolean') {
                        SettingsUI.toggleSplitRendering(value);
                    }
                }
            },
            {
                title: "Game HUD",
                uiElement: "toggle",
                visibility: "all",
                defaultValue: true, // Default to showing HUD elements
                onChange: (value: boolean | string) => {
                    if (typeof value === 'boolean') {
                        SettingsUI.toggleGameHUD(value);
                    }
                }
            }
        ]
    },

    INVENTORY: {
        HEADING_TEXT: "Inventory",
        PANEL_WIDTH_RATIO: 1 / 3,
        FULL_SCREEN_THRESHOLD: 500,
        Z_INDEX: 1800,
        BUTTON_Z_INDEX: 2000,
        TILES: [] // Tiles will be added dynamically by InventoryManager
    }
} as const;
