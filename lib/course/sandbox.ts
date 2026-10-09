import type { Exercise, Files } from "./types";
import { CARD } from "./lessons";

export const cardProbeProps = [
  {
    title: "Fresh card",
    description: "A new description.",
    buttonLabel: "Try this",
    color: "red",
  },
  {
    title: "Another card",
    description: "Different content.",
    buttonLabel: "Keep learning",
    color: "green",
  },
];

export function runnerCode(
  runId: string,
  hasCard = false,
  exercise?: Exercise,
) {
  return `import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import Home from "./app/page";
import Button from "./app/components/Button";
${hasCard ? 'import Card from "./app/components/Card";' : ""}
import "./preview.css";

const runId = ${JSON.stringify(runId)};
const send = (data) => window.parent.postMessage({ type: "next-classroom-result", runId, ...data }, "*");
let probing = true;
const alerts = [];
window.alert = (message) => {
  alerts.push(String(message));
  if (!probing) {
    let feedback = document.getElementById("preview-alert");
    if (!feedback) {
      feedback = document.createElement("p");
      feedback.id = "preview-alert";
      feedback.setAttribute("role", "status");
      document.body.appendChild(feedback);
    }
    feedback.textContent = String(message);
  }
};
window.addEventListener("error", (event) => send({ error: event.message, buttons: [], probes: [] }));
window.addEventListener("unhandledrejection", (event) => send({ error: String(event.reason), buttons: [], probes: [] }));
class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error: error.message }; }
  componentDidCatch(error) { send({ error: error.message, buttons: [], probes: [] }); }
  render() { return this.state.error ? <pre role="alert">{this.state.error}</pre> : this.props.children; }
}
const root = document.getElementById("root");
flushSync(() => createRoot(root).render(<Boundary><Home /></Boundary>));
const snapshot = (container) => Array.from(container.querySelectorAll("button")).map((button) => ({
  text: button.textContent.trim(), background: getComputedStyle(button).backgroundColor,
  color: getComputedStyle(button).color, padding: getComputedStyle(button).padding,
}));
const buttons = snapshot(root);
const interactionSnapshot = (container) => ({ alerts: [...alerts], text: Array.from(container.querySelectorAll("p")).map((p) => p.textContent.trim()).join("\\n"), buttons: snapshot(container) });
const initialInteraction = interactionSnapshot(root);
${
  hasCard
    ? `const cardSnapshot = (container) => Array.from(container.querySelectorAll("article")).map((card) => ({
  title: card.querySelector("h2")?.textContent.trim() ?? "",
  description: card.querySelector("p")?.textContent.trim() ?? "",
  buttons: snapshot(card),
}));
const cards = cardSnapshot(root);`
    : ""
}
const probe = document.createElement("div");
probe.style.display = "none";
document.body.appendChild(probe);
const probeRoot = createRoot(probe);
const probes = [];
const buttonClickCalls = [];
for (const props of [
  { label: "A fresh label", color: "blue" },
  { label: "Another label", color: "red" },
  { label: "A third label", color: "green" },
]) {
  let calls = 0;
  const onClick = () => { calls++; };
  flushSync(() => probeRoot.render(<Boundary><Button {...props} onClick={onClick} /></Boundary>));
  probes.push(snapshot(probe));
  const beforeClick = calls;
  flushSync(() => probe.querySelector("button")?.click());
  buttonClickCalls.push(beforeClick === 0 ? calls : -1);
}
${
  hasCard
    ? `const cardProbes = [];
const cardClickCalls = [];
for (const props of ${JSON.stringify(cardProbeProps)}) {
  let calls = 0;
  const onClick = () => { calls++; };
  flushSync(() => probeRoot.render(<Boundary><Card {...props} onClick={onClick} /></Boundary>));
  cardProbes.push(cardSnapshot(probe));
  const beforeClick = calls;
  flushSync(() => probe.querySelector("button")?.click());
  cardClickCalls.push(beforeClick === 0 ? calls : -1);
}`
    : ""
}
const interactions = [];
${
  exercise?.interactions
    ? `flushSync(() => probeRoot.unmount());
const actionRoot = createRoot(probe);
alerts.length = 0;
flushSync(() => actionRoot.render(<Boundary><Home /></Boundary>));
initialInteraction.alerts.push(...alerts);
for (const step of ${JSON.stringify(exercise.interactions.map(({ button }) => ({ button })))}) {
  alerts.length = 0;
  flushSync(() => probe.querySelectorAll("button")[step.button]?.click());
  interactions.push(interactionSnapshot(probe));
}
flushSync(() => actionRoot.unmount());`
    : "flushSync(() => probeRoot.unmount());"
}
probe.remove();
probing = false;
alerts.length = 0;
send({ buttons, probes, initialInteraction, interactions, buttonClickCalls${hasCard ? ", cards, cardProbes, cardClickCalls" : ""} });
`;
}
export function sandboxFiles(files: Files, exercise?: Exercise) {
  return {
    ...Object.fromEntries(
      Object.entries(files).map(([path, code]) => [path, { code }]),
    ),
    "/App.tsx": {
      code: "export default function App() { return null; }",
      hidden: true,
    },
    "/index.tsx": {
      code: runnerCode("initial", CARD in files, exercise),
      hidden: true,
    },
    "/preview.css": {
      code: `* { box-sizing: border-box; } body { margin: 0; padding: 34px 24px; background: #fff; color: #172033; font-family: system-ui, sans-serif; } main { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 14px; } section > button + button { margin-left: 12px; } article h2 { margin: 0 0 12px; font-size: 22px; } article p { margin: 0 0 20px; line-height: 1.5; } button { cursor: pointer; } #preview-alert { padding: 12px; border: 1px solid #c4b5fd; border-radius: 8px; background: #f5f3ff; font-size: 14px; text-align: center; } pre { white-space: pre-wrap; color: #b42318; }`,
      hidden: true,
    },
  };
}
