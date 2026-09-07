import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Expand,
  Home,
  Leaf,
  Minus,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import { acceptEvent, ambientAt, selectActivity } from "./runtime/semantic";
import type { Activity, PresenceEvent } from "./runtime/semantic";
import { characters } from "./assets/catalog";
import { About } from "./ui/About";
import { observations, studio } from "./worlds/studio";
import type { ObjectId } from "./worlds/studio";
const HabitatScene = lazy(() => import("./scene/HabitatScene"));

class SceneBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Habitat scene failed", error, info.componentStack);
  }
  render() {
    return this.state.error ? (
      <div className="load-state">
        <Home />
        <h2>小屋暂时没有打开</h2>
        <p>请确认浏览器支持 WebGL 2，再重新载入。</p>
        <button onClick={() => location.reload()}>重新载入</button>
      </div>
    ) : (
      this.props.children
    );
  }
}

const activityNames: Record<Activity, string> = {
  idle: "自在闲逛",
  reading: "安静阅读",
  working: "专注工作",
  thinking: "窗边片刻",
  resting: "稍作休息",
  sleeping: "小憩一会儿",
};
const events: { activity: Activity; label: string; speech: string }[] = [
  {
    activity: "working",
    label: "开始工作",
    speech: "收到一个新问题。我先把手边的材料整理一下。",
  },
  {
    activity: "thinking",
    label: "一个新想法",
    speech: "也许，安静地待在一起，本身就是一种陪伴。",
  },
  {
    activity: "reading",
    label: "翻阅材料",
    speech: "我想再翻翻之前留下的笔记。",
  },
  {
    activity: "sleeping",
    label: "暂时休息",
    speech: "告一段落了。让我在这里歇一小会儿。",
  },
];

function ObjectCard({ id, onClose }: { id: ObjectId; onClose: () => void }) {
  const data = observations[id];
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    close.current?.focus();
    return () => {
      requestAnimationFrame(() => {
        if (before?.isConnected) before.focus();
      });
    };
  }, [id]);
  return (
    <aside
      className="object-card"
      role="dialog"
      aria-label={data.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="card-top">
        <span className="eyebrow">{data.kicker}</span>
        <button
          ref={close}
          className="icon-button"
          aria-label="关闭信息"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
      <div className="card-symbol">
        <BookOpen size={25} strokeWidth={1.2} />
      </div>
      <h2>{data.title}</h2>
      <p className="card-intro">{data.intro}</p>
      <div className="card-entries">
        {data.entries.map((entry) => (
          <article key={entry.title}>
            <span className="entry-tag">{entry.tag}</span>
            <h3>{entry.title}</h3>
            <p>{entry.text}</p>
          </article>
        ))}
      </div>
      <div className="card-footer">
        <span>{data.updated}</span>
        <span>只读投影</span>
      </div>
      <p className="projection-note">
        这里是示例信息的空间投影。小屋中的行为不会生成记忆，也不会修改 Mind
        Runtime。
      </p>
    </aside>
  );
}

export default function App() {
  const [night, setNight] = useState(false),
    [autumn, setAutumn] = useState(false),
    [assetIndex, setAssetIndex] = useState(0);
  const [paused, setPaused] = useState(false),
    [hidden, setHidden] = useState(document.hidden),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const [elapsed, setElapsed] = useState(0),
    [now, setNow] = useState(Date.now());
  const [event, setEvent] = useState<PresenceEvent | null>(null);
  const [selected, setSelected] = useState<ObjectId | null>(null),
    [settings, setSettings] = useState(false),
    [demo, setDemo] = useState(false),
    [about, setAbout] = useState(false);
  const [showLabels, setShowLabels] = useState(true),
    [reset, setReset] = useState(0),
    [zoom, setZoom] = useState(1),
    [moving, setMoving] = useState(false),
    [blocked, setBlocked] = useState(false);
  const [autoEvents, setAutoEvents] = useState(true);
  const firstEvent = useRef(false);
  const seq = useRef(0);
  const asset = characters[assetIndex];
  const simulationPaused = paused || hidden;
  const motion = useCallback((walk: boolean, stuck: boolean) => {
    setMoving(walk);
    setBlocked(stuck);
  }, []);
  useEffect(() => {
    const fn = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      if (!simulationPaused) setElapsed((t) => t + 0.25);
    }, 250);
    return () => clearInterval(timer);
  }, [simulationPaused]);
  const inject = useCallback((index: number) => {
    firstEvent.current = true;
    const time = Date.now();
    const input = {
      ...events[index],
      id: `demo-${++seq.current}`,
      agentId: "agent-demo",
      observedAt: time,
      expiresAt: time + 35000,
    };
    setEvent(acceptEvent(input, time, "agent-demo"));
    setNow(time);
  }, []);
  useEffect(() => {
    if (autoEvents && !firstEvent.current && elapsed >= 12) {
      firstEvent.current = true;
      inject(0);
    }
  }, [elapsed, autoEvents, inject]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setSettings(false);
        setDemo(false);
        setAbout(false);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const projection = selectActivity(event, now, ambientAt(elapsed));
  const speech =
    event && now < Math.min(event.expiresAt, event.observedAt + 8500)
      ? (event.speech ?? null)
      : null;
  const [full, setFull] = useState(false);
  useEffect(() => {
    const listener = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setAbout(true);
    }
  }
  return (
    <main
      className={`habitat ${night ? "night" : ""} ${selected ? "has-card" : ""}`}
    >
      <header className="topbar">
        <a className="brand" href="./" aria-label="MR Habitat 首页">
          <span className="brand-mark">
            <Home size={20} strokeWidth={1.45} />
          </span>
          <span>
            habitat<span className="brand-by">by Mind Runtime</span>
          </span>
        </a>
        <div className="top-center">
          <span className="live-dot" />
          一个 Agent 的日常
        </div>
        <div className="top-actions">
          <span className="demo-badge">LOCAL DEMO</span>
          <button
            className="icon-button"
            aria-label="关于 Habitat"
            onClick={() => setAbout(!about)}
          >
            <CircleHelp size={19} />
          </button>
        </div>
      </header>
      <section className="world-heading">
        <span className="eyebrow">A LITTLE PLACE TO BE</span>
        <h1>
          让日常，
          <br />
          有个栖身之处<span>。</span>
        </h1>
        <p>{studio.subtitle}</p>
        <button
          className={`world-selector ${settings ? "active" : ""}`}
          onClick={() => {
            setSettings(!settings);
            setDemo(false);
          }}
          aria-expanded={settings}
        >
          <Home size={15} />
          {studio.name}
          <span className="selector-divider" />
          01
          <ChevronDown size={14} />
        </button>
      </section>
      <section
        className="room-canvas"
        aria-label="可交互的三维小屋，拖动旋转，滚轮缩放"
      >
        <SceneBoundary>
          <Suspense
            fallback={
              <div className="load-state">
                <Home size={32} />
                <p>正在打开小屋…</p>
              </div>
            }
          >
            <HabitatScene
              night={night}
              autumn={autumn}
              paused={simulationPaused}
              reduced={reduced}
              activity={projection.activity}
              asset={asset}
              speech={speech}
              showLabels={showLabels}
              onSelect={setSelected}
              onMotion={motion}
              reset={reset}
              zoom={zoom}
            />
          </Suspense>
        </SceneBoundary>
      </section>
      <div className="time-note">
        <span className="time-icon">
          {night ? <Moon size={19} /> : <Sun size={21} />}
        </span>
        <div>
          <span>{night ? "灯火可亲" : "午后，日光正好"}</span>
          <small>
            {night ? "EVENING IN THE HABITAT" : "A QUIET AFTERNOON"}
          </small>
        </div>
      </div>
      <div className="room-caption">
        <span>THE PAPERWOOD STUDIO</span>
        <div className="caption-line" />
        <span>01 / 一个正在发生的日常</span>
      </div>
      <div className="agent-card">
        <div className="agent-avatar" style={{ background: asset.coat }}>
          <span className="avatar-hair" style={{ background: asset.hair }} />
          <span className="avatar-face" style={{ background: asset.skin }}>
            ··
          </span>
          <i />
        </div>
        <div className="agent-details">
          <div className="agent-name">
            {asset.name}
            <span>在小屋里</span>
          </div>
          <div className="agent-state" aria-live="polite">
            <span className={`live-dot ${paused ? "paused-dot" : ""}`} />
            {paused
              ? "画面已暂停"
              : blocked
                ? "暂时无法到达"
                : moving
                  ? "正慢慢走过去"
                  : activityNames[projection.activity]}
          </div>
        </div>
        <div
          className="agent-source"
          title="Ambient 行为仅为视觉表现；Mock 为外部语义事件示例"
        >
          {projection.source === "ambient" ? (
            <Leaf size={14} />
          ) : (
            <Radio size={14} />
          )}
          <span>
            {projection.source === "ambient" ? "日常片刻" : "模拟事件"}
          </span>
        </div>
      </div>
      <nav className="scene-controls" aria-label="小屋视图控制">
        <div className="control-group">
          <button
            className={`icon-button ${!night ? "selected" : ""}`}
            title="午后"
            aria-label="切换午后"
            aria-pressed={!night}
            onClick={() => setNight(false)}
          >
            <Sun size={18} />
          </button>
          <button
            className={`icon-button ${night ? "selected" : ""}`}
            title="夜晚"
            aria-label="切换夜晚"
            aria-pressed={night}
            onClick={() => setNight(true)}
          >
            <Moon size={17} />
          </button>
        </div>
        <span className="toolbar-divider" />
        <button
          className="icon-button"
          title={paused ? "继续活动" : "暂停活动"}
          aria-label={paused ? "继续活动" : "暂停活动"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={17} /> : <Pause size={17} />}
        </button>
        <span className="toolbar-divider" />
        <button
          className="icon-button zoom-control"
          aria-label="缩小"
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.12))}
        >
          <Minus size={17} />
        </button>
        <button
          className="icon-button zoom-control"
          aria-label="放大"
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.12))}
        >
          <Plus size={17} />
        </button>
        <button
          className="icon-button"
          aria-label="重置视角"
          title="重置视角"
          onClick={() => {
            setReset((r) => r + 1);
            setZoom(1);
          }}
        >
          <RotateCcw size={16} />
        </button>
        <button
          className="icon-button"
          aria-label={full ? "退出全屏" : "全屏"}
          title="全屏"
          onClick={fullscreen}
        >
          <Expand size={17} />
        </button>
        <span className="toolbar-divider" />
        <button
          className={`icon-button ${demo ? "selected" : ""}`}
          aria-label="模拟外部事件"
          title="模拟外部事件"
          aria-expanded={demo}
          onClick={() => {
            setDemo(!demo);
            setSettings(false);
          }}
        >
          <MoreHorizontal size={20} />
        </button>
      </nav>
      <footer className="footer">
        <span>
          <span className="tiny-dot" />
          只是来看看，也很好。
        </span>
        <span className="interaction-hint">
          拖动环绕 <span>·</span> 滚轮缩放 <span>·</span> 点击物件探索{" "}
          <ArrowDownRight size={13} />
        </span>
        <span className="footer-version">PRESENCE, NOT A CHAT.</span>
      </footer>
      {selected && (
        <ObjectCard id={selected} onClose={() => setSelected(null)} />
      )}
      {settings && (
        <section className="settings-popover" aria-label="小屋设置">
          <div className="card-top">
            <span className="eyebrow">MAKE YOURSELF AT HOME</span>
            <button
              className="icon-button"
              aria-label="关闭设置"
              onClick={() => setSettings(false)}
            >
              <X size={16} />
            </button>
          </div>
          <h2>小屋的样子</h2>
          <label>室内配色</label>
          <div className="choice-row">
            <button
              className={!autumn ? "chosen" : ""}
              onClick={() => setAutumn(false)}
            >
              <i style={{ background: "#8e9b7e" }} />
              鼠尾草{!autumn && <Check size={13} />}
            </button>
            <button
              className={autumn ? "chosen" : ""}
              onClick={() => setAutumn(true)}
            >
              <i style={{ background: "#b08c70" }} />
              秋日木色{autumn && <Check size={13} />}
            </button>
          </div>
          <label>演示角色</label>
          <div className="choice-row">
            {characters.map((c, i) => (
              <button
                className={assetIndex === i ? "chosen" : ""}
                key={c.id}
                onClick={() => setAssetIndex(i)}
              >
                <i style={{ background: c.coat }} />
                {c.name}
                {assetIndex === i && <Check size={13} />}
              </button>
            ))}
          </div>
          <label className="switch-row">
            显示物件标记
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
          </label>
          <label className="switch-row">
            减少循环动作
            <input
              type="checkbox"
              checked={reduced}
              onChange={(e) => setReduced(e.target.checked)}
            />
          </label>
          <p>所有设置只影响这间小屋的视觉表现。</p>
        </section>
      )}
      {demo && (
        <section className="demo-popover" aria-label="模拟事件面板">
          <div className="card-top">
            <span className="eyebrow">A WINDOW TO THE OUTSIDE</span>
            <button
              className="icon-button"
              aria-label="关闭事件面板"
              onClick={() => setDemo(false)}
            >
              <X size={16} />
            </button>
          </div>
          <h2>让外面发生一点事</h2>
          <p>模拟一条外部语义状态，看看小屋如何回应。</p>
          <div className="event-grid">
            {events.map((e, i) => (
              <button key={e.activity} onClick={() => inject(i)}>
                {e.label}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
          <button
            className="quiet-link"
            onClick={() => {
              setEvent(null);
              setAutoEvents(false);
              firstEvent.current = true;
            }}
          >
            回到自然日常 <Leaf size={13} />
          </button>
          <small>MOCK ONLY · 35 秒后回归日常 · 未连接 MR</small>
        </section>
      )}
      {about && <About onClose={() => setAbout(false)} />}
    </main>
  );
}
