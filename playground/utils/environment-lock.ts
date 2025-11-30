// ============================================================================
// ENVIRONMENT LOCK UTILITY
// ============================================================================
// Provides globally accessible, MDC-compliant utility for runtime environment locking
// ============================================================================

import { ASSETS } from '../config/assets';
import { SettingsUI } from '../ui/SettingsUI';
import type { Environment } from '../types/environment';

export class EnvironmentLock {
    // Map to track runtime lock state (since ASSETS is 'as const' and cannot be mutated)
    private static environmentLockState: Map<string, boolean> = new Map();

    /**
     * Sets the runtime lock state for an environment by name
     * Triggers reactive UI refresh of Settings UI dropdown
     * If locking the current environment, automatically switches to last selected environment if unlocked,
     * otherwise switches to the first available unlocked environment
     * @param name - Environment name
     * @param locked - true to lock, false to unlock
     */
    public static setEnvironmentLocked(name: string, locked: boolean): void {
        // Validate environment exists
        const environment = ASSETS.ENVIRONMENTS.find((e: Environment) => e.name === name);
        if (!environment) {
            return; // Environment not found, silently ignore
        }

        // Update runtime lock state
        this.environmentLockState.set(name, locked);

        // If locking the current environment, switch to an unlocked environment
        if (locked) {
            const currentEnvironmentName = SettingsUI.getCurrentEnvironmentName();
            if (currentEnvironmentName === name) {
                // Try to get the last selected environment if unlocked
                const lastSelectedEnvironment = this.getLastSelectedEnvironmentIfUnlocked();
                if (lastSelectedEnvironment !== null) {
                    SettingsUI.changeEnvironment(lastSelectedEnvironment.name);
                } else {
                    // Fall back to first unlocked environment
                    const firstUnlockedEnvironment = this.getFirstUnlockedEnvironment();
                    if (firstUnlockedEnvironment !== null) {
                        SettingsUI.changeEnvironment(firstUnlockedEnvironment.name);
                    }
                }
            }
        }

        // Trigger reactive UI refresh of Settings UI dropdown
        SettingsUI.regenerateSections();
    }

    /**
     * Checks if an environment is locked
     * Returns true if environment's default locked property is true OR runtime Map has it locked
     * @param name - Environment name
     * @returns true if locked, false otherwise
     */
    public static isEnvironmentLocked(name: string): boolean {
        // Check runtime lock state first (takes precedence)
        const runtimeState = this.environmentLockState.get(name);
        if (runtimeState !== undefined) {
            return runtimeState;
        }

        // Check environment's default locked property
        const environment = ASSETS.ENVIRONMENTS.find((e: Environment) => e.name === name);
        if (environment) {
            return environment.locked === true;
        }

        // Environment not found, assume unlocked
        return false;
    }

    /**
     * Gets the runtime lock state from Map (returns undefined if not set)
     * Useful for checking if runtime state differs from default
     * @param name - Environment name
     * @returns runtime lock state or undefined if not set
     */
    public static getEnvironmentLockState(name: string): boolean | undefined {
        return this.environmentLockState.get(name);
    }

    /**
     * Removes runtime lock state, reverting to default locked property
     * Clears the entry from the Map
     * @param name - Environment name
     */
    public static resetEnvironmentLock(name: string): void {
        this.environmentLockState.delete(name);
        // Trigger reactive UI refresh
        SettingsUI.regenerateSections();
    }

    /**
     * Gets the first unlocked environment from ASSETS.ENVIRONMENTS
     * @returns First unlocked environment or null if all are locked
     */
    private static getFirstUnlockedEnvironment(): Environment | null {
        for (const environment of ASSETS.ENVIRONMENTS) {
            if (!this.isEnvironmentLocked(environment.name)) {
                return environment;
            }
        }
        return null;
    }

    /**
     * Gets the last selected environment if it's unlocked
     * @returns Last selected environment if unlocked, otherwise null
     */
    private static getLastSelectedEnvironmentIfUnlocked(): Environment | null {
        const lastSelectedName = SettingsUI.getLastSelectedEnvironmentName();
        if (lastSelectedName === null) {
            return null;
        }

        const environment = ASSETS.ENVIRONMENTS.find((e: Environment) => e.name === lastSelectedName);
        if (environment && !this.isEnvironmentLocked(environment.name)) {
            return environment;
        }

        return null;
    }
}

