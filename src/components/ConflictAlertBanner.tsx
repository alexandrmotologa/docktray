import React from "react";
import { PortInfo } from "../types";
import { AlertOctagon, X, Zap } from "lucide-react";

interface ConflictAlertBannerProps {
  conflictPort: PortInfo | null;
  onFreePort: (pid: number, port: number, processName: string) => Promise<boolean>;
  onDismiss: () => void;
}

export const ConflictAlertBanner: React.FC<ConflictAlertBannerProps> = ({
  conflictPort,
  onFreePort,
  onDismiss,
}) => {
  if (!conflictPort) return null;

  return (
    <div className="mx-3 mt-2 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center space-x-2 min-w-0 pr-2">
        <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-amber-200">
            Port :{conflictPort.port} is busy
          </div>
          <div className="text-[11px] text-amber-300/80 truncate">
            Occupied by <span className="font-mono text-white">{conflictPort.processName}</span> (PID {conflictPort.pid})
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={() => onFreePort(conflictPort.pid, conflictPort.port, conflictPort.processName)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-semibold text-[11px] transition-colors shadow-sm"
          title={`Kill process ${conflictPort.pid} and free port ${conflictPort.port}`}
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>Free Port</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1 text-amber-400/80 hover:text-white rounded transition-colors"
          title="Dismiss warning"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
