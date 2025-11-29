// ============================================================================
// BEHAVIOR TYPE DEFINITIONS
// ============================================================================

/**
 * Discriminated union for check period configuration
 * Controls how frequently trigger conditions are evaluated
 */
export type CheckPeriod = 
    | { readonly type: "everyFrame" }
    | { readonly type: "interval"; readonly milliseconds: number };

/**
 * Union type for behavior kinds
 */
export type BehaviorKind = "glow";

/**
 * Union type for trigger kinds
 */
export type TriggerKind = "proximity";

/**
 * Configuration for proximity-based trigger
 */
export interface ProximityTriggerConfig {
    readonly triggerKind: "proximity";
    readonly radius: number;
    readonly checkPeriod?: CheckPeriod; // Defaults to "everyFrame" if not specified
    readonly triggerOutOfRange?: boolean; // When true, applies behavior when character is OUTSIDE radius
    readonly edgeColor?: BABYLON.Color4;
    readonly edgeWidth?: number;
}

/**
 * Discriminated union for behavior configurations
 * Each trigger type has its own configuration interface
 */
export type BehaviorConfig = ProximityTriggerConfig;

