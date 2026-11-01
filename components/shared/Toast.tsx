"use client";

import { useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error";

type ToastProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

export default function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${
        isError
          ? "border-rose-200"
          : "border-emerald-200"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isError
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {isError ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 pt-1">
        <p
          className={`text-sm font-semibold ${
            isError ? "text-rose-800" : "text-emerald-800"
          }`}
        >
          {isError ? "Something went wrong" : "Success"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}