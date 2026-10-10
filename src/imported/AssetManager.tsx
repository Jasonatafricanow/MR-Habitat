import { useEffect, useRef, useState } from "react";
import type { Object3D } from "three";
import { AssetPreview } from "./AssetPreview";
import { inspectGlb, disposeModel, maxGlbBytes } from "./glb";
import {
  makeDescriptor,
  normalOffset,
  type AssetDescriptor,
  type Placement,
  type Binding,
} from "./descriptor";
import type { Registry } from "./useRegistry";
interface Pending {
  blob: Blob;
  scene: Object3D;
  descriptor: AssetDescriptor;
}
const radians = (n: number) => (n * Math.PI) / 180;
export function AssetManager({
  registry: r,
  onClose,
  onApply,
  placementError,
}: {
  registry: Registry;
  onClose: () => void;
  onApply: (items: Placement[]) => Promise<void>;
  placementError: string | null;
}) {
  const [pending, setPending] = useState<Pending | null>(null),
    [selected, setSelected] = useState(""),
    [status, setStatus] = useState(""),
    [reading, setReading] = useState(false),
    [ground, setGround] = useState(true);
  const [draft, setDraft] = useState({ x: -0.8, z: -1.5, yaw: 0, scale: 1 }),
    [editId, setEditId] = useState<string | null>(null);
  const seq = useRef(0);
  useEffect(
    () => () => {
      seq.current++;
    },
    [],
  );
  useEffect(
    () => () => {
      if (pending) disposeModel(pending.scene);
    },
    [pending?.scene],
  );
  const asset = r.assets.find((a) => a.descriptor.id === selected),
    descriptor = pending?.descriptor ?? asset?.descriptor,
    scene = pending?.scene ?? asset?.scene;
  async function load(file: File | undefined) {
    if (!file) return;
    const token = ++seq.current;
    setReading(true);
    setStatus("正在检查文件…");
    setPending(null);
    setSelected("");
    setEditId(null);
    try {
      if (!file.name.toLowerCase().endsWith(".glb"))
        throw new Error("请选择 .glb 文件");
      if (file.size > maxGlbBytes) throw new Error("文件超过 32 MB 限制");
      const parsed = await inspectGlb(await file.arrayBuffer());
      if (token !== seq.current) {
        disposeModel(parsed.scene);
        return;
      }
      setGround(true);
      setPending({
        blob: file,
        scene: parsed.scene,
        descriptor: makeDescriptor(
          file.name.replace(/\.glb$/i, ""),
          parsed.info,
        ),
      });
      setStatus("解析成功。确认方向、大小及落地后，加入资产库。");
    } catch (e) {
      if (token === seq.current)
        setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      if (token === seq.current) setReading(false);
    }
  }
  function change(patch: Partial<AssetDescriptor>) {
    if (pending)
      setPending({
        ...pending,
        descriptor: { ...pending.descriptor, ...patch },
      });
  }
  async function act(fn: () => Promise<void>, message: string) {
    try {
      await fn();
      setStatus(message);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    }
  }
  const binding =
    descriptor?.interaction.kind === "projection"
      ? `projection:${descriptor.interaction.key}`
      : (descriptor?.interaction.kind ?? "none");
  return (
    <section
      className="asset-manager"
      role="dialog"
      aria-label="本地资产库"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void load(e.dataTransfer.files[0]);
      }}
    >
      <header>
        <h2>本地资产库</h2>
        <button onClick={onClose}>关闭资产库 ×</button>
      </header>
      <p>导入 GLB → 确认外观 → 加入资产库 → 放入房间 → 保存</p>
      <label className="asset-drop">
        选择或拖入 .glb
        <input
          aria-label="选择 GLB 文件"
          type="file"
          accept=".glb"
          disabled={reading || r.busy || !r.ready}
          onChange={(e) => void load(e.target.files?.[0])}
        />
      </label>
      <small>
        仅内嵌资源 GLB · 每个文件最多 32 MB · 模型单位为米 / Y 向上 ·
        动画暂以静态姿态展示
      </small>
      <details>
        <summary>没有测试文件？下载简单验证模型</summary>
        <div className="asset-fixtures">
          {["crate", "wardrobe", "projection"].map((n) => (
            <a key={n} href={`/fixtures/${n}.glb`} download>
              {n}.glb
            </a>
          ))}
        </div>
      </details>
      {(r.error || placementError) && (
        <p role="alert">{r.error || placementError}</p>
      )}
      <p className="asset-status" role="status">
        {reading
          ? "正在检查文件…"
          : status ||
            (!r.ready
              ? "正在读取本地资产库…"
              : "文件和布局保存在本浏览器。清除网站数据会删除它们。")}
      </p>
      <div className="asset-columns">
        <div>
          <h3>已登记资产（{r.assets.length}）</h3>
          {r.assets.map((a) => (
            <article className="asset-entry" key={a.descriptor.id}>
              <strong>{a.descriptor.displayName}</strong>
              <small>
                {a.descriptor.category} · {(a.blob.size / 1024).toFixed(1)} KB ·{" "}
                {a.descriptor.info.meshes} 网格
              </small>
              {a.error && <p role="alert">{a.error}</p>}
              <button
                disabled={!a.scene || r.busy}
                onClick={() => {
                  setPending(null);
                  setSelected(a.descriptor.id);
                  setEditId(null);
                  setDraft({ x: -0.8, z: -1.5, yaw: 0, scale: 1 });
                }}
              >
                选择 {a.descriptor.displayName}
              </button>
              <button
                disabled={r.busy}
                onClick={() =>
                  void act(async () => {
                    await r.unregister(a.descriptor.id);
                    if (selected === a.descriptor.id) setSelected("");
                  }, "已注销资产，并移除房间中的引用")
                }
              >
                注销 {a.descriptor.displayName}
              </button>
            </article>
          ))}
          <h3>房间中的导入物件（{r.placements.length}）</h3>
          {r.placements.map((p, i) => {
            const a = r.assets.find((a) => a.descriptor.id === p.assetId);
            return (
              <article className="asset-entry" key={p.id}>
                <strong>
                  {a?.descriptor.displayName ?? "缺失资产"} · {i + 1}
                </strong>
                <small>
                  X {p.x.toFixed(2)} / Z {p.z.toFixed(2)} /{" "}
                  {((p.yaw * 180) / Math.PI).toFixed(1)}°
                </small>
                <button
                  disabled={!a?.scene || r.busy}
                  onClick={() => {
                    setPending(null);
                    setSelected(p.assetId);
                    setEditId(p.id);
                    setDraft({ x: p.x, z: p.z, yaw: p.yaw, scale: p.scale });
                  }}
                >
                  调整物件 {i + 1}
                </button>
                <button
                  disabled={r.busy}
                  onClick={() =>
                    void act(
                      () =>
                        onApply(
                          r.placements.filter((item) => item.id !== p.id),
                        ),
                      "已从房间移除并保存；资产仍在库中",
                    )
                  }
                >
                  移除物件 {i + 1}
                </button>
              </article>
            );
          })}
        </div>
        <div>
          {descriptor && scene ? (
            <>
              <AssetPreview scene={scene} descriptor={descriptor} />
              <p>
                归一化尺寸：
                {descriptor.info.bounds.max
                  .map((n, i) =>
                    (
                      (n - descriptor.info.bounds.min[i]) *
                      descriptor.defaultScale
                    ).toFixed(3),
                  )
                  .join(" × ")}{" "}
                m
              </p>
              <small>
                {descriptor.info.vertices.toLocaleString()} 顶点 ·{" "}
                {descriptor.info.triangles.toLocaleString()} 三角面 ·{" "}
                {descriptor.info.materials} 材质 · {descriptor.info.textures}{" "}
                贴图 · {descriptor.info.animations} 动画
                <br />
                {descriptor.info.materialTypes.join(" / ")}
              </small>
              {pending ? (
                <fieldset disabled={r.busy || reading}>
                  <legend>资产属性</legend>
                  <label>
                    名称
                    <input
                      aria-label="资产名称"
                      value={descriptor.displayName}
                      maxLength={100}
                      onChange={(e) => change({ displayName: e.target.value })}
                    />
                  </label>
                  <label>
                    类别
                    <input
                      aria-label="资产类别"
                      value={descriptor.category}
                      maxLength={40}
                      onChange={(e) => change({ category: e.target.value })}
                    />
                  </label>
                  <label>
                    尺寸倍数
                    <input
                      aria-label="导入缩放"
                      type="number"
                      min=".001"
                      max="1000"
                      step=".1"
                      value={descriptor.defaultScale}
                      onChange={(e) =>
                        change({
                          defaultScale: Math.max(
                            0.001,
                            Math.min(1000, Number(e.target.value) || 1),
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    正面方向（Y 轴角度）
                    <input
                      aria-label="模型方向"
                      type="number"
                      step="15"
                      value={Number(
                        (
                          (descriptor.localTransform.yaw * 180) /
                          Math.PI
                        ).toFixed(2),
                      )}
                      onChange={(e) =>
                        change({
                          localTransform: {
                            ...descriptor.localTransform,
                            yaw: radians(Number(e.target.value)),
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={ground}
                      onChange={(e) => {
                        setGround(e.target.checked);
                        change({
                          localTransform: {
                            ...descriptor.localTransform,
                            offset: normalOffset(
                              descriptor.info.bounds,
                              e.target.checked,
                            ),
                          },
                        });
                      }}
                    />
                    自动落地并居中
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={descriptor.movable}
                      onChange={(e) => change({ movable: e.target.checked })}
                    />
                    放入后允许移动
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={descriptor.collision.strategy === "aabb"}
                      onChange={(e) =>
                        change({
                          collision: {
                            strategy: e.target.checked ? "aabb" : "none",
                          },
                        })
                      }
                    />
                    阻挡角色通行（装饰物可关闭）
                  </label>
                  <label>
                    点击时
                    <select
                      aria-label="资产交互"
                      value={binding}
                      onChange={(e) => {
                        const v = e.target.value;
                        const interaction: Binding = v.startsWith("projection:")
                          ? {
                              kind: "projection",
                              key: v.split(":")[1] as
                                "desk" | "books" | "journal",
                            }
                          : v === "wardrobe"
                            ? { kind: "wardrobe" }
                            : { kind: "none" };
                        change({ interaction });
                      }}
                    >
                      <option value="none">无交互</option>
                      <option value="wardrobe">打开衣柜 / 换装</option>
                      <option value="projection:desk">工作与项目投影</option>
                      <option value="projection:books">长期信息投影</option>
                      <option value="projection:journal">最近经历投影</option>
                    </select>
                  </label>
                  <button
                    onClick={() =>
                      void act(async () => {
                        await r.register(descriptor, pending.blob);
                        setSelected(descriptor.id);
                        setPending(null);
                        setEditId(null);
                      }, "已加入资产库。设置摆放位置后放入房间。")
                    }
                  >
                    加入资产库
                  </button>
                </fieldset>
              ) : (
                <fieldset disabled={r.busy}>
                  <legend>{editId ? "调整房间物件" : "放入溪月之家"}</legend>
                  <small>
                    {descriptor.movable ? "可移动家具" : "固定摆放物件"} ·{" "}
                    {descriptor.collision.strategy === "none"
                      ? "不阻挡通行"
                      : "包围盒障碍"}{" "}
                    ·{" "}
                    {binding === "none"
                      ? "无交互"
                      : binding === "wardrobe"
                        ? "衣柜"
                        : "只读投影"}
                  </small>
                  <div className="placement-inputs">
                    {(["x", "z", "yaw", "scale"] as const).map((k) => (
                      <label key={k}>
                        {
                          {
                            x: "位置 X",
                            z: "位置 Z",
                            yaw: "Y 旋转 °",
                            scale: "摆放缩放",
                          }[k]
                        }
                        <input
                          aria-label={`摆放 ${k}`}
                          disabled={!!editId && !descriptor.movable}
                          type="number"
                          step={k === "yaw" ? 15 : 0.1}
                          value={Number(
                            (k === "yaw"
                              ? (draft[k] * 180) / Math.PI
                              : draft[k]
                            ).toFixed(3),
                          )}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              [k]:
                                Number(e.target.value) *
                                (k === "yaw" ? Math.PI / 180 : 1),
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    disabled={!!editId && !descriptor.movable}
                    onClick={() =>
                      void act(async () => {
                        const p: Placement = {
                          ...draft,
                          id: editId ?? crypto.randomUUID(),
                          assetId: descriptor.id,
                        };
                        await onApply(
                          editId
                            ? r.placements.map((old) =>
                                old.id === editId ? p : old,
                              )
                            : [...r.placements, p],
                        );
                        setEditId(p.id);
                      }, "已保存摆放，导航已更新；角色回到玄关。")
                    }
                  >
                    {editId ? "保存位置" : "放入房间并保存"}
                  </button>
                </fieldset>
              )}
            </>
          ) : (
            <p>选择文件，或从资产库选择一个模型。</p>
          )}
        </div>
      </div>
    </section>
  );
}
