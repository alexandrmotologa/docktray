import React from "react";
import { ToastMessage } from "../hooks/useSystemScan";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="absolute bottom-12 left-3 right-3 z-50 flex flex-col space-y-1.5 pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-2 rounded-lg text-xs shadow-lg border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
                : toast.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-500/40"
                : "bg-obsidian-850/90 text-slate-200 border-white/20"
            }`}
          >
            <div className="flex items-center space-x-2 min-w-0 pr-1">
              {toast.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
              {toast.type === "info" && <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              <span className="truncate text-[11px]">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
