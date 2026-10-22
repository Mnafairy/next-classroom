"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Dialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const focused = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      focused?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`py-dialog ${wide ? "py-dialog-wide" : ""}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="py-dialog-title">
        <h2>{title}</h2>
        <button className="py-icon" aria-label="Хаах" onClick={onClose}>
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
