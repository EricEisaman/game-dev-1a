// ============================================================================
// ENVIRONMENT TYPE DEFINITIONS
// ============================================================================

export const OBJECT_ROLE = {
    DYNAMIC_BOX: "DYNAMIC_BOX",
    PIVOT_BEAM: "PIVOT_BEAM"
} as const;

export type ObjectRole = typeof OBJECT_ROLE[keyof typeof OBJECT_ROLE];

export interface LightmappedMesh {
    readonly name: string;
    readonly level: number;
}

export interface PhysicsObject {
    readonly name: string;
    readonly mass: number;
    readonly scale: number;
    readonly role: ObjectRole;
}

export interface EnvironmentParticle {
    readonly name: string; // Name of the particle snippet to use
    readonly position: BABYLON.Vector3; // Position where the particle should be created
    readonly updateSpeed?: number; // Optional update speed for the particle system
}

export interface BackgroundMusicConfig {
    readonly url: string;
    readonly volume: number;
}

export interface AmbientSoundConfig {
    readonly url: string;
    readonly volume: number;
    readonly position: BABYLON.Vector3;
    readonly rollOff?: number; // Defaults to 2
    readonly maxDistance?: number; // Defaults to 40
}

export interface Environment {
    readonly name: string;
    readonly model: string;
    readonly lightmap: string;
    readonly scale: number;
    readonly lightmappedMeshes: readonly LightmappedMesh[];
    readonly physicsObjects: readonly PhysicsObject[];
    readonly sky?: SkyConfig; // Optional sky configuration for this environment
    readonly spawnPoint: BABYLON.Vector3; // Spawn point for this environment
    readonly spawnRotation: BABYLON.Vector3; // Spawn rotation for this environment
    readonly transitionPosition?: BABYLON.Vector3; // Optional transition position during environment change
    readonly transitionRotation?: BABYLON.Vector3; // Optional transition rotation during environment change
    readonly particles?: readonly EnvironmentParticle[]; // Optional environment particles
    readonly items?: readonly ItemConfig[]; // Optional items configuration for this environment
    readonly backgroundMusic?: BackgroundMusicConfig; // Optional looping non-positional BGM
    readonly ambientSounds?: readonly AmbientSoundConfig[]; // Optional positional ambient sounds
}

// Forward declarations for circular dependencies
export interface SkyConfig {
    readonly TEXTURE_URL: string;
    readonly ROTATION_Y: number;
    readonly BLUR: number;
    readonly TYPE: SkyType;
}

export type SkyType = "BOX" | "SPHERE";

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

export interface ItemInstance {
    readonly position: BABYLON.Vector3;
    readonly scale: number;
    readonly rotation: BABYLON.Vector3;
    readonly mass: number;
}

// Import ItemEffectKind from config to avoid circular dependency
import type { ItemEffectKind } from './config';
