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
 * Action type for adjustCredits
 */
export interface AdjustCreditsAction {
    readonly actionType: "adjustCredits";
    readonly amount: number;
}

/**
 * Action type for portal
 */
export interface PortalAction {
    readonly actionType: "portal";
    readonly target: string;
}

/**
 * Discriminated union for behavior actions
 */
export type BehaviorAction = AdjustCreditsAction | PortalAction;

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
    readonly action?: BehaviorAction; // Optional action to execute when triggered
}

/**
 * Discriminated union for behavior configurations
 * Each trigger type has its own configuration interface
 */
export type BehaviorConfig = ProximityTriggerConfig;

