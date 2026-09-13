import { describe, it, expect, beforeEach } from "vitest";
import { MockBridge } from "../src/bridge/mockBridge";

describe("MockBridge unit tests", () => {
  let bridge: MockBridge;

  beforeEach(() => {
    bridge = new MockBridge();
  });

  it("returns initial listening ports list", async () => {
    const ports = await bridge.getListeningPorts();
    expect(ports.length).toBeGreaterThanOrEqual(4);

    const port3000 = ports.find((p) => p.port === 3000);
    expect(port3000).toBeDefined();
    expect(port3000?.processName).toBe("node");
    expect(port3000?.category).toBe("web");
  });

  it("simulates killing a process by PID", async () => {
    const initialPorts = await bridge.getListeningPorts();
    const targetPid = initialPorts[0].pid;

    const killed = await bridge.killProcess(targetPid);
    expect(killed).toBe(true);

    const updatedPorts = await bridge.getListeningPorts();
    const found = updatedPorts.find((p) => p.pid === targetPid);
    expect(found).toBeUndefined();
  });

  it("returns false when attempting to kill an invalid PID", async () => {
    const killed = await bridge.killProcess(999999);
    expect(killed).toBe(false);
  });

  it("retrieves containers and restarts container", async () => {
    const containers = await bridge.getContainers();
    expect(containers.length).toBeGreaterThan(0);

    const targetId = containers[0].id;
    const restarted = await bridge.restartContainer(targetId);
    expect(restarted).toBe(true);
  });

  it("switches environment profiles", async () => {
    const initialProfiles = await bridge.getEnvProfiles();
    expect(initialProfiles.find((p) => p.id === "local")?.isActive).toBe(true);

    const switched = await bridge.switchEnvProfile("staging");
    expect(switched).toBe(true);

    const updatedProfiles = await bridge.getEnvProfiles();
    expect(updatedProfiles.find((p) => p.id === "staging")?.isActive).toBe(true);
    expect(updatedProfiles.find((p) => p.id === "local")?.isActive).toBe(false);
  });

  it("returns calculated system metrics", async () => {
    const stats = await bridge.getSystemStats();
    expect(stats.totalMemoryMb).toBe(16384);
    expect(stats.usedMemoryMb).toBeGreaterThan(0);
    expect(stats.listeningPortCount).toBeGreaterThan(0);
    expect(stats.dockerAvailable).toBe(true);
  });
});
