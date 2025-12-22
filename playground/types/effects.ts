// ============================================================================
// EFFECTS TYPE DEFINITIONS
// ============================================================================

export type EffectType = "GLOW";

export type SkyType = "BOX" | "SPHERE";

export interface SkyConfig {
    readonly TEXTURE_URL: string;
    readonly ROTATION_Y: number;
    readonly BLUR: number;
    readonly TYPE: SkyType;
}

export type ParticleSnippetType = "legacy" | "nodes";

export interface LegacyParticleSnippet {
    readonly type: "legacy";
    readonly name: string;
    readonly description: string;
    readonly snippetId: string;
    readonly category: "fire" | "magic" | "nature" | "tech" | "cosmic";
}

export interface NodesParticleSnippet {
    readonly type: "nodes";
    readonly name: string;
    readonly description: string;
    readonly snippetId: string;
    readonly category: "fire" | "magic" | "nature" | "tech" | "cosmic";
}

export type ParticleSnippet = LegacyParticleSnippet | NodesParticleSnippet;

export interface SoundEffect {
    readonly name: string;
    readonly url: string;
    readonly volume: number;
    readonly loop: boolean;
}

export interface EffectsConfig {
    readonly PARTICLE_SNIPPETS: readonly ParticleSnippet[];
    readonly DEFAULT_PARTICLE: string;
    readonly AUTO_SPAWN: boolean;
    readonly SOUND_EFFECTS: readonly SoundEffect[];
}

export interface ItemInstance {
    readonly position: BABYLON.Vector3;
    readonly scale: number;
    readonly rotation: BABYLON.Vector3;
    readonly mass: number;
}

export interface ItemConfig {
    readonly name: string;
    readonly url: string;
    readonly collectible: boolean;
    readonly creditValue: number;
    readonly minImpulseForCollection: number;
    readonly instances: readonly ItemInstance[];
    readonly inventory?: boolean;
    readonly thumbnail?: string;
    readonly itemEffectKind?: ItemEffectKind;
}

export interface ItemsConfig {
    readonly ITEMS: readonly ItemConfig[];
    readonly COLLECTION_RADIUS: number;
    readonly COLLECTION_SOUND: string;
    readonly SHOW_COLLECTION_EFFECTS: boolean;
}

// Import ItemEffectKind from config to avoid circular dependency
import type { ItemEffectKind } from './config';
