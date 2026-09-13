import { useCallback, useEffect, useRef, useState } from "react";
import { getBridge } from "../bridge";
import {
  AppSettings,
  DockerContainer,
  EnvDiffResult,
  EnvProfile,
  PortInfo,
  SystemStats,
  TunnelInfo,
} from "../types";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  pollIntervalMs: 2000,
  autoPauseOnBlur: true,
  enableSoundEffects: true,
  defaultKillMode: "single",
};

export function useSystemScan() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem("docktray_settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [envProfiles, setEnvProfiles] = useState<EnvProfile[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dismissedConflictPort, setDismissedConflictPort] = useState<number | null>(null);

  const [pinnedPorts, setPinnedPorts] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("docktray_pinned_ports");
      return saved ? JSON.parse(saved) : [3000, 8080, 5432];
    } catch {
      return [3000, 8080, 5432];
    }
  });

  const bridge = getBridge();
  const isMountedRef = useRef<boolean>(true);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem("docktray_settings", JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  }, []);

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const togglePinPort = useCallback((portNum: number) => {
    setPinnedPorts((prev) => {
      const next = prev.includes(portNum) ? prev.filter((p) => p !== portNum) : [...prev, portNum];
      try {
        localStorage.setItem("docktray_pinned_ports", JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, []);

  const resetPinnedPorts = useCallback(() => {
    const defaults = [3000, 8080, 5432];
    setPinnedPorts(defaults);
    try {
      localStorage.setItem("docktray_pinned_ports", JSON.stringify(defaults));
    } catch {
      // Ignore
    }
    addToast("Reset pinned priority ports to :3000, :8080, :5432", "info");
  }, [addToast]);

  const scanSystem = useCallback(async (isManual: boolean = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }

    try {
      const [fetchedPorts, fetchedContainers, fetchedProfiles, fetchedStats] = await Promise.all([
        bridge.getListeningPorts(),
        bridge.getContainers(),
        bridge.getEnvProfiles(),
        bridge.getSystemStats(),
      ]);

      if (!isMountedRef.current) return;

      // Mark pinned ports
      const mappedPorts = fetchedPorts.map((p) => ({
        ...p,
        pinned: pinnedPorts.includes(p.port),
      }));

      setPorts(mappedPorts);
      setContainers(fetchedContainers);
      setEnvProfiles(fetchedProfiles);
      setStats(fetchedStats);
    } catch (error) {
      console.error("System scan failed:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [bridge, pinnedPorts]);

  const killProcess = useCallback(async (pid: number, portNum: number, processName: string) => {
    try {
      const success = await bridge.killProcess(pid);
      if (success) {
        addToast(`Terminated ${processName} (PID ${pid}) on port :${portNum}`, "success");
        setPorts((prev) => prev.filter((p) => p.pid !== pid));
        setTimeout(() => scanSystem(false), 300);
        return true;
      } else {
        addToast(`Failed to terminate process ${pid}`, "error");
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast(`Error killing process: ${msg}`, "error");
      return false;
    }
  }, [bridge, scanSystem, addToast]);

  const killProcessTree = useCallback(async (pid: number, portNum: number, processName: string) => {
    try {
      const success = await bridge.killProcessTree(pid);
      if (success) {
        addToast(`Terminated process tree for ${processName} (PID ${pid}) on :${portNum}`, "success");
        setPorts((prev) => prev.filter((p) => p.pid !== pid && p.parentPid !== pid));
        setTimeout(() => scanSystem(false), 300);
        return true;
      } else {
        addToast(`Could not terminate full process tree for ${pid}`, "error");
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast(`Process tree error: ${msg}`, "error");
      return false;
    }
  }, [bridge, scanSystem, addToast]);

  const restartContainer = useCallback(async (id: string, name: string) => {
    try {
      addToast(`Restarting ${name}...`, "info");
      const success = await bridge.restartContainer(id);
      if (success) {
        addToast(`Container ${name} restarted`, "success");
        scanSystem(false);
        return true;
      } else {
        addToast(`Could not restart container ${name}`, "error");
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast(`Error restarting container: ${msg}`, "error");
      return false;
    }
  }, [bridge, scanSystem, addToast]);

  const stopContainer = useCallback(async (id: string, name: string) => {
    try {
      const success = await bridge.stopContainer(id);
      if (success) {
        addToast(`Container ${name} state changed`, "success");
        scanSystem(false);
        return true;
      } else {
        addToast(`Could not change container state`, "error");
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast(`Error stopping container: ${msg}`, "error");
      return false;
    }
  }, [bridge, scanSystem, addToast]);

  const pruneStoppedContainers = useCallback(async () => {
    try {
      const count = await bridge.pruneStoppedContainers();
      addToast(`Cleaned up ${count} stopped containers`, "success");
      scanSystem(false);
      return count;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast(`Prune error: ${msg}`, "error");
      return 0;
    }
  }, [bridge, scanSystem, addToast]);

  const switchEnvProfile = useCallback(async (profileId: string, name: string) => {
    try {
      const success = await bridge.switchEnvProfile(profileId);
      if (success) {
        addToast(`Switched active profile to ${name}`, "success");
        scanSystem(false);
        return true;
      } else {
        addToast(`Failed to switch profile`, "error");
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast(`Error switching profile: ${msg}`, "error");
      return false;
    }
  }, [bridge, scanSystem, addToast]);

  const fetchContainerLogs = useCallback(
    async (id: string) => {
      return bridge.getContainerLogs(id);
    },
    [bridge]
  );

  const fetchEnvDiff = useCallback(async (): Promise<EnvDiffResult> => {
    return bridge.getEnvDiff();
  }, [bridge]);

  const createTunnel = useCallback(
    async (port: number): Promise<TunnelInfo> => {
      addToast(`Creating public tunnel for port :${port}...`, "info");
      const info = await bridge.createLocalTunnel(port);
      addToast(`Tunnel created: ${info.publicUrl}`, "success");
      return info;
    },
    [bridge, addToast]
  );

  // Identify conflict port: first pinned port that is currently occupied and not dismissed
  const conflictPort = ports.find(
    (p) => p.pinned && p.port !== dismissedConflictPort && p.port === 3000
  ) || null;

  // Polling loop
  useEffect(() => {
    isMountedRef.current = true;
    scanSystem(false);

    if (settings.pollIntervalMs <= 0) return;

    let intervalId: number | null = null;

    const startPolling = () => {
      if (intervalId === null && settings.pollIntervalMs > 0) {
        intervalId = window.setInterval(() => {
          if (!settings.autoPauseOnBlur || document.visibilityState === "visible") {
            scanSystem(false);
          }
        }, settings.pollIntervalMs);
      }
    };

    const stopPolling = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scanSystem(false);
        startPolling();
      } else if (settings.autoPauseOnBlur) {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scanSystem, settings.pollIntervalMs, settings.autoPauseOnBlur]);

  return {
    ports,
    containers,
    envProfiles,
    stats,
    isLoading,
    isRefreshing,
    toasts,
    pinnedPorts,
    settings,
    conflictPort,
    dismissConflict: () => conflictPort && setDismissedConflictPort(conflictPort.port),
    updateSettings,
    resetPinnedPorts,
    addToast,
    removeToast,
    togglePinPort,
    refreshNow: () => scanSystem(true),
    killProcess,
    killProcessTree,
    restartContainer,
    stopContainer,
    pruneStoppedContainers,
    switchEnvProfile,
    fetchContainerLogs,
    fetchEnvDiff,
    createTunnel,
    isMock: bridge.isMock(),
  };
}
