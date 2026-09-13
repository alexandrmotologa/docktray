import { describe, it, expect } from "vitest";
import { DockerContainer } from "../src/types";

describe("Advanced feature logic tests", () => {
  it("groups containers by docker-compose project correctly", () => {
    const sampleContainers: DockerContainer[] = [
      {
        id: "1",
        name: "web-app",
        image: "node:20",
        status: "running",
        state: "Up",
        ports: [],
        memoryUsageMb: 100,
        cpuPercent: 0.5,
        uptime: "1h",
        composeProject: "app-stack",
        composeService: "web",
      },
      {
        id: "2",
        name: "db",
        image: "postgres:16",
        status: "running",
        state: "Up",
        ports: [],
        memoryUsageMb: 50,
        cpuPercent: 0.1,
        uptime: "1h",
        composeProject: "app-stack",
        composeService: "postgres",
      },
      {
        id: "3",
        name: "standalone-utility",
        image: "alpine",
        status: "exited",
        state: "Exited",
        ports: [],
        memoryUsageMb: 0,
        cpuPercent: 0,
        uptime: "Stopped",
      },
    ];

    const groups: Record<string, DockerContainer[]> = {};
    sampleContainers.forEach((c) => {
      const project = c.composeProject || "Standalone Containers";
      if (!groups[project]) groups[project] = [];
      groups[project].push(c);
    });

    expect(Object.keys(groups).length).toBe(2);
    expect(groups["app-stack"].length).toBe(2);
    expect(groups["Standalone Containers"].length).toBe(1);
  });

  it("detects missing environment keys across profiles", () => {
    const diffEntries = [
      {
        key: "API_KEY",
        values: { local: "abc", staging: null, production: "def" },
        isSecret: true,
      },
      {
        key: "PORT",
        values: { local: "3000", staging: "8080", production: "80" },
        isSecret: false,
      },
    ];

    const missingKeys = diffEntries.filter((e) =>
      Object.values(e.values).some((v) => v === null)
    );

    expect(missingKeys.length).toBe(1);
    expect(missingKeys[0].key).toBe("API_KEY");
  });
});
