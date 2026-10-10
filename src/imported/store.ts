import { instanceId, type AssetDescriptor, type Placement } from "./descriptor";
export interface StoredAsset {
  descriptor: AssetDescriptor;
  blob: Blob;
}
export class AssetStore {
  private database: Promise<IDBDatabase> | undefined;
  constructor(private name = "habitat-imported-assets-v0") {}
  private open() {
    return (this.database ??= new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open(this.name, 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore("assets", { keyPath: "descriptor.id" });
        r.result.createObjectStore("layouts", { keyPath: "id" });
      };
      r.onsuccess = () => {
        r.result.onversionchange = () => r.result.close();
        resolve(r.result);
      };
      r.onerror = () => reject(r.error);
      r.onblocked = () => reject(new Error("请关闭其他 Habitat 页面后重试"));
    }));
  }
  async read() {
    const db = await this.open();
    return new Promise<{
      assets: StoredAsset[];
      placements: Placement[];
      instanceId: string;
    }>((resolve, reject) => {
      const t = db.transaction(["assets", "layouts"], "readonly"),
        a = t.objectStore("assets").getAll(),
        p = t.objectStore("layouts").get(instanceId);
      t.oncomplete = () =>
        resolve({
          assets: a.result,
          placements: p.result?.items ?? [],
          instanceId,
        });
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("读取取消"));
    });
  }
  async add(asset: StoredAsset) {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction("assets", "readwrite");
      t.objectStore("assets").add(asset);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error ?? new Error("资产登记失败"));
      t.onabort = () => reject(t.error ?? new Error("资产 ID 冲突或存储失败"));
    });
  }
  async savePlacements(items: Placement[]) {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(["assets", "layouts"], "readwrite"),
        r = t.objectStore("assets").getAllKeys();
      let reason: Error | undefined;
      r.onsuccess = () => {
        if (items.some((p) => !r.result.includes(p.assetId))) {
          reason = new Error("资产文件不存在，未保存布局");
          t.abort();
          return;
        }
        t.objectStore("layouts").put({ id: instanceId, items });
      };
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(reason ?? t.error ?? new Error("保存取消"));
    });
  }
  async unregister(id: string) {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(["assets", "layouts"], "readwrite");
      t.objectStore("assets").delete(id);
      const r = t.objectStore("layouts").getAll();
      r.onsuccess = () =>
        r.result.forEach((l) =>
          t.objectStore("layouts").put({
            ...l,
            items: l.items.filter((p: Placement) => p.assetId !== id),
          }),
        );
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("删除取消"));
    });
  }
}
