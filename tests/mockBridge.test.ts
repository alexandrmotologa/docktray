import { describe, it, expect, beforeEach } from "vitest";
import { MockBridge } from "../src/bridge/mockBridge";

describe("MockBridge unit tests", () => {
  let bridge: MockBridge;

  beforeEach(() => {
    bridge = new MockBridge();
  });

  it("returns initial listening ports list with health checks", async () => {
    const ports = await bridge.getListeningPorts();
    expect(ports.length).toBeGreaterThanOrEqual(4);

    const port3000 = ports.find((p) => p.port === 3000);
    expect(port3000).toBeDefined();
    expect(port3000?.processName).toBe("node");
    expect(port3000?.category).toBe("web");
    expect(port3000?.httpHealth?.status).toBe(200);
    expect(port3000?.parentName).toBe("npm run dev");
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

  it("simulates killing a process tree recursively", async () => {
    const ports = await bridge.getListeningPorts();
    const port3000 = ports.find((p) => p.port === 3000);
    expect(port3000).toBeDefined();

    const rootPid = port3000!.pid;
    const killed = await bridge.killProcessTree(rootPid);
    expect(killed).toBe(true);

    const updatedPorts = await bridge.getListeningPorts();
    expect(updatedPorts.find((p) => p.pid === rootPid)).toBeUndefined();
  });

  it("returns container logs", async () => {
    const containers = await bridge.getContainers();
    expect(containers.length).toBeGreaterThan(0);

    const logs = await bridge.getContainerLogs(containers[0].id);
    expect(logs).toBeDefined();
    expect(logs.length).toBeGreaterThan(10);
  });

  it("prunes stopped containers", async () => {
    const initialContainers = await bridge.getContainers();
    const stoppedCount = initialContainers.filter((c) => c.status === "exited").length;
    expect(stoppedCount).toBeGreaterThan(0);

    const pruned = await bridge.pruneStoppedContainers();
    expect(pruned).toBe(stoppedCount);

    const updated = await bridge.getContainers();
    expect(updated.every((c) => c.status === "running")).toBe(true);
  });

  it("calculates environment profile differences (diff)", async () => {
    const diff = await bridge.getEnvDiff();
    expect(diff.profiles.length).toBe(3);
    expect(diff.entries.length).toBeGreaterThanOrEqual(4);

    const stripeKey = diff.entries.find((e) => e.key === "STRIPE_SECRET_KEY");
    expect(stripeKey).toBeDefined();
    expect(stripeKey?.values["staging"]).toBeNull(); // Missing in staging
    expect(stripeKey?.isSecret).toBe(true);
  });

  it("generates a local tunnel URL", async () => {
    const tunnel = await bridge.createLocalTunnel(3000);
    expect(tunnel.port).toBe(3000);
    expect(tunnel.publicUrl).toContain("3000");
    expect(tunnel.publicUrl).toContain("loca.lt");
  });

  it("performs port health probe", async () => {
    const health = await bridge.checkPortHealth(3000);
    expect(health).not.toBeNull();
    expect(health?.status).toBe(200);
  });
});
