"use client";
import { useEffect, useState, createContext, useContext, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons: Record<ToastType, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  const styles: Record<ToastType, string> = {
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    error: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    info: "border-[#c0c1ff]/40 bg-[#c0c1ff]/10 text-[#c0c1ff]",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300 ${styles[toast.type]}`}
          >
            <span className="material-symbols-outlined text-lg shrink-0">
              {icons[toast.type]}
            </span>
            <span className="text-sm font-medium text-[#dfe2ee]">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-2 text-[#908fa0] hover:text-[#dfe2ee] transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
