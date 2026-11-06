"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const changeEvent = "kodlab-practice-draft";
function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
function read(key: string | null) {
  try {
    return key ? sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

export function useSessionDraft<T>(
  key: string | null,
  fallback: T,
  restore: (raw: unknown) => T | null,
) {
  const snapshot = useSyncExternalStore(
    subscribe,
    useCallback(() => read(key), [key]),
    () => null,
  );
  const saved = useMemo(() => {
    try {
      return snapshot ? (restore(JSON.parse(snapshot)) ?? fallback) : fallback;
    } catch {
      return fallback;
    }
  }, [snapshot, fallback, restore]);
  const [memory, setMemory] = useState<{ key: string | null; value: T } | null>(
    null,
  );
  const [warning, setWarning] = useState("");
  const value = memory?.key === key ? memory.value : saved;
  function update(next: T) {
    setMemory({ key, value: next });
    if (!key) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(changeEvent));
      setWarning("");
    } catch {
      setWarning(
        "Энэ табд хадгалж чадсангүй. Хуудсаа хаахаас өмнө ажлаа татаж аваарай.",
      );
    }
  }
  return [value, update, warning] as const;
}
