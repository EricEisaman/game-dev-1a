// ============================================================================
// HUD MANAGER
// ============================================================================

import { CONFIG } from '../config/game-config';
import type { CharacterController } from '../controllers/CharacterController';
import { CollectiblesManager } from './CollectiblesManager';

export class HUDManager {
    private static hudContainer: HTMLDivElement | null = null;
    private static hudElements: Map<string, HTMLDivElement> = new Map();
    private static scene: BABYLON.Scene | null = null;
    private static characterController: CharacterController | null = null;
    private static startTime: number = 0;
    private static lastUpdateTime: number = 0;
    private static fpsCounter: number = 0;
    private static fpsLastTime: number = 0;
    private static currentFPS: number = 0;

    /**
     * Initializes the HUD with a scene and character controller
     */
    public static initialize(scene: BABYLON.Scene, characterController: CharacterController): void {
        // Clean up any existing HUD before creating a new one
        this.dispose();

        this.scene = scene;
        this.characterController = characterController;
        this.startTime = Date.now();
        this.createHUD();

        // Detect if this is a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);

        // Set initial visibility for all HUD elements based on device type
        this.setElementVisibility('coordinates', isMobile ? CONFIG.HUD.MOBILE.SHOW_COORDINATES : CONFIG.HUD.SHOW_COORDINATES);
        this.setElementVisibility('time', isMobile ? CONFIG.HUD.MOBILE.SHOW_TIME : CONFIG.HUD.SHOW_TIME);
        this.setElementVisibility('fps', isMobile ? CONFIG.HUD.MOBILE.SHOW_FPS : CONFIG.HUD.SHOW_FPS);
        this.setElementVisibility('state', isMobile ? CONFIG.HUD.MOBILE.SHOW_STATE : CONFIG.HUD.SHOW_STATE);
        this.setElementVisibility('boost', isMobile ? CONFIG.HUD.MOBILE.SHOW_BOOST_STATUS : CONFIG.HUD.SHOW_BOOST_STATUS);
        this.setElementVisibility('credits', isMobile ? CONFIG.HUD.MOBILE.SHOW_CREDITS : CONFIG.HUD.SHOW_CREDITS);

        // Start the update loop
        this.startUpdateLoop();
    }

    /**
     * Creates the HUD elements
     */
    private static createHUD(): void {
        if (!this.scene) return;

        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (!canvas) return;

        // Create HUD container
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'game-hud';
        this.hudContainer.style.cssText = this.getHUDContainerStyles();

        // Create HUD elements
        this.createHUDElement('coordinates', 'Coordinates');
        this.createHUDElement('time', 'Time');
        this.createHUDElement('fps', 'FPS');
        this.createHUDElement('state', 'State');
        this.createHUDElement('boost', 'Boost');
        this.createHUDElement('credits', 'Credits');

        // Add CSS animations
        this.addHUDAnimations();

        // Add HUD to canvas parent
        const canvasParent = canvas.parentElement;
        if (canvasParent) {
            canvasParent.appendChild(this.hudContainer);
        }

        // Set up FPS counter
        this.scene.onBeforeRenderObservable.add(() => {
            this.fpsCounter++;
            const currentTime = Date.now();
            if (currentTime - this.fpsLastTime >= 1000) {
                this.currentFPS = this.fpsCounter;
                this.fpsCounter = 0;
                this.fpsLastTime = currentTime;
            }
        });
    }

    /**
     * Gets the HUD container styles based on CONFIG.HUD.POSITION
     */
    private static getHUDContainerStyles(): string {
        const config = CONFIG.HUD;
        const position = config.POSITION;

        let positionStyles = '';
        switch (position) {
            case 'top':
                positionStyles = 'top: 0; left: 0; right: 0; flex-direction: row; justify-content: space-between;';
                break;
            case 'bottom':
                positionStyles = 'bottom: 0; left: 0; right: 0; flex-direction: row; justify-content: space-between;';
                break;
            case 'left':
                positionStyles = 'top: 0; left: 0; bottom: 0; flex-direction: column; justify-content: flex-start;';
                break;
            case 'right':
                positionStyles = 'top: 0; right: 0; bottom: 0; flex-direction: column; justify-content: flex-start;';
                break;
        }

        return `
            position: absolute;
            ${positionStyles}
            display: flex;
            padding: ${config.PADDING}px;
            font-family: ${config.FONT_FAMILY};
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            pointer-events: none;
        `;
    }

    /**
     * Creates a HUD element with proper styling
     */
    private static createHUDElement(id: string, label: string): void {
        if (!this.hudContainer) return;

        const element = document.createElement('div');
        element.id = `hud-${id}`;
        element.className = 'hud-element';
        element.style.cssText = this.getHUDElementStyles() + 'display: none;'; // Start hidden

        const labelSpan = document.createElement('span');
        labelSpan.className = 'hud-label';
        labelSpan.textContent = label;
        labelSpan.style.color = CONFIG.HUD.SECONDARY_COLOR;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'hud-value';
        valueSpan.id = `hud-${id}-value`;
        valueSpan.style.color = CONFIG.HUD.PRIMARY_COLOR;

        element.appendChild(labelSpan);
        // Add <br> for all elements to put value under title
        element.appendChild(document.createElement('br'));
        element.appendChild(valueSpan);

        this.hudContainer.appendChild(element);
        this.hudElements.set(id, element);
    }

    /**
     * Gets the HUD element styles
     */
    private static getHUDElementStyles(): string {
        const config = CONFIG.HUD;
        return `
            background-color: ${config.BACKGROUND_COLOR};
            background-opacity: ${config.BACKGROUND_OPACITY};
            background: rgba(0, 0, 0, ${config.BACKGROUND_OPACITY});
            color: ${config.PRIMARY_COLOR};
            padding: 8px 12px;
            margin: 2px;
            border-radius: ${config.BORDER_RADIUS}px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            min-width: 80px;
            text-align: center;
            transition: all 0.2s ease;
        `;
    }

    /**
     * Adds CSS animations for HUD effects
     */
    private static addHUDAnimations(): void {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .hud-element {
                animation: fadeIn 0.3s ease-out;
            }
            .hud-element:hover {
                animation: pulse 0.5s ease-in-out;
            }
            .hud-boost-active {
                animation: pulse 0.5s ease-in-out infinite alternate;
            }
            .hud-element.faded-in {
                animation: none;
            }
            .hud-element.faded-in.hud-boost-active {
                animation: pulse 0.5s ease-in-out infinite alternate;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Starts the HUD update loop
     */
    private static startUpdateLoop(): void {
        // Use Babylon.js scene observable instead of setInterval
        if (this.scene) {
            this.scene.onBeforeRenderObservable.add(() => {
                this.updateHUD();
            });
        }
    }

    /**
     * Updates all HUD elements
     */
    private static updateHUD(): void {
        if (!this.scene || !this.characterController) return;

        // Detect if this is a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);
        
        // Detect iPad with keyboard
        const isIPadWithKeyboard = this.isIPadWithKeyboard();

        // Update coordinates
        if (isIPadWithKeyboard || (isMobile ? CONFIG.HUD.MOBILE.SHOW_COORDINATES : CONFIG.HUD.SHOW_COORDINATES)) {
            this.updateCoordinates();
            this.setElementVisibility('coordinates', true);
        } else {
            this.setElementVisibility('coordinates', false);
        }

        // Update time
        if (isIPadWithKeyboard || (isMobile ? CONFIG.HUD.MOBILE.SHOW_TIME : CONFIG.HUD.SHOW_TIME)) {
            this.updateTime();
            this.setElementVisibility('time', true);
        } else {
            this.setElementVisibility('time', false);
        }

        // Update FPS
        if (isIPadWithKeyboard || (isMobile ? CONFIG.HUD.MOBILE.SHOW_FPS : CONFIG.HUD.SHOW_FPS)) {
            this.updateFPS();
            this.setElementVisibility('fps', true);
        } else {
            this.setElementVisibility('fps', false);
        }

        // Update state
        if (isIPadWithKeyboard || (isMobile ? CONFIG.HUD.MOBILE.SHOW_STATE : CONFIG.HUD.SHOW_STATE)) {
            this.updateState();
            this.setElementVisibility('state', true);
        } else {
            this.setElementVisibility('state', false);
        }

        // Update boost status
        if (isIPadWithKeyboard || (isMobile ? CONFIG.HUD.MOBILE.SHOW_BOOST_STATUS : CONFIG.HUD.SHOW_BOOST_STATUS)) {
            this.updateBoostStatus();
            this.setElementVisibility('boost', true);
        } else {
            this.setElementVisibility('boost', false);
        }

        // Update credits
        if (isIPadWithKeyboard || (isMobile ? CONFIG.HUD.MOBILE.SHOW_CREDITS : CONFIG.HUD.SHOW_CREDITS)) {
            this.updateCredits();
            this.setElementVisibility('credits', true);
        } else {
            this.setElementVisibility('credits', false);
        }
    }

    /**
     * Updates the coordinates display
     */
    private static updateCoordinates(): void {
        const element = this.hudElements.get('coordinates');
        if (!element || !this.characterController) return;

        const position = this.characterController.getPosition();
        const coordsValue = element.querySelector('#hud-coordinates-value');
        if (coordsValue) {
            coordsValue.textContent = `${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}`;
        }
    }

    /**
     * Updates the time display
     */
    private static updateTime(): void {
        const element = this.hudElements.get('time');
        if (!element) return;

        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeValue = element.querySelector('#hud-time-value');
        if (timeValue) {
            timeValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Updates the FPS display
     */
    private static updateFPS(): void {
        const element = this.hudElements.get('fps');
        if (!element || !this.scene) return;

        this.fpsCounter++;
        const currentTime = Date.now();
        
        if (currentTime - this.fpsLastTime >= 1000) {
            this.currentFPS = Math.round((this.fpsCounter * 1000) / (currentTime - this.fpsLastTime));
            this.fpsCounter = 0;
            this.fpsLastTime = currentTime;
        }

        const fpsValue = element.querySelector('#hud-fps-value') as HTMLElement;
        if (fpsValue) {
            fpsValue.textContent = this.currentFPS.toString();
            fpsValue.style.color = this.currentFPS < 30 ? '#ff4444' : CONFIG.HUD.PRIMARY_COLOR;
        }
    }

    /**
     * Updates the character state display
     */
    private static updateState(): void {
        const element = this.hudElements.get('state');
        if (!element || !this.characterController) return;

        const state = this.characterController.getCurrentState();
        const stateValue = element.querySelector('#hud-state-value') as HTMLElement;
        if (stateValue) {
            stateValue.textContent = state;
            stateValue.style.color = this.getStateColor(state);
        }
    }

    /**
     * Updates the boost status display
     */
    private static updateBoostStatus(): void {
        const element = this.hudElements.get('boost');
        if (!element || !this.characterController) return;

        const isBoosting = this.characterController.isBoosting();
        const boostValue = element.querySelector('#hud-boost-value') as HTMLElement;
        if (boostValue) {
            if (isBoosting) {
                boostValue.textContent = 'ACTIVE';
                boostValue.style.color = '#44ff44';
                element.classList.add('hud-boost-active');
            } else {
                boostValue.textContent = 'Inactive';
                boostValue.style.color = '#ff4444';
                element.classList.remove('hud-boost-active');
            }
        }
    }

    /**
     * Updates the credits display
     */
    private static updateCredits(): void {
        const element = this.hudElements.get('credits');
        if (!element) return;

        // Get credits from CollectiblesManager
        const credits = CollectiblesManager.getTotalCredits();
        const creditsValue = element.querySelector('#hud-credits-value');
        if (creditsValue) {
            creditsValue.textContent = credits.toString();
        }
    }

    /**
     * Sets the visibility of a HUD element
     */
    private static setElementVisibility(elementId: string, visible: boolean): void {
        const element = this.hudElements.get(elementId);
        if (element) {
            if (visible && element.style.display === 'none') {
                element.style.display = 'block';
                // Mark element as faded in after animation completes so it doesn't re-trigger
                if (!element.classList.contains('faded-in')) {
                    const handleAnimationEnd = () => {
                        if (element) {
                            element.classList.add('faded-in');
                        }
                        element.removeEventListener('animationend', handleAnimationEnd);
                    };
                    element.addEventListener('animationend', handleAnimationEnd, { once: true });
                }
            } else {
                element.style.display = visible ? 'block' : 'none';
            }
        }
    }

    /**
     * Triggers fade-in animation for all visible HUD elements
     * Called when the HUD container is toggled back on
     */
    public static triggerFadeIn(): void {
        this.hudElements.forEach((element) => {
            if (element.style.display !== 'none') {
                // Remove faded-in class to allow fadeIn animation to run again
                element.classList.remove('faded-in');
                // The CSS class will automatically trigger the fadeIn animation
                const handleAnimationEnd = () => {
                    if (element) {
                        element.classList.add('faded-in');
                    }
                    element.removeEventListener('animationend', handleAnimationEnd);
                };
                element.addEventListener('animationend', handleAnimationEnd, { once: true });
            }
        });
    }

    /**
     * Gets the color for a character state
     */
    private static getStateColor(state: string): string {
        switch (state.toLowerCase()) {
            case 'idle': return CONFIG.HUD.SECONDARY_COLOR;
            case 'walking': return '#4488ff';
            case 'running': return '#44ff88';
            case 'jumping': return '#ffaa44';
            case 'falling': return '#ff4444';
            default: return CONFIG.HUD.PRIMARY_COLOR;
        }
    }

    /**
     * Gets the color for boost status
     */
    private static getBoostColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'active':
            case 'ready': return '#44ff44';
            case 'inactive':
            case 'cooldown': return '#ff4444';
            default: return CONFIG.HUD.SECONDARY_COLOR;
        }
    }

    /**
     * Checks if this is an iPad with keyboard
     */
    private static isIPadWithKeyboard(): boolean {
        return /iPad/.test(navigator.userAgent) && navigator.maxTouchPoints > 0;
    }

    /**
     * Converts hex color to RGB values
     */
    private static hexToRgb(hex: string): string {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `${r}, ${g}, ${b}`;
        }
        return '0, 0, 0';
    }

    /**
     * Disposes of the HUD
     */
    public static dispose(): void {
        
        if (this.hudContainer) {
            this.hudContainer.remove();
            this.hudContainer = null;
        }
        
        this.hudElements.clear();
        this.scene = null;
        this.characterController = null;
    }

    /**
     * Global cleanup method to remove all HUD elements from DOM
     */
    public static cleanup(): void {
        // Remove any existing HUD containers
        const existingHUD = document.getElementById('game-hud');
        if (existingHUD) {
            existingHUD.remove();
        }

        // Clear any existing HUD styles
        const existingStyles = document.querySelectorAll('style');
        existingStyles.forEach(style => {
            if (style.textContent?.includes('hud-element') || style.textContent?.includes('@keyframes pulse')) {
                style.remove();
            }
        });

        // Reset static properties
        this.hudContainer = null;
        this.hudElements.clear();
        this.scene = null;
        this.characterController = null;
        this.startTime = 0;
        this.lastUpdateTime = 0;
        this.fpsCounter = 0;
        this.fpsLastTime = 0;
        this.currentFPS = 0;
    }
}