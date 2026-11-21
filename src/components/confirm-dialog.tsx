'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export function ConfirmDialog({
  title,
  children,
  confirm,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  confirm: string;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="wallet-dialog request-dialog"
      aria-labelledby="request-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2 id="request-dialog-title">{title}</h2>
      {children}
      <div className="button-row">
        <button className="button secondary" disabled={busy} onClick={onClose} autoFocus>
          Go back
        </button>
        <button className="button" disabled={busy} onClick={onConfirm}>
          {busy ? 'Checking and saving…' : confirm}
        </button>
      </div>
    </dialog>
  );
}
