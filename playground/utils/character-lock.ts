// ============================================================================
// CHARACTER LOCK UTILITY
// ============================================================================
// Provides globally accessible, MDC-compliant utility for runtime character locking
// ============================================================================

import { ASSETS } from '../config/assets';
import { SettingsUI } from '../ui/SettingsUI';
import type { Character } from '../types/character';

export class CharacterLock {
    // Map to track runtime lock state (since ASSETS is 'as const' and cannot be mutated)
    private static characterLockState: Map<string, boolean> = new Map();

    /**
     * Sets the runtime lock state for a character by name
     * Triggers reactive UI refresh of Settings UI dropdown
     * @param name - Character name
     * @param locked - true to lock, false to unlock
     */
    public static setCharacterLocked(name: string, locked: boolean): void {
        // Validate character exists
        const character = ASSETS.CHARACTERS.find((c: Character) => c.name === name);
        if (!character) {
            return; // Character not found, silently ignore
        }

        // Update runtime lock state
        this.characterLockState.set(name, locked);

        // Trigger reactive UI refresh of Settings UI dropdown
        SettingsUI.regenerateSections();
    }

    /**
     * Checks if a character is locked
     * Returns true if character's default locked property is true OR runtime Map has it locked
     * @param name - Character name
     * @returns true if locked, false otherwise
     */
    public static isCharacterLocked(name: string): boolean {
        // Check runtime lock state first (takes precedence)
        const runtimeState = this.characterLockState.get(name);
        if (runtimeState !== undefined) {
            return runtimeState;
        }

        // Check character's default locked property
        const character = ASSETS.CHARACTERS.find((c: Character) => c.name === name);
        if (character) {
            return character.locked === true;
        }

        // Character not found, assume unlocked
        return false;
    }

    /**
     * Gets the runtime lock state from Map (returns undefined if not set)
     * Useful for checking if runtime state differs from default
     * @param name - Character name
     * @returns runtime lock state or undefined if not set
     */
    public static getCharacterLockState(name: string): boolean | undefined {
        return this.characterLockState.get(name);
    }

    /**
     * Removes runtime lock state, reverting to default locked property
     * Clears the entry from the Map
     * @param name - Character name
     */
    public static resetCharacterLock(name: string): void {
        this.characterLockState.delete(name);
        // Trigger reactive UI refresh
        SettingsUI.regenerateSections();
    }
}

