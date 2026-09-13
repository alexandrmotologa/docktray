import React, { useEffect, useState, useRef } from "react";
import { X, Copy, Check, RefreshCw, Terminal } from "lucide-react";
import { DockerContainer } from "../types";

interface DockerLogsModalProps {
  container: DockerContainer | null;
  onClose: () => void;
  fetchLogs: (id: string) => Promise<string>;
}

export const DockerLogsModal: React.FC<DockerLogsModalProps> = ({
  container,
  onClose,
  fetchLogs,
}) => {
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container) return;

    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const text = await fetchLogs(container.id);
        if (isMounted) {
          setLogs(text);
          // Scroll to bottom
          setTimeout(() => {
            if (logContainerRef.current) {
              logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }
          }, 50);
        }
      } catch (err) {
        if (isMounted) {
          setLogs(`Failed to load logs: ${String(err)}`);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    let intervalId: number | null = null;
    if (autoRefresh) {
      intervalId = window.setInterval(load, 3000);
    }

    return () => {
      isMounted = false;
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [container, fetchLogs, autoRefresh]);

  if (!container) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg h-[460px] rounded-xl bg-obsidian-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-obsidian-950/80">
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-white truncate">
                Logs: {container.name}
              </h3>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {container.image} · {container.id.substring(0, 10)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                autoRefresh
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              }`}
              title="Toggle 3s live polling"
            >
              {autoRefresh ? "Live: ON" : "Live: OFF"}
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Copy all logs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Log Output */}
        <div
          ref={logContainerRef}
          className="flex-1 p-3 bg-obsidian-950 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto whitespace-pre-wrap select-text scrollbar-thin"
        >
          {isLoading && !logs ? (
            <div className="flex items-center space-x-2 text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching container logs...</span>
            </div>
          ) : (
            logs
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-white/5 bg-obsidian-950/90 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span>Showing latest stdout/stderr stream</span>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-sans"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
