import { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

interface UnityAvatarProps {
  width?: string;
  height?: string;
}

export function UnityAvatar({ width = "100%", height = "400px" }: UnityAvatarProps) {
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity/Build/Build.loader.js",
    dataUrl: "/unity/Build/Build.data",
    frameworkUrl: "/unity/Build/Build.framework.js",
    codeUrl: "/unity/Build/Build.wasm",
  });

  // Optional: Send messages to Unity when chat events happen
  // Example: unityProvider.send("GameObjectName", "MethodName", "parameter");

  return (
    <div className="relative" style={{ width, height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium mb-2">Loading Avatar...</div>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${loadingProgression * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {Math.round(loadingProgression * 100)}%
            </div>
          </div>
        </div>
      )}
      <Unity
        unityProvider={unityProvider}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "0.5rem",
          visibility: isLoaded ? "visible" : "hidden",
        }}
      />
    </div>
  );
}
