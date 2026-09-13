import React from "react";
import { AppSettings } from "../types";
import { X, Sliders, Volume2, VolumeX, Moon, RotateCcw } from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetPinned: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
  onResetPinned,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl bg-obsidian-900 border border-white/10 shadow-2xl p-4 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white">DockTray Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Scan Refresh Rate */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">
              Socket Scan Rate
            </label>
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-obsidian-950 border border-white/5 font-mono text-[11px]">
              {[
                { label: "1s", val: 1000 },
                { label: "2s", val: 2000 },
                { label: "5s", val: 5000 },
                { label: "Manual", val: 0 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => updateSettings({ pollIntervalMs: item.val })}
                  className={`py-1 rounded text-center transition-colors ${
                    settings.pollIntervalMs === item.val
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Kill Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">
              Default Kill Behavior
            </label>
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-obsidian-950 border border-white/5 text-[11px]">
              <button
                onClick={() => updateSettings({ defaultKillMode: "single" })}
                className={`py-1.5 px-2 rounded text-center transition-colors ${
                  settings.defaultKillMode === "single"
                    ? "bg-white/15 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Target PID Only
              </button>
              <button
                onClick={() => updateSettings({ defaultKillMode: "tree" })}
                className={`py-1.5 px-2 rounded text-center transition-colors ${
                  settings.defaultKillMode === "tree"
                    ? "bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Full Process Tree
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <Moon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Auto-pause when tray loses focus</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPauseOnBlur}
                onChange={(e) => updateSettings({ autoPauseOnBlur: e.target.checked })}
                className="rounded bg-obsidian-800 border-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                {settings.enableSoundEffects ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="text-[11px]">Haptic audio feedback on actions</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSoundEffects}
                onChange={(e) => updateSettings({ enableSoundEffects: e.target.checked })}
                className="rounded bg-obsidian-800 border-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Pinned */}
          <div className="pt-1">
            <button
              onClick={onResetPinned}
              className="flex items-center justify-center space-x-1.5 w-full py-1.5 rounded border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-[11px] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Pinned Priority Ports (3000, 8080, 5432)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
