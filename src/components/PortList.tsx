import React, { useState } from "react";
import { PortInfo } from "../types";
import { ExternalLink, Skull, Star, CheckCircle2, AlertTriangle } from "lucide-react";

interface PortListProps {
  ports: PortInfo[];
  onKill: (pid: number, port: number, processName: string) => Promise<boolean>;
  onTogglePin: (port: number) => void;
  isLoading: boolean;
}

export const PortList: React.FC<PortListProps> = ({
  ports,
  onKill,
  onTogglePin,
  isLoading,
}) => {
  const [killingPid, setKillingPid] = useState<number | null>(null);
  const [confirmPid, setConfirmPid] = useState<number | null>(null);

  const handleKillClick = async (port: PortInfo) => {
    if (confirmPid === port.pid) {
      setKillingPid(port.pid);
      setConfirmPid(null);
      await onKill(port.pid, port.port, port.processName);
      setKillingPid(null);
    } else {
      setConfirmPid(port.pid);
      // Reset confirmation after 3 seconds if not clicked
      setTimeout(() => {
        setConfirmPid((current) => (current === port.pid ? null : current));
      }, 3000);
    }
  };

  const formatUptime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "web":
        return "border-cyan-500/30 text-cyan-400 bg-cyan-500/10";
      case "database":
        return "border-violet-500/30 text-violet-400 bg-violet-500/10";
      case "cache":
        return "border-amber-500/30 text-amber-400 bg-amber-500/10";
      default:
        return "border-slate-600/30 text-slate-400 bg-slate-700/10";
    }
  };

  if (ports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
        <CheckCircle2 className="w-8 h-8 text-slate-600 mb-1" />
        <p className="text-xs font-medium text-slate-400">No matching listening ports</p>
        <p className="text-[11px] text-slate-600">
          {isLoading ? "Scanning local sockets..." : "No local servers or processes are active on these ports."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5 overflow-y-auto max-h-[360px] scrollbar-thin">
      {ports.map((item) => {
        const isConfirming = confirmPid === item.pid;
        const isKilling = killingPid === item.pid;
        const isWebPort = item.category === "web" || item.port === 3000 || item.port === 8080 || item.port === 5173;

        return (
          <div
            key={`${item.protocol}-${item.port}-${item.pid}`}
            className={`p-2.5 transition-colors flex items-center justify-between group ${
              isConfirming ? "bg-rose-950/30 border-l-2 border-rose-500" : "hover:bg-white/[0.03]"
            }`}
          >
            {/* Left: Port, Category & Process Info */}
            <div className="flex items-start space-x-2.5 min-w-0">
              <button
                onClick={() => onTogglePin(item.port)}
                className="mt-0.5 text-slate-600 hover:text-amber-400 transition-colors"
                title={item.pinned ? "Unpin port" : "Pin port to top"}
              >
                <Star
                  className={`w-3.5 h-3.5 ${item.pinned ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                />
              </button>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-sm text-white tracking-wide">
                    :{item.port}
                  </span>
                  <span
                    className={`text-[9px] uppercase px-1 py-0.2 rounded border font-mono ${getCategoryStyles(
                      item.category
                    )}`}
                  >
                    {item.protocol}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.ip}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400">
                  <span className="font-medium text-slate-300 truncate max-w-[110px]" title={item.commandPath || item.processName}>
                    {item.processName}
                  </span>
                  <span className="text-slate-600 font-mono">PID {item.pid}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 font-mono">{item.memoryMb.toFixed(0)} MB</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-500 text-[10px]">{formatUptime(item.uptimeSec)}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-1 shrink-0 ml-2">
              {isWebPort && (
                <a
                  href={`http://localhost:${item.port}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  title={`Open http://localhost:${item.port}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={() => handleKillClick(item)}
                disabled={isKilling}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                  isConfirming
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                } disabled:opacity-50`}
                title="Kill process"
              >
                {isConfirming ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>Confirm</span>
                  </>
                ) : (
                  <>
                    <Skull className="w-3 h-3" />
                    <span>Kill</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
