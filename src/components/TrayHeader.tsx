import React from "react";
import { ActiveTab } from "../types";
import { RefreshCw, Radio, Layers, Box, FileText, Info } from "lucide-react";

interface TrayHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  portsCount: number;
  containersCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  isMock: boolean;
  onOpenAbout: () => void;
}

export const TrayHeader: React.FC<TrayHeaderProps> = ({
  activeTab,
  setActiveTab,
  portsCount,
  containersCount,
  isRefreshing,
  onRefresh,
  isMock,
  onOpenAbout,
}) => {
  return (
    <header className="p-3 border-b border-white/10 bg-obsidian-900/90 backdrop-blur-md select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-white tracking-tight">DockTray</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse" title="Scanner active" />
              {isMock && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  MOCK
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            title="Scan ports now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={onOpenAbout}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="About DockTray"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-obsidian-950/80 border border-white/5 text-xs">
        <button
          onClick={() => setActiveTab("ports")}
          className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md font-medium transition-all ${
            activeTab === "ports"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ports</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
            {portsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("docker")}
          className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md font-medium transition-all ${
            activeTab === "docker"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Docker</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
            {containersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("env")}
          className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md font-medium transition-all ${
            activeTab === "env"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Env</span>
        </button>
      </div>
    </header>
  );
};
