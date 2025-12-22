// ============================================================================
// CONFIGURATION TYPE DEFINITIONS
// ============================================================================

import type { ParticleSnippet, SoundEffect } from './effects';

export interface CharacterSpeed {
    readonly WALK: number;
    readonly RUN: number;
    readonly JUMP: number;
}

export interface CharacterConfig {
    readonly SPEED: CharacterSpeed;
    readonly CAPSULE_HEIGHT: number;
    readonly CAPSULE_RADIUS: number;
    readonly MASS: number;
    readonly FRICTION: number;
    readonly RESTITUTION: number;
    readonly ROTATION_SMOOTHING: number;
    readonly ANIMATION_BLEND: number;
    readonly JUMP_DELAY: number;
}

export interface CameraConfig {
    readonly START_POSITION: BABYLON.Vector3;
    readonly OFFSET: BABYLON.Vector3;
    readonly DRAG_SENSITIVITY: number;
    readonly ZOOM_MIN: number;
    readonly ZOOM_MAX: number;
    readonly FOLLOW_SMOOTHING: number;
}

export interface PhysicsConfig {
    readonly GRAVITY: BABYLON.Vector3;
    readonly CHARACTER_GRAVITY: BABYLON.Vector3;
}

export interface AnimationConfig {
    readonly PLAYER_SCALE: number;
    readonly PLAYER_Y_OFFSET: number;
}

export interface DebugConfig {
    readonly CAPSULE_VISIBLE: boolean;
}

export interface GameConfig {
    readonly CHARACTER: CharacterConfig;
    readonly CAMERA: CameraConfig;
    readonly PHYSICS: PhysicsConfig;
    readonly ANIMATION: AnimationConfig;
    readonly DEBUG: DebugConfig;
    readonly EFFECTS: EffectsConfig;
    readonly HUD: HUDConfig;
    readonly SETTINGS: SettingsConfig;
    readonly INVENTORY: InventoryConfig;
}

// Forward declarations for circular dependencies
export interface EffectsConfig {
    readonly PARTICLE_SNIPPETS: readonly ParticleSnippet[];
    readonly DEFAULT_PARTICLE: string;
    readonly AUTO_SPAWN: boolean;
    readonly SOUND_EFFECTS: readonly SoundEffect[];
}


export interface HUDConfig {
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

export type HUDPosition = "top" | "bottom" | "left" | "right";

export interface SettingsConfig {
    readonly HEADING_TEXT: string;
    readonly PANEL_WIDTH_RATIO: number;
    readonly FULL_SCREEN_THRESHOLD: number;
    readonly Z_INDEX: number;
    readonly BUTTON_Z_INDEX: number;
    readonly SECTIONS: readonly SettingsSection[];
}

export interface SettingsSection {
    readonly title: string;
    readonly uiElement: UIElementType;
    readonly visibility: VisibilityType;
    readonly defaultValue?: boolean | string;
    readonly options?: string[];
    readonly onChange?: (_value: boolean | string) => void | Promise<void>;
}

export type UIElementType = "toggle" | "dropdown";
export type VisibilityType = "all" | "mobile" | "iPadWithKeyboard";

export interface InventoryConfig {
    readonly HEADING_TEXT: string;
    readonly PANEL_WIDTH_RATIO: number;
    readonly FULL_SCREEN_THRESHOLD: number;
    readonly Z_INDEX: number;
    readonly BUTTON_Z_INDEX: number;
    readonly TILES: readonly Tile[];
}

export interface Tile {
    readonly title: string;
    readonly thumbnail: string;
    readonly minSize: number;
    readonly maxSize: number;
    readonly count: number;
    readonly itemEffectKind: ItemEffectKind;
}

export type ItemEffectKind = "superJump" | "invisibility" | "gamma";
