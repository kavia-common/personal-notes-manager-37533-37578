import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import "../App.css";

/**
 * PUBLIC_INTERFACE
 * Toast
 * A minimal toast notification system for showing transient messages.
 * Usage:
 *  - Wrap your app in <ToastProvider>
 *  - Call const { addToast } = useToast(); addToast({ type: "error"|"info"|"success", message: "..." })
 */

// PUBLIC_INTERFACE
export const ToastContext = createContext({ addToast: () => {} });

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = "info", message, duration = 3500 }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              minWidth: 240,
              maxWidth: 360,
              padding: "10px 12px",
              borderRadius: 10,
              boxShadow: "var(--shadow-md)",
              color: t.type === "error" ? "#fff" : "var(--text)",
              background: t.type === "error"
                ? "linear-gradient(180deg, rgba(239,68,68,0.95), #b91c1c)"
                : t.type === "success"
                  ? "linear-gradient(180deg, rgba(37,99,235,0.95), #1d4ed8)"
                  : "var(--surface)",
              border: "1px solid var(--border)"
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx;
}
