"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type Toast = { id: string; message: string; type?: "info" | "success" | "warning" | "error" };
type ToastContextValue = { addToast: (message: string, type?: Toast["type"]) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const value = useMemo(() => ({ addToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 space-y-2"
        role="region"
        aria-label="Notifications"
      >
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {toasts.length > 0 ? toasts[toasts.length - 1].message : ""}
        </div>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm text-white ${
              t.type === "success"
                ? "bg-green-600"
                : t.type === "warning"
                ? "bg-yellow-600"
                : t.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
            role="status"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

