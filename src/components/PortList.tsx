import React, { useState } from "react";
import { PortInfo } from "../types";
import {
  ExternalLink,
  Skull,
  Star,
  CheckCircle2,
  AlertTriangle,
  GitFork,
  Globe2,
  Activity,
} from "lucide-react";

interface PortListProps {
  ports: PortInfo[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onKill: (pid: number, port: number, processName: string) => Promise<boolean>;
  onKillTree: (pid: number, port: number, processName: string) => Promise<boolean>;
  onTogglePin: (port: number) => void;
  onShareTunnel: (port: number) => void;
  isLoading: boolean;
}

export const PortList: React.FC<PortListProps> = ({
  ports,
  selectedIndex,
  onSelectIndex,
  onKill,
  onKillTree,
  onTogglePin,
  onShareTunnel,
  isLoading,
}) => {
  const [killingPid, setKillingPid] = useState<number | null>(null);
  const [confirmPid, setConfirmPid] = useState<number | null>(null);

  const handleKillSingle = async (port: PortInfo) => {
    setKillingPid(port.pid);
    setConfirmPid(null);
    await onKill(port.pid, port.port, port.processName);
    setKillingPid(null);
  };

  const handleKillTree = async (port: PortInfo) => {
    setKillingPid(port.pid);
    setConfirmPid(null);
    await onKillTree(port.pid, port.port, port.processName);
    setKillingPid(null);
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
          {isLoading ? "Scanning local sockets..." : "No local processes are active on these ports."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5 overflow-y-auto max-h-[380px] scrollbar-thin">
      {ports.map((item, idx) => {
        const isConfirming = confirmPid === item.pid;
        const isKilling = killingPid === item.pid;
        const isSelected = selectedIndex === idx;
        const isWebPort =
          item.category === "web" || item.port === 3000 || item.port === 8080 || item.port === 5173;

        return (
          <div
            key={`${item.protocol}-${item.port}-${item.pid}`}
            onClick={() => onSelectIndex(idx)}
            className={`p-2.5 transition-all flex flex-col space-y-1.5 cursor-pointer ${
              isSelected ? "bg-white/[0.05] ring-1 ring-cyan-500/30" : "hover:bg-white/[0.02]"
            } ${isConfirming ? "bg-rose-950/30 border-l-2 border-rose-500" : ""}`}
          >
            {/* Main Row */}
            <div className="flex items-center justify-between">
              {/* Left: Port, Category & Process Info */}
              <div className="flex items-start space-x-2.5 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(item.port);
                  }}
                  className="mt-0.5 text-slate-600 hover:text-amber-400 transition-colors"
                  title={item.pinned ? "Unpin port" : "Pin port to top"}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${item.pinned ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                  />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
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

                    {/* HTTP Health badge */}
                    {item.httpHealth && (
                      <span className="flex items-center space-x-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">
                        <Activity className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{item.httpHealth.status} OK</span>
                        <span className="text-emerald-500">·</span>
                        <span>{item.httpHealth.latencyMs}ms</span>
                      </span>
                    )}

                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.ip}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400">
                    <span
                      className="font-medium text-slate-300 truncate max-w-[120px]"
                      title={item.commandPath || item.processName}
                    >
                      {item.processName}
                    </span>
                    <span className="text-slate-600 font-mono">PID {item.pid}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 font-mono">{item.memoryMb.toFixed(0)} MB</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-500 text-[10px]">{formatUptime(item.uptimeSec)}</span>
                  </div>

                  {/* Parent Process Tree Tag */}
                  {item.parentName && (
                    <div className="flex items-center space-x-1 mt-1 text-[10px] text-cyan-400/80 font-mono">
                      <GitFork className="w-2.5 h-2.5 rotate-180 text-cyan-500" />
                      <span className="text-slate-500">parent:</span>
                      <span className="truncate max-w-[140px] text-cyan-300">{item.parentName}</span>
                      {item.parentPid && <span className="text-slate-600">(PID {item.parentPid})</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                {isWebPort && (
                  <>
                    <button
                      onClick={() => onShareTunnel(item.port)}
                      className="p-1.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Share via public tunnel"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`http://localhost:${item.port}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title={`Open http://localhost:${item.port}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}

                {!isConfirming ? (
                  <button
                    onClick={() => {
                      setConfirmPid(item.pid);
                      setTimeout(() => {
                        setConfirmPid((cur) => (cur === item.pid ? null : cur));
                      }, 4000);
                    }}
                    disabled={isKilling}
                    className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50"
                    title="Kill process"
                  >
                    <Skull className="w-3 h-3" />
                    <span>Kill</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Confirmation actions drawer if Kill was clicked */}
            {isConfirming && (
              <div
                className="flex items-center justify-between pt-1 border-t border-rose-500/20 text-[11px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-1 text-rose-300">
                  <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>Choose kill target:</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleKillSingle(item)}
                    disabled={isKilling}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
                    title="Kill only this PID"
                  >
                    Kill PID
                  </button>

                  <button
                    onClick={() => handleKillTree(item)}
                    disabled={isKilling}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-semibold transition-colors shadow-glow-rose"
                    title="Kill this process and all its parent/children workers"
                  >
                    <GitFork className="w-3 h-3" />
                    <span>Kill Tree</span>
                  </button>

                  <button
                    onClick={() => setConfirmPid(null)}
                    className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
