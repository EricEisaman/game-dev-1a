// ============================================================================
// CUTSCENE MANAGER
// ============================================================================
// Handles fullscreen cutscene display with image/video and optional audio
// ============================================================================

import type { CutScene } from '../types/environment';
import { Time } from '../utils/time';

export class CutSceneManager {
    /**
     * Plays a cutscene with fullscreen display
     * @param scene The Babylon.js scene to use for timing
     * @param cutScene The cutscene configuration to play
     * @returns Promise that resolves when the cutscene completes
     */
    public static async playCutScene(scene: BABYLON.Scene, cutScene: CutScene): Promise<void> {
        // Create fullscreen overlay container
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 10000;
            background: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        let visualElement: HTMLImageElement | HTMLVideoElement | null = null;
        let audioElement: HTMLAudioElement | null = null;
        let fadeObserver: BABYLON.Observer<BABYLON.Scene> | null = null;
        let cleanupObserver: BABYLON.Observer<BABYLON.Scene> | null = null;

        try {
            // Create audio element if audioUrl is provided
            if (cutScene.audioUrl) {
                audioElement = document.createElement('audio');
                audioElement.src = cutScene.audioUrl;
                audioElement.autoplay = true;
                audioElement.volume = 1.0;
                try {
                    await audioElement.play();
                } catch {
                    // Autoplay may fail in some browsers, continue without audio
                }
            }

            // Handle image type
            if (cutScene.type === "image") {
                // Append overlay to DOM first so it's visible immediately
                document.body.appendChild(overlay);
                
                const img = document.createElement('img');
                img.src = cutScene.visualUrl;
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                `;
                visualElement = img;
                overlay.appendChild(img);

                // Wait for image to load
                // If image fails to load, still show overlay for minimum duration
                await new Promise<void>((resolve) => {
                    img.onload = () => {
                        resolve();
                    };
                    img.onerror = () => {
                        // Continue even if image fails - overlay is already visible
                        resolve();
                    };
                });

                // Start audio fade-out at 9 seconds (1 second before end)
                if (audioElement) {
                    const fadeStartTime = performance.now();
                    fadeObserver = scene.onBeforeRenderObservable.add(() => {
                        const elapsed = performance.now() - fadeStartTime;
                        if (elapsed >= 9000) {
                            const fadeProgress = Math.min((elapsed - 9000) / 1000, 1.0);
                            if (audioElement) {
                                audioElement.volume = Math.max(0, 1.0 - fadeProgress);
                            }
                        }
                    });
                }

                // Wait 10 seconds using Time utility
                await new Promise<void>((resolve) => {
                    Time.runDelayed(scene, 10000, () => {
                        resolve();
                    });
                });
            }
            // Handle video type
            else if (cutScene.type === "video") {
                const video = document.createElement('video');
                video.src = cutScene.visualUrl;
                video.autoplay = true;
                video.playsInline = true;
                // Try to play with audio first, fall back to muted if autoplay fails
                video.muted = false;
                video.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                `;
                visualElement = video;
                overlay.appendChild(video);

                document.body.appendChild(overlay);

                // Wait for video to load and start playing
                await new Promise<void>((resolve, reject) => {
                    video.onloadeddata = async () => {
                        // Try to play with audio
                        try {
                            await video.play();
                            resolve();
                        } catch {
                            // Autoplay with sound failed, try muted
                            video.muted = true;
                            try {
                                await video.play();
                                resolve();
                            } catch {
                                reject(new Error('Failed to play cutscene video'));
                            }
                        }
                    };
                    video.onerror = () => {
                        reject(new Error('Failed to load cutscene video'));
                    };
                });

                // Start audio fade-out when video is near end
                if (audioElement) {
                    cleanupObserver = scene.onBeforeRenderObservable.add(() => {
                        if (video.readyState >= 2) {
                            const duration = video.duration;
                            const currentTime = video.currentTime;
                            if (duration > 0 && currentTime > 0 && duration - currentTime <= 1.0) {
                                const fadeProgress = 1.0 - ((duration - currentTime) / 1.0);
                                if (audioElement) {
                                    audioElement.volume = Math.max(0, 1.0 - fadeProgress);
                                }
                            }
                        }
                    });
                }

                // Wait for video to end
                await new Promise<void>((resolve) => {
                    video.onended = () => {
                        resolve();
                    };
                });
            }

            // Stop audio if still playing
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        } finally {
            // Clean up observers
            if (fadeObserver) {
                scene.onBeforeRenderObservable.remove(fadeObserver);
            }
            if (cleanupObserver) {
                scene.onBeforeRenderObservable.remove(cleanupObserver);
            }

            // Remove DOM elements
            if (overlay.parentElement) {
                overlay.remove();
            }
            if (audioElement && audioElement.parentElement) {
                audioElement.remove();
            }
        }
    }
}

