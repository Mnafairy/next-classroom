"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Expand,
  GitBranch,
  Pause,
  Minimize2,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  StepForward,
  Terminal,
  Variable,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { makeFlow, type FlowMode, type FlowNode } from "@/lib/python/flow";

const modes = [
  {
    id: "if",
    label: "if / else",
    caption: "Аль салаа ажиллах вэ?",
    icon: GitBranch,
  },
  {
    id: "for",
    label: "for давталт",
    caption: "Дарааллын утга бүрээр",
    icon: RotateCcw,
  },
  {
    id: "while",
    label: "while давталт",
    caption: "Нөхцөл үнэн байх хугацаанд",
    icon: RotateCcw,
  },
] as const;

function NodeShape({ node }: { node: FlowNode }) {
  const { x, y, w, h } = node;
  if (node.shape === "decision")
    return (
      <polygon
        points={`${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}`}
      />
    );
  if (node.shape === "output")
    return (
      <polygon
        points={`${x - w / 2 + 13},${y - h / 2} ${x + w / 2},${y - h / 2} ${x + w / 2 - 13},${y + h / 2} ${x - w / 2},${y + h / 2}`}
      />
    );
  return (
    <rect
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      rx={node.shape === "terminal" ? h / 2 : 7}
    />
  );
}

function FlowPlayer({ mode, value }: { mode: FlowMode; value: number }) {
  const lesson = useMemo(() => makeFlow(mode, value), [mode, value]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1700);
  const [showTrace, setShowTrace] = useState(false);
  const frame = lesson.frames[index];
  const last = index === lesson.frames.length - 1;
  const prefix = useId().replace(/:/g, "");
  const visited = new Set(
    lesson.frames.slice(0, index + 1).map((item) => item.node),
  );
  const incoming = lesson.edges.find((edge) => edge.id === frame.edge);
  const iterations = lesson.frames
    .slice(0, index + 1)
    .filter((item) => item.node === "body").length;

  useEffect(() => {
    if (!playing || last) return;
    const timer = setTimeout(() => setIndex((current) => current + 1), speed);
    return () => clearTimeout(timer);
  }, [playing, index, speed, last]);

  function play() {
    if (last) {
      setIndex(0);
      setPlaying(true);
    } else setPlaying((current) => !current);
  }

  return (
    <>
      <section className="py-flow-controls" aria-label="Хөдөлгөөний удирдлага">
        <div className="py-flow-transport">
          <button
            className="py-icon"
            title="Эхнээс нь"
            aria-label="Хөдөлгөөнийг эхнээс нь эхлэх"
            onClick={() => {
              setPlaying(false);
              setIndex(0);
            }}
          >
            <SkipBack size={18} />
          </button>
          <button
            className="py-icon"
            title="Өмнөх алхам"
            aria-label="Өмнөх алхам"
            disabled={index === 0}
            onClick={() => {
              setPlaying(false);
              setIndex((current) => current - 1);
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <button className="py-primary" onClick={play}>
            {playing && !last ? <Pause size={16} /> : <Play size={16} />}
            {playing && !last
              ? "Түр зогсоох"
              : last
                ? "Дахин тоглуулах"
                : "Тоглуулах"}
          </button>
          <button
            className="py-secondary"
            disabled={last}
            onClick={() => {
              setPlaying(false);
              setIndex((current) => current + 1);
            }}
          >
            <StepForward size={17} /> Алхмаар
          </button>
          <button
            className="py-icon"
            title="Төгсгөлд очих"
            aria-label="Төгсгөлд очих"
            disabled={last}
            onClick={() => {
              setPlaying(false);
              setIndex(lesson.frames.length - 1);
            }}
          >
            <SkipForward size={18} />
          </button>
        </div>
        <div className="py-flow-speed">
          <label htmlFor="flow-speed">Хурд</label>
          <select
            id="flow-speed"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          >
            <option value={2600}>Удаан</option>
            <option value={1700}>Дунд</option>
            <option value={850}>Хурдан</option>
          </select>
          <span>
            Алхам <strong>{index + 1}</strong> / {lesson.frames.length}
          </span>
        </div>
      </section>
      <div className="py-flow-layout">
        <div className="py-flow-left">
          <section className="py-flow-code">
            <div className="py-flow-card-heading">
              <span>
                <span className="py-file-symbol">Py</span> {mode}_example.py
              </span>
              <span className="py-flow-live">
                <span /> Одоогийн мөр
              </span>
            </div>
            <div
              className="py-flow-code-lines"
              role="region"
              aria-label="Алхамтай Python жишээ"
            >
              {lesson.code.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={frame.line === lineIndex + 1 ? "active" : ""}
                  aria-current={
                    frame.line === lineIndex + 1 ? "step" : undefined
                  }
                >
                  <span className="py-flow-line-marker">
                    {frame.line === lineIndex + 1 && <ChevronRight size={13} />}
                  </span>
                  <span className="py-flow-line-number">{lineIndex + 1}</span>
                  <code>{line}</code>
                </div>
              ))}
            </div>
            <div className="py-flow-code-footer">
              <CircleHelp size={14} /> Шарласан мөр яг одоо ажиллаж байна.
            </div>
          </section>
          <section className="py-flow-state">
            <div className="py-flow-card-heading">
              <span>
                <Variable size={16} /> Хувьсагч ба нөхцөл
              </span>
            </div>
            <div className="py-flow-state-grid">
              <div>
                <span>{lesson.variableName}</span>
                <strong key={`${index}-variable`}>{frame.variable}</strong>
              </div>
              <div>
                <span>
                  {mode === "if"
                    ? "battery <= 20"
                    : mode === "while"
                      ? "i <= n"
                      : "Дараагийн утга?"}
                </span>
                <strong
                  className={
                    frame.condition === null
                      ? "neutral"
                      : frame.condition
                        ? "true"
                        : "false"
                  }
                >
                  {frame.condition === null
                    ? "—"
                    : String(frame.condition === true ? "True" : "False")}
                </strong>
              </div>
              {mode !== "if" && (
                <div>
                  <span>print(i) ажилласан</span>
                  <strong>
                    {iterations}
                    <small> / {value}</small>
                  </strong>
                </div>
              )}
            </div>
          </section>
          <section className="py-flow-output">
            <div className="py-flow-card-heading">
              <span>
                <Terminal size={16} /> Гаралт
              </span>
              <span>{frame.output.length} мөр</span>
            </div>
            <pre aria-live="polite">
              {frame.output.length ? (
                frame.output.map((line, lineIndex) => (
                  <span
                    className={
                      lineIndex === frame.output.length - 1 ? "latest" : ""
                    }
                    key={`${lineIndex}-${line}`}
                  >
                    {line}
                    {"\n"}
                  </span>
                ))
              ) : (
                <span className="empty">Одоогоор print() ажиллаагүй.</span>
              )}
            </pre>
          </section>
          <div className="py-flow-teacher-tip">
            <BookOpen size={17} />
            <p>
              <strong>Түр зогсоогоод асуугаарай.</strong>
              {mode === "if"
                ? " «20 байх үед аль салаа ажиллах вэ? Яагаад хоёр салаа хоёулаа ажиллахгүй вэ?»"
                : mode === "for"
                  ? " «Дараагийн i хэд болох вэ? range-ийн төгсгөлийн утга яагаад орохгүй вэ?»"
                  : " «i += 1 мөрийг хасвал юу болох вэ? Сүүлийн шалгалтаар i хэд байх вэ?»"}
            </p>
          </div>
        </div>
        <section className="py-flow-diagram-card">
          <div className="py-flow-card-heading">
            <span>
              <GitBranch size={16} /> Үйлдлийн дараалал
            </span>
            <span className="py-flow-diagram-key">
              <span /> Одоо ажиллаж буй
            </span>
          </div>
          <div className="py-flow-diagram">
            <svg
              viewBox={`0 0 520 ${lesson.height}`}
              role="img"
              aria-label={`${lesson.title}. ${frame.message}`}
            >
              <title>{lesson.title}</title>
              <desc>
                Цэнхэр хүрээ одоогийн үйлдлийг, сум дагах цэг кодын шилжилтийг
                харуулна. Тийм эсвэл үгүй гэсэн салаагаар зам сонгоно.
              </desc>
              <defs>
                <marker
                  id={`${prefix}-arrow`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L10 5 L0 10 z" fill="#b7c6dc" />
                </marker>
                <marker
                  id={`${prefix}-active-arrow`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L10 5 L0 10 z" fill="#2458e6" />
                </marker>
              </defs>
              {lesson.edges.map((edge) => (
                <g key={edge.id}>
                  <path
                    data-edge={edge.id}
                    d={edge.path}
                    fill="none"
                    className={`py-flow-edge ${frame.edge === edge.id ? "active" : ""}`}
                    markerEnd={`url(#${prefix}-${frame.edge === edge.id ? "active-arrow" : "arrow"})`}
                  />
                  {edge.label && (
                    <text
                      x={edge.x}
                      y={edge.y}
                      textAnchor="middle"
                      className={`py-flow-branch ${edge.branch === true ? "true" : edge.branch === false ? "false" : ""}`}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              ))}
              {lesson.nodes.map((node) => (
                <g
                  key={node.id}
                  data-node={node.id}
                  className={`py-flow-node ${visited.has(node.id) ? "visited" : ""} ${frame.node === node.id ? "active" : ""} ${node.shape === "decision" ? "decision" : ""}`}
                >
                  <NodeShape node={node} />
                  <text
                    x={node.x}
                    y={node.y - (node.label.length - 1) * 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {node.label.map((line, lineIndex) => (
                      <tspan
                        key={lineIndex}
                        x={node.x}
                        dy={lineIndex === 0 ? 0 : 17}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                  {frame.node === node.id && (
                    <circle
                      className="py-flow-active-indicator"
                      cx={
                        node.x +
                        node.w / 2 -
                        (node.shape === "decision" ? 24 : 7)
                      }
                      cy={
                        node.y -
                        node.h / 2 +
                        (node.shape === "decision" ? 40 : 5)
                      }
                      r="4"
                    />
                  )}
                </g>
              ))}
              {incoming && (
                <circle
                  key={`${mode}-${value}-${index}`}
                  className="py-flow-traveler"
                  r="5"
                  fill="#2458e6"
                  stroke="white"
                  strokeWidth="2"
                >
                  <animateMotion
                    path={incoming.path}
                    dur={`${Math.min(800, speed * 0.45)}ms`}
                    fill="freeze"
                  />
                </circle>
              )}
            </svg>
          </div>
          <div className="py-flow-legend">
            <span>
              <i className="terminal" /> Эхлэх / дуусах
            </span>
            <span>
              <i className="decision" /> Нөхцөл
            </span>
            <span>
              <i className="output" /> Хэвлэх
            </span>
            <span>
              <ArrowDown size={13} /> Кодын урсгал
            </span>
          </div>
        </section>
      </div>
      <section
        className="py-flow-current"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="py-flow-step-badge">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <span>
            {last
              ? "ДУУСЛАА"
              : frame.line
                ? `КОДЫН ${frame.line}-Р МӨР`
                : "ЭХЛЭЛ"}
          </span>
          <p>{frame.message}</p>
        </div>
        {last && <Check size={22} />}
      </section>
      <div className="py-flow-scrubber">
        <label htmlFor="flow-step">Алхам сонгох</label>
        <input
          id="flow-step"
          type="range"
          min={0}
          max={lesson.frames.length - 1}
          value={index}
          onChange={(event) => {
            setPlaying(false);
            setIndex(Number(event.target.value));
          }}
        />
        <span>
          {index + 1} / {lesson.frames.length}
        </span>
      </div>
      <button
        className="py-text-button py-flow-trace-toggle"
        aria-expanded={showTrace}
        onClick={() => setShowTrace((current) => !current)}
      >
        <Terminal size={15} />{" "}
        {showTrace ? "Алхмын хүснэгт нуух" : "Алхмын хүснэгт харах"}{" "}
        <ChevronRight size={15} />
      </button>
      {showTrace && (
        <div className="py-flow-trace">
          <table>
            <caption>Эхлэлээс одоогийн алхам хүртэлх утгууд</caption>
            <thead>
              <tr>
                <th>Алхам</th>
                <th>Кодын мөр</th>
                <th>{lesson.variableName}</th>
                <th>Нөхцөл</th>
                <th>Гаралт</th>
              </tr>
            </thead>
            <tbody>
              {lesson.frames.slice(0, index + 1).map((item, frameIndex) => (
                <tr
                  key={frameIndex}
                  className={frameIndex === index ? "active" : ""}
                >
                  <td>{frameIndex + 1}</td>
                  <td>{item.line || "—"}</td>
                  <td>{item.variable}</td>
                  <td>
                    {item.condition === null
                      ? "—"
                      : item.condition
                        ? "True"
                        : "False"}
                  </td>
                  <td>{item.output.join(" · ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FlowInputs({
  mode,
  value,
  onValue,
}: {
  mode: FlowMode;
  value: number;
  onValue: (value: number) => void;
}) {
  return (
    <div className="py-flow-inputs">
      <div>
        <label htmlFor="flow-value">
          {mode === "if" ? "Батерейны цэнэг" : "Давтах тоо"}
          <code>
            {mode === "if" ? "battery" : "n"} = {value}
          </code>
        </label>
        <input
          id="flow-value"
          type="range"
          min={mode === "if" ? 0 : 1}
          max={mode === "if" ? 100 : 6}
          value={value}
          onChange={(event) => onValue(Number(event.target.value))}
        />
      </div>
      <div>
        <strong>Өөр утгаар туршаарай</strong>
        <p>
          {mode === "if"
            ? "Яг 20 болон 21-ийг харьцуулаад зам яаж өөрчлөгдөхийг хараарай."
            : "n-ийг өөрчлөөд хэдэн удаа хэвлэх, хэдэн удаа шалгахыг таагаарай."}
        </p>
        <div>
          {(mode === "if" ? [15, 20, 21, 80] : [1, 3, 5, 6]).map((number) => (
            <button
              key={number}
              className={value === number ? "active" : ""}
              onClick={() => onValue(number)}
            >
              {number}
              {mode === "if" ? "%" : ""}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FlowVisualizer({
  initialMode = "for",
  onExercise,
}: {
  initialMode?: FlowMode;
  onExercise: (id: string) => void;
}) {
  const [mode, setMode] = useState<FlowMode>(initialMode);
  const [value, setValue] = useState(initialMode === "if" ? 15 : 3);
  const [presenting, setPresenting] = useState(false);
  useEffect(() => {
    if (!presenting) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [
      ...document.querySelectorAll<HTMLElement>(
        ".py-header, .py-sidebar, .py-app-bottom, .skip-link",
      ),
    ];
    background.forEach((element) => {
      element.inert = true;
    });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPresenting(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => {
        element.inert = false;
      });
      window.removeEventListener("keydown", escape);
    };
  }, [presenting]);
  function choose(next: FlowMode) {
    setMode(next);
    setValue(next === "if" ? 15 : 3);
  }
  return (
    <main
      id="main-content"
      className={`py-main py-flow-page ${presenting ? "py-presenting" : ""}`}
    >
      <div className="py-page-title">
        <div>
          <div className="py-eyebrow">КОД АЛХАМ БҮРД ЮУ ХИЙДЭГ ВЭ?</div>
          <h1>Кодын урсгалыг харъя.</h1>
          <p className="py-subtitle">
            Кодын мөр, үйлдлийн дараалал, хувьсагч, гаралт — бүгд нэг хэмнэлээр.
          </p>
        </div>
        <button
          className="py-secondary py-presentation-button"
          aria-pressed={presenting}
          onClick={() => setPresenting((current) => !current)}
        >
          {presenting ? <Minimize2 size={15} /> : <Expand size={15} />}
          {presenting ? "Энгийн харагдац" : "Том дэлгэц"}
        </button>
      </div>
      <div
        className="py-flow-mode-tabs"
        role="tablist"
        aria-label="Тайлбарлах бүтэц"
      >
        {modes.map(({ id, label, caption, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            className={mode === id ? "active" : ""}
            onClick={() => choose(id)}
          >
            <span>
              <Icon size={19} />
            </span>
            <span>
              <strong>{label}</strong>
              <small>{caption}</small>
            </span>
            {mode === id && <Check size={16} />}
          </button>
        ))}
      </div>
      <FlowPlayer key={`${mode}-${value}`} mode={mode} value={value} />
      <FlowInputs mode={mode} value={value} onValue={setValue} />
      <div className="py-flow-practice">
        <span>
          <strong>Одоо өөрөө бичээд үзье.</strong> Харсан зүйлээ дасгал дээр
          хэрэглээрэй.
        </span>
        <button
          className="py-primary"
          onClick={() =>
            onExercise(
              mode === "if"
                ? "battery"
                : mode === "for"
                  ? "for-intro"
                  : "while-count",
            )
          }
        >
          Дасгал руу очих <ArrowRight size={16} />
        </button>
      </div>
    </main>
  );
}
