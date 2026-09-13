import React, { useState } from "react";
import { TunnelInfo } from "../types";
import { X, Copy, Check, ExternalLink, Globe2, Smartphone } from "lucide-react";

interface ShareTunnelModalProps {
  tunnel: TunnelInfo | null;
  onClose: () => void;
}

export const ShareTunnelModal: React.FC<ShareTunnelModalProps> = ({ tunnel, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!tunnel) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tunnel.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl bg-obsidian-900 border border-white/10 shadow-2xl p-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Globe2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-white">Share Localhost :{tunnel.port}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Public tunnel active. Use this temporary address to preview your web application on phones, tablets, or share with remote teammates.
        </p>

        <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">Public URL</span>
            <span className="text-[10px] text-emerald-400 font-mono">Active</span>
          </div>

          <div className="p-2 rounded bg-obsidian-850 border border-white/10 font-mono text-xs text-cyan-300 break-all select-all">
            {tunnel.publicUrl}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Scan or open on your mobile browser while connected to WiFi.</span>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
          <a
            href={tunnel.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link</span>
          </a>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-cyan-500 text-obsidian-950 hover:bg-cyan-400 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
