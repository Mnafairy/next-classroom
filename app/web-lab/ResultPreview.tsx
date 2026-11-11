import { useEffect, useRef } from "react";

function fitContent(frame: HTMLIFrameElement) {
  const preview = frame.contentDocument;
  if (!preview || preview.readyState !== "complete") return;

  // Measure from the CSS height so a narrower or shorter result can shrink.
  frame.style.removeProperty("height");
  frame.style.height = `${preview.documentElement.scrollHeight}px`;
}

export default function ResultPreview({
  html,
  visible,
  onLoad,
}: {
  html: string;
  visible: boolean;
  onLoad: (frame: HTMLIFrameElement) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;

    let width: number | undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      fitContent(frame);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <iframe
      ref={ref}
      title="Кодын үр дүн"
      sandbox="allow-same-origin"
      tabIndex={visible ? 0 : -1}
      srcDoc={html}
      onLoad={(event) => {
        fitContent(event.currentTarget);
        onLoad(event.currentTarget);
      }}
    />
  );
}
