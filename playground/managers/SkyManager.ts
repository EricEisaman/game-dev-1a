// ============================================================================
// SKY MANAGER
// ============================================================================


import type { SkyConfig } from '../types/environment';

export class SkyManager {
    private static sky: BABYLON.Mesh | null = null;
    private static skyTexture: BABYLON.Texture | null = null;
    
    // Effect state management
    private static heatLightningEffect: {
        startTime: number;
        strength: number;
        frequency: number;
        duration: number;
        originalVisibility: number;
    } | null = null;
    
    private static colorEffect: {
        startTime: number;
        color: BABYLON.Color4;
        frequency: number;
        duration: number;
        originalEmissiveColor: BABYLON.Color3;
    } | null = null;
    
    private static animationFrameId: number | null = null;

    /**
     * Creates and applies a sky to the scene
     * @param scene The Babylon.js scene
     * @param skyConfig Sky configuration object
     * @returns The created sky mesh
     */
    public static createSky(
        scene: BABYLON.Scene,
        skyConfig: SkyConfig
    ): BABYLON.Mesh {
        // Remove existing sky if present
        this.removeSky(scene);

        // Create sky texture
        this.skyTexture = new BABYLON.Texture(skyConfig.TEXTURE_URL, scene);

        // Apply blur if specified
        if (skyConfig.BLUR > 0) {
            this.skyTexture.level = skyConfig.BLUR;
        }

        // Create sky based on type
        if (skyConfig.TYPE.toUpperCase() === "SPHERE") {
            this.createSkySphere(scene, skyConfig.ROTATION_Y);
        } else {
            this.createSkyBox(scene, skyConfig.ROTATION_Y);
        }

        if (!this.sky) throw new Error('Sky not initialized');
        return this.sky;
    }

    /**
     * Creates a sky sphere (360-degree sphere)
     * @param scene The Babylon.js scene
     * @param rotationY Y-axis rotation in radians
     */
    private static createSkySphere(scene: BABYLON.Scene, rotationY: number): void {
        // Create sphere mesh
        this.sky = BABYLON.MeshBuilder.CreateSphere("skySphere", {
            diameter: 1000.0,
            segments: 32
        }, scene);

        // Create sky material for sphere
        const skyMaterial = new BABYLON.StandardMaterial("skySphere", scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.diffuseTexture = this.skyTexture;
        skyMaterial.disableLighting = true;
        skyMaterial.emissiveTexture = this.skyTexture;
        skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

        // Apply material to sky
        this.sky.material = skyMaterial;

        // Fix upside-down issue by rotating 180 degrees around X-axis
        this.sky.rotation.x = Math.PI;

        // Apply additional rotation
        if (rotationY !== 0) {
            this.sky.rotation.y = rotationY;
        }
    }

    /**
     * Creates a sky box (standard cube skybox)
     * @param scene The Babylon.js scene
     * @param rotationY Y-axis rotation in radians
     */
    private static createSkyBox(scene: BABYLON.Scene, rotationY: number): void {
        // Set texture coordinates mode for cube skybox
        if (!this.skyTexture) throw new Error('Sky texture not initialized');
        this.skyTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

        // Create box mesh
        this.sky = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);

        // Create sky material for box
        const skyMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.diffuseTexture = this.skyTexture;
        skyMaterial.disableLighting = true;
        skyMaterial.emissiveTexture = this.skyTexture;
        skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

        // Apply material to sky
        this.sky.material = skyMaterial;

        // Apply rotation
        if (rotationY !== 0) {
            this.sky.rotation.y = rotationY;
        }
    }

    /**
     * Removes the sky from the scene
     * @param scene The Babylon.js scene
     */
    public static removeSky(_scene: BABYLON.Scene): void {
        if (this.sky) {
            this.sky.dispose();
            this.sky = null;
        }

        if (this.skyTexture) {
            this.skyTexture.dispose();
            this.skyTexture = null;
        }
    }

    /**
     * Updates the sky rotation
     * @param rotationY Y-axis rotation in radians
     */
    public static setRotation(rotationY: number): void {
        if (this.sky) {
            this.sky.rotation.y = rotationY;
        }
    }

    /**
     * Updates the sky blur
     * @param blur Blur amount (0-1)
     */
    public static setBlur(blur: number): void {
        if (this.skyTexture) {
            this.skyTexture.level = blur;
        }
    }

    /**
     * Gets the current sky mesh
     * @returns The sky mesh or null if not created
     */
    public static getSky(): BABYLON.Mesh | null {
        return this.sky;
    }

    /**
     * Checks if a sky exists
     * @returns True if sky exists, false otherwise
     */
    public static hasSky(): boolean {
        return this.sky !== null;
    }

    /**
     * Applies a heat lightning effect that cycles sky visibility
     * @param strength - Number between 0 and 1, determines how much visibility decreases (visibility cycles from 1 to 1 - strength)
     * @param frequency - Number of cycles per second (Hz)
     * @param duration - Duration in milliseconds
     */
    public static effectHeatLightning(strength: number, frequency: number, duration: number): void {
        // Validate parameters
        if (strength < 0 || strength > 1 || frequency <= 0 || duration <= 0) {
            return; // Silent failure for robustness
        }

        // Check if sky exists
        if (!this.sky) {
            return; // No sky to affect
        }

        // Store original visibility
        const originalVisibility = this.sky.visibility;

        // Initialize effect state
        this.heatLightningEffect = {
            startTime: performance.now(),
            strength: strength,
            frequency: frequency,
            duration: duration,
            originalVisibility: originalVisibility
        };

        // Start animation loop if not already running
        if (this.animationFrameId === null) {
            this.updateEffects();
        }
    }

    /**
     * Applies a sky color effect with additive color blending
     * @param color - BABYLON.Color4 for additive blending
     * @param frequency - Number of cycles per second (Hz)
     * @param duration - Duration in milliseconds
     */
    public static effectSkyColor(color: BABYLON.Color4, frequency: number, duration: number): void {
        // Validate parameters
        if (frequency <= 0 || duration <= 0 || !(color instanceof BABYLON.Color4)) {
            return; // Silent failure for robustness
        }

        // Check if sky exists and has material
        if (!this.sky || !this.sky.material) {
            return; // No sky or material to affect
        }

        // Get sky material with type guard
        const material = this.sky.material;
        if (!(material instanceof BABYLON.StandardMaterial)) {
            return; // Material is not StandardMaterial
        }

        // Store original emissiveColor
        const originalEmissiveColor = material.emissiveColor.clone();

        // Initialize effect state
        this.colorEffect = {
            startTime: performance.now(),
            color: color.clone(),
            frequency: frequency,
            duration: duration,
            originalEmissiveColor: originalEmissiveColor
        };

        // Start animation loop if not already running
        if (this.animationFrameId === null) {
            this.updateEffects();
        }
    }

    /**
     * Unified animation loop that updates both effects if active
     */
    private static updateEffects(): void {
        const currentTime = performance.now();

        // Update heat lightning effect if active
        if (this.heatLightningEffect) {
            const elapsed = (currentTime - this.heatLightningEffect.startTime) / 1000; // Convert to seconds
            const elapsedMs = currentTime - this.heatLightningEffect.startTime;

            if (elapsedMs >= this.heatLightningEffect.duration) {
                // Effect duration expired, stop it
                this.stopHeatLightningEffect();
            } else if (this.sky) {
                // Calculate visibility using sine wave
                const sineValue = Math.sin(elapsed * this.heatLightningEffect.frequency * 2 * Math.PI);
                const visibility = 1 - (this.heatLightningEffect.strength * (1 + sineValue) / 2);
                this.sky.visibility = visibility;
            }
        }

        // Update color effect if active
        if (this.colorEffect) {
            const elapsed = (currentTime - this.colorEffect.startTime) / 1000; // Convert to seconds
            const elapsedMs = currentTime - this.colorEffect.startTime;

            if (elapsedMs >= this.colorEffect.duration) {
                // Effect duration expired, stop it
                this.stopColorEffect();
            } else if (this.sky && this.sky.material) {
                const material = this.sky.material;
                if (material instanceof BABYLON.StandardMaterial) {
                    // Calculate blend factor using sine wave
                    const sineValue = Math.sin(elapsed * this.colorEffect.frequency * 2 * Math.PI);
                    const blendFactor = (1 + sineValue) / 2;

                    // Apply additive color blending
                    const r = Math.max(0, Math.min(1, this.colorEffect.originalEmissiveColor.r + (this.colorEffect.color.r * blendFactor)));
                    const g = Math.max(0, Math.min(1, this.colorEffect.originalEmissiveColor.g + (this.colorEffect.color.g * blendFactor)));
                    const b = Math.max(0, Math.min(1, this.colorEffect.originalEmissiveColor.b + (this.colorEffect.color.b * blendFactor)));

                    material.emissiveColor = new BABYLON.Color3(r, g, b);
                }
            }
        }

        // Continue animation loop if either effect is active
        if (this.heatLightningEffect || this.colorEffect) {
            this.animationFrameId = requestAnimationFrame(() => this.updateEffects());
        } else {
            // Both effects complete, stop animation loop
            this.animationFrameId = null;
        }
    }

    /**
     * Stops the heat lightning effect and restores original visibility
     */
    private static stopHeatLightningEffect(): void {
        if (this.heatLightningEffect && this.sky) {
            // Restore original visibility
            this.sky.visibility = this.heatLightningEffect.originalVisibility;
        }
        this.heatLightningEffect = null;
    }

    /**
     * Stops the color effect and restores original emissiveColor
     */
    private static stopColorEffect(): void {
        if (this.colorEffect && this.sky && this.sky.material) {
            const material = this.sky.material;
            if (material instanceof BABYLON.StandardMaterial) {
                // Restore original emissiveColor
                material.emissiveColor = this.colorEffect.originalEmissiveColor.clone();
            }
        }
        this.colorEffect = null;
    }

    /**
     * Stops all active effects and cancels animation frame
     */
    public static stopAllEffects(): void {
        this.stopHeatLightningEffect();
        this.stopColorEffect();
        
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
