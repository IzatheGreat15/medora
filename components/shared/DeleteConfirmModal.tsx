
"use client";

import { AlertTriangle, X } from "lucide-react";

type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  description: string;
  itemName?: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  open,
  title = "Confirm deletion",
  description,
  itemName,
  confirmLabel = "Delete",
  loading = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="delete-confirm-title"
              className="text-lg font-bold text-[#173F35]"
            >
              {title}
            </h2>

            <p
              id="delete-confirm-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              {description}
            </p>

            {itemName && (
              <p className="mt-3 break-words rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {itemName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close confirmation"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
