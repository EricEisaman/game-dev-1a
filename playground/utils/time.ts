// ============================================================================
// TIME UTILITY
// ============================================================================
// Provides scene-based timing utilities using onBeforeRenderObservable
// ============================================================================

export class Time {
    /**
     * Runs a callback after a specified delay using scene.onBeforeRenderObservable
     * @param scene The Babylon.js scene to use for timing
     * @param delayMs The delay in milliseconds before executing the callback
     * @param callback The function to execute after the delay
     */
    public static runDelayed(scene: BABYLON.Scene, delayMs: number, callback: () => void): void {
        const startTime = performance.now();
        const delay = delayMs;

        const observer = scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime >= delay) {
                // Execute the callback
                callback();

                // Unregister the observer
                scene.onBeforeRenderObservable.remove(observer);
            }
        });
    }
}

