import { useState, useMemo, useEffect } from "react";
import { useSystemScan } from "./hooks/useSystemScan";
import { ActiveTab, DockerContainer, EnvDiffResult, TunnelInfo } from "./types";
import { TrayHeader } from "./components/TrayHeader";
import { SearchFilter, FilterCategory } from "./components/SearchFilter";
import { PortList } from "./components/PortList";
import { DockerList } from "./components/DockerList";
import { EnvSwitcher } from "./components/EnvSwitcher";
import { StatusFooter } from "./components/StatusFooter";
import { ToastNotification } from "./components/ToastNotification";
import { ExportModal } from "./components/ExportModal";
import { AboutModal } from "./components/AboutModal";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { ConflictAlertBanner } from "./components/ConflictAlertBanner";
import { DockerLogsModal } from "./components/DockerLogsModal";
import { EnvDiffModal } from "./components/EnvDiffModal";
import { ShareTunnelModal } from "./components/ShareTunnelModal";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("ports");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [logsContainer, setLogsContainer] = useState<DockerContainer | null>(null);
  const [isEnvDiffOpen, setIsEnvDiffOpen] = useState<boolean>(false);
  const [envDiffData, setEnvDiffData] = useState<EnvDiffResult | null>(null);
  const [isDiffLoading, setIsDiffLoading] = useState<boolean>(false);
  const [activeTunnel, setActiveTunnel] = useState<TunnelInfo | null>(null);

  const {
    ports,
    containers,
    envProfiles,
    stats,
    isLoading,
    isRefreshing,
    toasts,
    settings,
    conflictPort,
    dismissConflict,
    updateSettings,
    resetPinnedPorts,
    removeToast,
    togglePinPort,
    refreshNow,
    killProcess,
    killProcessTree,
    restartContainer,
    stopContainer,
    pruneStoppedContainers,
    switchEnvProfile,
    fetchContainerLogs,
    fetchEnvDiff,
    createTunnel,
    isMock,
  } = useSystemScan();

  // Filtered & sorted ports
  const filteredPorts = useMemo(() => {
    let result = ports;

    if (selectedCategory === "pinned") {
      result = result.filter((p) => p.pinned);
    } else if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

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

    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.port - b.port;
    });
  }, [ports, selectedCategory, searchQuery]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredPorts.length) {
      setSelectedIndex(Math.max(0, filteredPorts.length - 1));
    }
  }, [filteredPorts.length, selectedIndex]);

  // Keyboard Navigation: ArrowUp / ArrowDown / Enter / Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if an input or textarea is active
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (activeTab === "ports" && filteredPorts.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredPorts.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredPorts.length) % filteredPorts.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const target = filteredPorts[selectedIndex];
          if (target) {
            window.open(`http://localhost:${target.port}`, "_blank");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, filteredPorts, selectedIndex]);

  // Filtered containers
  const filteredContainers = useMemo(() => {
    if (!searchQuery.trim()) return containers;
    const q = searchQuery.toLowerCase().trim();
    return containers.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const imgMatch = c.image.toLowerCase().includes(q);
      const projMatch = c.composeProject?.toLowerCase().includes(q) ?? false;
      const portMatch = c.ports.some((p) => String(p.publicPort || p.privatePort).includes(q));
      return nameMatch || imgMatch || projMatch || portMatch;
    });
  }, [containers, searchQuery]);

  const pinnedCount = useMemo(() => ports.filter((p) => p.pinned).length, [ports]);

  const handleOpenEnvDiff = async () => {
    setIsEnvDiffOpen(true);
    setIsDiffLoading(true);
    try {
      const diff = await fetchEnvDiff();
      setEnvDiffData(diff);
    } catch (err) {
      console.error("Failed to load env diff:", err);
    } finally {
      setIsDiffLoading(false);
    }
  };

  const handleShareTunnel = async (port: number) => {
    try {
      const info = await createTunnel(port);
      setActiveTunnel(info);
    } catch (err) {
      console.error("Tunnel creation failed:", err);
    }
  };

  const handleQuit = () => {
    if (typeof window !== "undefined") {
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
      {/* Popover Window Container: 390px width matches macOS/Windows tray popover */}
      <div className="w-full sm:max-w-[420px] h-screen sm:h-[600px] sm:max-h-[640px] rounded-none sm:rounded-2xl glass-panel shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border border-white/10">
        
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
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Port Conflict Alert Banner */}
        {activeTab === "ports" && (
          <ConflictAlertBanner
            conflictPort={conflictPort}
            onFreePort={killProcess}
            onDismiss={dismissConflict}
          />
        )}

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
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              onKill={killProcess}
              onKillTree={killProcessTree}
              onTogglePin={togglePinPort}
              onShareTunnel={handleShareTunnel}
              isLoading={isLoading}
            />
          )}

          {activeTab === "docker" && (
            <DockerList
              containers={filteredContainers}
              onRestart={restartContainer}
              onToggleState={stopContainer}
              onViewLogs={(c) => setLogsContainer(c)}
              onPruneStopped={pruneStoppedContainers}
              dockerAvailable={stats?.dockerAvailable ?? true}
              isLoading={isLoading}
            />
          )}

          {activeTab === "env" && (
            <EnvSwitcher
              profiles={envProfiles}
              onSwitch={switchEnvProfile}
              onOpenDiff={handleOpenEnvDiff}
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

        {/* Modals & Drawers */}
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

        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          updateSettings={updateSettings}
          onResetPinned={resetPinnedPorts}
        />

        <DockerLogsModal
          container={logsContainer}
          onClose={() => setLogsContainer(null)}
          fetchLogs={fetchContainerLogs}
        />

        <EnvDiffModal
          isOpen={isEnvDiffOpen}
          onClose={() => setIsEnvDiffOpen(false)}
          diffData={envDiffData}
          isLoading={isDiffLoading}
        />

        <ShareTunnelModal
          tunnel={activeTunnel}
          onClose={() => setActiveTunnel(null)}
        />
      </div>
    </div>
  );
}

export default App;
