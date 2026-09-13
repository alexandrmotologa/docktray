import React, { useState } from "react";
import { DockerContainer } from "../types";
import { RotateCw, Square, Play, Box, AlertCircle } from "lucide-react";

interface DockerListProps {
  containers: DockerContainer[];
  onRestart: (id: string, name: string) => Promise<boolean>;
  onToggleState: (id: string, name: string) => Promise<boolean>;
  dockerAvailable: boolean;
  isLoading: boolean;
}

export const DockerList: React.FC<DockerListProps> = ({
  containers,
  onRestart,
  onToggleState,
  dockerAvailable,
  isLoading,
}) => {
  const [restartingId, setRestartingId] = useState<string | null>(null);

  const handleRestart = async (c: DockerContainer) => {
    setRestartingId(c.id);
    await onRestart(c.id, c.name);
    setRestartingId(null);
  };

  if (!dockerAvailable) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
        <AlertCircle className="w-8 h-8 text-amber-500/80 mb-1" />
        <p className="text-xs font-medium text-slate-300">Docker Daemon Offline</p>
        <p className="text-[11px] text-slate-500 max-w-[280px]">
          Could not connect to the local Docker socket or named pipe. Ensure Docker Desktop or the engine is running.
        </p>
      </div>
    );
  }

  if (containers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
        <Box className="w-8 h-8 text-slate-600 mb-1" />
        <p className="text-xs font-medium text-slate-400">No Containers Detected</p>
        <p className="text-[11px] text-slate-600">
          {isLoading ? "Reading container status..." : "No active or paused containers found in your Docker environment."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5 overflow-y-auto max-h-[360px] scrollbar-thin">
      {containers.map((item) => {
        const isRunning = item.status === "running";
        const isRestarting = restartingId === item.id || item.status === "restarting";

        return (
          <div
            key={item.id}
            className="p-2.5 transition-colors flex items-center justify-between hover:bg-white/[0.03]"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isRunning ? "bg-emerald-400 live-pulse" : "bg-slate-600"
                  }`}
                  title={item.status}
                />
                <span className="font-mono font-medium text-xs text-white truncate max-w-[170px]" title={item.name}>
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.id.substring(0, 7)}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 truncate mt-0.5" title={item.image}>
                {item.image}
              </div>

              <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-500 font-mono">
                {item.ports.length > 0 ? (
                  <span className="text-violet-400">
                    {item.ports.map((p) => (p.publicPort ? `:${p.publicPort}` : `:${p.privatePort}`)).join(", ")}
                  </span>
                ) : (
                  <span>No ports mapped</span>
                )}
                <span>·</span>
                <span>{item.memoryUsageMb > 0 ? `${item.memoryUsageMb.toFixed(0)} MB` : "0 MB"}</span>
                <span>·</span>
                <span>{item.uptime}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => handleRestart(item)}
                disabled={isRestarting}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Restart container"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRestarting ? "animate-spin text-cyan-400" : ""}`} />
              </button>

              <button
                onClick={() => onToggleState(item.id, item.name)}
                className={`p-1.5 rounded transition-colors ${
                  isRunning
                    ? "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                    : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                }`}
                title={isRunning ? "Stop container" : "Start container"}
              >
                {isRunning ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
