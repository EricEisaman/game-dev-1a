// ============================================================================
// CHARACTER TYPE DEFINITIONS
// ============================================================================

export type ItemEffect = {
    readonly [K in ItemEffectKind]: (_characterController: CharacterController) => void;
};

export interface CharacterAnims {
    readonly idle: string;
    readonly walk: string;
    readonly jump: string;
}

export interface Character {
    readonly name: string;
    readonly model: string;
    locked?: boolean; // Locked state - runtime state managed separately via CharacterLock utility
    readonly animations: CharacterAnims;
    readonly scale: number;
    readonly mass: number; // Physics mass for different character weights
    readonly height: number; // Character capsule height
    readonly radius: number; // Character capsule radius
    readonly speed: {
        readonly inAir: number;
        readonly onGround: number;
        readonly boostMultiplier: number;
    };
    readonly jumpHeight: number; // Jump height for physics calculations
    readonly rotationSpeed: number; // Rotation speed in radians
    readonly rotationSmoothing: number; // Rotation smoothing factor
    readonly animationBlend?: number; // Animation blend time in milliseconds, defaults to 400
    readonly jumpDelay?: number; // Jump animation delay in milliseconds, defaults to 100
    readonly friction?: number; // Character-specific friction coefficient (0.0-1.0), defaults to mass-adjusted calculation
}

// Forward declaration for CharacterController
declare class CharacterController {
    // This will be properly typed when CharacterController is imported
}

// Import ItemEffectKind from config to avoid circular dependency
import type { ItemEffectKind } from './config';
