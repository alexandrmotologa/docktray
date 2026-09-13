import React, { useState } from "react";
import { PortInfo } from "../types";
import { X, Copy, Check, FileJson, FileSpreadsheet } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ports: PortInfo[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, ports }) => {
  const [format, setFormat] = useState<"markdown" | "json">("markdown");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateExportText = () => {
    if (format === "json") {
      return JSON.stringify(
        ports.map((p) => ({
          port: p.port,
          protocol: p.protocol,
          pid: p.pid,
          process: p.processName,
          memoryMb: Math.round(p.memoryMb),
          category: p.category,
        })),
        null,
        2
      );
    }

    const headers = "| Port | Protocol | PID | Process | Memory | Category |\n| --- | --- | --- | --- | --- | --- |\n";
    const rows = ports
      .map(
        (p) =>
          `| :${p.port} | ${p.protocol} | ${p.pid} | ${p.processName} | ${Math.round(p.memoryMb)}MB | ${p.category} |`
      )
      .join("\n");
    return headers + rows;
  };

  const handleCopy = async () => {
    const text = generateExportText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl bg-obsidian-900 border border-white/10 shadow-2xl p-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white">Export Active Ports</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-obsidian-950 border border-white/5 text-xs">
          <button
            onClick={() => setFormat("markdown")}
            className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-md transition-colors ${
              format === "markdown"
                ? "bg-white/15 text-white font-medium"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>

          <button
            onClick={() => setFormat("json")}
            className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-md transition-colors ${
              format === "json"
                ? "bg-white/15 text-white font-medium"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>

        <textarea
          readOnly
          value={generateExportText()}
          className="w-full h-32 p-2 bg-obsidian-950/80 rounded-md border border-white/10 text-[10px] font-mono text-slate-300 resize-none focus:outline-none scrollbar-thin"
        />

        <div className="flex items-center justify-end space-x-2 pt-1">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Close
          </button>

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
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
