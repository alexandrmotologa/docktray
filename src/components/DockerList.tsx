import React, { useState } from "react";
import { DockerContainer } from "../types";
import {
  RotateCw,
  Square,
  Play,
  Box,
  AlertCircle,
  Terminal,
  Trash2,
  FolderGit2,
} from "lucide-react";

interface DockerListProps {
  containers: DockerContainer[];
  onRestart: (id: string, name: string) => Promise<boolean>;
  onToggleState: (id: string, name: string) => Promise<boolean>;
  onViewLogs: (container: DockerContainer) => void;
  onPruneStopped: () => Promise<number>;
  dockerAvailable: boolean;
  isLoading: boolean;
}

export const DockerList: React.FC<DockerListProps> = ({
  containers,
  onRestart,
  onToggleState,
  onViewLogs,
  onPruneStopped,
  dockerAvailable,
  isLoading,
}) => {
  const [restartingId, setRestartingId] = useState<string | null>(null);
  const [isPruning, setIsPruning] = useState<boolean>(false);

  const handleRestart = async (c: DockerContainer) => {
    setRestartingId(c.id);
    await onRestart(c.id, c.name);
    setRestartingId(null);
  };

  const handlePrune = async () => {
    setIsPruning(true);
    await onPruneStopped();
    setIsPruning(false);
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

  // Group by compose project
  const groups: Record<string, DockerContainer[]> = {};
  containers.forEach((c) => {
    const project = c.composeProject || "Standalone Containers";
    if (!groups[project]) groups[project] = [];
    groups[project].push(c);
  });

  const stoppedCount = containers.filter((c) => c.status === "exited").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top action bar: Prune stopped */}
      {stoppedCount > 0 && (
        <div className="px-3 py-1.5 bg-obsidian-950/90 border-b border-white/5 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            {stoppedCount} stopped {stoppedCount === 1 ? "container" : "containers"}
          </span>
          <button
            onClick={handlePrune}
            disabled={isPruning}
            className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 transition-colors disabled:opacity-50"
            title="Remove stopped containers"
          >
            <Trash2 className="w-3 h-3" />
            <span>{isPruning ? "Cleaning..." : "Prune Stopped"}</span>
          </button>
        </div>
      )}

      {/* Containers List with Groups */}
      <div className="divide-y divide-white/5 overflow-y-auto max-h-[380px] scrollbar-thin flex-1">
        {Object.entries(groups).map(([groupName, groupContainers]) => {
          const isProject = groupName !== "Standalone Containers";

          return (
            <div key={groupName} className="pb-1">
              {/* Group Header */}
              {isProject && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-mono text-violet-400/90 flex items-center space-x-1.5 bg-obsidian-950/40">
                  <FolderGit2 className="w-3 h-3 text-violet-400" />
                  <span className="font-semibold uppercase tracking-wider">{groupName}</span>
                  <span className="text-slate-600">({groupContainers.length})</span>
                </div>
              )}

              {groupContainers.map((item) => {
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
                        <span
                          className="font-mono font-medium text-xs text-white truncate max-w-[150px]"
                          title={item.name}
                        >
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
                            {item.ports
                              .map((p) => (p.publicPort ? `:${p.publicPort}` : `:${p.privatePort}`))
                              .join(", ")}
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
                      {/* View Logs Button */}
                      <button
                        onClick={() => onViewLogs(item)}
                        className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        title="View container logs"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>

                      {/* Restart Button */}
                      <button
                        onClick={() => handleRestart(item)}
                        disabled={isRestarting}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                        title="Restart container"
                      >
                        <RotateCw
                          className={`w-3.5 h-3.5 ${isRestarting ? "animate-spin text-cyan-400" : ""}`}
                        />
                      </button>

                      {/* Stop/Start Button */}
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
        })}
      </div>
    </div>
  );
};
