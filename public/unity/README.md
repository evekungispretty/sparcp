# Unity WebGL Build Instructions

## For the 3D Artist:

### Building from Unity:

1. In Unity, go to **File → Build Settings**
2. Select **WebGL** as the platform
3. Click **Switch Platform** (if needed)
4. Click **Player Settings** and configure:
   - **Compression Format**: Disabled (for faster testing) or Gzip
   - **Template**: Default or Minimal
5. Click **Build** and save to a temporary folder

### After Building:

You'll get a folder with this structure:
```
YourBuild/
├── Build/
│   ├── Build.data
│   ├── Build.framework.js
│   ├── Build.loader.js
│   └── Build.wasm
└── index.html (you can ignore this)
```

### Installing in this project:

**Copy the entire `Build` folder contents** to:
```
sparcp/public/unity/Build/
```

Your final structure should be:
```
sparcp/
└── public/
    └── unity/
        └── Build/
            ├── Build.data
            ├── Build.framework.js
            ├── Build.loader.js
            └── Build.wasm
```

## File Naming:

⚠️ **IMPORTANT**: If your Unity build creates files with different names (e.g., `MyAvatar.data` instead of `Build.data`), let the developer know so they can update the file paths in `src/components/UnityAvatar.tsx`.

## Tips for Optimization:

- Keep the scene simple for web (low poly count)
- Bake lighting when possible
- Use texture atlases to reduce draw calls
- Aim for < 50MB total build size for faster loading
- Test the build in browser before sending

## Communication with React (Optional):

If you need the avatar to react to chat messages:

1. In Unity, create a C# script with public methods:
```csharp
public class AvatarController : MonoBehaviour
{
    public void OnNewMessage(string message)
    {
        // Animate avatar based on message
    }

    public void SetEmotion(string emotion)
    {
        // Change facial expression
    }
}
```

2. Attach to a GameObject (e.g., "AvatarManager")

3. The React app can call these methods using:
```typescript
unityProvider.send("AvatarManager", "OnNewMessage", "Hello!");
```
