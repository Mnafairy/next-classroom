"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export default function AdminDialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    element.querySelector<HTMLElement>("input, textarea")?.focus();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`admin-dialog ${wide ? "admin-dialog-wide" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="admin-dialog-title"
    >
      <header>
        <div>
          <h2 id="admin-dialog-title">{title}</h2>
        </div>
        <button
          type="button"
          className="admin-icon"
          onClick={onClose}
          aria-label="Цонх хаах"
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
