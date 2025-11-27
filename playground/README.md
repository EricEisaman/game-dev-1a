# Babylon Playground Game Starter 🎮✨

Welcome to **Babylon Playground Game Starter**! This game starter template is designed to be your canvas for creativity, experimentation, and sharing. We've built a modular, extensible framework that makes it easy to add your own characters, environments, effects, and gameplay mechanics.

> **💡 Share Your Creations!** When you post your amazing creations on the [Babylon.js forum](https://forum.babylonjs.com/) or social media, be sure to use the hashtag **`#BabylonGameStarter`** to help the community discover and appreciate your work! 🚀

**We encourage you to add your own flair, experiment with new ideas, and share your creations with the community!**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration Files](#configuration-files)
3. [Managers](#managers)
4. [Controllers](#controllers)
5. [UI Components](#ui-components)
6. [Types](#types)
7. [Adding Your Own Features](#adding-your-own-features)
8. [Sharing Your Work](#sharing-your-work)
9. [Technical Notes](#technical-notes)

---

## Getting Started

### Entry Point

The playground system starts at `index.ts`. This is where the `Playground.CreateScene()` function is defined, which is called by the Babylon.js playground infrastructure:

```typescript
class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        const sceneManager = new SceneManager(engine, canvas);
        SettingsUI.initialize(canvas, sceneManager);
        InventoryUI.initialize(canvas, sceneManager);
        return sceneManager.getScene();
    }
}
```

The `SceneManager` handles scene initialization, character setup, environment loading, and coordinates all the other managers. The UI components are initialized here to provide settings and inventory interfaces.

**Remember:** When you share your creations, use `#BabylonGameStarter` to help the community find your work!

---

## Configuration Files

All configuration files are located in the `config/` directory. These files contain the data that drives the game behavior and can be easily modified without touching the core logic.

### `config/assets.ts`

**Purpose:** Define all game assets including characters, environments, items, and collectibles.

**How to Modify:**

#### Adding a New Character

```typescript
{
    name: "YourCharacter",
    model: "https://your-url.com/character.glb",
    animations: {
        idle: "idle",
        walk: "run",  // Match your animation names
        jump: "jump"
    },
    scale: 1.0,
    mass: 1.0,
    height: 1.8,
    radius: 0.6,
    speed: {
        inAir: 25.0,
        onGround: 25.0,
        boostMultiplier: 8.0
    },
    jumpHeight: 2.0,
    rotationSpeed: 0.05,
    rotationSmoothing: 0.2,
    animationBlend: 200,
    jumpDelay: 200
}
```

#### Adding a New Environment

```typescript
{
    name: "My Custom World",
    model: "https://your-url.com/environment.glb",
    lightmap: "https://your-url.com/lightmap.jpg",  // Optional
    scale: 1.0,
    spawnPoint: new BABYLON.Vector3(0, 1, 0),
    sky: {
        TEXTURE_URL: "https://your-url.com/sky.png",
        ROTATION_Y: 0,
        BLUR: 0.2,
        TYPE: "SPHERE" satisfies SkyType
    },
    particles: [
        {
            name: "Fire Trail",
            position: new BABYLON.Vector3(0, 5, 0),
            updateSpeed: 0.01
        }
    ],
    items: [
        // Define collectibles and items here
    ]
}
```

**Key Properties:**
- `model`: URL to the GLB/GLTF file
- `scale`: Scale factor for the environment
- `spawnPoint`: Where the character spawns
- `sky`: Sky configuration
- `particles`: Particle effects in the environment
- `items`: Collectible items and crates

### `config/game-config.ts`

**Purpose:** Core game settings that control gameplay behavior.

**Main Sections:**

#### CHARACTER
- `SPEED.WALK`, `SPEED.RUN`, `SPEED.JUMP`: Movement speeds
- `CAPSULE_HEIGHT`, `CAPSULE_RADIUS`: Physics capsule dimensions
- `MASS`: Character mass
- `FRICTION`, `RESTITUTION`: Physics properties
- `ROTATION_SMOOTHING`: Character rotation interpolation
- `ANIMATION_BLEND`: Animation transition time (ms)
- `JUMP_DELAY`: Jump input delay (ms)

#### CAMERA
- `START_POSITION`: Initial camera position
- `OFFSET`: Camera offset from character
- `DRAG_SENSITIVITY`: Touch/mouse drag sensitivity
- `ZOOM_MIN`, `ZOOM_MAX`: Zoom limits
- `FOLLOW_SMOOTHING`: Camera follow interpolation

#### PHYSICS
- `GRAVITY`: World gravity
- `CHARACTER_GRAVITY`: Character-specific gravity (can be stronger)

#### EFFECTS
- `PARTICLE_SNIPPETS`: List of available particle effects from Babylon.js snippets
- Each snippet has: `name`, `description`, `category`, `snippetId`

#### INVENTORY
- `MAX_SLOTS`: Maximum inventory size
- `UI_POSITION`: Inventory UI screen position

#### HUD
- `POSITION`: HUD screen position
- `SHOW_CREDITS`, `SHOW_BOOST_STATUS`: Toggle HUD elements

**Example Customization:**

```typescript
CHARACTER: {
    SPEED: {
        WALK: 3.0,  // Faster walking
        RUN: 6.0,   // Faster running
        JUMP: 10.0  // Higher jump
    },
    // ... other settings
}
```

### `config/input-keys.ts`

**Purpose:** Keyboard input mappings for all game actions.

**Available Actions:**
- `FORWARD`, `BACKWARD`, `LEFT`, `RIGHT`: Movement
- `STRAFE_LEFT`, `STRAFE_RIGHT`: Strafing
- `JUMP`: Jump action
- `BOOST`: Boost/sprint
- `DEBUG`: Debug toggle
- `HUD_TOGGLE`: Show/hide HUD
- `HUD_POSITION`: Cycle HUD positions
- `RESET_CAMERA`: Reset camera to default

**How to Customize:**

```typescript
export const INPUT_KEYS = {
    FORWARD: ['w', 'arrowup'],
    JUMP: [' '],  // Spacebar
    BOOST: ['shift'],
    // Add your own keys here
} as const;
```

### `config/mobile-controls.ts`

**Purpose:** Mobile/touch input configuration for on-screen controls.

**Configurable Properties:**
- `JOYSTICK_RADIUS`: Size of the movement joystick
- `BUTTON_SIZE`: Size of action buttons
- `OPACITY`: Control transparency
- `COLORS`: Color scheme for controls
- `POSITIONS`: Screen positions for joystick and buttons
- `VISIBILITY`: Show/hide specific controls

### `config/character-states.ts`

**Purpose:** Character state definitions used by the animation and movement system.

**Available States:**
- `IN_AIR`: Character is in the air
- `ON_GROUND`: Character is on the ground
- `START_JUMP`: Character just started jumping

---

## Managers

Managers handle specific subsystems of the game. They're designed to be extensible, allowing you to add new functionality easily.

### `managers/SceneManager.ts`

**Purpose:** Orchestrates scene initialization, environment loading, and coordinates other managers.

**Key Methods:**
- `loadEnvironment(environmentName: string)`: Loads a new environment
- `setupEnvironmentItems()`: Sets up collectibles for the current environment
- `clearEnvironment()`: Cleans up environment meshes
- `clearItems()`: Cleans up collectible items

**How to Extend:**
Add custom environment loading logic by modifying `loadEnvironment()` or add new methods for environment-specific features.

### `managers/CollectiblesManager.ts`

**Purpose:** Manages all collectible items in the scene, including their creation, collection, disposal, and effects.

**Key Methods:**
- `initialize(scene, characterController)`: Initialize the manager
- `setupEnvironmentItems(environment)`: Set up collectibles for an environment
- `collectItem(id)`: Handle item collection
- `createCollectibleInstance(id, instance, itemConfig)`: Create a collectible instance

**How to Add New Collectible Types:**

1. Add the item to `config/assets.ts` in an environment's `items` array:

```typescript
{
    name: "Power Orb",
    url: "https://your-url.com/power-orb.glb",
    collectible: true,
    creditValue: 100,
    inventory: true,
    itemEffectKind: "customEffect",
    instances: [
        {
            position: new BABYLON.Vector3(0, 1, 0),
            scale: 1.0,
            rotation: new BABYLON.Vector3(0, 0, 0),
            mass: 0.5
        }
    ]
}
```

2. Add the effect handler in `managers/InventoryManager.ts` in the `applyItemEffect()` method.

### `managers/EffectsManager.ts`

**Purpose:** Manages particle systems, sounds, and visual effects.

**Key Methods:**
- `createParticleSystem(name, position)`: Create a particle system from snippet
- `setupAmbientSounds(sounds)`: Set up positional ambient sounds
- `crossfadeBackgroundMusic(url, volume, duration)`: Fade between background music tracks

**How to Add New Effects:**

1. Add particle snippet to `config/game-config.ts`:

```typescript
EFFECTS: {
    PARTICLE_SNIPPETS: [
        {
            name: "Your Effect",
            description: "Custom particle effect",
            category: "custom",
            snippetId: "YOUR_SNIPPET_ID"
        }
    ]
}
```

2. Use it in an environment's `particles` array in `config/assets.ts`.

### `managers/InventoryManager.ts`

**Purpose:** Manages player inventory, item usage, and item effects.

**Key Methods:**
- `addItem(name, count)`: Add items to inventory
- `useInventoryItem(name)`: Use an inventory item
- `applyItemEffect(itemName, item)`: Apply the effect of an item
- `getInventoryItems()`: Get current inventory

**How to Add New Item Effects:**

1. Add the item to `config/assets.ts` with `inventory: true` and `itemEffectKind: "yourEffectName"`.

2. Add the effect handler in `applyItemEffect()`:

```typescript
private static applyItemEffect(itemName: string, item: InventoryItem): boolean {
    const effectMap: Record<string, () => boolean> = {
        'Super Jump': () => this.applySuperJumpEffect(),
        'Invisibility': () => this.applyInvisibilityEffect(),
        'Your Effect': () => this.applyYourEffect(),  // Add your effect
    };
    // ... rest of the method
}
```

3. Implement your effect method that applies the desired behavior.

### `managers/HUDManager.ts`

**Purpose:** Manages the Heads-Up Display (HUD) showing credits, boost status, and other UI elements.

**Key Methods:**
- `updateHUD()`: Updates all HUD elements
- `updateCredits()`: Updates the credits display
- `updateBoostStatus()`: Updates the boost status display

**How to Add New HUD Elements:**

1. Add HUD element creation in `initialize()`.
2. Add update logic in `updateHUD()`.
3. Configure position in `config/game-config.ts` under `HUD`.

### `managers/NodeMaterialManager.ts`

**Purpose:** Processes NME (Node Material Editor) materials from Babylon.js snippets.

**Key Methods:**
- `processMeshForNodeMaterial(mesh)`: Processes a mesh for node material snippet patterns
- `processImportResult(result)`: Processes imported meshes for node materials
- `processMeshesForNodeMaterials()`: Processes all scene meshes

**How It Works:**
Meshes with names containing `#nmSNIPPET_ID` will automatically have node materials loaded from the snippet. For example, a mesh named `"ground#nmABC123"` will load snippet `ABC123`.

### `managers/SkyManager.ts`

**Purpose:** Manages sky textures and environment lighting.

**Key Methods:**
- `createSky(scene, skyConfig)`: Creates a sky from configuration

**Sky Types:**
- `SPHERE`: Sphere skybox
- Other types can be added by extending the type definitions

---

## Controllers

Controllers handle specific gameplay mechanics and behaviors.

### `controllers/CharacterController.ts`

**Purpose:** Controls character movement, physics interactions, and item effect application.

**Key Methods:**
- Movement and physics handling
- `applySuperJumpEffect()`: Applies super jump boost
- `applyInvisibilityEffect()`: Applies invisibility effect
- `getBoostStatus()`: Gets current boost status

**How to Add New Movement Mechanics:**

Modify the movement logic in the update loop or add new effect methods similar to `applySuperJumpEffect()`.

### `controllers/SmoothFollowCameraController.ts`

**Purpose:** Implements smooth camera following with drag controls and zoom.

**Key Methods:**
- `update()`: Updates camera position
- `handleDrag(deltaX, deltaY)`: Handles camera dragging
- `zoom(delta)`: Handles zoom input

**How to Customize:**

Modify smoothing values in `config/game-config.ts` under `CAMERA.FOLLOW_SMOOTHING` or adjust the camera offset and limits.

### `controllers/AnimationController.ts`

**Purpose:** Manages character animations and blends between animation states.

**Key Methods:**
- Animation state management
- Animation blending
- Animation transitions

---

## UI Components

UI components handle the visual interface elements.

### `ui/SettingsUI.ts`

**Purpose:** Settings panel for changing characters, environments, and other game settings.

**Key Methods:**
- `initialize(canvas, sceneManager)`: Initialize the settings UI
- `changeCharacter(characterIndexOrName)`: Change the active character
- `changeEnvironment(environmentName)`: Change the active environment

**How to Add New Settings:**

Add new settings sections in the `createSettingsPanel()` method and implement handlers for your settings.

### `ui/InventoryUI.ts`

**Purpose:** Displays and manages the inventory UI.

**Key Methods:**
- `initialize(canvas, sceneManager)`: Initialize the inventory UI
- `updateInventoryContent()`: Update the displayed inventory
- `updateInventoryButton()`: Update the inventory button state

**How to Customize:**

Modify the UI appearance in the `createInventoryButton()` and `createInventoryPanel()` methods.

---

## Types

All TypeScript type definitions are located in the `types/` directory:

- `types/babylon.d.ts`: Babylon.js type declarations for local development TypeScript checking only
- `types/character.ts`: Character type definitions
- `types/environment.ts`: Environment and item type definitions
- `types/config.ts`: Configuration type definitions
- `types/effects.ts`: Effects and particle type definitions
- `types/ui.ts`: UI type definitions

**Important Note about `babylon.d.ts`:**
The `types/babylon.d.ts` file is **only used for local development TypeScript checking**. It is **not used in the actual Babylon playground environment**. The playground has its own global BABYLON types that are automatically available. Some files (like `utils/engine.ts`) include local type declarations at the top of the file for local dev compatibility, but these don't affect the playground runtime.

**Type Safety:**
The codebase maintains strict type safety with no `any` types. All customizations should maintain type safety by using the provided type definitions.

---

## Adding Your Own Features

### Adding a New Character

1. **Add Character Model:**
   - Upload your GLB file to a URL (GitHub, CDN, etc.)

2. **Add to `config/assets.ts`:**
   ```typescript
   {
       name: "MyCharacter",
       model: "https://your-url.com/character.glb",
       animations: {
           idle: "idle_anim",
           walk: "walk_anim",
           jump: "jump_anim"
       },
       // ... configure other properties
   }
   ```

3. **Test:** The character will appear in the Settings UI character selector.

### Adding a New Environment

1. **Add Environment Model:**
   - Upload your GLB file to a URL

2. **Add to `config/assets.ts`:**
   ```typescript
   {
       name: "MyWorld",
       model: "https://your-url.com/environment.glb",
       spawnPoint: new BABYLON.Vector3(0, 1, 0),
       // ... configure sky, particles, items
   }
   ```

3. **Test:** The environment will appear in the Settings UI environment selector.

### Adding a New Collectible Item

1. **Add Item Model:**
   - Upload your GLB file to a URL

2. **Add to Environment in `config/assets.ts`:**
   ```typescript
   {
       name: "CollectibleName",
       url: "https://your-url.com/item.glb",
       collectible: true,
       creditValue: 50,
       inventory: false,  // true if it goes to inventory
       instances: [
           {
               position: new BABYLON.Vector3(0, 1, 0),
               scale: 1.0,
               rotation: new BABYLON.Vector3(0, 0, 0),
               mass: 0.5
           }
       ]
   }
   ```

### Adding a New Item Effect

1. **Add Item with Effect:**
   ```typescript
   {
       name: "EffectItem",
       inventory: true,
       itemEffectKind: "myCustomEffect",
       // ... other properties
   }
   ```

2. **Add Effect Handler in `managers/InventoryManager.ts`:**
   ```typescript
   private static applyItemEffect(itemName: string, item: InventoryItem): boolean {
       const effectMap: Record<string, () => boolean> = {
           'Super Jump': () => this.applySuperJumpEffect(),
           'EffectItem': () => this.applyMyCustomEffect(),
       };
       // ... rest
   }
   
   private static applyMyCustomEffect(): boolean {
       // Your effect logic here
       return true;
   }
   ```

3. **Apply Effect in Character Controller:**
   - If the effect modifies character behavior, add the logic to `controllers/CharacterController.ts`.

### Creating Custom Particle Effects

1. **Create Effect in Node Material Editor:**
   - Go to [Babylon.js Playground](https://playground.babylonjs.com/)
   - Create your particle effect
   - Save as a snippet and get the snippet ID

2. **Add to `config/game-config.ts`:**
   ```typescript
   EFFECTS: {
       PARTICLE_SNIPPETS: [
           {
               name: "My Effect",
               description: "Custom effect description",
               category: "custom",
               snippetId: "YOUR_SNIPPET_ID"
           }
       ]
   }
   ```

3. **Use in Environment:**
   ```typescript
   particles: [
       {
           name: "My Effect",
           position: new BABYLON.Vector3(0, 5, 0),
           updateSpeed: 0.01
       }
   ]
   ```

---

## Sharing Your Work

### Share Your Creations! 🎉

We'd love to see what you create with **Babylon Playground Game Starter**! When you share your work, please use the hashtag **`#BabylonGameStarter`** so the community can find and appreciate your creations.

**Use `#BabylonGameStarter` on:**
- [Babylon.js Forum](https://forum.babylonjs.com/) posts
- Twitter/X
- Instagram
- Reddit
- Any other social platform!

This hashtag helps us build a community around the game starter and makes it easier for others to discover amazing creations!

### Share on Babylon.js Forum

We encourage you to share your creations on the [official Babylon.js forum](https://forum.babylonjs.com/)! 

**Best Practices for Sharing:**
1. **Create a Playground Snippet:** Use the Babylon.js playground to create a shareable snippet
2. **Take Screenshots/Videos:** Visual demonstrations are always appreciated
3. **Document Your Changes:** Explain what you modified and how it works
4. **Share Your Assets:** If using custom models, provide links or credits
5. **Use the Hashtag:** Include **`#BabylonGameStarter`** in your forum post title or tags
6. **Tag Appropriately:** Use relevant tags like `#playground`, `#game`, `#tutorial` along with `#BabylonGameStarter`

**Forum Categories:**
- Post in "Showcases" for completed projects
- Post in "Questions & Answers" if you need help
- Post in "Tutorials" if creating educational content

### Tips for Impressive Demos

1. **Unique Characters:** Create or import interesting character models
2. **Beautiful Environments:** Design or import stunning environments
3. **Custom Effects:** Add custom particle effects and visual flair
4. **Interesting Mechanics:** Implement unique gameplay mechanics
5. **Polish:** Add sound effects, smooth animations, and responsive controls

### Community Guidelines

- Be respectful and helpful
- Give credit where credit is due
- Share knowledge and help others learn
- Follow Babylon.js community guidelines
- Have fun and be creative!

---

## Technical Notes

### TypeScript

This playground uses TypeScript with strict type checking. All code maintains type safety without using `any` types.

### Type Safety Requirements

- All function parameters must be typed
- All return types must be explicit
- Use the provided type definitions in `types/`
- No type casting or `any` types

### Code Style

- Follow existing code patterns
- Use clear, descriptive variable names
- Comment complex logic
- Maintain consistency with existing code style

### No Timeouts Policy

The codebase uses Babylon.js Observables (`scene.onBeforeRenderObservable`) instead of `setTimeout` or `setInterval` for frame-based timing. This ensures better performance and integration with the rendering loop.

---

## Resources

- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Babylon.js Forum](https://forum.babylonjs.com/)
- [Babylon.js Playground](https://playground.babylonjs.com/)
- [Node Material Editor](https://nme.babylonjs.com/)

---

**Happy Coding! We can't wait to see what you create! Don't forget to tag us with `#BabylonGameStarter`! 🚀**

