// ============================================================================
// INVENTORY MANAGER
// ============================================================================
import { CharacterLock } from '../utils/character-lock';
import { Notification } from '../utils/notification';
import { Time } from '../utils/time';
import type { CharacterController } from '../controllers/CharacterController';

export interface InventoryItem {
    name: string;
    count: number;
    maxCount: number;
    effect?: string;
    thumbnail: string;
}

export class InventoryManager {
    private static scene: BABYLON.Scene | null = null;
    private static characterController: CharacterController | null = null;
    private static inventoryItems: Map<string, InventoryItem> = new Map();
    private static activeEffects: Map<string, number> = new Map();

    /**
     * Initializes the InventoryManager
     */
    public static initialize(scene: BABYLON.Scene, characterController: CharacterController): void {
        this.scene = scene;
        this.characterController = characterController;
        this.inventoryItems.clear();
        this.activeEffects.clear();
    }

    /**
     * Adds an item to the inventory
     */
    public static addItem(itemName: string, count: number = 1, thumbnail: string = ''): void {
        const existingItem = this.inventoryItems.get(itemName);
        if (existingItem) {
            existingItem.count = Math.min(existingItem.count + count, existingItem.maxCount);
        } else {
            this.inventoryItems.set(itemName, {
                name: itemName,
                count: count,
                maxCount: 10, // Default max count
                thumbnail: thumbnail
            });
        }
    }

    /**
     * Removes an item from the inventory
     */
    public static removeItem(itemName: string, count: number = 1): boolean {
        const item = this.inventoryItems.get(itemName);
        if (item && item.count >= count) {
            item.count -= count;
            if (item.count <= 0) {
                this.inventoryItems.delete(itemName);
            }
            return true;
        }
        return false;
    }

    /**
     * Uses an inventory item
     */
    public static useInventoryItem(itemName: string): boolean {
        const item = this.inventoryItems.get(itemName);
        if (!item || item.count <= 0) {
            return false;
        }

        // Apply item effect based on item name or effect type
        const effectApplied = this.applyItemEffect(itemName, item);

        if (effectApplied) {
            // Remove one item from inventory
            this.removeItem(itemName, 1);
            return true;
        }

        return false;
    }

    /**
     * Applies the effect of an inventory item
     */
    private static applyItemEffect(itemName: string, item: InventoryItem): boolean {
        if (!this.characterController) {
            return false;
        }

        // Map item names to effects (this could be made more sophisticated)
        const effectMap: Record<string, () => boolean> = {

            'Super Jump': () => this.applySuperJumpEffect(),

            'Invisibility': () => this.applyInvisibilityEffect(),

            'Gamma Crystal': () => this.applyHulkUnlockEffect(),

            // Add more item effects as needed

        };



        const effectFunction = effectMap[itemName];
        if (effectFunction) {
            return effectFunction();
        }

        // Default effect - just return true for basic items
        return true;
    }

    /**
     * Applies super jump effect
     */
    private static applySuperJumpEffect(): boolean {
        if (!this.characterController) {
            return false;
        }

        // Apply temporary super jump boost
        this.characterController.applySuperJumpEffect();
        return true;
    }

    /**
     * Applies invisibility effect
     */
    private static applyInvisibilityEffect(): boolean {
        if (!this.characterController) {
            return false;
        }

        // Apply temporary invisibility
        this.characterController.applyInvisibilityEffect();
        return true;
    }

    /**

 * Applies Hulk unlock effect

 */

    private static applyHulkUnlockEffect(): boolean {

        CharacterLock.setCharacterLocked('Hulk', false);

        Notification.create({

            message: `Hulk is now unlocked!`,

            delay: 4000,

            duration: 2000,

            scene: this.scene,

            background: 'rgba(0, 255, 136, 0.9)',

            color: 'black',

            padding: '20px',

            borderRadius: '10px',

            fontSize: '18px',

            fontWeight: 'bold',

            position: 'center',

            zIndex: 9999,

        });

        Time.runDelayed(this.scene, 120000, () => {

            CharacterLock.setCharacterLocked('Hulk', true);

            Notification.create({

                message: `Hulk is now locked!`,

                delay: 0,

                duration: 2000,

                scene: this.scene,

                background: 'rgba(188, 70, 76, 0.9)',

                color: 'black',

                padding: '20px',

                borderRadius: '10px',

                fontSize: '18px',

                fontWeight: 'bold',

                position: 'center',

                zIndex: 9999,

            });

        });

        return true;

    }


    /**
     * Gets all inventory items
     */
    public static getInventoryItems(): Map<string, InventoryItem> {
        return new Map(this.inventoryItems);
    }

    /**
     * Gets the count of a specific item
     */
    public static getItemCount(itemName: string): number {
        const item = this.inventoryItems.get(itemName);
        return item ? item.count : 0;
    }

    /**
     * Checks if the player has a specific item
     */
    public static hasItem(itemName: string): boolean {
        return this.getItemCount(itemName) > 0;
    }

    /**
     * Disposes of the InventoryManager
     */
    public static dispose(): void {
        this.inventoryItems.clear();
        this.activeEffects.clear();
        this.scene = null;
        this.characterController = null;
    }
}
