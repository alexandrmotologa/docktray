import React from "react";
import { EnvProfile } from "../types";
import { Check, FileCode2, ShieldAlert, GitCompare } from "lucide-react";

interface EnvSwitcherProps {
  profiles: EnvProfile[];
  onSwitch: (profileId: string, name: string) => Promise<boolean>;
  onOpenDiff: () => void;
}

export const EnvSwitcher: React.FC<EnvSwitcherProps> = ({
  profiles,
  onSwitch,
  onOpenDiff,
}) => {
  return (
    <div className="p-3 space-y-3">
      {/* Top Banner with Diff Trigger */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-950/60 border border-white/5">
        <div className="flex items-center space-x-2 text-xs text-slate-400 min-w-0 pr-2">
          <FileCode2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="text-[11px] leading-relaxed truncate">
            Active environment profile
          </p>
        </div>

        <button
          onClick={onOpenDiff}
          className="flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors shrink-0"
          title="Compare variables across .env files"
        >
          <GitCompare className="w-3 h-3" />
          <span>Compare Diff</span>
        </button>
      </div>

      <div className="space-y-2">
        {profiles.map((item) => {
          return (
            <button
              key={item.id}
              onClick={() => onSwitch(item.id, item.name)}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                item.isActive
                  ? "bg-cyan-500/10 border-cyan-500/40 shadow-glow"
                  : "bg-obsidian-850/60 border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-semibold ${
                      item.isActive ? "text-cyan-300" : "text-slate-200"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.isActive && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500 font-mono">
                  <span>{item.fileName}</span>
                  <span>·</span>
                  <span>{item.variablesCount} keys defined</span>
                </div>
              </div>

              <div className="shrink-0 ml-2">
                {item.isActive ? (
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-obsidian-950 flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30">
                    <span className="text-[10px]">Use</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-start space-x-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>DockTray creates a timestamped backup before swapping active config files.</span>
      </div>
    </div>
  );
};
