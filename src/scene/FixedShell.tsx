import { useEffect, useState, type ReactNode } from "react";
import { Html } from "@react-three/drei";
import type { Object3D } from "three";
import type { FixedShellSource } from "../assets/shell";
import { loadExternalShell } from "./shellLoader";
import { disposeModel } from "../imported/glb";

function ExternalShell({
  source,
}: {
  source: Extract<FixedShellSource, { kind: "glb" }>;
}) {
  const [scene, setScene] = useState<Object3D>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    const controller = new AbortController();
    let owned: Object3D | undefined;
    loadExternalShell(source, controller.signal)
      .then((model) => {
        if (controller.signal.aborted) {
          disposeModel(model);
          return;
        }
        owned = model;
        setScene(model);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      controller.abort();
      if (owned) disposeModel(owned);
    };
  }, [source.uri, source.schemaVersion]);
  if (error)
    return (
      <Html center>
        <div role="alert">房屋外壳加载失败：{error}</div>
      </Html>
    );
  return scene ? <primitive object={scene} dispose={null} /> : null;
}

/** Procedural children retain their exact authored transforms and materials. */
export function FixedShell({
  source,
  children,
}: {
  source: FixedShellSource;
  children: ReactNode;
}) {
  return source.kind === "procedural" ? (
    children
  ) : (
    <ExternalShell
      key={`${source.schemaVersion}:${source.uri}`}
      source={source}
    />
  );
}
