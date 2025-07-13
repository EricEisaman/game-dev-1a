// ============================================================================
// BABYLON.JS PLAYGROUND - CHARACTER CONTROLLER WITH PHYSICS
// ============================================================================

// Configuration Constants
const CONFIG = {
    // Character Settings
    CHARACTER: {
        HEIGHT: 1.8,
        RADIUS: 0.6,
        START_POSITION: new BABYLON.Vector3(3, 0.3, -8),
        SPEED: {
            IN_AIR: 8.0,
            ON_GROUND: 10.0
        },
        JUMP_HEIGHT: 2.0,
        ROTATION_SPEED: BABYLON.Tools.ToRadians(3),
        ROTATION_SMOOTHING: 0.2
    },
    
    // Camera Settings
    CAMERA: {
        START_POSITION: new BABYLON.Vector3(0, 5, -10),
        OFFSET: new BABYLON.Vector3(0, 1.2, -3),
        DRAG_SENSITIVITY: 0.02,
        ZOOM_MIN: -15,
        ZOOM_MAX: -2,
        FOLLOW_SMOOTHING: 0.1
    },
    
    // Physics Settings
    PHYSICS: {
        GRAVITY: new BABYLON.Vector3(0, -9.8, 0),
        CHARACTER_GRAVITY: new BABYLON.Vector3(0, -18, 0)
    },
    
    // Animation Settings
    ANIMATION: {
        PLAYER_SCALE: 0.7,
        PLAYER_Y_OFFSET: -0.9
    },
    
    // Debug Settings
    DEBUG: {
        CAPSULE_VISIBLE: false
    },
    
    // Sky Settings
    SKY: {
        TEXTURE_URL: "https://raw.githubusercontent.com/EricEisaman/game-dev-1a/refs/heads/main/assets/cartoon-river-with-orange-sky.jpg",
        ROTATION_Y: 0,
        BLUR: 0.3,
        TYPE: "SPHERE" // "BOX" or "SPHERE"
    }
} as const;

// Asset URLs
const ASSETS = {
    CHARACTER_MODEL: "https://cdn.glitch.global/eb9efb0a-b839-4ec6-9701-f10ab7097b32/among_us_anims.glb?v=1716732954106",
    LEVEL_MODEL: "https://raw.githubusercontent.com/CedricGuillemet/dump/master/CharController/levelTest.glb",
    LIGHTMAP_TEXTURE: "https://raw.githubusercontent.com/CedricGuillemet/dump/master/CharController/lightmap.jpg"
} as const;

// Input Mapping
const INPUT_KEYS = {
    FORWARD: ['w', 'arrowup'],
    BACKWARD: ['s', 'arrowdown'],
    LEFT: ['a', 'arrowleft'],
    RIGHT: ['d', 'arrowright'],
    STRAFE_LEFT: ['q'],
    STRAFE_RIGHT: ['e'],
    JUMP: [' '],
    DEBUG: ['0']
} as const;

// Character States
const CHARACTER_STATES = {
    IN_AIR: "IN_AIR",
    ON_GROUND: "ON_GROUND",
    START_JUMP: "START_JUMP"
} as const;

type CharacterState = typeof CHARACTER_STATES[keyof typeof CHARACTER_STATES];

// Animation Groups
const playerAnimations: Record<string, BABYLON.AnimationGroup | undefined> = {};

// ============================================================================
// SKY MANAGER
// ============================================================================

class SkyManager {
    private static sky: BABYLON.Mesh | null = null;
    private static skyTexture: BABYLON.Texture | null = null;
    
    /**
     * Creates and applies a sky to the scene
     * @param scene The Babylon.js scene
     * @param textureUrl URL of the sky texture
     * @param rotationY Y-axis rotation in radians
     * @param blur Blur amount (0-1)
     * @param type Type of sky ("BOX" or "SPHERE")
     * @returns The created sky mesh
     */
    public static createSky(
        scene: BABYLON.Scene, 
        textureUrl: string = CONFIG.SKY.TEXTURE_URL,
        rotationY: number = CONFIG.SKY.ROTATION_Y,
        blur: number = CONFIG.SKY.BLUR,
        type: string = CONFIG.SKY.TYPE
    ): BABYLON.Mesh {
        // Remove existing sky if present
        this.removeSky(scene);
        
        // Create sky texture
        this.skyTexture = new BABYLON.Texture(textureUrl, scene);
        
        // Apply blur if specified
        if (blur > 0) {
            this.skyTexture.level = blur;
        }
        
        // Create sky based on type
        if (type.toUpperCase() === "SPHERE") {
            this.createSkySphere(scene, rotationY);
        } else {
            this.createSkyBox(scene, rotationY);
        }
        
        return this.sky!;
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
        this.skyTexture!.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        
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
    public static removeSky(scene: BABYLON.Scene): void {
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
}

// ============================================================================
// SMOOTH FOLLOW CAMERA CONTROLLER
// ============================================================================

class SmoothFollowCameraController {
    private readonly scene: BABYLON.Scene;
    private readonly camera: BABYLON.TargetCamera;
    private readonly target: BABYLON.Mesh;
    private readonly offset: BABYLON.Vector3;
    private readonly dragSensitivity: number;
    
    public isDragging = false;
    public dragDeltaX = 0;
    public dragDeltaZ = 0;
    
    private pointerObserver: BABYLON.Observer<BABYLON.PointerInfo>;
    private beforeRenderObserver: BABYLON.Observer<BABYLON.Scene>;
    private lastPointerX = 0;
    private lastPointerY = 0;
    private isTwoFingerPanning = false;
    private lastPanPositions: [number, number, number, number] | null = null;
    private canvas: HTMLCanvasElement | null = null;
    
    // Character rotation lerp variables
    public isRotatingCharacter = false;
    private characterRotationStartY = 0;
    private characterRotationTargetY = 0;
    private characterRotationStartTime = 0;
    private characterRotationDuration = 0.5; // 0.5 seconds
    private shouldStartRotationOnWalk = false;

    constructor(
        scene: BABYLON.Scene,
        camera: BABYLON.TargetCamera,
        target: BABYLON.Mesh,
        offset: BABYLON.Vector3 = CONFIG.CAMERA.OFFSET,
        dragSensitivity: number = CONFIG.CAMERA.DRAG_SENSITIVITY
    ) {
        this.scene = scene;
        this.camera = camera;
        this.target = target;
        this.offset = offset.clone();
        this.dragSensitivity = dragSensitivity;
        
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.pointerObserver = this.scene.onPointerObservable.add(this.handlePointer);
        this.beforeRenderObserver = this.scene.onBeforeRenderObservable.add(this.updateCamera);
        
        this.canvas = this.scene.getEngine().getRenderingCanvas();
        if (this.canvas) {
            this.canvas.addEventListener("touchstart", this.handleTouchStart, { passive: false });
            this.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });
            this.canvas.addEventListener("touchend", this.handleTouchEnd, { passive: false });
            this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
        }
    }

    private handlePointer = (pointerInfo: BABYLON.PointerInfo): void => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                this.isDragging = true;
                this.lastPointerX = pointerInfo.event.clientX;
                this.lastPointerY = pointerInfo.event.clientY;
                this.dragDeltaX = 0;
                this.dragDeltaZ = 0;
                break;
                
            case BABYLON.PointerEventTypes.POINTERUP:
                this.isDragging = false;
                this.dragDeltaX = 0;
                this.dragDeltaZ = 0;
                // Mark that we should start rotation lerp on first walk activation
                this.shouldStartRotationOnWalk = true;
                break;
                
            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (this.isDragging) {
                    this.handlePointerMove(pointerInfo);
                }
                break;
        }
    };

    private handlePointerMove(pointerInfo: BABYLON.PointerInfo): void {
        const deltaX = pointerInfo.event.movementX || (pointerInfo.event.clientX - this.lastPointerX);
        const deltaY = pointerInfo.event.movementY || (pointerInfo.event.clientY - this.lastPointerY);

        this.lastPointerX = pointerInfo.event.clientX;
        this.lastPointerY = pointerInfo.event.clientY;

        this.dragDeltaX = -deltaX * this.dragSensitivity;
        this.dragDeltaZ = deltaY * this.dragSensitivity;

        this.updateCameraPosition();
    }

    private updateCameraPosition(): void {
        const right = this.camera.getDirection(BABYLON.Vector3.Right());
        this.camera.position.addInPlace(right.scale(this.dragDeltaX));
        
        const up = this.camera.getDirection(BABYLON.Vector3.Up());
        this.camera.position.addInPlace(up.scale(this.dragDeltaZ));
        
        this.camera.setTarget(this.target.position);
    }

    private handleWheel = (e: WheelEvent): void => {
        e.preventDefault();
        this.offset.z += e.deltaX * this.dragSensitivity * 6;
        this.offset.z = BABYLON.Scalar.Clamp(
            this.offset.z, 
            CONFIG.CAMERA.ZOOM_MIN, 
            CONFIG.CAMERA.ZOOM_MAX
        );
    };

    private handleTouchStart = (e: TouchEvent): void => {
        if (e.touches.length === 2) {
            this.isTwoFingerPanning = true;
            this.lastPanPositions = [
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            ] as [number, number, number, number];
        }
    };

    private handleTouchMove = (e: TouchEvent): void => {
        if (!this.isTwoFingerPanning || e.touches.length !== 2 || !this.lastPanPositions) {
            return;
        }

        e.preventDefault();
        this.handleTwoFingerPan(e);
    };

    private handleTwoFingerPan(e: TouchEvent): void {
        const currentPositions = [
            e.touches[0].clientX, e.touches[0].clientY,
            e.touches[1].clientX, e.touches[1].clientY
        ] as [number, number, number, number];

        const lastMidX = (this.lastPanPositions![0] + this.lastPanPositions![2]) / 2;
        const lastMidY = (this.lastPanPositions![1] + this.lastPanPositions![3]) / 2;
        const currMidX = (currentPositions[0] + currentPositions[2]) / 2;
        const currMidY = (currentPositions[1] + currentPositions[3]) / 2;

        const deltaX = currMidX - lastMidX;
        const deltaY = currMidY - lastMidY;

        const right = this.camera.getDirection(BABYLON.Vector3.Right());
        const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
        
        this.offset.addInPlace(right.scale(-deltaX * this.dragSensitivity * 4));
        this.offset.addInPlace(forward.scale(deltaY * this.dragSensitivity * 4));

        this.lastPanPositions = currentPositions;
    }

    private handleTouchEnd = (e: TouchEvent): void => {
        if (e.touches.length < 2) {
            this.isTwoFingerPanning = false;
            this.lastPanPositions = null;
        }
    };

    private updateCamera = (): void => {
        if (!this.isDragging) {
            // Only smooth follow if we're not waiting for walk activation
            if (!this.shouldStartRotationOnWalk) {
                this.smoothFollowTarget();
            }
        } else {
            this.updateOffsetY();
        }
        
        // Update character rotation lerp
        this.updateCharacterRotationLerp();
    };

    private smoothFollowTarget(): void {
        // If character is rotating, pause the smooth follow camera
        if (this.isRotatingCharacter) {
            return;
        }
        
        const yRot = BABYLON.Quaternion.FromEulerAngles(0, this.target.rotation.y, 0);
        const rotatedOffset = this.offset.rotateByQuaternionToRef(yRot, new BABYLON.Vector3());
        const desiredPos = this.target.position.add(rotatedOffset);
        
        // Calculate dynamic smoothing based on offset.z
        // Closer camera (smaller offset.z) = more responsive (higher smoothing value)
        // Farther camera (larger offset.z) = more relaxed (lower smoothing value)
        const normalizedOffset = (this.offset.z - CONFIG.CAMERA.ZOOM_MIN) / (CONFIG.CAMERA.ZOOM_MAX - CONFIG.CAMERA.ZOOM_MIN);
        const dynamicSmoothing = BABYLON.Scalar.Lerp(0.05, 0.25, normalizedOffset);
        
        BABYLON.Vector3.LerpToRef(
            this.camera.position, 
            desiredPos, 
            dynamicSmoothing, 
            this.camera.position
        );
        
        this.camera.lockedTarget = this.target;
    }

    private updateOffsetY(): void {
        this.offset.y = this.camera.position.y - this.target.position.y;
    }

    private startCharacterRotationLerp(): void {
        // Calculate direction from character to camera
        const toCamera = this.camera.position.subtract(this.target.position).normalize();
        
        // Calculate the desired Y rotation (yaw) to face AWAY from the camera
        const targetYaw = Math.atan2(-toCamera.x, -toCamera.z);
        
        // Calculate the shortest rotation path
        const currentYaw = this.target.rotation.y;
        let rotationDifference = targetYaw - currentYaw;
        
        // Normalize to shortest path (-π to π)
        while (rotationDifference > Math.PI) rotationDifference -= 2 * Math.PI;
        while (rotationDifference < -Math.PI) rotationDifference += 2 * Math.PI;
        
        // Start the lerp with the shortest path
        this.isRotatingCharacter = true;
        this.characterRotationStartY = currentYaw;
        this.characterRotationTargetY = currentYaw + rotationDifference;
        this.characterRotationStartTime = Date.now();
    }

    private updateCharacterRotationLerp(): void {
        if (!this.isRotatingCharacter) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.characterRotationStartTime) / 1000; // Convert to seconds
        const progress = Math.min(elapsed / this.characterRotationDuration, 1.0);
        
        // Use smooth easing function
        const easedProgress = this.easeInOutCubic(progress);
        
        // Lerp the rotation
        const currentRotation = BABYLON.Scalar.Lerp(
            this.characterRotationStartY, 
            this.characterRotationTargetY, 
            easedProgress
        );
        
        this.target.rotation.y = currentRotation;
        
        // Update quaternion if needed
        if (this.target.rotationQuaternion) {
            BABYLON.Quaternion.FromEulerAnglesToRef(
                this.target.rotation.x,
                currentRotation,
                this.target.rotation.z,
                this.target.rotationQuaternion
            );
        }
        
        // Stop lerping when complete
        if (progress >= 1.0) {
            this.isRotatingCharacter = false;
        }
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public checkForWalkActivation(): void {
        if (this.shouldStartRotationOnWalk) {
            this.shouldStartRotationOnWalk = false;
            this.startCharacterRotationLerp();
        }
    }

    public dispose(): void {
        this.scene.onPointerObservable.remove(this.pointerObserver);
        this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
        
        if (this.canvas) {
            this.canvas.removeEventListener("touchstart", this.handleTouchStart);
            this.canvas.removeEventListener("touchmove", this.handleTouchMove);
            this.canvas.removeEventListener("touchend", this.handleTouchEnd);
            this.canvas.removeEventListener("wheel", this.handleWheel);
        }
    }
}

// ============================================================================
// CHARACTER CONTROLLER
// ============================================================================

class CharacterController {
    private readonly scene: BABYLON.Scene;
    private readonly characterController: BABYLON.PhysicsCharacterController;
    private readonly displayCapsule: BABYLON.Mesh;
    private playerMesh: BABYLON.AbstractMesh;
    
    private state: CharacterState = CHARACTER_STATES.IN_AIR;
    private wantJump = false;
    private inputDirection = new BABYLON.Vector3(0, 0, 0);
    private targetRotationY = 0;
    private keysDown = new Set<string>();
    private cameraController: SmoothFollowCameraController | null = null;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        
        // Create character physics controller
        this.characterController = new BABYLON.PhysicsCharacterController(
            CONFIG.CHARACTER.START_POSITION,
            { 
                capsuleHeight: CONFIG.CHARACTER.HEIGHT, 
                capsuleRadius: CONFIG.CHARACTER.RADIUS 
            },
            scene
        );

        // Create display capsule for debug
        this.displayCapsule = BABYLON.MeshBuilder.CreateCapsule(
            "CharacterDisplay", 
            { 
                height: CONFIG.CHARACTER.HEIGHT, 
                radius: CONFIG.CHARACTER.RADIUS 
            }, 
            scene
        );
        this.displayCapsule.isVisible = CONFIG.DEBUG.CAPSULE_VISIBLE;
        
        // Initialize player mesh (will be replaced by loaded model)
        this.playerMesh = this.displayCapsule;
        
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.scene.onKeyboardObservable.add(this.handleKeyboard);
        this.scene.onBeforeRenderObservable.add(this.updateCharacter);
        this.scene.onAfterPhysicsObservable.add(this.updatePhysics);
    }

    private handleKeyboard = (kbInfo: any): void => {
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
        } else if (INPUT_KEYS.DEBUG.includes(key as any)) {
            this.toggleDebugDisplay();
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
    }

    private toggleDebugDisplay(): void {
        this.displayCapsule.isVisible = !this.displayCapsule.isVisible;
    }

    private updateCharacter = (): void => {
        this.updateRotation();
        this.updatePosition();
        this.updateAnimations();
    };

    private updateRotation(): void {
        // If camera is controlling rotation, don't interfere
        if (this.cameraController && this.cameraController.isRotatingCharacter) {
            // Update target rotation to match current rotation to prevent jerking
            this.targetRotationY = this.displayCapsule.rotation.y;
            return;
        }
        
        // Handle rotation based on input
        if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) {
            this.targetRotationY -= CONFIG.CHARACTER.ROTATION_SPEED;
        }
        if (this.keysDown.has('d') || this.keysDown.has('arrowright')) {
            this.targetRotationY += CONFIG.CHARACTER.ROTATION_SPEED;
        }
        
        this.displayCapsule.rotation.y += (this.targetRotationY - this.displayCapsule.rotation.y) * CONFIG.CHARACTER.ROTATION_SMOOTHING;
    }

    private updatePosition(): void {
        // Update display capsule position
        this.displayCapsule.position.copyFrom(this.characterController.getPosition());
        
        // Update player mesh position
        this.playerMesh.position.copyFrom(this.characterController.getPosition());
        this.playerMesh.position.y += CONFIG.ANIMATION.PLAYER_Y_OFFSET;
        
        // Update player mesh rotation
        if (this.displayCapsule.rotationQuaternion) {
            if (!this.playerMesh.rotationQuaternion) {
                this.playerMesh.rotationQuaternion = new BABYLON.Quaternion();
            }
            this.playerMesh.rotationQuaternion.copyFrom(this.displayCapsule.rotationQuaternion);
        } else {
            this.playerMesh.rotationQuaternion = null;
            this.playerMesh.rotation.copyFrom(this.displayCapsule.rotation);
        }
    }

    private updateAnimations(): void {
        if (!playerAnimations.walk || !playerAnimations.idle) return;

        const isMoving = this.isAnyMovementKeyPressed();
        
        if (isMoving) {
            if (!playerAnimations.walk.isPlaying) {
                playerAnimations.idle.stop();
                playerAnimations.walk.start(true);
                // Check for walk activation to trigger character rotation
                if (this.cameraController) {
                    this.cameraController.checkForWalkActivation();
                }
            }
        } else {
            if (!playerAnimations.idle.isPlaying) {
                playerAnimations.walk.stop();
                playerAnimations.idle.start(true);
            }
        }
    }

    private isAnyMovementKeyPressed(): boolean {
        return INPUT_KEYS.FORWARD.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.BACKWARD.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.LEFT.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.RIGHT.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.STRAFE_LEFT.some(key => this.keysDown.has(key)) ||
               INPUT_KEYS.STRAFE_RIGHT.some(key => this.keysDown.has(key));
    }

    private updatePhysics = (): void => {
        if (!this.scene.deltaTime) return;
        
        const deltaTime = this.scene.deltaTime / 1000.0;
        if (deltaTime === 0) return;

        const down = new BABYLON.Vector3(0, -1, 0);
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
        
        const forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
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
        const desiredVelocity = this.inputDirection.scale(CONFIG.CHARACTER.SPEED.IN_AIR).applyRotationQuaternion(characterOrientation);
        const outputVelocity = this.characterController.calculateMovement(
            deltaTime, forwardWorld, upWorld, currentVelocity, 
            BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld
        );
        
        outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
        outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
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
        const desiredVelocity = this.inputDirection.scale(CONFIG.CHARACTER.SPEED.ON_GROUND).applyRotationQuaternion(characterOrientation);
        const outputVelocity = this.characterController.calculateMovement(
            deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity,
            supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld
        );
        
        outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
        
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
        const u = Math.sqrt(2 * CONFIG.PHYSICS.CHARACTER_GRAVITY.length() * CONFIG.CHARACTER.JUMP_HEIGHT);
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
    }

    public getDisplayCapsule(): BABYLON.Mesh {
        return this.displayCapsule;
    }

    public setCameraController(cameraController: SmoothFollowCameraController): void {
        this.cameraController = cameraController;
    }
}

// ============================================================================
// SCENE MANAGER
// ============================================================================

class SceneManager {
    private readonly scene: BABYLON.Scene;
    private readonly camera: BABYLON.TargetCamera;
    private characterController: CharacterController | null = null;
    private smoothFollowController: SmoothFollowCameraController | null = null;

    constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
        this.scene = new BABYLON.Scene(engine);
        this.camera = new BABYLON.TargetCamera("camera1", CONFIG.CAMERA.START_POSITION, this.scene);
        
        this.initializeScene();
    }

    private initializeScene(): void {
        this.setupLighting();
        this.setupPhysics();
        this.setupSky();
        this.loadLevel();
    }

    private setupLighting(): void {
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
    }

    private setupPhysics(): void {
        const hk = new BABYLON.HavokPlugin(false);
        this.scene.enablePhysics(CONFIG.PHYSICS.GRAVITY, hk);
    }

    private setupSky(): void {
        try {
            SkyManager.createSky(this.scene);
        } catch (error) {
            console.warn("Failed to create sky:", error);
        }
    }

    private loadLevel(): void {
        BABYLON.ImportMeshAsync(ASSETS.LEVEL_MODEL, this.scene)
            .then(() => {
                this.setupLevelPhysics();
                this.setupCharacter();
                this.loadCharacterModel();
            })
            .catch(error => {
                console.error("Failed to load level:", error);
            });
    }

    private setupLevelPhysics(): void {
        this.setupLightmappedMeshes();
        this.setupPhysicsObjects();
        this.setupJoints();
    }

    private setupLightmappedMeshes(): void {
        const lightmap = new BABYLON.Texture(ASSETS.LIGHTMAP_TEXTURE);
        const lightmappedMeshes = ["level_primitive0", "level_primitive1", "level_primitive2"];
        
        lightmappedMeshes.forEach(meshName => {
            const mesh = this.scene.getMeshByName(meshName);
            if (!mesh) return;
            
            new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH);
            mesh.isPickable = false;
            
            if (mesh.material instanceof BABYLON.StandardMaterial || mesh.material instanceof BABYLON.PBRMaterial) {
                mesh.material.lightmapTexture = lightmap;
                mesh.material.useLightmapAsShadowmap = true;
                (mesh.material.lightmapTexture as BABYLON.Texture).uAng = Math.PI;
                (mesh.material.lightmapTexture as BABYLON.Texture).level = 1.6;
                (mesh.material.lightmapTexture as BABYLON.Texture).coordinatesIndex = 1;
            }
            
            mesh.freezeWorldMatrix();
            mesh.doNotSyncBoundingInfo = true;
        });
    }

    private setupPhysicsObjects(): void {
        const cubes = ["Cube", "Cube.001", "Cube.002", "Cube.003", "Cube.004", "Cube.005"];
        cubes.forEach(meshName => {
            const mesh = this.scene.getMeshByName(meshName);
            if (mesh) {
                new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
            }
        });
        
        const planeMesh = this.scene.getMeshByName("Cube.006");
        if (planeMesh) {
            planeMesh.scaling.set(0.03, 3, 1);
            new BABYLON.PhysicsAggregate(planeMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
        }
    }

    private setupJoints(): void {
        const fixedMass = new BABYLON.PhysicsAggregate(
            this.scene.getMeshByName("Cube.007"), 
            BABYLON.PhysicsShapeType.BOX, 
            { mass: 0 }
        );
        
        const planeMesh = this.scene.getMeshByName("Cube.006");
        if (planeMesh) {
            const plane = new BABYLON.PhysicsAggregate(planeMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
            
            const joint = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0.75, 0, 0),
                new BABYLON.Vector3(-0.25, 0, 0),
                new BABYLON.Vector3(0, 0, -1),
                new BABYLON.Vector3(0, 0, 1),
                this.scene
            );
            
            fixedMass.body.addConstraint(plane.body, joint);
        }
    }

    private setupCharacter(): void {
        this.characterController = new CharacterController(this.scene);
        
        if (this.characterController) {
            this.smoothFollowController = new SmoothFollowCameraController(
                this.scene,
                this.camera,
                this.characterController.getDisplayCapsule()
            );
            
            // Connect the character controller to the camera controller
            this.characterController.setCameraController(this.smoothFollowController);
        }
    }

    private loadCharacterModel(): void {
        BABYLON.ImportMeshAsync(ASSETS.CHARACTER_MODEL, this.scene)
            .then(result => {
                if (this.characterController && result.meshes[0]) {
                    this.characterController.setPlayerMesh(result.meshes[0]);
                    
                    // Setup animations
                    playerAnimations.walk = result.animationGroups.find(a => a.name === 'walk');
                    playerAnimations.idle = result.animationGroups.find(a => a.name === 'idle');
                    
                    // Stop animations initially
                    playerAnimations.walk?.stop();
                    playerAnimations.idle?.stop();
                }
            })
            .catch(error => {
                console.error("Failed to load character model:", error);
            });
    }

    public getScene(): BABYLON.Scene {
        return this.scene;
    }
}

// ============================================================================
// MAIN PLAYGROUND CLASS
// ============================================================================

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        const sceneManager = new SceneManager(engine, canvas);
        return sceneManager.getScene();
    }
}
