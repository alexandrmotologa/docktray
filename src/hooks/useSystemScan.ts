import { useCallback, useEffect, useRef, useState } from "react";
import { getBridge } from "../bridge";
import { DockerContainer, EnvProfile, PortInfo, SystemStats } from "../types";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function useSystemScan(pollIntervalMs: number = 2000) {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [envProfiles, setEnvProfiles] = useState<EnvProfile[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
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
        // Ignore storage write error
      }
      return next;
    });
  }, []);

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
      setLastUpdated(new Date());
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
        // Optimistic UI update
        setPorts((prev) => prev.filter((p) => p.pid !== pid));
        // Follow-up scan
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

  // Polling loop
  useEffect(() => {
    isMountedRef.current = true;
    scanSystem(false);

    let intervalId: number | null = null;

    const startPolling = () => {
      if (intervalId === null) {
        intervalId = window.setInterval(() => {
          if (document.visibilityState === "visible") {
            scanSystem(false);
          }
        }, pollIntervalMs);
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
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scanSystem, pollIntervalMs]);

  return {
    ports,
    containers,
    envProfiles,
    stats,
    isLoading,
    isRefreshing,
    lastUpdated,
    toasts,
    pinnedPorts,
    addToast,
    removeToast,
    togglePinPort,
    refreshNow: () => scanSystem(true),
    killProcess,
    restartContainer,
    stopContainer,
    switchEnvProfile,
    isMock: bridge.isMock(),
  };
}
