import { Home, Leaf, X } from "lucide-react";
import { useDialogFocus } from "./useDialogFocus";
export function About({ onClose }: { onClose: () => void }) {
  const focus = useDialogFocus();
  return (
    <div className="about-backdrop" onClick={onClose}>
      <section
        ref={focus}
        className="about-card"
        role="dialog"
        aria-modal="true"
        aria-label="关于 Habitat"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-button about-close"
          aria-label="关闭关于"
          onClick={onClose}
        >
          <X size={19} />
        </button>
        <div className="brand-mark">
          <Home size={25} />
        </div>
        <span className="eyebrow">MR HABITAT / EARLY EXPLORATION</span>
        <h2>
          一个可以安静
          <br />
          待在一起的地方。
        </h2>
        <p>聊天发生在别处。这里让 Agent 的状态和活动，成为房间里可见的日常。</p>
        <p>
          当前是独立视觉原型：角色、事件与物件信息均为演示。环境行为只是动画，不代表真实思考、喜好或记忆。
        </p>
        <div className="about-bottom">
          <Leaf size={16} />
          只读投影 · 无 MR 连接 · 无认知写入
        </div>
      </section>
    </div>
  );
}
