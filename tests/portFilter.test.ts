import { describe, it, expect } from "vitest";
import { PortInfo } from "../src/types";

describe("Port filtering and sorting tests", () => {
  const samplePorts: PortInfo[] = [
    {
      port: 8080,
      protocol: "TCP",
      ip: "0.0.0.0",
      pid: 9410,
      processName: "java",
      commandPath: "java -jar target/api.jar",
      memoryMb: 412,
      uptimeSec: 3600,
      category: "web",
      pinned: false,
    },
    {
      port: 3000,
      protocol: "TCP",
      ip: "127.0.0.1",
      pid: 14290,
      processName: "node",
      commandPath: "node server.js",
      memoryMb: 180,
      uptimeSec: 1200,
      category: "web",
      pinned: true,
    },
    {
      port: 5432,
      protocol: "TCP",
      ip: "0.0.0.0",
      pid: 3120,
      processName: "postgres",
      commandPath: "docker-proxy",
      memoryMb: 64,
      uptimeSec: 86400,
      category: "database",
      pinned: false,
    },
    {
      port: 6379,
      protocol: "TCP",
      ip: "127.0.0.1",
      pid: 4192,
      processName: "redis-server",
      commandPath: "redis-server *:6379",
      memoryMb: 18,
      uptimeSec: 86400,
      category: "cache",
      pinned: true,
    },
  ];

  it("filters ports by number", () => {
    const query = "3000";
    const filtered = samplePorts.filter((p) => String(p.port).includes(query));
    expect(filtered.length).toBe(1);
    expect(filtered[0].processName).toBe("node");
  });

  it("filters ports by process name case-insensitively", () => {
    const query = "POSTGRES";
    const filtered = samplePorts.filter((p) =>
      p.processName.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].port).toBe(5432);
  });

  it("sorts pinned ports before unpinned ports", () => {
    const sorted = [...samplePorts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.port - b.port;
    });

    expect(sorted[0].pinned).toBe(true);
    expect(sorted[1].pinned).toBe(true);
    expect(sorted[2].pinned).toBe(false);
    expect(sorted[3].pinned).toBe(false);

    // Among pinned: 3000 then 6379
    expect(sorted[0].port).toBe(3000);
    expect(sorted[1].port).toBe(6379);

    // Among unpinned: 5432 then 8080
    expect(sorted[2].port).toBe(5432);
    expect(sorted[3].port).toBe(8080);
  });

  it("filters by category correctly", () => {
    const webPorts = samplePorts.filter((p) => p.category === "web");
    expect(webPorts.length).toBe(2);

    const dbPorts = samplePorts.filter((p) => p.category === "database");
    expect(dbPorts.length).toBe(1);
    expect(dbPorts[0].port).toBe(5432);
  });
});
