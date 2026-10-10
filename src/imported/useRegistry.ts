import { useEffect, useRef, useState } from "react";
import type { Object3D } from "three";
import { AssetStore, type StoredAsset } from "./store";
import {
  descriptorError,
  type AssetDescriptor,
  type Placement,
} from "./descriptor";
import { inspectGlb, disposeModel } from "./glb";
export interface LoadedAsset extends StoredAsset {
  scene?: Object3D;
  error?: string;
}
const store = new AssetStore();
export function useRegistry() {
  const [assets, setAssets] = useState<LoadedAsset[]>([]),
    [placements, setPlacements] = useState<Placement[]>([]),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  const lock = useRef(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snapshot = await store.read();
        const loaded: LoadedAsset[] = [];
        for (const a of snapshot.assets) {
          try {
            const err = descriptorError(a.descriptor);
            if (err) throw new Error(err);
            const result = await inspectGlb(await a.blob.arrayBuffer());
            loaded.push({
              ...a,
              descriptor: { ...a.descriptor, info: result.info },
              scene: result.scene,
            });
          } catch (e) {
            loaded.push({
              ...a,
              error: e instanceof Error ? e.message : "资产读取失败",
            });
          }
        }
        if (cancelled) {
          loaded.forEach((a) => a.scene && disposeModel(a.scene));
          return;
        }
        setAssets(loaded);
        setPlacements(snapshot.placements);
        setReady(true);
      } catch (e) {
        if (!cancelled)
          setError(
            "无法读取本地资产库：" +
              (e instanceof Error ? e.message : String(e)),
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(
    () => () =>
      assetsRef.current.forEach((a) => a.scene && disposeModel(a.scene)),
    [],
  );
  async function run(action: () => Promise<void>) {
    if (lock.current) throw new Error("请等待当前保存完成");
    if (!ready) throw new Error("本地资产库尚未就绪");
    lock.current = true;
    setBusy(true);
    try {
      await action();
      setError("");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function register(descriptor: AssetDescriptor, blob: Blob) {
    await run(async () => {
      const error = descriptorError(descriptor);
      if (error) throw new Error(error);
      if (
        assets.length >= 32 ||
        assets.reduce((n, a) => n + a.blob.size, 0) + blob.size >
          256 * 1024 * 1024
      )
        throw new Error("本地 V0 上限为 32 个资产 / 256 MB");
      const parsed = await inspectGlb(await blob.arrayBuffer());
      const record = {
        descriptor: structuredClone({ ...descriptor, info: parsed.info }),
        blob,
      };
      try {
        await store.add(record);
      } catch (e) {
        disposeModel(parsed.scene);
        throw e;
      }
      setAssets((old) => [...old, { ...record, scene: parsed.scene }]);
    });
  }
  async function commit(items: Placement[]) {
    await run(async () => {
      await store.savePlacements(items);
      setPlacements(structuredClone(items));
    });
  }
  async function unregister(id: string) {
    await run(async () => {
      await store.unregister(id);
      setPlacements((old) => old.filter((p) => p.assetId !== id));
      const a = assetsRef.current.find((a) => a.descriptor.id === id);
      setAssets((old) => old.filter((a) => a.descriptor.id !== id));
      if (a?.scene) disposeModel(a.scene);
    });
  }
  return {
    assets,
    placements,
    ready,
    error,
    busy,
    register,
    commit,
    unregister,
  };
}
export type Registry = ReturnType<typeof useRegistry>;
