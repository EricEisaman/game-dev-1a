// ============================================================================
// BabylonJS PLAYGROUND V2 - MULTIFILE ENTRY POINT
// ============================================================================

// /// <reference path="./types/babylon.d.ts" />

import { SceneManager } from './managers/SceneManager';
import { SettingsUI } from './ui/SettingsUI';
import { InventoryUI } from './ui/InventoryUI';
import { HUDManager } from './managers/HUDManager';
import { switchToEnvironment } from './utils/switch-environment';
import { ASSETS } from './config/assets';
import { queryHook } from './utils/query-hook';

/**
 * Global cleanup function to remove all UI elements from DOM
 * This prevents orphaned elements when the playground is rerun
 */
function cleanupUI(): void {
    HUDManager.cleanup();
    SettingsUI.cleanup();
    InventoryUI.cleanup();
}

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        // Clean up any existing UI elements before creating new ones
        cleanupUI();
        
        const sceneManager = new SceneManager(engine, canvas);

        // Initialize settings UI with scene manager
        SettingsUI.initialize(canvas, sceneManager);

        // Initialize inventory UI with scene manager
        InventoryUI.initialize(canvas, sceneManager);

        // Check for fullscreen query parameter and activate if present
        queryHook(['fullscreen'], (values) => {
            const fullscreenValue = values.get('fullscreen');
            if (fullscreenValue && fullscreenValue.toLowerCase() === 'true') {
                SettingsUI.toggleSplitRendering(true);
            }
        });

        // Check for pgui query parameter and hide Babylon Playground UI if false
        queryHook(['pgui'], (values) => {
            const pguiValue = values.get('pgui');
            if (pguiValue && pguiValue.toLowerCase() === 'false') {
                SettingsUI.togglePlaygroundUI(false);
            }
        });

        // Complete scene initialization
        sceneManager.completeInitialization();
        
        // Trigger initial environment load with cutscene support
        // TypeScript needs help narrowing the type from the satisfies constraint
        const defaultEnv = ASSETS.ENVIRONMENTS.find(env => 'isDefault' in env && env.isDefault === true) || ASSETS.ENVIRONMENTS[0];
        const defaultEnvironment = defaultEnv.name;
        switchToEnvironment(defaultEnvironment).then(() => {
            // Load character model after environment is loaded
            sceneManager.loadCharacterModel();
        });

        return sceneManager.getScene();
    }
}

export { Playground };