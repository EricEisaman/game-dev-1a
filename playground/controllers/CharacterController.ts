// ============================================================================
// CHARACTER CONTROLLER
// ============================================================================

// /// <reference path="../types/babylon.d.ts" />

import type { Character } from '../types/character';
import type { CharacterState } from '../config/character-states';
import { CHARACTER_STATES } from '../config/character-states';
import { CONFIG } from '../config/game-config';
import { INPUT_KEYS } from '../config/input-keys';
import { ASSETS } from '../config/assets';
import { AnimationController } from './AnimationController';
import type { SmoothFollowCameraController } from './SmoothFollowCameraController';

import { MobileInputManager } from '../input/MobileInputManager';

export class CharacterController {
    private readonly scene: BABYLON.Scene;
    private readonly characterController: BABYLON.PhysicsCharacterController;
    private displayCapsule: BABYLON.AbstractMesh;
    private playerMesh: BABYLON.AbstractMesh;

    private state: CharacterState = CHARACTER_STATES.IN_AIR;
    private wantJump = false;
    private inputDirection = new BABYLON.Vector3(0, 0, 0);
    private targetRotationY = 0;
    private keysDown = new Set<string>();
    private cameraController: SmoothFollowCameraController | null = null;
    private boostActive = false;
    private superJumpActive = false;
    private invisibilityActive = false;
    private playerParticleSystem: BABYLON.IParticleSystem | null = null;
    private thrusterSound: BABYLON.Sound | null = null;
    public animationController: AnimationController;

    // Mobile device detection - computed once at initialization
    private readonly isMobileDevice: boolean;
    private readonly isIPadWithKeyboard: boolean;
    private readonly isIPad: boolean;
    private keyboardEventCount: number = 0;
    private keyboardDetectionFrameCount: number = 0;
    private keyboardDetectionTimeout: number | null = null;
    private physicsPaused: boolean = false;
    private currentCharacter: Character | null = null;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;

        // Enhanced device detection
        this.isMobileDevice = this.detectMobileDevice();
        this.isIPad = this.detectIPad();
        this.isIPadWithKeyboard = this.detectIPadWithKeyboard();

        // Create character physics controller with default position (will be updated when character is loaded)
        this.characterController = new BABYLON.PhysicsCharacterController(
            new BABYLON.Vector3(0, 0, 0), // Default position, will be updated
            {
                capsuleHeight: 1.8, // Default height, will be updated when character is loaded
                capsuleRadius: 0.6  // Default radius, will be updated when character is loaded
            },
            scene
        );

        // Create display capsule for debug
        this.displayCapsule = BABYLON.MeshBuilder.CreateCapsule(
            "CharacterDisplay",
            {
                height: 1.8, // Default height, will be updated when character is loaded
                radius: 0.6  // Default radius, will be updated when character is loaded
            },
            scene
        );
        this.displayCapsule.isVisible = CONFIG.DEBUG.CAPSULE_VISIBLE;
        this.displayCapsule.setEnabled(false); // Disable immediately to prevent visibility on load

        // Initialize player mesh (will be replaced by loaded model)
        this.playerMesh = this.displayCapsule;

        // Initialize animation controller
        this.animationController = new AnimationController(scene);

        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.scene.onKeyboardObservable.add(this.handleKeyboard);
        this.scene.onBeforeRenderObservable.add(this.updateCharacter);
        this.scene.onAfterPhysicsObservable.add(this.updatePhysics);

        // Initialize mobile controls if on mobile device
        if (this.isMobileDevice) {
            const canvas = this.scene.getEngine().getRenderingCanvas();
            if (canvas) {
                MobileInputManager.initialize(canvas);
            }
        }
    }

    private detectMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);
    }

    private detectIPad(): boolean {
        // More specific iPad detection
        return /iPad/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0);
    }

    private detectIPadWithKeyboard(): boolean {
        if (!this.isIPad) return false;

        // Check for keyboard presence using various methods
        const hasKeyboard = this.checkForKeyboardPresence();
        const hasExternalKeyboard = this.checkForExternalKeyboard();

        return hasKeyboard || hasExternalKeyboard;
    }

    private checkForKeyboardPresence(): boolean {
        // Method 1: Check if virtual keyboard is likely present
        // This is not 100% reliable but gives us a good indication
        const viewportHeight = window.innerHeight;
        const screenHeight = window.screen.height;
        const keyboardLikelyPresent = viewportHeight < screenHeight * 0.8;

        return keyboardLikelyPresent;
    }

    private checkForExternalKeyboard(): boolean {
        // Method 2: Check for external keyboard events
        // We'll track if we receive keyboard events that suggest an external keyboard
        this.keyboardEventCount = 0;
        this.keyboardDetectionFrameCount = 0;
        const keyboardThreshold = 3; // Number of events to consider keyboard present
        const maxFrames = 300; // 5 seconds at 60fps

        const checkKeyboardEvents = (event: KeyboardEvent) => {
            // Only count events that are likely from a physical keyboard
            // (not virtual keyboard events which often have different characteristics)
            if (event.key.length === 1 ||
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Shift'].includes(event.key)) {
                this.keyboardEventCount++;

                if (this.keyboardEventCount >= keyboardThreshold) {
                    // Remove the listener once we've confirmed keyboard presence
                    document.removeEventListener('keydown', checkKeyboardEvents);
                    if (this.keyboardDetectionTimeout) {
                        clearTimeout(this.keyboardDetectionTimeout);
                        this.keyboardDetectionTimeout = null;
                    }
                    return true;
                }
            }
            return false;
        };

        // Add listener for a short period to detect keyboard
        document.addEventListener('keydown', checkKeyboardEvents);

        // Use scene observable instead of setTimeout for frame counting
        // Use setTimeout instead of scene observable for keyboard detection
        this.keyboardDetectionTimeout = window.setTimeout(() => {
            document.removeEventListener('keydown', checkKeyboardEvents);
        }, 5000);

        return false; // Will be updated by the event listener
    }

    private handleKeyboard = (kbInfo: BABYLON.KeyboardInfo): void => {
        const key = kbInfo.event.key.toLowerCase();

        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                this.keysDown.add(key);
                this.handleKeyDown(key);
                break;

            case BABYLON.KeyboardEventTypes.KEYUP:
                this.keysDown.delete(key);
                this.handleKeyUp(key);
                break;
        }
    };

    // Type guard functions for INPUT_KEYS
    private isForwardKey = (k: string): k is typeof INPUT_KEYS.FORWARD[number] => {
        return INPUT_KEYS.FORWARD.some(key => key === k);
    };

    private isBackwardKey = (k: string): k is typeof INPUT_KEYS.BACKWARD[number] => {
        return INPUT_KEYS.BACKWARD.some(key => key === k);
    };

    private isStrafeLeftKey = (k: string): k is typeof INPUT_KEYS.STRAFE_LEFT[number] => {
        return INPUT_KEYS.STRAFE_LEFT.some(key => key === k);
    };

    private isStrafeRightKey = (k: string): k is typeof INPUT_KEYS.STRAFE_RIGHT[number] => {
        return INPUT_KEYS.STRAFE_RIGHT.some(key => key === k);
    };

    private isJumpKey = (k: string): k is typeof INPUT_KEYS.JUMP[number] => {
        return INPUT_KEYS.JUMP.some(key => key === k);
    };

    private isBoostKey = (k: string): k is typeof INPUT_KEYS.BOOST[number] => {
        return INPUT_KEYS.BOOST.some(key => key === k);
    };

    private isDebugKey = (k: string): k is typeof INPUT_KEYS.DEBUG[number] => {
        return INPUT_KEYS.DEBUG.some(key => key === k);
    };

    private isHUDToggleKey = (k: string): k is typeof INPUT_KEYS.HUD_TOGGLE[number] => {
        return INPUT_KEYS.HUD_TOGGLE.some(key => key === k);
    };

    private isHUDPositionKey = (k: string): k is typeof INPUT_KEYS.HUD_POSITION[number] => {
        return INPUT_KEYS.HUD_POSITION.some(key => key === k);
    };

    private isResetCameraKey = (k: string): k is typeof INPUT_KEYS.RESET_CAMERA[number] => {
        return INPUT_KEYS.RESET_CAMERA.some(key => key === k);
    };

    private isLeftKey = (k: string): k is typeof INPUT_KEYS.LEFT[number] => {
        return INPUT_KEYS.LEFT.some(key => key === k);
    };

    private isRightKey = (k: string): k is typeof INPUT_KEYS.RIGHT[number] => {
        return INPUT_KEYS.RIGHT.some(key => key === k);
    };

    private handleKeyDown(key: string): void {
        // Movement input
        if (INPUT_KEYS.FORWARD.includes(key as any)) {
            this.inputDirection.z = 1;

        } else if (INPUT_KEYS.BACKWARD.includes(key as any)) {
            this.inputDirection.z = -1;

        } else if (INPUT_KEYS.STRAFE_LEFT.includes(key as any)) {
            this.inputDirection.x = -1;

        } else if (INPUT_KEYS.STRAFE_RIGHT.includes(key as any)) {
            this.inputDirection.x = 1;

        } else if (INPUT_KEYS.JUMP.includes(key as any)) {
            this.wantJump = true;
        } else if (INPUT_KEYS.BOOST.includes(key as any)) {
            this.boostActive = true;
            this.updateParticleSystem();
        } else if (INPUT_KEYS.DEBUG.includes(key as any)) {
            this.toggleDebugDisplay();
        } else if (INPUT_KEYS.HUD_TOGGLE.includes(key as any)) {
            this.toggleHUD();
        } else if (INPUT_KEYS.HUD_POSITION.includes(key as any)) {
            this.cycleHUDPosition();
        } else if (INPUT_KEYS.RESET_CAMERA.includes(key as any)) {
            this.resetCameraToDefaultOffset();
        }

        // Only update mobile input for iPads with keyboards, not for regular keyboard input
        if (this.isIPadWithKeyboard) {
            this.updateMobileInput();
        }
    }

    private handleKeyUp(key: string): void {
        // Reset movement input
        if (INPUT_KEYS.FORWARD.includes(key as any) || INPUT_KEYS.BACKWARD.includes(key as any)) {
            this.inputDirection.z = 0;
        }
        if (INPUT_KEYS.LEFT.includes(key as any) || INPUT_KEYS.RIGHT.includes(key as any)) {
            this.inputDirection.x = 0;
        }
        if (INPUT_KEYS.STRAFE_LEFT.includes(key as any) || INPUT_KEYS.STRAFE_RIGHT.includes(key as any)) {
            this.inputDirection.x = 0;
        }
        if (INPUT_KEYS.JUMP.includes(key as any)) {
            this.wantJump = false;
        }
        if (INPUT_KEYS.BOOST.includes(key as any)) {
            this.boostActive = false;
            this.updateParticleSystem();
        }

        // Only update mobile input for iPads with keyboards, not for regular keyboard input
        if (this.isIPadWithKeyboard) {
            this.updateMobileInput();
        }
    }

    private updateMobileInput(): void {
        // Only update mobile input if this is a mobile device
        if (this.isMobileDevice) {
            // Get mobile input direction
            const mobileDirection = MobileInputManager.getInputDirection();

            // For iPads with keyboards, allow both keyboard and touch input to work together
            if (this.isIPadWithKeyboard) {
                // Only allow touch input for rotation (X-axis) when not in air
                if (this.state !== CHARACTER_STATES.IN_AIR && Math.abs(mobileDirection.x) > 0.1) {
                    const rotationSpeed = this.currentCharacter?.rotationSpeed ?? 0.05;
                    this.targetRotationY += mobileDirection.x * rotationSpeed;
                }

                // For movement (Z-axis), use keyboard if available, otherwise use touch
                const hasKeyboardMovement = this.keysDown.has('w') || this.keysDown.has('s') ||
                    this.keysDown.has('arrowup') || this.keysDown.has('arrowdown');

                if (!hasKeyboardMovement && Math.abs(mobileDirection.z) > 0.1) {
                    // Use touch input for forward/backward movement when no keyboard movement
                    this.inputDirection.z = mobileDirection.z;
                } else if (!hasKeyboardMovement) {
                    // Reset Z movement when no input
                    this.inputDirection.z = 0;
                }

                // For actions (jump/boost), allow both keyboard and touch
                const mobileWantJump = MobileInputManager.getWantJump();
                const mobileWantBoost = MobileInputManager.getWantBoost();

                // Use keyboard input if available, otherwise use touch input
                if (!this.keysDown.has(' ') && mobileWantJump) {
                    this.wantJump = true;
                } else if (!this.keysDown.has(' ') && !mobileWantJump) {
                    this.wantJump = false;
                }
                if (!this.keysDown.has('shift') && mobileWantBoost) {
                    this.boostActive = true;
                } else if (!this.keysDown.has('shift') && !mobileWantBoost) {
                    this.boostActive = false;
                }
            } else {
                // Standard mobile behavior - replace keyboard input with touch input
                this.inputDirection.copyFrom(mobileDirection);

                // Only update player rotation based on X-axis (left/right) when not in air
                if (this.state !== CHARACTER_STATES.IN_AIR && Math.abs(mobileDirection.x) > 0.1) {
                    const rotationSpeed = this.currentCharacter?.rotationSpeed ?? 0.05;
                    this.targetRotationY += mobileDirection.x * rotationSpeed;
                }

                // Set forward/backward movement based on Y-axis
                if (Math.abs(mobileDirection.z) > 0.1) {
                    this.inputDirection.z = mobileDirection.z;
                } else {
                    this.inputDirection.z = 0;
                }

                // Clear X movement since we're using it for rotation
                this.inputDirection.x = 0;

                // Use mobile input for actions
                this.wantJump = MobileInputManager.getWantJump();
                this.boostActive = MobileInputManager.getWantBoost();
            }

            // Always update particle system to ensure proper on/off state
            this.updateParticleSystem();
        }
    }

    private toggleDebugDisplay(): void {
        this.displayCapsule.isVisible = !this.displayCapsule.isVisible;
    }

    private toggleHUD(): void {
        // This would need to be connected to HUDManager
    }

    private cycleHUDPosition(): void {
        // This would need to be connected to HUDManager
    }

    private resetCameraToDefaultOffset(): void {
        if (this.cameraController) {
            this.cameraController.resetCameraToDefaultOffset();
        }
    }

    private updateParticleSystem(): void {
        if (this.playerParticleSystem) {
            if (this.boostActive) {
                this.playerParticleSystem.start();
            } else {
                this.playerParticleSystem.stop();
            }
        }

        // Update thruster sound
        if (this.thrusterSound) {
            if (this.boostActive) {
                if (!this.thrusterSound.isPlaying) {
                    this.thrusterSound.play();
                }
            } else {
                if (this.thrusterSound.isPlaying) {
                    this.thrusterSound.stop();
                }
            }
        }
    }

    private updateCharacter = (): void => {
        // Update mobile input every frame
        this.updateMobileInput();

        // Apply invisibility effect if active
        this.updateInvisibilityEffect();

        this.updateRotation();
        this.updatePosition();
        this.updateAnimations();
    };

    private updateRotation(): void {
        // If camera is controlling rotation, don't interfere
        if (this.cameraController?.isRotatingCharacter === true) {
            // Update target rotation to match current rotation to prevent jerking
            this.targetRotationY = this.displayCapsule.rotation.y;
            return;
        }

        // Prevent rotation while in air for more realistic physics
        if (this.state === CHARACTER_STATES.IN_AIR) {
            return;
        }

        // Handle rotation based on input using active character's properties
        const rotationSpeed = this.currentCharacter?.rotationSpeed ?? 0.05;
        const rotationSmoothing = this.currentCharacter?.rotationSmoothing ?? 0.2;

        if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) {
            this.targetRotationY -= rotationSpeed;
        }
        if (this.keysDown.has('d') || this.keysDown.has('arrowright')) {
            this.targetRotationY += rotationSpeed;
        }

        this.displayCapsule.rotation.y += (this.targetRotationY - this.displayCapsule.rotation.y) * rotationSmoothing;
    }

    private updatePosition(): void {
        // Update display capsule position
        this.displayCapsule.position.copyFrom(this.characterController.getPosition());

        // Update player mesh position
        if (this.playerMesh) {
            this.playerMesh.position.copyFrom(this.characterController.getPosition());
            this.playerMesh.position.y += CONFIG.ANIMATION.PLAYER_Y_OFFSET;

            // Update player mesh rotation
            if (this.displayCapsule.rotationQuaternion) {
                this.playerMesh.rotationQuaternion ??= new BABYLON.Quaternion(0, 0, 0, 1);
                this.playerMesh.rotationQuaternion.copyFrom(this.displayCapsule.rotationQuaternion);
            } else {
                this.playerMesh.rotationQuaternion = null;
                this.playerMesh.rotation.copyFrom(this.displayCapsule.rotation);
            }
        }
    }

    private updateAnimations(): void {
        const isMoving = this.isAnyMovementKeyPressed();

        // Update animation controller with character state
        this.animationController.updateAnimation(isMoving, this.state);

        // Update blend weights if currently blending
        this.animationController.updateBlend();

        // Check for walk activation to trigger character rotation
        if (isMoving && this.cameraController) {
            this.cameraController.checkForWalkActivation();
        }
    }

    private isAnyMovementKeyPressed(): boolean {
        // Check keyboard input
        const keyboardMoving = INPUT_KEYS.FORWARD.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.BACKWARD.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.LEFT.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.RIGHT.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.STRAFE_LEFT.some(key => this.keysDown.has(key)) ||
            INPUT_KEYS.STRAFE_RIGHT.some(key => this.keysDown.has(key));

        // Check mobile input
        if (this.isMobileDevice) {
            const mobileMoving = MobileInputManager.isMobileActive() &&
                (MobileInputManager.getInputDirection().length() > 0.1);

            // For iPads with keyboards, either input can trigger movement
            if (this.isIPadWithKeyboard) {
                return keyboardMoving || mobileMoving;
            } else {
                // For pure mobile, only mobile input matters
                return mobileMoving;
            }
        }

        return keyboardMoving;
    }

    private updatePhysics = (): void => {
        if (!this.scene.deltaTime) return;

        const deltaTime = this.scene.deltaTime / 1000.0;
        if (deltaTime === 0) return;

        // Skip physics updates if paused
        if (this.physicsPaused) return;

        const down = BABYLON.Vector3.Down();
        const support = this.characterController.checkSupport(deltaTime, down);

        const characterOrientation = BABYLON.Quaternion.FromEulerAngles(0, this.displayCapsule.rotation.y, 0);
        const desiredVelocity = this.calculateDesiredVelocity(deltaTime, support, characterOrientation);

        this.characterController.setVelocity(desiredVelocity);
        this.characterController.integrate(deltaTime, support, CONFIG.PHYSICS.CHARACTER_GRAVITY);
    };

    private calculateDesiredVelocity(
        deltaTime: number,
        supportInfo: BABYLON.CharacterSurfaceInfo,
        characterOrientation: BABYLON.Quaternion
    ): BABYLON.Vector3 {
        const nextState = this.getNextState(supportInfo);
        if (nextState !== this.state) {
            this.state = nextState;
        }

        const upWorld = CONFIG.PHYSICS.CHARACTER_GRAVITY.normalizeToNew();
        upWorld.scaleInPlace(-1.0);

        const forwardLocalSpace = BABYLON.Vector3.Forward();
        const forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation);
        const currentVelocity = this.characterController.getVelocity();

        switch (this.state) {
            case CHARACTER_STATES.IN_AIR:
                return this.calculateAirVelocity(deltaTime, forwardWorld, upWorld, currentVelocity, characterOrientation);

            case CHARACTER_STATES.ON_GROUND:
                return this.calculateGroundVelocity(deltaTime, forwardWorld, upWorld, currentVelocity, supportInfo, characterOrientation);

            case CHARACTER_STATES.START_JUMP:
                return this.calculateJumpVelocity(currentVelocity, upWorld);

            default:
                return BABYLON.Vector3.Zero();
        }
    }

    private calculateAirVelocity(
        deltaTime: number,
        forwardWorld: BABYLON.Vector3,
        upWorld: BABYLON.Vector3,
        currentVelocity: BABYLON.Vector3,
        characterOrientation: BABYLON.Quaternion
    ): BABYLON.Vector3 {
        // Get character-specific physics attributes
        const character = this.currentCharacter;
        if (!character) {
            return currentVelocity;
        }

        const characterMass = character.mass;
        let outputVelocity = currentVelocity.clone();

        // If boost is active, allow input-based velocity modification while in air
        if (this.boostActive) {
            // Character-specific air speed using active character's properties
            const baseSpeed = character.speed.inAir * character.speed.boostMultiplier;
            const massAdjustedSpeed = baseSpeed / Math.sqrt(characterMass); // Additional mass adjustment for realistic physics
            const desiredVelocity = this.inputDirection.scale(massAdjustedSpeed).applyRotationQuaternion(characterOrientation);
            outputVelocity = this.characterController.calculateMovement(
                deltaTime, forwardWorld, upWorld, currentVelocity,
                BABYLON.Vector3.Zero(), desiredVelocity, upWorld
            );
        } else {
            // Maintain initial jump velocity while in air - no input-based velocity modification
            // Only apply gravity and minimal air resistance to preserve realistic physics
        }

        // Minimal air resistance - consistent for all characters regardless of mass
        // Air resistance should be minimal to allow all characters to move normally in air
        // Mass doesn't significantly affect air resistance in this physics model
        const airResistance = 0.98; // Minimal air resistance (loses 2% of velocity per frame)
        outputVelocity.scaleInPlace(airResistance);

        // Preserve vertical velocity component from jump
        outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
        outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));

        // Apply gravity
        outputVelocity.addInPlace(CONFIG.PHYSICS.CHARACTER_GRAVITY.scale(deltaTime));

        return outputVelocity;
    }

    private calculateGroundVelocity(
        deltaTime: number,
        forwardWorld: BABYLON.Vector3,
        upWorld: BABYLON.Vector3,
        currentVelocity: BABYLON.Vector3,
        supportInfo: BABYLON.CharacterSurfaceInfo,
        characterOrientation: BABYLON.Quaternion
    ): BABYLON.Vector3 {
        // Get character-specific physics attributes
        const character = this.currentCharacter;
        if (!character) {
            return currentVelocity;
        }

        const characterMass = character.mass;

        // Character-specific speed calculations using active character's properties
        const baseSpeed = this.boostActive ? character.speed.onGround * character.speed.boostMultiplier : character.speed.onGround;
        const massAdjustedSpeed = baseSpeed / Math.sqrt(characterMass); // Additional mass adjustment for realistic physics

        const desiredVelocity = this.inputDirection.scale(massAdjustedSpeed).applyRotationQuaternion(characterOrientation);
        const outputVelocity = this.characterController.calculateMovement(
            deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity,
            supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld
        );

        outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);

        // Character-specific friction (INVERTED LOGIC: friction = velocity loss per frame)
        // Use explicit friction if provided, otherwise use improved mass-adjusted formula
        let friction: number;
        if (character.friction !== undefined) {
            friction = character.friction;
        } else {
            // Improved mass-adjusted formula that caps friction at 0.99 and scales better
            const baseFriction = 0.95;
            friction = Math.min(baseFriction + (characterMass - 1.0) * 0.01, 0.99);
        }

        // Apply mass-based friction multiplier
        const effectiveFriction = Math.min(friction * (1.0 + (characterMass - 1.0) * 0.1), 0.99);

        // Apply friction based on input state
        const hasInput = this.inputDirection.length() >= 0.1;
        if (hasInput) {
            // With input: apply reduced friction (10% of friction value) to allow movement
            const movementFriction = effectiveFriction * 0.1;
            const velocityRetention = 1.0 - movementFriction;
            outputVelocity.scaleInPlace(velocityRetention);
        } else {
            // No input: apply full friction for strong stopping
            const velocityRetention = 1.0 - effectiveFriction;
            outputVelocity.scaleInPlace(velocityRetention);
        }

        const maxSpeed = massAdjustedSpeed * 2.0;

        // Clamp velocity to prevent excessive sliding
        const currentSpeed = outputVelocity.length();
        if (currentSpeed > maxSpeed) {
            outputVelocity.normalize().scaleInPlace(maxSpeed);
        }

        const inv1k = 1e-3;
        if (outputVelocity.dot(upWorld) > inv1k) {
            const velLen = outputVelocity.length();
            outputVelocity.normalizeFromLength(velLen);
            const horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
            const c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
            const newOutputVelocity = c.cross(upWorld);
            newOutputVelocity.scaleInPlace(horizLen);
            return newOutputVelocity;
        }

        outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
        return outputVelocity;
    }

    private calculateJumpVelocity(currentVelocity: BABYLON.Vector3, upWorld: BABYLON.Vector3): BABYLON.Vector3 {
        // Get character-specific physics attributes
        const character = this.currentCharacter;
        if (!character) {
            return currentVelocity;
        }

        const characterMass = character.mass;

        // Character-specific jump height using active character's properties
        let jumpHeight = this.boostActive ? 10.0 : character.jumpHeight; // Use character's jump height
        
        // Apply super jump effect if active
        if (this.superJumpActive) {
            jumpHeight *= 2.0; // Double jump height
        }
        const massAdjustedJumpHeight = jumpHeight / Math.sqrt(characterMass); // Additional mass adjustment for realistic physics

        // Calculate jump velocity using physics formula: v = sqrt(2 * g * h)
        const u = Math.sqrt(2 * CONFIG.PHYSICS.CHARACTER_GRAVITY.length() * massAdjustedJumpHeight);
        const curRelVel = currentVelocity.dot(upWorld);

        return currentVelocity.add(upWorld.scale(u - curRelVel));
    }

    private getNextState(supportInfo: BABYLON.CharacterSurfaceInfo): CharacterState {
        switch (this.state) {
            case CHARACTER_STATES.IN_AIR:
                return supportInfo.supportedState === BABYLON.CharacterSupportedState.SUPPORTED
                    ? CHARACTER_STATES.ON_GROUND
                    : CHARACTER_STATES.IN_AIR;

            case CHARACTER_STATES.ON_GROUND:
                if (supportInfo.supportedState !== BABYLON.CharacterSupportedState.SUPPORTED) {
                    return CHARACTER_STATES.IN_AIR;
                }
                return this.wantJump ? CHARACTER_STATES.START_JUMP : CHARACTER_STATES.ON_GROUND;

            case CHARACTER_STATES.START_JUMP:
                return CHARACTER_STATES.IN_AIR;

            default:
                return CHARACTER_STATES.IN_AIR;
        }
    }

    public setPlayerMesh(mesh: BABYLON.AbstractMesh): void {
        this.playerMesh = mesh;
        mesh.scaling.setAll(CONFIG.ANIMATION.PLAYER_SCALE);
        
        // Hide display capsule when real character model is loaded
        if (mesh !== this.displayCapsule) {
            this.displayCapsule.isVisible = false;
        }
    }

    public getPlayerMesh(): BABYLON.AbstractMesh | null {
        return this.playerMesh;
    }

    public getPhysicsCharacterController(): BABYLON.PhysicsCharacterController {
        return this.characterController;
    }

    public getCurrentCharacter(): Character | null {
        return this.currentCharacter;
    }

    public updateCharacterPhysics(character: Character, spawnPosition: BABYLON.Vector3): void {
        // Update character position to spawn point
        this.characterController.setPosition(spawnPosition);

        // Store current character for physics calculations
        this.currentCharacter = character;

        // Update character-specific physics attributes
        // Note: PhysicsCharacterController doesn't allow runtime updates of capsule dimensions
        // The display capsule can be updated for visual feedback
        this.displayCapsule.scaling.setAll(1); // Reset scaling
        this.displayCapsule.scaling.y = character.height / 1.8; // Scale height
        this.displayCapsule.scaling.x = character.radius / 0.6; // Scale radius
        this.displayCapsule.scaling.z = character.radius / 0.6; // Scale radius

        // Reset physics state for new character
        this.characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
        this.inputDirection.setAll(0);
        this.wantJump = false;
        this.boostActive = false;
        this.state = CHARACTER_STATES.IN_AIR;
    }

    public getDisplayCapsule(): BABYLON.AbstractMesh {
        return this.displayCapsule;
    }

    public setCameraController(cameraController: SmoothFollowCameraController): void {
        this.cameraController = cameraController;
    }

    public setPlayerParticleSystem(particleSystem: BABYLON.IParticleSystem | null): void {
        this.playerParticleSystem = particleSystem;
        // Start with particle system stopped if it exists
        if (particleSystem != null) {
            particleSystem.stop();
        }
    }

    public getPlayerParticleSystem(): BABYLON.IParticleSystem | null {
        return this.playerParticleSystem;
    }

    public setThrusterSound(sound: BABYLON.Sound): void {
        this.thrusterSound = sound;
        // Start with sound stopped
        sound.stop();
    }

    /**
     * Gets whether the character is currently moving
     * @returns True if character is moving, false otherwise
     */
    public isMoving(): boolean {
        return this.isAnyMovementKeyPressed();
    }

    /**
     * Gets whether the character is currently boosting
     * @returns True if character is boosting, false otherwise
     */
    public isBoosting(): boolean {
        return this.boostActive;
    }

    /**
     * Applies a super jump effect temporarily
     */
    public applySuperJumpEffect(): void {
        if (!this.currentCharacter) return;
        
        // Activate super jump effect
        this.superJumpActive = true;
        
        // Reset after 5 seconds using scene observable
        let frameCount = 0;
        const maxFrames = 300; // 5 seconds at 60fps
        
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            frameCount++;
            if (frameCount >= maxFrames) {
                this.superJumpActive = false;
                this.scene.onBeforeRenderObservable.remove(observer);
            }
        });
    }

    /**
     * Applies an invisibility effect temporarily
     */
    public applyInvisibilityEffect(): void {
        if (!this.playerMesh) return;
        
        // Activate invisibility effect
        this.invisibilityActive = true;
        
        // Reset after 10 seconds using scene observable
        let frameCount = 0;
        const maxFrames = 600; // 10 seconds at 60fps
        
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            frameCount++;
            if (frameCount >= maxFrames) {
                this.invisibilityActive = false;
                this.scene.onBeforeRenderObservable.remove(observer);
            }
        });
    }

    /**
     * Updates the invisibility effect
     */
    private updateInvisibilityEffect(): void {
        if (!this.playerMesh) return;
        
        // Apply invisibility by adjusting material alpha on main mesh AND all child meshes
        const allMeshes = [this.playerMesh, ...this.playerMesh.getChildMeshes()];
        allMeshes.forEach(mesh => {
            if (mesh.material) {
                if (this.invisibilityActive) {
                    (mesh.material as any).alpha = 0.25;
                } else {
                    (mesh.material as any).alpha = 1.0;
                }
            }
        });
    }

    /**
     * Gets the current character state
     * @returns The current character state
     */
    public getState(): CharacterState {
        return this.state;
    }

    /**
     * Gets whether the character is on the ground
     * @returns True if character is on ground, false otherwise
     */
    public isOnGround(): boolean {
        return this.state === CHARACTER_STATES.ON_GROUND;
    }

    /**
     * Gets the physics body of the character controller
     * @returns The physics body or null if not available
     */
    public getPhysicsBody(): null {
        // PhysicsCharacterController doesn't expose its physics body directly
        // We'll use the display capsule for collision detection instead
        return null;
    }

    /**
     * Gets the current velocity of the character
     * @returns The current velocity vector
     */
    public getVelocity(): BABYLON.Vector3 {
        return this.characterController.getVelocity();
    }

    public getPosition(): BABYLON.Vector3 {
        return this.characterController.getPosition();
    }

    public setPosition(position: BABYLON.Vector3): void {
        this.characterController.setPosition(position);
    }

    public setRotation(rotation: BABYLON.Vector3): void {
        this.targetRotationY = rotation.y;
        this.displayCapsule.rotation.y = rotation.y;

        // Update player mesh rotation to match
        if (this.playerMesh) {
            if (this.displayCapsule.rotationQuaternion) {
                this.playerMesh.rotationQuaternion ??= new BABYLON.Quaternion(0, 0, 0, 1);
                this.playerMesh.rotationQuaternion.copyFrom(this.displayCapsule.rotationQuaternion);
            } else {
                this.playerMesh.rotationQuaternion = null;
                this.playerMesh.rotation.copyFrom(this.displayCapsule.rotation);
            }
        }
    }

    public setVelocity(velocity: BABYLON.Vector3): void {
        this.characterController.setVelocity(velocity);
    }

    public resetInputDirection(): void {
        this.inputDirection.setAll(0);
    }

    public getCurrentState(): string {
        // Return current character state based on movement and physics
        const velocity = this.characterController.getVelocity();
        const isMoving = velocity.length() > 0.1;
        const isJumping = velocity.y > 0.1;
        const isFalling = velocity.y < -0.1;
        const isRunning = isMoving && this.inputDirection.length() > 0.5;

        if (isJumping) {
            return 'Jumping';
        } else if (isFalling) {
            return 'Falling';
        } else if (isMoving) {
            return isRunning ? 'Running' : 'Walking';
        } else {
            return 'Idle';
        }
    }

    public getBoostStatus(): string {
        if (this.superJumpActive) {
            return 'Super Jump Active';
        }
        if (this.invisibilityActive) {
            return 'Invisibility Active';
        }
        return 'Ready';
    }

    /**
     * Pauses physics updates for the character
     */
    public pausePhysics(): void {
        this.physicsPaused = true;
        // Set velocity to zero to stop movement
        this.characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
    }

    /**
     * Resumes physics updates for the character
     */
    public resumePhysics(): void {
        this.physicsPaused = false;
    }

    /**
     * Checks if physics is currently paused
     */
    public isPhysicsPaused(): boolean {
        return this.physicsPaused;
    }

    /**
     * Resets the character to the starting position
     */
    public resetToStartPosition(): void {
        // Use environment spawn point instead of character start position
        const environment = ASSETS.ENVIRONMENTS.find(env => env.name === "Level Test");
        const spawnPoint = environment?.spawnPoint ?? new BABYLON.Vector3(0, 0, 0);
        this.characterController.setPosition(spawnPoint);
        this.characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
        this.inputDirection.setAll(0);
        this.wantJump = false;
        this.boostActive = false;
        this.state = CHARACTER_STATES.IN_AIR;
    }

    public dispose(): void {
        // Clean up keyboard detection timeout
        if (this.keyboardDetectionTimeout) {
            clearTimeout(this.keyboardDetectionTimeout);
            this.keyboardDetectionTimeout = null;
        }
        
        // Dispose mobile input manager
        MobileInputManager.dispose();
    }
}
