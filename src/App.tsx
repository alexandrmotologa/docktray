import { useState, useMemo } from "react";
import { useSystemScan } from "./hooks/useSystemScan";
import { ActiveTab } from "./types";
import { TrayHeader } from "./components/TrayHeader";
import { SearchFilter, FilterCategory } from "./components/SearchFilter";
import { PortList } from "./components/PortList";
import { DockerList } from "./components/DockerList";
import { EnvSwitcher } from "./components/EnvSwitcher";
import { StatusFooter } from "./components/StatusFooter";
import { ToastNotification } from "./components/ToastNotification";
import { ExportModal } from "./components/ExportModal";
import { AboutModal } from "./components/AboutModal";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("ports");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  const {
    ports,
    containers,
    envProfiles,
    stats,
    isLoading,
    isRefreshing,
    toasts,
    removeToast,
    togglePinPort,
    refreshNow,
    killProcess,
    restartContainer,
    stopContainer,
    switchEnvProfile,
    isMock,
  } = useSystemScan(2000);

  // Filtered & sorted ports
  const filteredPorts = useMemo(() => {
    let result = ports;

    // Filter by category
    if (selectedCategory === "pinned") {
      result = result.filter((p) => p.pinned);
    } else if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const portStr = String(p.port);
        const pidStr = String(p.pid);
        const nameMatch = p.processName.toLowerCase().includes(q);
        const cmdMatch = p.commandPath?.toLowerCase().includes(q) ?? false;
        return portStr.includes(q) || pidStr.includes(q) || nameMatch || cmdMatch;
      });
    }

    // Sort: pinned first, then by port number
    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.port - b.port;
    });
  }, [ports, selectedCategory, searchQuery]);

  // Filtered containers
  const filteredContainers = useMemo(() => {
    if (!searchQuery.trim()) return containers;
    const q = searchQuery.toLowerCase().trim();
    return containers.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const imgMatch = c.image.toLowerCase().includes(q);
      const portMatch = c.ports.some((p) => String(p.publicPort || p.privatePort).includes(q));
      return nameMatch || imgMatch || portMatch;
    });
  }, [containers, searchQuery]);

  const pinnedCount = useMemo(() => ports.filter((p) => p.pinned).length, [ports]);

  const handleQuit = () => {
    if (typeof window !== "undefined") {
      // If in Tauri desktop app, invoke exit or close window
      const tauriWindow = (window as unknown as { __TAURI__?: { window?: { getCurrentWindow?: () => { close: () => void } } } });
      if (tauriWindow.__TAURI__?.window?.getCurrentWindow) {
        tauriWindow.__TAURI__.window.getCurrentWindow().close();
      } else {
        alert("DockTray operates as a system tray utility. Close the browser tab to exit preview mode.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-0 sm:p-4 antialiased">
      {/* Popover Window Container: 380px width matches macOS/Windows tray popover */}
      <div className="w-full sm:max-w-[400px] h-screen sm:h-[580px] sm:max-h-[620px] rounded-none sm:rounded-2xl glass-panel shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border border-white/10">
        
        {/* Header */}
        <TrayHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          portsCount={ports.length}
          containersCount={containers.filter((c) => c.status === "running").length}
          isRefreshing={isRefreshing}
          onRefresh={refreshNow}
          isMock={isMock}
          onOpenAbout={() => setIsAboutOpen(true)}
        />

        {/* Search & Filter Bar (available on Ports and Docker tabs) */}
        {activeTab !== "env" && (
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            pinnedCount={pinnedCount}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === "ports" && (
            <PortList
              ports={filteredPorts}
              onKill={killProcess}
              onTogglePin={togglePinPort}
              isLoading={isLoading}
            />
          )}

          {activeTab === "docker" && (
            <DockerList
              containers={filteredContainers}
              onRestart={restartContainer}
              onToggleState={stopContainer}
              dockerAvailable={stats?.dockerAvailable ?? true}
              isLoading={isLoading}
            />
          )}

          {activeTab === "env" && (
            <EnvSwitcher
              profiles={envProfiles}
              onSwitch={switchEnvProfile}
            />
          )}
        </main>

        {/* Status Footer */}
        <StatusFooter
          stats={stats}
          onExport={() => setIsExportOpen(true)}
          onQuit={handleQuit}
        />

        {/* Overlay Toasts */}
        <ToastNotification toasts={toasts} onDismiss={removeToast} />

        {/* Modals */}
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          ports={ports}
        />

        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
          isMock={isMock}
        />
      </div>
    </div>
  );
}

export default App;
