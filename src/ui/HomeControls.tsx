import { useState } from "react";
import { useDialogFocus } from "./useDialogFocus";
import { outfits, chooseOutfit, type Outfit } from "../runtime/wardrobe";
import { defaultLayout, type Layout } from "../worlds/xiyue";
export function Wardrobe({
  current,
  night,
  onChoose,
  onClose,
}: {
  current: Outfit;
  night: boolean;
  onChoose: (outfit: Outfit) => void;
  onClose: () => void;
}) {
  const ref = useDialogFocus();
  const [reason, setReason] = useState("整套换装 · 本地衣柜");
  return (
    <section
      ref={ref}
      className="home-panel wardrobe-panel"
      role="dialog"
      aria-modal="true"
      aria-label="溪月的衣柜"
    >
      <button onClick={onClose}>返回小屋 ×</button>
      <span className="eyebrow">XIYUE / WARDROBE</span>
      <h2>今天，穿哪一套？</h2>
      <p>当前穿着：{current.name}</p>
      <div className="outfit-list">
        {outfits.map((o) => (
          <button
            key={o.id}
            aria-pressed={o.id === current.id}
            onClick={() => {
              onChoose(o);
              setReason("已换上 " + o.name);
            }}
          >
            <span
              className="outfit-swatch"
              style={{
                background: o.coat,
                borderBottom: `18px solid ${o.pants}`,
              }}
            />
            {o.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          const o = chooseOutfit(current.id, night);
          onChoose(o);
          setReason(
            (night ? "晚上，想穿得舒服些。" : "今天先选轻松的日常装。") +
              " 已选择 " +
              o.name +
              "（本地规则演示）",
          );
        }}
      >
        让溪月自己挑
      </button>
      <p role="status">{reason}</p>
    </section>
  );
}
export function LayoutControls({
  layout,
  onApply,
  onClose,
}: {
  layout: Layout;
  onApply: (v: Layout) => string | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(layout),
    [status, setStatus] = useState("应用时检查通道，并让角色回到玄关。");
  return (
    <section className="home-panel" aria-label="家具布局验证">
      <button onClick={onClose}>关闭 ×</button>
      <h2>家具布局 · Demo</h2>
      {(["sofa", "coffee"] as const).map((id) => (
        <fieldset key={id}>
          <legend>{id === "sofa" ? "沙发" : "茶几"}</legend>
          {(["x", "z", "rotation"] as const).map((k) => (
            <label key={k}>
              {k === "rotation" ? "Y 旋转 °" : k.toUpperCase()}
              <input
                type="number"
                aria-label={`${id} ${k}`}
                step={k === "rotation" ? 5 : 0.1}
                value={Number(
                  (k === "rotation"
                    ? (draft[id][k] * 180) / Math.PI
                    : draft[id][k]
                  ).toFixed(2),
                )}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [id]: {
                      ...draft[id],
                      [k]:
                        Number(e.target.value) *
                        (k === "rotation" ? Math.PI / 180 : 1),
                    },
                  })
                }
              />
            </label>
          ))}
        </fieldset>
      ))}
      <button
        onClick={() => {
          const v = {
            sofa: { x: 1.1, z: -1.1, rotation: -Math.PI / 2 + 0.1 },
            coffee: { x: 0.1, z: 0.8, rotation: Math.PI / 2 },
          };
          setDraft(v);
          setStatus(onApply(v) ?? "两个家具已移动、旋转并保存");
        }}
      >
        演示：移动两个家具
      </button>
      <button
        onClick={() =>
          setStatus(onApply(draft) ?? "已保存独立布局；障碍已重建")
        }
      >
        应用并保存
      </button>
      <button
        onClick={() => {
          setDraft(defaultLayout);
          setStatus(onApply(defaultLayout) ?? "已恢复默认布局");
        }}
      >
        恢复默认布局
      </button>
      <p role="status">{status}</p>
    </section>
  );
}
