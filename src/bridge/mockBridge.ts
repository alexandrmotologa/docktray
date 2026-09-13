import { DockerContainer, EnvProfile, PortInfo, SystemBridge, SystemStats } from "../types";

const INITIAL_PORTS: PortInfo[] = [
  {
    port: 3000,
    protocol: "TCP",
    ip: "127.0.0.1",
    pid: 14290,
    processName: "node",
    commandPath: "node /workspace/frontend/server.js",
    memoryMb: 184.5,
    uptimeSec: 3420,
    category: "web",
    pinned: true,
  },
  {
    port: 5173,
    protocol: "TCP",
    ip: "127.0.0.1",
    pid: 18932,
    processName: "vite",
    commandPath: "node_modules/.bin/vite",
    memoryMb: 92.4,
    uptimeSec: 420,
    category: "web",
    pinned: false,
  },
  {
    port: 8080,
    protocol: "TCP",
    ip: "0.0.0.0",
    pid: 9410,
    processName: "java",
    commandPath: "java -jar target/api-gateway.jar",
    memoryMb: 412.0,
    uptimeSec: 18400,
    category: "web",
    pinned: true,
  },
  {
    port: 5432,
    protocol: "TCP",
    ip: "0.0.0.0",
    pid: 3120,
    processName: "postgres",
    commandPath: "docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 5432",
    memoryMb: 68.2,
    uptimeSec: 86400,
    category: "database",
    pinned: true,
  },
  {
    port: 6379,
    protocol: "TCP",
    ip: "127.0.0.1",
    pid: 4192,
    processName: "redis-server",
    commandPath: "/usr/local/bin/redis-server *:6379",
    memoryMb: 18.6,
    uptimeSec: 86400,
    category: "cache",
    pinned: false,
  },
  {
    port: 27017,
    protocol: "TCP",
    ip: "127.0.0.1",
    pid: 5820,
    processName: "mongod",
    commandPath: "/usr/bin/mongod --config /etc/mongod.conf",
    memoryMb: 124.8,
    uptimeSec: 43200,
    category: "database",
    pinned: false,
  },
];

const INITIAL_CONTAINERS: DockerContainer[] = [
  {
    id: "d7a4e1b8c9f0",
    name: "docktray-postgres-dev",
    image: "postgres:16-alpine",
    status: "running",
    state: "Up 24 hours",
    ports: [{ privatePort: 5432, publicPort: 5432, type: "tcp" }],
    memoryUsageMb: 68.2,
    cpuPercent: 0.4,
    uptime: "24h 12m",
  },
  {
    id: "e9f2a3c5d6b7",
    name: "docktray-redis-cache",
    image: "redis:7.2-alpine",
    status: "running",
    state: "Up 24 hours",
    ports: [{ privatePort: 6379, publicPort: 6379, type: "tcp" }],
    memoryUsageMb: 18.6,
    cpuPercent: 0.1,
    uptime: "24h 10m",
  },
  {
    id: "f1c8e4d2a9b3",
    name: "local-rabbitmq-broker",
    image: "rabbitmq:3-management",
    status: "exited",
    state: "Exited (0) 3 hours ago",
    ports: [
      { privatePort: 5672, publicPort: 5672, type: "tcp" },
      { privatePort: 15672, publicPort: 15672, type: "tcp" },
    ],
    memoryUsageMb: 0,
    cpuPercent: 0,
    uptime: "Stopped",
  },
  {
    id: "a3b9c8d7e6f5",
    name: "stripe-mock-server",
    image: "stripe/stripe-mock:latest",
    status: "running",
    state: "Up 4 hours",
    ports: [{ privatePort: 12111, publicPort: 12111, type: "tcp" }],
    memoryUsageMb: 32.1,
    cpuPercent: 0.2,
    uptime: "4h 05m",
  },
];

const INITIAL_ENV_PROFILES: EnvProfile[] = [
  {
    id: "local",
    name: "Local Development",
    fileName: ".env.local",
    isActive: true,
    variablesCount: 24,
  },
  {
    id: "staging",
    name: "Remote Staging",
    fileName: ".env.staging",
    isActive: false,
    variablesCount: 26,
  },
  {
    id: "production",
    name: "Production (Read-Only)",
    fileName: ".env.production",
    isActive: false,
    variablesCount: 28,
  },
];

export class MockBridge implements SystemBridge {
  private ports: PortInfo[] = JSON.parse(JSON.stringify(INITIAL_PORTS));
  private containers: DockerContainer[] = JSON.parse(JSON.stringify(INITIAL_CONTAINERS));
  private envProfiles: EnvProfile[] = JSON.parse(JSON.stringify(INITIAL_ENV_PROFILES));

  async getListeningPorts(): Promise<PortInfo[]> {
    // Artificial small latency to simulate asynchronous IPC
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...this.ports];
  }

  async killProcess(pid: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const initialCount = this.ports.length;
    this.ports = this.ports.filter((p) => p.pid !== pid);
    return this.ports.length < initialCount;
  }

  async getContainers(): Promise<DockerContainer[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...this.containers];
  }

  async restartContainer(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const container = this.containers.find((c) => c.id === id);
    if (!container) return false;

    container.status = "restarting";
    container.uptime = "Restarting...";

    setTimeout(() => {
      container.status = "running";
      container.uptime = "Just now";
    }, 1200);

    return true;
  }

  async stopContainer(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const container = this.containers.find((c) => c.id === id);
    if (!container) return false;

    if (container.status === "running") {
      container.status = "exited";
      container.state = "Exited (0) Just now";
      container.uptime = "Stopped";
      container.memoryUsageMb = 0;
      container.cpuPercent = 0;
    } else {
      container.status = "running";
      container.state = "Up Just now";
      container.uptime = "Just now";
      container.memoryUsageMb = 24.5;
    }
    return true;
  }

  async getEnvProfiles(): Promise<EnvProfile[]> {
    return [...this.envProfiles];
  }

  async switchEnvProfile(profileId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.envProfiles = this.envProfiles.map((profile) => ({
      ...profile,
      isActive: profile.id === profileId,
    }));
    return true;
  }

  async getSystemStats(): Promise<SystemStats> {
    const totalMem = 16384;
    const processMemory = this.ports.reduce((acc, p) => acc + p.memoryMb, 0);
    const containerMemory = this.containers.reduce((acc, c) => acc + c.memoryUsageMb, 0);
    const usedMem = 4800 + Math.round(processMemory + containerMemory);

    return {
      totalMemoryMb: totalMem,
      usedMemoryMb: usedMem,
      freeMemoryMb: totalMem - usedMem,
      cpuUsagePercent: Math.min(85, Math.round(12 + this.ports.length * 1.5)),
      listeningPortCount: this.ports.length,
      dockerAvailable: true,
    };
  }

  isMock(): boolean {
    return true;
  }

  reset(): void {
    this.ports = JSON.parse(JSON.stringify(INITIAL_PORTS));
    this.containers = JSON.parse(JSON.stringify(INITIAL_CONTAINERS));
    this.envProfiles = JSON.parse(JSON.stringify(INITIAL_ENV_PROFILES));
  }
}

export const mockBridgeInstance = new MockBridge();
