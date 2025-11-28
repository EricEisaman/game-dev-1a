// ============================================================================
// BABYLON.JS TYPE DECLARATIONS FOR PLAYGROUND V2
// ============================================================================

// Global BABYLON namespace is available in Playground v2
declare global {
    
    namespace BABYLON {
        // Enums
        enum KeyboardEventTypes {
            KEYDOWN = 1,
            KEYUP = 2
        }

        enum PointerEventTypes {
            POINTERDOWN = 1,
            POINTERUP = 2,
            POINTERMOVE = 3
        }

        enum CharacterSupportedState {
            SUPPORTED = 1,
            UNSUPPORTED = 2
        }

        // Constants
        const POINTERDOWN: number;
        const POINTERUP: number;
        const POINTERMOVE: number;
        const KEYDOWN: number;
        const KEYUP: number;
        const SUPPORTED: number;

        // Static methods
        function FromEulerAngles(x: number, y: number, z: number): Quaternion;
        function Clamp(value: number, min: number, max: number): number;
        function Lerp(start: number, end: number, amount: number): number;
        function ParseFromSnippetAsync(snippetId: string, scene: Scene, rootUrl?: string): Promise<IParticleSystem>;

        interface Scene {
            engine: Engine;
            meshes: AbstractMesh[];
            animationGroups: AnimationGroup[];
            deltaTime: number;
            onPointerObservable: Observable<PointerInfo>;
            onBeforeRenderObservable: Observable<Scene>;
            onAfterPhysicsObservable: Observable<Scene>;
            onKeyboardObservable: Observable<KeyboardInfo>;
            enablePhysics(gravity: Vector3, plugin: PhysicsPlugin): void;
            getAnimationGroupByName(name: string): AnimationGroup | null;
        getMeshByName(name: string): AbstractMesh | null;
        getEngine(): Engine;
        getRenderingCanvas(): HTMLCanvasElement | null;
        beginAnimation(target: AbstractMesh, from: number, to: number, loop?: boolean): void;
        }

        interface Engine {
            getRenderingCanvas(): HTMLCanvasElement | null;
        }

        interface PhysicsPlugin {
            // Physics plugin interface
        }

        interface TargetCamera {
            position: Vector3;
            lockedTarget: Vector3 | null;
            setTarget(target: Vector3): void;
            getDirection(direction: Vector3): Vector3;
        }

        interface Vector3 {
            x: number;
            y: number;
            z: number;
            length(): number;
            normalize(): Vector3;
            normalizeToNew(): Vector3;
            normalizeFromLength(length: number): void;
            add(other: Vector3): Vector3;
            addInPlace(other: Vector3): void;
            subtract(other: Vector3): Vector3;
            subtractInPlace(other: Vector3): void;
            scale(factor: number): Vector3;
            scaleInPlace(factor: number): void;
            copyFrom(other: Vector3): void;
            clone(): Vector3;
            dot(other: Vector3): number;
            cross(other: Vector3): Vector3;
            applyRotationQuaternion(quaternion: Quaternion): Vector3;
            rotateByQuaternionToRef(quaternion: Quaternion, result: Vector3): Vector3;
            set(x: number, y: number, z: number): void;
        }

        interface Quaternion {
            x: number;
            y: number;
            z: number;
            w: number;
            copyFrom(other: Quaternion): void;
        }

        interface Mesh {
            geometry: Geometry;
            material: Material | null;
            scaling: Vector3;
            rotation: Vector3;
            rotationQuaternion: Quaternion | null;
            position: Vector3;
            isVisible: boolean;
            parent: AbstractMesh | null;
            name: string;
            dispose(): void;
        }

        interface AbstractMesh {
            name: string;
            position: Vector3;
            rotation: Vector3;
            rotationQuaternion: Quaternion | null;
            scaling: Vector3;
            isVisible: boolean;
            parent: AbstractMesh | null;
            material: Material | null;
            dispose(): void;
        }

        interface Geometry {
            // Geometry interface
        }

        interface Material {
            // Material interface
        }

        interface Texture {
            // Texture interface
        }

        interface Color4 {
            r: number;
            g: number;
            b: number;
            a: number;
        }

        interface PhysicsCharacterController {
            getPosition(): Vector3;
            setPosition(position: Vector3): void;
            getVelocity(): Vector3;
            setVelocity(velocity: Vector3): void;
            checkSupport(deltaTime: number, direction: Vector3): CharacterSurfaceInfo;
            calculateMovement(deltaTime: number, forward: Vector3, up: Vector3, currentVelocity: Vector3, surfaceVelocity: Vector3, desiredVelocity: Vector3, gravity: Vector3): Vector3;
            integrate(deltaTime: number, supportInfo: CharacterSurfaceInfo, gravity: Vector3): void;
        }

        interface AnimationGroup {
            name: string;
            weight: number;
            start(loop?: boolean): void;
            stop(): void;
            dispose(): void;
        }

        interface ParticleSystem {
            name: string;
            emitter: AbstractMesh | Vector3;
            particleTexture: Texture | null;
            minEmitBox: Vector3;
            maxEmitBox: Vector3;
            color1: Color4;
            color2: Color4;
            colorDead: Color4;
            gravity: Vector3;
            direction1: Vector3;
            direction2: Vector3;
            targetStopDuration?: number;
            updateSpeed: number;
            start(): void;
            stop(): void;
            dispose(): void;
        }

        interface IParticleSystem extends ParticleSystem {}
        
        class ParticleSystem {
            constructor(name: string, capacity: number, scene: Scene);
            updateSpeed: number;
            particleTexture: Texture | null;
            emitter: AbstractMesh | Vector3;
            minEmitBox: Vector3;
            maxEmitBox: Vector3;
            color1: Color4;
            color2: Color4;
            colorDead: Color4;
            minSize: number;
            maxSize: number;
            minLifeTime: number;
            maxLifeTime: number;
            emitRate: number;
            blendMode: number;
            gravity: Vector3;
            direction1: Vector3;
            direction2: Vector3;
            minEmitPower: number;
            maxEmitPower: number;
            start(): void;
            stop(): void;
            dispose(): void;
            static BLENDMODE_ONEONE: number;
        }

        interface Sound {
            name: string;
            isPlaying: boolean;
            onended: (() => void) | null;
            rolloffFactor?: number;
            maxDistance?: number;
            play(): void;
            stop(): void;
            dispose(): void;
            setVolume(volume: number): void;
            getVolume(): number;
            setPosition(position: Vector3): void;
        }

        interface CharacterSurfaceInfo {
            supportedState: CharacterSupportedState;
            averageSurfaceNormal: Vector3;
            averageSurfaceVelocity: Vector3;
        }

        interface Observable<T> {
            add(callback: (data: T) => void): Observer<T>;
            remove(observer: Observer<T>): void;
        }

        interface Observer<T> {
            // Observer interface
        }

        interface PointerInfo {
            type: PointerEventTypes;
            event: PointerEvent;
        }

        interface KeyboardInfo {
            type: KeyboardEventTypes;
            event: KeyboardEvent;
        }

        // Static classes

        class Scene {
            constructor(engine: Engine);
            dispose(): void;
            particleSystems: IParticleSystem[];
        }

        class TargetCamera {
            constructor(name: string, position: Vector3, scene: Scene);
            lockedTarget: Vector3 | null;
        }

        class HemisphericLight {
            constructor(name: string, direction: Vector3, scene: Scene);
        }

        class HavokPlugin {
            constructor(useSharedArrayBuffer?: boolean);
        }

        class Sound {
            constructor(name: string, url: string, scene: Scene, readyToPlayCallback?: () => void, options?: { loop?: boolean; volume?: number; autoplay?: boolean; spatialSound?: boolean });
        }

        class PhysicsCharacterController {
            constructor(position: Vector3, options: { capsuleHeight: number; capsuleRadius: number }, scene: Scene);
            setPosition(position: Vector3): void;
            getPosition(): Vector3;
            setVelocity(velocity: Vector3): void;
            getVelocity(): Vector3;
            checkSupport(deltaTime: number, direction: Vector3): CharacterSurfaceInfo;
            integrate(deltaTime: number, supportInfo: CharacterSurfaceInfo, gravity: Vector3): void;
            pausePhysics(): void;
            resumePhysics(): void;
        }

        interface CharacterSurfaceInfo {
            isSupported: boolean;
            normal: Vector3;
        }


        class Scalar {
            static Clamp(value: number, min: number, max: number): number;
            static Lerp(start: number, end: number, amount: number): number;
            static LerpToRef(start: number, end: number, amount: number, result: number): void;
        }

        class MeshBuilder {
            static CreateCapsule(name: string, options: { height: number; radius: number }, scene: Scene): AbstractMesh;
            static CreateSphere(name: string, options: { diameter: number; segments: number }, scene: Scene): Mesh;
            static CreateBox(name: string, options: { size: number }, scene: Scene): Mesh;
        }

        class ParticleHelper {
            static ParseFromSnippetAsync(snippetId: string, scene: Scene, rootUrl?: string): Promise<IParticleSystem>;
        }

    class PhysicsImpostor {
        dispose(): void;
    }

    class AbstractMesh {
        constructor(name: string, scene: Scene);
        name: string;
        position: Vector3;
        rotation: Vector3;
        scaling: Vector3;
        parent: AbstractMesh | null;
        isVisible: boolean;
        isPickable: boolean;
        material: Material | null;
        animations: Animation[];
        physicsImpostor: PhysicsImpostor | null;
        metadata: Record<string, unknown> | null;
        getChildMeshes(): AbstractMesh[];
        setEnabled(enabled: boolean): void;
        setParent(parent: AbstractMesh | null): void;
        createInstance(name: string): AbstractMesh;
        getBoundingInfo(): BoundingInfo;
        freezeWorldMatrix(): void;
        doNotSyncBoundingInfo: boolean;
        dispose(): void;
        addTags(...tags: string[]): void;
        hasTags(...tags: string[]): boolean;
    }

    class Geometry {
        dispose(): void;
        getTotalVertices(): number;
    }

    class Mesh extends AbstractMesh {
        material: Material | null;
        geometry: Geometry | null;
        dispose(): void;
    }

        class Material {
            dispose(): void;
        }

    class StandardMaterial extends Material {
        constructor(name: string, scene: Scene);
        backFaceCulling: boolean;
        diffuseTexture: Texture | null;
        disableLighting: boolean;
        emissiveTexture: Texture | null;
        emissiveColor: Color3;
        lightmapTexture: Texture | null;
        useLightmapAsShadowmap: boolean;
    }

    class Texture {
        constructor(url: string, scene: Scene);
        level: number;
        coordinatesMode: number;
        uAng: number;
        coordinatesIndex: number;
        dispose(): void;
        static readonly SKYBOX_MODE: number;
    }

    class Color3 {
        constructor(r: number, g: number, b: number);
    }

    class Color4 {
        constructor(r: number, g: number, b: number, a: number);
    }

    class Vector3 {
        constructor(x: number, y: number, z: number);
        x: number;
        y: number;
        z: number;
        set(x: number, y: number, z: number): void;
        setAll(value: number): void;
        copyFrom(other: Vector3): void;
        scale(factor: number): Vector3;
        static Zero(): Vector3;
        static Up(): Vector3;
        static Down(): Vector3;
        static Left(): Vector3;
        static Right(): Vector3;
        static Forward(): Vector3;
        static Backward(): Vector3;
        static Lerp(start: Vector3, end: Vector3, amount: number): Vector3;
        static LerpToRef(from: Vector3, to: Vector3, amount: number, result: Vector3): void;
        static Distance(value1: Vector3, value2: Vector3): number;
    }

    class Quaternion {
        constructor(x: number, y: number, z: number, w: number);
        x: number;
        y: number;
        z: number;
        w: number;
        static FromEulerAngles(x: number, y: number, z: number): Quaternion;
        static FromEulerAnglesToRef(x: number, y: number, z: number, result: Quaternion): void;
    }

        class NodeMaterial {
            constructor(name: string, scene: Scene);
            static ParseFromSnippetAsync(snippetId: string, scene: Scene): Promise<NodeMaterial>;
            dispose(): void;
        }

    class PhysicsBody {
        dispose(): void;
        addConstraint(otherBody: PhysicsBody, constraint: HingeConstraint): void;
    }

    class PhysicsAggregate {
        constructor(mesh: AbstractMesh, shapeType: PhysicsShapeType, options?: { mass?: number; friction?: number; restitution?: number });
        body: PhysicsBody;
    }

    enum PhysicsShapeType {
        MESH = 0,
        BOX = 1,
        SPHERE = 2,
        CAPSULE = 3,
        CYLINDER = 4,
        CONVEX_HULL = 5,
        CONTAINER = 6,
        HEIGHTFIELD = 7,
        PLANE = 8
    }

    class HingeConstraint {
        constructor(
            pivotA: Vector3,
            pivotB: Vector3,
            axisA: Vector3,
            axisB: Vector3,
            scene: Scene
        );
    }

    class PBRMaterial extends Material {
        lightmapTexture: Texture | null;
        useLightmapAsShadowmap: boolean;
    }

    class Animation {
        constructor(name: string, targetProperty: string, framePerSecond: number, dataType: number, loopMode: number);
        setKeys(keys: Array<{ frame: number; value: number }>): void;
        static readonly ANIMATIONTYPE_FLOAT: number;
        static readonly ANIMATIONLOOPMODE_CYCLE: number;
    }

    class BoundingInfo {
        boundingBox: BoundingBox;
    }

    class BoundingBox {
        extendSize: Vector3;
    }

        // Import utilities
        function ImportMeshAsync(modelUrl: string, scene: Scene): Promise<{ meshes: AbstractMesh[]; particleSystems: IParticleSystem[]; skeletons: any[]; animationGroups: AnimationGroup[] }>;
    }

    // Forward declaration for SceneManager
    interface SceneManager {
        changeCharacter(characterIndexOrName: number | string): void;
        pausePhysics(): void;
        clearEnvironment(): void;
        clearItems(): void;
        clearParticles(): void;
        loadEnvironment(environmentName: string): Promise<void>;
        setupEnvironmentItems(): Promise<void>;
        repositionCharacter(): void;
        forceActivateSmoothFollow(): void;
        resumePhysics(): void;
        getCurrentEnvironment(): string;
    }
}

export {};