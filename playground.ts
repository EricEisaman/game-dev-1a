const charUrl = "https://cdn.glitch.global/eb9efb0a-b839-4ec6-9701-f10ab7097b32/among_us_anims.glb?v=1716732954106";
let debugDisplay = false;
const playerAnims: Record<string, BABYLON.AnimationGroup | undefined> = {};

class SmoothFollowCameraController {
    public isDragging = false;
    private pointerObserver: BABYLON.Observer<BABYLON.PointerInfo>;
    private beforeRenderObserver: BABYLON.Observer<BABYLON.Scene>;
    private lastPointerX = 0;
    private lastPointerY = 0;
    private isTwoFingerPanning = false;
    private lastPanPositions: [number, number, number, number] | null = null;

    public dragDeltaX = 0;
    public dragDeltaZ = 0;

    constructor(
        private scene: BABYLON.Scene,
        private camera: BABYLON.TargetCamera,
        private target: BABYLON.Mesh,
        private offset: BABYLON.Vector3 = new BABYLON.Vector3(0, 2, -6),
        private dragSensitivity: number = 0.02
    ) {
        this.pointerObserver = this.scene.onPointerObservable.add(this.handlePointer);
        this.beforeRenderObserver = this.scene.onBeforeRenderObservable.add(this.updateCamera);
        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            canvas.addEventListener("touchstart", this.handleTouchStart, { passive: false });
            canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });
            canvas.addEventListener("touchend", this.handleTouchEnd, { passive: false });

            canvas.addEventListener("wheel", this.handleWheel, { passive: false });
        }
    }

    private handlePointer = (pointerInfo: BABYLON.PointerInfo) => {
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
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (this.isDragging) {
                    const deltaX = pointerInfo.event.movementX || (pointerInfo.event.clientX - this.lastPointerX);
                    const deltaY = pointerInfo.event.movementY || (pointerInfo.event.clientY - this.lastPointerY);

                    this.lastPointerX = pointerInfo.event.clientX;
                    this.lastPointerY = pointerInfo.event.clientY;

                    // Calculate normalized direction based on drag
                    // You may want to scale or clamp these values
                    this.dragDeltaX = -deltaX * this.dragSensitivity;
                    this.dragDeltaZ = deltaY * this.dragSensitivity;

                    // Move camera as before...
                    const right = this.camera.getDirection(BABYLON.Vector3.Right());
                    this.camera.position.addInPlace(right.scale(this.dragDeltaX));
                    const up = this.camera.getDirection(BABYLON.Vector3.Up());
                    this.camera.position.addInPlace(up.scale(this.dragDeltaZ));
                    this.camera.setTarget(this.target.position);
                }
                break;
        }
    };

    private handleWheel = (e: WheelEvent) => {
        // Two-finger pan on laptop touchpad triggers wheel
        e.preventDefault();
        this.offset.z += e.deltaX * this.dragSensitivity * 6;
        if (this.offset.z > -2) this.offset.z = -2.05;
        else if (this.offset.z < -15) this.offset.z = -14.95;

    };

    private handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            this.isTwoFingerPanning = true;
            this.lastPanPositions = [
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            ] as [number, number, number, number];
        }
    };

    private handleTouchMove = (e: TouchEvent) => {
        if (this.isTwoFingerPanning && e.touches.length === 2 && this.lastPanPositions) {
            e.preventDefault();

            // Current positions
            const curr = [
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            ] as [number, number, number, number];


            // Calculate average movement
            const lastMidX = (this.lastPanPositions[0] + this.lastPanPositions[2]) / 2;
            const lastMidY = (this.lastPanPositions[1] + this.lastPanPositions[3]) / 2;
            const currMidX = (curr[0] + curr[2]) / 2;
            const currMidY = (curr[1] + curr[3]) / 2;

            const deltaX = currMidX - lastMidX;
            const deltaY = currMidY - lastMidY;

            // Update offset or camera position
            // Example: pan in XZ plane (adjust as needed for your scene)
            const right = this.camera.getDirection(BABYLON.Vector3.Right());
            const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
            this.offset.addInPlace(right.scale(-deltaX * this.dragSensitivity * 4));
            this.offset.addInPlace(forward.scale(deltaY * this.dragSensitivity * 4));

            this.lastPanPositions = curr;
        }
    };

    private handleTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
            this.isTwoFingerPanning = false;
            this.lastPanPositions = null;
        }
    };


    private updateCamera = () => {
        if (!this.isDragging) {
            const yRot = BABYLON.Quaternion.FromEulerAngles(0, this.target.rotation.y, 0);
            const rotatedOffset = this.offset.rotateByQuaternionToRef(yRot, new BABYLON.Vector3());
            const desiredPos = this.target.position.add(rotatedOffset);
            BABYLON.Vector3.LerpToRef(this.camera.position, desiredPos, 0.1, this.camera.position);
            this.camera.lockedTarget = this.target;
        } else {
            this.offset.y = this.camera.position.y - this.target.position.y;
        }
    };

    public dispose() {
        this.scene.onPointerObservable.remove(this.pointerObserver);
        this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            canvas.removeEventListener("touchstart", this.handleTouchStart);
            canvas.removeEventListener("touchmove", this.handleTouchMove);
            canvas.removeEventListener("touchend", this.handleTouchEnd);
        }
    }
}

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        let keysDown: Set<string> = new Set();
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.TargetCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const hk = new BABYLON.HavokPlugin(false);
        scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

        BABYLON.ImportMeshAsync("https://raw.githubusercontent.com/CedricGuillemet/dump/master/CharController/levelTest.glb", scene).then(() => {
            var lightmap = new BABYLON.Texture("https://raw.githubusercontent.com/CedricGuillemet/dump/master/CharController/lightmap.jpg");
            var lightmapped = ["level_primitive0", "level_primitive1", "level_primitive2"];
            lightmapped.forEach((meshName) => {
                var mesh = scene.getMeshByName(meshName);
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
            var cubes = ["Cube", "Cube.001", "Cube.002", "Cube.003", "Cube.004", "Cube.005"];
            cubes.forEach((meshName) => {
                new BABYLON.PhysicsAggregate(scene.getMeshByName(meshName), BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });
            });
            var planeMesh = scene.getMeshByName("Cube.006");
            planeMesh.scaling.set(0.03, 3, 1);
            var fixedMass = new BABYLON.PhysicsAggregate(scene.getMeshByName("Cube.007"), BABYLON.PhysicsShapeType.BOX, { mass: 0 });
            var plane = new BABYLON.PhysicsAggregate(planeMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1 });

            var joint = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0.75, 0, 0),
                new BABYLON.Vector3(-0.25, 0, 0),
                new BABYLON.Vector3(0, 0, -1),
                new BABYLON.Vector3(0, 0, 1),
                scene);
            fixedMass.body.addConstraint(plane.body, joint);

            var state = "IN_AIR";
            var inAirSpeed = 8.0;
            var onGroundSpeed = 10.0;
            var jumpHeight = 2.0;
            var wantJump = false;
            var inputDirection = new BABYLON.Vector3(0, 0, 0);
            var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
            let characterOrientation = BABYLON.Quaternion.Identity();
            let characterGravity = new BABYLON.Vector3(0, -18, 0);

            let h = 1.8;
            let r = 0.6;
            let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", { height: h, radius: r }, scene);
            displayCapsule.isVisible = debugDisplay;
            let characterPosition = new BABYLON.Vector3(3., 0.3, -8.);
            let characterController = new BABYLON.PhysicsCharacterController(characterPosition, { capsuleHeight: h, capsuleRadius: r }, scene);
            let playerMesh = displayCapsule as BABYLON.AbstractMesh
            let targetRotationY = 0;
            let rotationSpeed = BABYLON.Tools.ToRadians(3);

            // --- Modular Smooth Follow Camera ---
            const smoothFollowController = new SmoothFollowCameraController(
                scene,
                camera,
                displayCapsule,
                new BABYLON.Vector3(0, 1.2, -3)
            );

            const MECHANICS_STATES = {
                IN_AIR: "IN_AIR",
                DOUBLE_JUMPING: "DOUBLE_JUMPING",
                ON_GROUND: "ON_GROUND",
                START_JUMP: "START_JUMP"
            } as const;
            type MechanicsState = typeof MECHANICS_STATES[keyof typeof MECHANICS_STATES];

            // Load the GLB model as the player
            BABYLON.ImportMeshAsync(charUrl, scene).then(result => {
                playerMesh = result.meshes[0]; // Assuming the first mesh is the player
                playerMesh.scaling.setAll(0.7);

                // Assign animation groups to playerAnims
                playerAnims.walk = result.animationGroups.find(a => a.name === 'walk');
                playerAnims.idle = result.animationGroups.find(a => a.name === 'idle');

                // Ensure both are stopped initially
                playerAnims.walk?.stop();
                playerAnims.idle?.stop();
            }).catch(error => {
                console.error("Failed to import mesh:", error);
            });

            var getNextState = function (supportInfo): MechanicsState {
                if (state == MECHANICS_STATES.IN_AIR) {
                    if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                        return MECHANICS_STATES.ON_GROUND;
                    }
                    return MECHANICS_STATES.IN_AIR;
                } else if (state == MECHANICS_STATES.ON_GROUND) {
                    if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                        return MECHANICS_STATES.IN_AIR;
                    }
                    if (wantJump) {
                        return MECHANICS_STATES.START_JUMP;
                    }
                    return MECHANICS_STATES.ON_GROUND;
                } else if (state == MECHANICS_STATES.START_JUMP) {
                    return MECHANICS_STATES.IN_AIR;
                }
            }

            var getDesiredVelocity = function (deltaTime, supportInfo, characterOrientation, currentVelocity) {
                let nextState = getNextState(supportInfo);
                if (nextState != state) {
                    state = nextState;
                }
                let upWorld = characterGravity.normalizeToNew();
                upWorld.scaleInPlace(-1.0);
                let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation);
                if (state == MECHANICS_STATES.IN_AIR) {
                    let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation);
                    let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
                    outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
                    outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
                    outputVelocity.addInPlace(characterGravity.scale(deltaTime));
                    return outputVelocity;
                } else if (state == MECHANICS_STATES.ON_GROUND) {
                    let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation);
                    let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
                    {
                        outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
                        let inv1k = 1e-3;
                        if (outputVelocity.dot(upWorld) > inv1k) {
                            let velLen = outputVelocity.length();
                            outputVelocity.normalizeFromLength(velLen);
                            let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                            let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                            outputVelocity = c.cross(upWorld);
                            outputVelocity.scaleInPlace(horizLen);
                        }
                        outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
                        return outputVelocity;
                    }
                } else if (state == MECHANICS_STATES.START_JUMP) {
                    let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
                    let curRelVel = currentVelocity.dot(upWorld);
                    return currentVelocity.add(upWorld.scale(u - curRelVel));
                }
                return BABYLON.Vector3.Zero();
            }

            scene.onBeforeRenderObservable.add(() => {

                if (smoothFollowController.isDragging) {
                    // Calculate direction from player to camera
                    const toCamera = camera.position.subtract(displayCapsule.position).normalize();
                    // In Babylon.js, forward is +Z, so to face away from camera, use -toCamera
                    const awayFromCamera = toCamera.negate();

                    // Calculate the desired Y rotation (yaw) to face away from the camera
                    const targetYaw = Math.atan2(awayFromCamera.x, awayFromCamera.z);

                    // Smoothly interpolate current rotation.y to targetYaw if desired, or set directly:
                    displayCapsule.rotation.y = targetYaw;

                    // If using rotationQuaternion, update it as well:
                    if (displayCapsule.rotationQuaternion) {
                        BABYLON.Quaternion.FromEulerAnglesToRef(
                            displayCapsule.rotation.x,
                            targetYaw,
                            displayCapsule.rotation.z,
                            displayCapsule.rotationQuaternion
                        );
                    }
                    targetRotationY = displayCapsule.rotation.y;
                } else {
                    if (keysDown.has("a") || keysDown.has("arrowleft")) {
                        targetRotationY -= rotationSpeed;
                    }
                    if (keysDown.has("d") || keysDown.has("arrowright")) {
                        targetRotationY += rotationSpeed;
                    }
                    displayCapsule.rotation.y += (targetRotationY - displayCapsule.rotation.y) * 0.2;


                }

                displayCapsule.position.copyFrom(characterController.getPosition());
                displayCapsule.isVisible = debugDisplay;


                playerMesh.position.copyFrom(characterController.getPosition());
                playerMesh.position.y -= 0.9;
                if (displayCapsule.rotationQuaternion) {
                    if (!playerMesh.rotationQuaternion) {
                        playerMesh.rotationQuaternion = new BABYLON.Quaternion();
                    }
                    // Multiply by a quaternion representing 180° (π radians) rotation around Y
                    //var q180 = BABYLON.Quaternion.FromEulerAngles(0, Math.PI, 0);
                    //playerMesh.rotationQuaternion.copyFrom(displayCapsule.rotationQuaternion.multiply(q180));
                } else {
                    playerMesh.rotationQuaternion = null;
                    playerMesh.rotation.copyFrom(displayCapsule.rotation);
                    //playerMesh.rotation.y += Math.PI;
                }

                // Ensure no undue movement
                if (!keysDown.has('w') && !keysDown.has('arrowup') &&
                    !keysDown.has('s') && !keysDown.has('arrowdown')) {
                    inputDirection.z = 0;
                }
                if (!keysDown.has('q') && !keysDown.has('e')) {
                    inputDirection.x = 0;
                }

                // Animation state management
                if (playerAnims.walk && playerAnims.idle) {
                    // If any movement key is pressed, play walk, else play idle
                    if (keysDown.has('w') || keysDown.has('a') ||
                        keysDown.has('s') || keysDown.has('d') ||
                        keysDown.has('q') || keysDown.has('e') ||
                        keysDown.has('arrowup') || keysDown.has('arrowdown') ||
                        keysDown.has('arrowleft') || keysDown.has('arrowright')) {
                        if (!playerAnims.walk.isPlaying) {
                            playerAnims.idle.stop();
                            playerAnims.walk.start(true); // true = loop
                        }
                    } else {
                        if (!playerAnims.idle.isPlaying) {
                            playerAnims.walk.stop();
                            playerAnims.idle.start(true);
                        }
                    }
                }


            });

            scene.onAfterPhysicsObservable.add((_) => {
                if (scene.deltaTime == undefined) return;
                let dt = scene.deltaTime / 1000.0;
                if (dt == 0) return;

                let down = new BABYLON.Vector3(0, -1, 0);
                let support = characterController.checkSupport(dt, down);

                BABYLON.Quaternion.FromEulerAnglesToRef(0, camera.rotation.y, 0, characterOrientation);
                let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
                characterController.setVelocity(desiredLinearVelocity);

                characterController.integrate(dt, support, characterGravity);
            });

            scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        keysDown.add(kbInfo.event.key.toLowerCase());

                        if (kbInfo.event.key === 'w' || kbInfo.event.key === 'ArrowUp') {
                            inputDirection.z = 1;
                        } else if (kbInfo.event.key === 's' || kbInfo.event.key === 'ArrowDown') {
                            inputDirection.z = -1;
                        } else if (kbInfo.event.key === 'q') {
                            inputDirection.x = -1;
                        } else if (kbInfo.event.key === 'e') {
                            inputDirection.x = 1;
                        } else if (kbInfo.event.key === '0') {
                            debugDisplay = !debugDisplay
                        }

                        if (kbInfo.event.key === ' ') {
                            wantJump = true;
                        }
                        break;

                    case BABYLON.KeyboardEventTypes.KEYUP:
                        keysDown.delete(kbInfo.event.key.toLowerCase());

                        if (
                            kbInfo.event.key === 'w' ||
                            kbInfo.event.key === 's' ||
                            kbInfo.event.key === 'ArrowUp' ||
                            kbInfo.event.key === 'ArrowDown'
                        ) {
                            inputDirection.z = 0;
                        }
                        if (
                            kbInfo.event.key === 'a' ||
                            kbInfo.event.key === 'd' ||
                            kbInfo.event.key === 'ArrowLeft' ||
                            kbInfo.event.key === 'ArrowRight'
                        ) {
                            inputDirection.x = 0;
                        }

                        if (kbInfo.event.key === ' ') {
                            wantJump = false;
                        }
                        break;
                }
            });
        });

        return scene;
    }
}
