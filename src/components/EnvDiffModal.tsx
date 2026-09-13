import React, { useState } from "react";
import { EnvDiffResult } from "../types";
import { X, Eye, EyeOff, Copy, Check, GitCompare, AlertTriangle } from "lucide-react";

interface EnvDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffData: EnvDiffResult | null;
  isLoading: boolean;
}

export const EnvDiffModal: React.FC<EnvDiffModalProps> = ({
  isOpen,
  onClose,
  diffData,
  isLoading,
}) => {
  const [showSecrets, setShowSecrets] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (key: string, val: string | null) => {
    await navigator.clipboard.writeText(val || key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const maskValue = (val: string | null, isSecret: boolean): string => {
    if (val === null) return "MISSING";
    if (!isSecret || showSecrets) return val;
    if (val.length <= 8) return "••••••••";
    return `${val.substring(0, 4)}••••${val.substring(val.length - 3)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl h-[500px] rounded-xl bg-obsidian-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-obsidian-950/80">
          <div className="flex items-center space-x-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-xs font-semibold text-white">Environment Profile Diff</h3>
              <p className="text-[10px] text-slate-500">
                Compare variables across local, staging, and production environments
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle secret values visibility"
            >
              {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showSecrets ? "Hide Secrets" : "Reveal Secrets"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Table */}
        <div className="flex-1 overflow-auto p-2 scrollbar-thin select-text">
          {isLoading || !diffData ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              Calculating profile differences...
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-slate-400">
                  <th className="p-2 font-medium">Variable Key</th>
                  {diffData.profiles.map((p) => (
                    <th key={p.id} className="p-2 font-medium">
                      {p.name}
                    </th>
                  ))}
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {diffData.entries.map((entry) => {
                  const hasMissing = Object.values(entry.values).some((v) => v === null);

                  return (
                    <tr
                      key={entry.key}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        hasMissing ? "bg-amber-950/10" : ""
                      }`}
                    >
                      <td className="p-2 font-semibold text-slate-200 truncate max-w-[160px]" title={entry.key}>
                        <div className="flex items-center space-x-1.5">
                          {hasMissing && (
                            <span title="Key missing in some profiles" className="inline-flex">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            </span>
                          )}
                          <span>{entry.key}</span>
                        </div>
                      </td>

                      {diffData.profiles.map((p) => {
                        const val = entry.values[p.id];
                        const isMissing = val === null;

                        return (
                          <td
                            key={p.id}
                            className="p-2 truncate max-w-[140px]"
                            title={val || "Missing"}
                          >
                            {isMissing ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] uppercase font-bold">
                                Missing
                              </span>
                            ) : (
                              <span className={entry.isSecret ? "text-cyan-300/90" : "text-slate-300"}>
                                {maskValue(val, entry.isSecret)}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleCopy(entry.key, entry.values["local"] || null)}
                          className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                          title="Copy variable key"
                        >
                          {copiedKey === entry.key ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-white/5 bg-obsidian-950/90 flex items-center justify-between text-xs text-slate-500">
          <span>{diffData?.entries.length ?? 0} total variables tracked</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-sans transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
