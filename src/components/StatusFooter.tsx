import React from "react";
import { SystemStats } from "../types";
import { Cpu, HardDrive, Download, Power } from "lucide-react";

interface StatusFooterProps {
  stats: SystemStats | null;
  onExport: () => void;
  onQuit: () => void;
}

export const StatusFooter: React.FC<StatusFooterProps> = ({ stats, onExport, onQuit }) => {
  const ramPercent = stats ? Math.round((stats.usedMemoryMb / stats.totalMemoryMb) * 100) : 0;
  const usedGb = stats ? (stats.usedMemoryMb / 1024).toFixed(1) : "0";
  const totalGb = stats ? (stats.totalMemoryMb / 1024).toFixed(0) : "0";

  return (
    <footer className="p-2.5 bg-obsidian-950/90 border-t border-white/10 text-xs text-slate-400 select-none">
      <div className="flex items-center justify-between">
        {/* Memory and CPU counters */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div className="flex items-center space-x-1" title={`Memory: ${usedGb}GB / ${totalGb}GB (${ramPercent}%)`}>
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{usedGb}/{totalGb} GB</span>
          </div>

          <div className="flex items-center space-x-1" title="Estimated CPU usage">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>{stats?.cpuUsagePercent ?? 0}%</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onExport}
            className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Export ports snapshot to clipboard"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>

          <button
            onClick={onQuit}
            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            title="Close / Quit DockTray"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
