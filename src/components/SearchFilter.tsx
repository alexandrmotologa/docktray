import React, { useEffect, useRef } from "react";
import { Search, X, Star } from "lucide-react";

export type FilterCategory = "all" | "web" | "database" | "cache" | "pinned";

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: FilterCategory;
  setSelectedCategory: (cat: FilterCategory) => void;
  pinnedCount: number;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  pinnedCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Ctrl+K or Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setSearchQuery("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchQuery]);

  return (
    <div className="px-3 pt-2 pb-1.5 space-y-2 bg-obsidian-900/60 border-b border-white/5">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by port, process or PID (Ctrl+K)..."
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-obsidian-950/90 border border-white/10 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 text-slate-400 hover:text-slate-200 p-0.5"
            title="Clear filter"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className="absolute right-2 px-1 py-0.5 text-[9px] text-slate-500 bg-obsidian-850 border border-white/10 rounded font-mono pointer-events-none">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Quick category pills */}
      <div className="flex items-center space-x-1 text-[11px] overflow-x-auto pb-0.5 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedCategory === "all"
              ? "bg-white/15 text-white font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory("web")}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedCategory === "web"
              ? "bg-cyan-500/20 text-cyan-300 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          Web
        </button>
        <button
          onClick={() => setSelectedCategory("database")}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedCategory === "database"
              ? "bg-violet-500/20 text-violet-300 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          Database
        </button>
        <button
          onClick={() => setSelectedCategory("cache")}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedCategory === "cache"
              ? "bg-amber-500/20 text-amber-300 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          Cache
        </button>
        <button
          onClick={() => setSelectedCategory("pinned")}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
            selectedCategory === "pinned"
              ? "bg-amber-400/20 text-amber-300 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Star className="w-2.5 h-2.5 fill-current" />
          <span>Pinned ({pinnedCount})</span>
        </button>
      </div>
    </div>
  );
};
