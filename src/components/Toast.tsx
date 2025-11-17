'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Simple toast hook using React state
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastState: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastState]));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    toastListeners.push(listener);
    setToasts([...toastState]);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    const newToast: Toast = { id, message, type, duration };
    toastState = [...toastState, newToast];
    notifyListeners();

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    toastState = toastState.filter((t) => t.id !== id);
    notifyListeners();
  };

  return { toasts, showToast, removeToast };
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const typeStyles: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right ${typeStyles[toast.type]}`}
          role="alert"
          aria-live="polite"
        >
          <span className="text-lg font-semibold">{icons[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-60 hover:opacity-100"
            aria-label="關閉通知"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

