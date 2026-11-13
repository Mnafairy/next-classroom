"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, Pause, RotateCcw, SkipForward, ChevronLeft } from "lucide-react";
import { curriculumFlow } from "@/lib/curriculum/flow";
import type { FlowMode } from "@/lib/python/flow";
import styles from "../workbench.module.css";

export default function FlowLab({
  initialMode = "if",
  language = "javascript",
}: {
  initialMode?: FlowMode;
  language?: "javascript" | "python";
}) {
  const [mode, setMode] = useState(initialMode);
  const [value, setValue] = useState(initialMode === "if" ? 15 : 3);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const reduced = useReducedMotion();
  const id = useId();
  const flow = curriculumFlow(mode, value, language);
  const frame = flow.frames[step];
  const last = step === flow.frames.length - 1;
  useEffect(() => {
    if (!playing || last) return;
    const timer = setTimeout(() => setStep((current) => current + 1), speed);
    return () => clearTimeout(timer);
  }, [playing, last, step, speed]);
  function reset() {
    setPlaying(false);
    setStep(0);
  }
  return (
    <section
      className={styles.flowLab}
      id="flow-lab"
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.labHeading}>
        <div>
          <span className={styles.eyebrow}>ХАРААД ОЙЛГО · ӨӨРЧЛӨӨД ТУРШ</span>
          <h2 id={`${id}-title`}>Код аль замаар явах вэ?</h2>
          <p>Утгаа сонгоод дараагийн алхмыг таа. Дараа нь ажиллуулж шалга.</p>
        </div>
        <span className={styles.language}>
          {language === "python" ? "Python" : "JavaScript"}
        </span>
      </div>
      <div className={styles.labTools}>
        <div className={styles.modeButtons} aria-label="Урсгал сонгох">
          {(["if", "for", "while"] as const).map((option) => (
            <button
              key={option}
              aria-pressed={mode === option}
              onClick={() => {
                reset();
                setMode(option);
                setValue(option === "if" ? 15 : 3);
              }}
            >
              {option === "if" ? "if / else" : option}
            </button>
          ))}
        </div>
        <label className={styles.valueControl}>
          {mode === "if" ? "Цэнэг" : "Давтах тоо"}{" "}
          <input
            aria-label={mode === "if" ? "Цэнэг" : "Давтах тоо"}
            type="range"
            min="0"
            max={mode === "if" ? 100 : 6}
            value={value}
            onChange={(event) => {
              reset();
              setValue(Number(event.target.value));
            }}
          />
          <strong>
            {value}
            {mode === "if" ? "%" : ""}
          </strong>
        </label>
      </div>
      <div className={styles.simulation}>
        <div className={styles.codePane}>
          <div className={styles.fileBar}>
            <span>
              {mode === "if" ? "battery" : "count"}.
              {language === "python" ? "py" : "js"}
            </span>
            <span>КОД</span>
          </div>
          <pre tabIndex={0} aria-label="Ажиллах код">
            {flow.code.map((line, index) => (
              <div key={index} data-active={frame.line === index + 1}>
                <span>{index + 1}</span>
                <code>{line || " "}</code>
              </div>
            ))}
          </pre>
          <div className={styles.variable}>
            <span>ХУВЬСАГЧ</span>
            <code>
              {flow.variableName} ={" "}
              <motion.strong
                key={`${step}-${frame.variable}`}
                initial={{ opacity: reduced ? 1 : 0.3 }}
                animate={{ opacity: 1 }}
              >
                {frame.variable}
              </motion.strong>
            </code>
          </div>
          <div className={styles.console}>
            <span>ГАРАЛТ</span>
            <pre>
              {frame.output.length
                ? frame.output.join("\n")
                : "Одоогоор гаралт алга"}
            </pre>
          </div>
        </div>
        <div className={styles.diagram}>
          <span className={styles.diagramLabel}>ПРОГРАММЫН УРСГАЛ</span>
          <svg
            viewBox={`0 0 520 ${flow.height}`}
            role="img"
            aria-label={`${flow.title}. ${frame.message}`}
          >
            <defs>
              <marker
                id={`${id}-arrow`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10z" fill="#8a9bb5" />
              </marker>
            </defs>
            {flow.edges.map((edge) => (
              <g key={edge.id}>
                <path
                  d={edge.path}
                  fill="none"
                  stroke="#bdcbdc"
                  strokeWidth="2"
                  markerEnd={`url(#${id}-arrow)`}
                />
                {frame.edge === edge.id && (
                  <motion.path
                    key={`${edge.id}-${step}`}
                    d={edge.path}
                    fill="none"
                    stroke="#3159ef"
                    strokeWidth="4"
                    initial={{ pathLength: reduced ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduced ? 0 : 0.4 }}
                  />
                )}{" "}
                {edge.label && (
                  <text
                    x={edge.x}
                    y={edge.y}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#52647d"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            ))}
            {flow.nodes.map((node) => (
              <g
                key={node.id}
                data-active={frame.node === node.id}
                className={styles.flowNode}
              >
                {node.shape === "decision" ? (
                  <polygon
                    points={`${node.x},${node.y - node.h / 2} ${node.x + node.w / 2},${node.y} ${node.x},${node.y + node.h / 2} ${node.x - node.w / 2},${node.y}`}
                  />
                ) : (
                  <rect
                    x={node.x - node.w / 2}
                    y={node.y - node.h / 2}
                    width={node.w}
                    height={node.h}
                    rx={node.shape === "terminal" ? 22 : 8}
                  />
                )}
                <text
                  x={node.x}
                  y={node.y - (node.label.length - 1) * 8 + 5}
                  textAnchor="middle"
                  fontSize="14"
                >
                  {node.label.map((line, index) => (
                    <tspan key={line} x={node.x} dy={index ? 17 : 0}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div
        className={styles.explanation}
        aria-live={playing && !last ? "off" : "polite"}
      >
        <span>
          {String(step + 1).padStart(2, "0")} / {flow.frames.length}
        </span>
        <p>{frame.message}</p>
      </div>
      <div className={styles.playback}>
        <button
          className={styles.playButton}
          onClick={() => {
            if (last) setStep(0);
            setPlaying(!playing || last);
          }}
        >
          {playing && !last ? <Pause size={17} /> : <Play size={17} />}{" "}
          {playing && !last
            ? "Түр зогсоох"
            : last
              ? "Дахин үзэх"
              : "Ажиллуулах"}
        </button>
        <button
          aria-label="Өмнөх алхам"
          disabled={step === 0}
          onClick={() => {
            setPlaying(false);
            setStep(step - 1);
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          disabled={last}
          onClick={() => {
            setPlaying(false);
            setStep(step + 1);
          }}
        >
          <SkipForward size={17} /> Алхах
        </button>
        <button aria-label="Эхнээс нь" onClick={reset}>
          <RotateCcw size={17} />
        </button>
        <label>
          Хурд{" "}
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          >
            <option value={1600}>0.5×</option>
            <option value={1000}>1×</option>
            <option value={550}>2×</option>
          </select>
        </label>
      </div>
    </section>
  );
}
