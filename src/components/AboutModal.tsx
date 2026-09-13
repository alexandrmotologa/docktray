import React from "react";
import { X, ExternalLink, Radio, ShieldCheck } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMock: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, isMock }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl bg-obsidian-900 border border-white/10 shadow-2xl p-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow">
              <Radio className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-white">About DockTray</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <p className="leading-relaxed">
            DockTray is a developer utility for monitoring listening ports, terminating rogue processes, and managing Docker containers directly from the desktop tray.
          </p>

          <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Version</span>
              <span className="text-slate-300">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Engine</span>
              <span className="text-slate-300">Tauri 2.0 + React 19</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Runtime mode</span>
              <span className={isMock ? "text-cyan-400" : "text-emerald-400"}>
                {isMock ? "Browser Mock" : "Native Desktop"}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="font-semibold text-slate-400 mb-1">Keyboard Shortcuts</div>
            <div className="flex justify-between text-slate-400">
              <span>Focus search filter</span>
              <kbd className="px-1 py-0.2 bg-obsidian-850 rounded border border-white/10 font-mono text-[10px]">Ctrl + K</kbd>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Summon tray popover</span>
              <kbd className="px-1 py-0.2 bg-obsidian-850 rounded border border-white/10 font-mono text-[10px]">Ctrl + Shift + P</kbd>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Dismiss filter or modal</span>
              <kbd className="px-1 py-0.2 bg-obsidian-850 rounded border border-white/10 font-mono text-[10px]">Esc</kbd>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <a
            href="https://github.com/alexandrmotologa/docktray"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center space-x-1 text-[10px] text-slate-500">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </div>
  );
};
