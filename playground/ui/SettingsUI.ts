// ============================================================================
// SETTINGS UI
// ============================================================================


import { CONFIG } from '../config/game-config';
import { ASSETS } from '../config/assets';
import type { SettingsSection, VisibilityType } from '../types/ui';
import type { SceneManager } from '../managers/SceneManager';

export class SettingsUI {
    private static settingsButton: HTMLDivElement | null = null;
    private static settingsPanel: HTMLDivElement | null = null;
    private static isPanelOpen = false;
    private static sceneManager: SceneManager | null = null;
    public static isInitializing = false; // Flag to prevent onChange during initialization
    // Cache for Babylon Playground UI element display styles
    private static playgroundUICache: Map<HTMLElement, string> = new Map();

    // Device detection methods
    private static isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    private static isIPad(): boolean {
        // Modern iPad detection (including iPad Pro)
        const userAgent = navigator.userAgent;
        const isIPadUA = /iPad/i.test(userAgent);
        const isMacWithTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        const isIPadPro = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

        return isIPadUA || isMacWithTouch || isIPadPro;
    }

    private static isIPadWithKeyboard(): boolean {
        // Check if it's an iPad first
        if (!this.isIPad()) {
            return false;
        }

        // Multiple detection methods for iPad with keyboard
        const isLandscape = window.innerHeight < window.innerWidth;
        const hasExternalKeyboard = this.detectExternalKeyboard();
        const hasKeyboardEvents = this.detectKeyboardEvents();

        // Show if any of these conditions are met
        return isLandscape || hasExternalKeyboard || hasKeyboardEvents;
    }

    private static detectExternalKeyboard(): boolean {
        // Check for external keyboard indicators
        // This is a simplified check - in real scenarios you might need more sophisticated detection
        return navigator.maxTouchPoints === 0 ||
            (navigator.maxTouchPoints === 1 && window.innerWidth > 1024);
    }

    private static detectKeyboardEvents(): boolean {
        // Check if keyboard events have been detected recently
        // This would require tracking keyboard events over time
        // For now, we'll use a simpler approach
        return false; // Placeholder for future keyboard event tracking
    }

    private static shouldShowSection(visibility: VisibilityType): boolean {
        switch (visibility) {
            case "all":
                return true;
            case "mobile":
                return this.isMobileDevice();
            case "iPadWithKeyboard":
                return this.isIPadWithKeyboard();
            default:
                return false;
        }
    }

    public static initialize(canvas: HTMLCanvasElement, sceneManager?: SceneManager): void {
        // Clean up first
        this.cleanup();
        
        this.isInitializing = true; // Prevent onChange during initialization
        this.sceneManager = sceneManager ?? null;
        this.createSettingsButton(canvas);
        this.createSettingsPanel(canvas);
        this.setupEventListeners();
        this.isInitializing = false; // Allow onChange after initialization
    }

    private static createSettingsButton(_canvas: HTMLCanvasElement): void {
        // Create settings button
        this.settingsButton = document.createElement('div');
        this.settingsButton.id = 'settings-button';
        this.settingsButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7195 9.31074 19.5149 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.74206 9.96512 4.01128 9.77251C4.2805 9.5799 4.48514 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        // Style the button
        this.settingsButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            z-index: 2000;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        // Add hover effects
        this.settingsButton.addEventListener('mouseenter', () => {
            if (this.settingsButton) {
                this.settingsButton.style.background = 'rgba(0, 0, 0, 0.9)';
                this.settingsButton.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                this.settingsButton.style.transform = 'scale(1.1)';
            }
        });

        this.settingsButton.addEventListener('mouseleave', () => {
            if (this.settingsButton) {
                this.settingsButton.style.background = 'rgba(0, 0, 0, 0.7)';
                this.settingsButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                this.settingsButton.style.transform = 'scale(1)';
            }
        });

        document.body.appendChild(this.settingsButton);
    }

    private static createSettingsPanel(_canvas: HTMLCanvasElement): void {
        // Create settings panel
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.id = 'settings-panel';

        // Calculate panel width (1/3 of view width with minimum 500px)
        const viewWidth = window.innerWidth;
        const panelWidth = Math.max(viewWidth / 3, 500);

        // Generate sections HTML
        const sectionsHTML = this.generateSectionsHTML();

        this.settingsPanel.innerHTML = `
            <div class="settings-header">
                <h2>${CONFIG.SETTINGS.HEADING_TEXT}</h2>
            </div>
            <div class="settings-content">
                ${sectionsHTML}
            </div>
        `;

        // Style the panel
        this.settingsPanel.style.cssText = `
            position: fixed;
            top: 0;
            left: -${panelWidth}px;
            width: ${panelWidth}px;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
            border-right: 2px solid rgba(255, 255, 255, 0.2);
            z-index: ${CONFIG.SETTINGS.Z_INDEX};
            transition: left 0.3s ease;
            color: white;
            font-family: Arial, sans-serif;
            overflow-y: auto;
        `;

        // Style the header
        const header = this.settingsPanel.querySelector('.settings-header');
        if (header instanceof HTMLElement) {
            header.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
            box-sizing: border-box;
            max-width: 100%;
        `;

            // Style the header title
            const headerTitle = header.querySelector('h2');
            if (headerTitle instanceof HTMLElement) {
                headerTitle.style.cssText = `
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: white;
        `;
            }
        }

        // Apply styles to content and sections
        this.applySectionStyles();

        document.body.appendChild(this.settingsPanel);

        // Setup section event listeners
        this.setupSectionEventListeners();

        // Listen for orientation changes to re-evaluate section visibility
        window.addEventListener('orientationchange', () => {
            requestAnimationFrame(() => {
                this.regenerateSections();
            });
        });

        // Also listen for resize events
        window.addEventListener('resize', () => {
            this.regenerateSections();
        });
    }

    /**
     * Applies styles to all section elements, content area, and form controls.
     * This method can be called multiple times safely to re-apply styles after content updates.
     */
    private static applySectionStyles(): void {
        if (!this.settingsPanel) return;

        // Style the content area
        const content = this.settingsPanel.querySelector('.settings-content');
        if (content instanceof HTMLElement) {
            content.style.cssText = `
            padding: 20px;
            box-sizing: border-box;
            max-width: 100%;
            overflow-x: hidden;
        `;
        }

        // Style sections
        const sections = this.settingsPanel.querySelectorAll('.settings-section');
        sections.forEach(section => {
            if (section instanceof HTMLElement) {
                section.style.cssText = `
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            }
        });

        // Style section headers
        const sectionHeaders = this.settingsPanel.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            if (header instanceof HTMLElement) {
                header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            `;
            }
        });

        // Style section titles
        const sectionTitles = this.settingsPanel.querySelectorAll('.section-header h3');
        sectionTitles.forEach(title => {
            if (title instanceof HTMLElement) {
                title.style.cssText = `
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: white;
            `;
            }
        });

        // Style toggle switches
        const toggleSwitches = this.settingsPanel.querySelectorAll('.toggle-switch');
        toggleSwitches.forEach(toggleSwitch => {
            if (toggleSwitch instanceof HTMLElement) {
                toggleSwitch.style.cssText = `
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            `;
            }
        });

        const toggleInputs = this.settingsPanel.querySelectorAll('.toggle-switch input');
        toggleInputs.forEach(input => {
            if (input instanceof HTMLElement) {
                input.style.cssText = `
                opacity: 0;
                width: 0;
                height: 0;
            `;
            }
        });

        const toggleSliders = this.settingsPanel.querySelectorAll('.toggle-slider');
        toggleSliders.forEach(slider => {
            if (slider instanceof HTMLElement) {
                slider.style.cssText = `
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.3);
                transition: 0.3s;
                border-radius: 24px;
            `;

                // Add pseudo-element for the toggle circle if it doesn't exist
                if (!slider.querySelector('span')) {
                    slider.innerHTML = '<span style="position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.3s; border-radius: 50%;"></span>';
                }
            }
        });

        // Style dropdowns
        const selects = this.settingsPanel.querySelectorAll('select');
        selects.forEach(select => {
            if (select instanceof HTMLElement) {
                select.style.cssText = `
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                color: white;
                font-size: 14px;
                cursor: pointer;
            `;
            }
        });
    }

    private static regenerateSections(): void {
        if (!this.settingsPanel) return;

        // Regenerate sections HTML
        const sectionsHTML = this.generateSectionsHTML();
        const content = this.settingsPanel.querySelector('.settings-content');
        if (content) {
            content.innerHTML = sectionsHTML;
        }

        // Re-apply styles to preserve styling after innerHTML update
        this.applySectionStyles();

        // Re-setup event listeners and toggle state handlers
        this.setupSectionEventListeners();
        this.setupToggleStateHandlers();
    }

    private static generateSectionsHTML(): string {
        let sectionsHTML = '';

        CONFIG.SETTINGS.SECTIONS.forEach((section: SettingsSection, index) => {
            // Check if section should be visible
            if (!this.shouldShowSection(section.visibility)) {
                return;
            }

            const sectionId = `section-${index}`;

            if (section.uiElement === 'toggle') {
                // Get current state for mobile controls
                let defaultValue = false;
                if (typeof section.defaultValue === 'boolean') {
                    defaultValue = section.defaultValue;
                }
                if (section.title === "Screen Controls") {
                    // For Screen Controls, always default to true (visible) since controls are shown by default
                    defaultValue = true;
                }

                sectionsHTML += `
                    <div class="settings-section" id="${sectionId}">
                        <div class="section-header">
                            <h3>${section.title}</h3>
                            <label class="toggle-switch">
                                <input type="checkbox" ${defaultValue ? 'checked' : ''} data-section-index="${index}">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                `;
            } else {
                let defaultValue = section.options?.[0] ?? '';
                if (typeof section.defaultValue === 'string') {
                    defaultValue = section.defaultValue;
                }

                // Special handling for Character and Environment dropdowns to show names
                let optionsHTML = '';
                if (section.title === "Character") {
                    optionsHTML = ASSETS.CHARACTERS.map((character) =>
                        `<option value="${character.name}" ${character.name === defaultValue ? 'selected' : ''}>${character.name}</option>`
                    ).join('');
                } else if (section.title === "Environment") {
                    optionsHTML = ASSETS.ENVIRONMENTS.map((environment) =>
                        `<option value="${environment.name}" ${environment.name === defaultValue ? 'selected' : ''}>${environment.name}</option>`
                    ).join('');
                } else {
                    optionsHTML = section.options?.map(option =>
                        `<option value="${option}" ${option === defaultValue ? 'selected' : ''}>${option}</option>`
                    ).join('') ?? '';
                }

                sectionsHTML += `
                    <div class="settings-section" id="${sectionId}">
                        <div class="section-header">
                            <h3>${section.title}</h3>
                            <select data-section-index="${index}">
                                ${optionsHTML}
                            </select>
                        </div>
                    </div>
                `;
            }
        });

        return sectionsHTML;
    }

    private static setupSectionEventListeners(): void {
        // Setup toggle switches
        if (!this.settingsPanel) return;
        const toggles = this.settingsPanel.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', async (e) => {
                const target = e.target;
                if (!(target instanceof HTMLInputElement)) return;
                const sectionIndexStr = target.dataset.sectionIndex;
                if (sectionIndexStr == null) return;
                const sectionIndex = parseInt(sectionIndexStr);
                const section: SettingsSection = CONFIG.SETTINGS.SECTIONS[sectionIndex];

                if (section.onChange) {
                    await section.onChange(target.checked);
                }
            });
        });

        // Setup dropdown selects
        const selects = this.settingsPanel.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', async (e) => {
                const target = e.target;
                if (!(target instanceof HTMLSelectElement)) return;
                const sectionIndexStr = target.dataset.sectionIndex;
                if (sectionIndexStr == null) return;
                const sectionIndex = parseInt(sectionIndexStr);
                const section: SettingsSection = CONFIG.SETTINGS.SECTIONS[sectionIndex];

                if (section.onChange && !this.isInitializing) {
                    await section.onChange(target.value);
                }
            });
        });

        // Add toggle state change handlers
        this.setupToggleStateHandlers();
    }

    private static setupToggleStateHandlers(): void {
        if (!this.settingsPanel) return;
        const toggleInputs = this.settingsPanel.querySelectorAll('.toggle-switch input');
        toggleInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const target = e.target;
                if (!(target instanceof HTMLInputElement)) return;
                const slider = target.nextElementSibling;
                if (!(slider instanceof HTMLElement)) return;
                const toggleCircle = slider.querySelector('span');
                if (!(toggleCircle instanceof HTMLElement)) return;

                if (target.checked) {
                    slider.style.backgroundColor = 'rgba(0, 255, 136, 0.8)';
                    toggleCircle.style.transform = 'translateX(26px)';
                } else {
                    slider.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    toggleCircle.style.transform = 'translateX(0)';
                }
            });
        });
    }

    private static setupEventListeners(): void {
        // Settings button click
        if (!this.settingsButton) return;
        this.settingsButton.addEventListener('click', () => {
            this.togglePanel();
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen && this.settingsPanel && this.settingsButton) {
                const target = e.target;
                if (target instanceof Node &&
                    !this.settingsPanel.contains(target) &&
                    !this.settingsButton.contains(target)) {
                    this.closePanel();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isPanelOpen) {
                this.updatePanelWidth();
            }
        });
    }

    private static togglePanel(): void {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    private static openPanel(): void {
        if (!this.settingsPanel || !this.settingsButton) return;
        this.settingsPanel.style.left = '0px';
        this.isPanelOpen = true;
        // Keep the button visible and on top
        this.settingsButton.style.transform = 'scale(1.1)';
        this.settingsButton.style.background = 'rgba(0, 0, 0, 0.9)';
        this.settingsButton.style.zIndex = CONFIG.SETTINGS.BUTTON_Z_INDEX.toString(); // Ensure button stays on top
    }

    private static closePanel(): void {
        if (!this.settingsPanel || !this.settingsButton) return;
        const panelWidth = this.settingsPanel.offsetWidth;
        this.settingsPanel.style.left = `-${panelWidth}px`;
        this.isPanelOpen = false;
        this.settingsButton.style.transform = 'scale(1)';
        this.settingsButton.style.background = 'rgba(0, 0, 0, 0.7)';
        this.settingsButton.style.zIndex = CONFIG.SETTINGS.BUTTON_Z_INDEX.toString(); // Reset z-index
    }

    private static updatePanelWidth(): void {
        if (!this.settingsPanel) return;
        const viewWidth = window.innerWidth;

        // If screen width is less than threshold, use full viewport width (100vw)
        // Otherwise use the configured ratio
        if (viewWidth < CONFIG.SETTINGS.FULL_SCREEN_THRESHOLD) {
            this.settingsPanel.style.width = '100vw';
            // Ensure no horizontal overflow on small screens
            this.settingsPanel.style.boxSizing = 'border-box';
            this.settingsPanel.style.padding = '0';
            this.settingsPanel.style.margin = '0';
        } else {
            const panelWidth = Math.max(viewWidth * CONFIG.SETTINGS.PANEL_WIDTH_RATIO, CONFIG.SETTINGS.FULL_SCREEN_THRESHOLD);
            this.settingsPanel.style.width = `${panelWidth}px`;
            // Reset to normal styling for larger screens
            this.settingsPanel.style.boxSizing = '';
            this.settingsPanel.style.padding = '';
            this.settingsPanel.style.margin = '';
        }

        if (!this.isPanelOpen) {
            const currentWidth = this.settingsPanel.style.width;
            this.settingsPanel.style.left = `-${currentWidth}`;
        }
    }

    public static dispose(): void {
        if (this.settingsButton) {
            this.settingsButton.remove();
            this.settingsButton = null;
        }
        if (this.settingsPanel) {
            this.settingsPanel.remove();
            this.settingsPanel = null;
        }
    }

    public static async changeCharacter(characterIndexOrName: number | string): Promise<void> {
        if (this.sceneManager && !this.isInitializing) {
            this.sceneManager.changeCharacter(characterIndexOrName);
        }
    }

    public static async changeEnvironment(environmentName: string): Promise<void> {
        if (this.sceneManager) {
            // Check if the environment is actually different from current
            const currentEnvironment = this.sceneManager.getCurrentEnvironment();
            if (currentEnvironment === environmentName) {
                return; // No change needed
            }

            // Pause physics to prevent character from falling during environment change
            this.sceneManager.pausePhysics();

            // Clear existing environment, items, and particles
            this.sceneManager.clearEnvironment();
            this.sceneManager.clearItems();
            this.sceneManager.clearParticles();

            // Load the new environment
            await this.sceneManager.loadEnvironment(environmentName);

            // Set up environment items for the new environment
            await this.sceneManager.setupEnvironmentItems();

            // Reposition character to safe location in new environment
            this.sceneManager.repositionCharacter();

            // Force activate smooth camera following after environment transition
            this.sceneManager.forceActivateSmoothFollow();

            // Resume physics after environment is loaded
            this.sceneManager.resumePhysics();
        }
    }

    /**
     * Toggles visibility of Babylon Playground UI elements
     * These elements are created by the Babylon Playground infrastructure, not our codebase
     * @param visible - true to show elements, false to hide them
     */
    public static togglePlaygroundUI(visible: boolean): void {
        // CSS classes for Babylon Playground UI elements (external to our codebase)
        const playgroundUIClasses = [
            'command-bar',
            'logo-area',
            'version-number',
            'hamburger-button',
            'fps',
            'links'
        ];

        // Find all elements with target classes
        const elements: HTMLElement[] = [];
        playgroundUIClasses.forEach(className => {
            const foundElements = document.querySelectorAll(`.${className}`);
            foundElements.forEach(element => {
                if (element instanceof HTMLElement) {
                    elements.push(element);
                }
            });
        });

        // Cache initial display styles on first toggle OFF
        if (!visible && this.playgroundUICache.size === 0) {
            elements.forEach(element => {
                if (!this.playgroundUICache.has(element)) {
                    const computedStyle = window.getComputedStyle(element);
                    const displayValue = computedStyle.display;
                    this.playgroundUICache.set(element, displayValue);
                }
            });
        }

        // Apply visibility changes
        if (visible) {
            // Restore from cache
            this.playgroundUICache.forEach((displayValue, element) => {
                if (element.isConnected) {
                    element.style.display = displayValue;
                }
            });
        } else {
            // Hide elements
            elements.forEach(element => {
                // Cache if not already cached
                if (!this.playgroundUICache.has(element)) {
                    const computedStyle = window.getComputedStyle(element);
                    const displayValue = computedStyle.display;
                    this.playgroundUICache.set(element, displayValue);
                }
                element.style.display = 'none';
            });
        }

        // If no elements found, try again with delayed initialization
        if (elements.length === 0) {
            this.attemptDelayedPlaygroundUIToggle(visible, 0);
        }
    }

    /**
     * Attempts to find and toggle playground UI elements with retries
     * Handles cases where elements may not exist yet
     */
    private static attemptDelayedPlaygroundUIToggle(visible: boolean, attempt: number): void {
        const retryDelays = [100, 500, 1000]; // milliseconds
        const maxAttempts = retryDelays.length;

        if (attempt >= maxAttempts) {
            return; // Give up after max attempts
        }

        setTimeout(() => {
            // Try to find elements again
            const playgroundUIClasses = [
                'command-bar',
                'logo-area',
                'version-number',
                'hamburger-button',
                'fps',
                'links'
            ];

            const elements: HTMLElement[] = [];
            playgroundUIClasses.forEach(className => {
                const foundElements = document.querySelectorAll(`.${className}`);
                foundElements.forEach(element => {
                    if (element instanceof HTMLElement) {
                        elements.push(element);
                    }
                });
            });

            if (elements.length > 0) {
                // Found elements, now toggle them
                if (!visible && this.playgroundUICache.size === 0) {
                    elements.forEach(element => {
                        if (!this.playgroundUICache.has(element)) {
                            const computedStyle = window.getComputedStyle(element);
                            const displayValue = computedStyle.display;
                            this.playgroundUICache.set(element, displayValue);
                        }
                    });
                }

                if (visible) {
                    this.playgroundUICache.forEach((displayValue, element) => {
                        if (element.isConnected) {
                            element.style.display = displayValue;
                        }
                    });
                } else {
                    elements.forEach(element => {
                        if (!this.playgroundUICache.has(element)) {
                            const computedStyle = window.getComputedStyle(element);
                            const displayValue = computedStyle.display;
                            this.playgroundUICache.set(element, displayValue);
                        }
                        element.style.display = 'none';
                    });
                }
            } else {
                // Still no elements, try again
                this.attemptDelayedPlaygroundUIToggle(visible, attempt + 1);
            }
        }, retryDelays[attempt]);
    }

    /**
     * Global cleanup method to remove all SettingsUI elements from DOM
     */
    public static cleanup(): void {
        // Remove ALL settings buttons and panels (more aggressive)
        const allButtons = document.querySelectorAll('#settings-button');
        allButtons.forEach(button => button.remove());

        const allPanels = document.querySelectorAll('#settings-panel');
        allPanels.forEach(panel => panel.remove());

        // Nuclear option - remove ANY div with settings gear icon
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
            if (div.innerHTML.includes('M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z') && 
                div.style.position === 'fixed' && 
                div.style.bottom === '20px' && 
                div.style.left === '20px') {
                div.remove();
            }
        });

        // Also remove by static reference if it exists
        if (this.settingsButton) {
            this.settingsButton.remove();
            this.settingsButton = null;
        }

        if (this.settingsPanel) {
            this.settingsPanel.remove();
            this.settingsPanel = null;
        }

        // Reset state
        this.isPanelOpen = false;
        this.sceneManager = null;
        // Clear playground UI cache
        this.playgroundUICache.clear();
    }
}
