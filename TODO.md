# TODO

## ✅ COMPLETED: Add the ability for the system to look for mesh names including #nmSnippetId in both environment and item models. Then have the system create and apply a node material from snippet to that mesh.

### Implementation Details:
- Created `NodeMaterialManager` class to handle node material processing
- Integrated with `SceneManager` for environment, item, and character loading
- Supports mesh names with pattern `#nmSnippetId` (e.g., "MyMesh#nmABC123")
- Automatically processes imported meshes and applies node materials
- Caches node materials for reuse to improve performance
- Includes proper cleanup and disposal methods

### Usage:
1. Name your mesh with the pattern: `MeshName#nmSNIPPET_ID`
2. The system will automatically detect and apply the node material from the Babylon.js snippet
3. Example: A mesh named "Crystal#nmABC123" will load node material from snippet "ABC123"
