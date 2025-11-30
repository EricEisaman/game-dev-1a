// ============================================================================
// SMOOTH FOLLOW CAMERA CONTROLLER
// ============================================================================


import { CONFIG } from '../config/game-config';

export class SmoothFollowCameraController {
    private readonly scene: BABYLON.Scene;
    private readonly camera: BABYLON.TargetCamera;
    private readonly target: BABYLON.AbstractMesh;
    private offset: BABYLON.Vector3;
    private readonly dragSensitivity: number;

    public isDragging = false;
    public dragDeltaX = 0;
    public dragDeltaZ = 0;

    private pointerObserver: BABYLON.Observer<BABYLON.PointerInfo> | null = null;
    private beforeRenderObserver: BABYLON.Observer<BABYLON.Scene> | null = null;
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
        target: BABYLON.AbstractMesh,
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
        this.offset.z = BABYLON.Clamp(
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
            ] as const;
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
        const currentPositions: [number, number, number, number] = [
            e.touches[0].clientX, e.touches[0].clientY,
            e.touches[1].clientX, e.touches[1].clientY
        ];

        if (!this.lastPanPositions) return;
        const lastMidX = (this.lastPanPositions[0] + this.lastPanPositions[2]) / 2;
        const lastMidY = (this.lastPanPositions[1] + this.lastPanPositions[3]) / 2;
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
        const rotatedOffset = this.offset.rotateByQuaternionToRef(yRot, BABYLON.Vector3.Zero());
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

        this.camera.lockedTarget = this.target.position;
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

    /**
     * Force activate smooth following, useful after environment transitions
     */
    public forceActivateSmoothFollow(): void {
        this.shouldStartRotationOnWalk = false;
        this.isRotatingCharacter = false;
        this.isDragging = false;
        this.dragDeltaX = 0;
        this.dragDeltaZ = 0;
    }

    /**
     * Sets the camera offset
     * @param offset The new camera offset vector
     */
    public setOffset(offset: BABYLON.Vector3): void {
        this.offset.copyFrom(offset);
    }

    /**
     * Reset camera to default offset from player
     */
    public resetCameraToDefaultOffset(): void {
        // Reset the offset to the default configuration
        this.offset.copyFrom(CONFIG.CAMERA.OFFSET);

        // Force activate smooth follow to ensure camera moves to new position
        this.forceActivateSmoothFollow();
    }

    public dispose(): void {
        if (this.pointerObserver) {
            this.scene.onPointerObservable.remove(this.pointerObserver);
        }
        if (this.beforeRenderObserver) {
            this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
        }

        if (this.canvas) {
            this.canvas.removeEventListener("touchstart", this.handleTouchStart);
            this.canvas.removeEventListener("touchmove", this.handleTouchMove);
            this.canvas.removeEventListener("touchend", this.handleTouchEnd);
            this.canvas.removeEventListener("wheel", this.handleWheel);
        }
    }
}
