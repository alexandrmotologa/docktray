import {
  DockerContainer,
  EnvDiffResult,
  EnvProfile,
  HttpHealth,
  PortInfo,
  SystemBridge,
  SystemStats,
  TunnelInfo,
} from "../types";

const INITIAL_PORTS: PortInfo[] = [
  {
    port: 3000,
    protocol: "TCP",
    ip: "127.0.0.1",
    pid: 14290,
    parentPid: 14200,
    parentName: "npm run dev",
    childPids: [14291, 14292],
    processName: "node",
    commandPath: "node /workspace/frontend/server.js",
    memoryMb: 184.5,
    uptimeSec: 3420,
    category: "web",
    pinned: true,
    httpHealth: {
      status: 200,
      statusText: "OK",
      latencyMs: 14,
      checkedAt: "Just now",
    },
  },
  {
    port: 5173,
    protocol: "TCP",
    ip: "127.0.0.1",
    pid: 18932,
    parentPid: 18900,
    parentName: "vite",
    childPids: [],
    processName: "vite",
    commandPath: "node_modules/.bin/vite",
    memoryMb: 92.4,
    uptimeSec: 420,
    category: "web",
    pinned: false,
    httpHealth: {
      status: 200,
      statusText: "OK",
      latencyMs: 6,
      checkedAt: "Just now",
    },
  },
  {
    port: 8080,
    protocol: "TCP",
    ip: "0.0.0.0",
    pid: 9410,
    parentPid: 9400,
    parentName: "mvn spring-boot:run",
    childPids: [],
    processName: "java",
    commandPath: "java -jar target/api-gateway.jar",
    memoryMb: 412.0,
    uptimeSec: 18400,
    category: "web",
    pinned: true,
    httpHealth: {
      status: 200,
      statusText: "OK",
      latencyMs: 28,
      checkedAt: "Just now",
    },
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
    composeProject: "core-infrastructure",
    composeService: "postgres",
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
    composeProject: "core-infrastructure",
    composeService: "redis",
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
    composeProject: "messaging-stack",
    composeService: "rabbitmq",
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
    composeProject: "billing-service",
    composeService: "stripe-mock",
  },
];

const INITIAL_ENV_PROFILES: EnvProfile[] = [
  {
    id: "local",
    name: "Local Development",
    fileName: ".env.local",
    isActive: true,
    variablesCount: 6,
  },
  {
    id: "staging",
    name: "Remote Staging",
    fileName: ".env.staging",
    isActive: false,
    variablesCount: 5,
  },
  {
    id: "production",
    name: "Production (Read-Only)",
    fileName: ".env.production",
    isActive: false,
    variablesCount: 6,
  },
];

const MOCK_LOGS: Record<string, string[]> = {
  "d7a4e1b8c9f0": [
    "2026-09-13 21:00:01 UTC [1] LOG:  starting PostgreSQL 16.2 on x86_64-pc-linux-musl",
    "2026-09-13 21:00:01 UTC [1] LOG:  listening on IPv4 address '0.0.0.0', port 5432",
    "2026-09-13 21:00:01 UTC [1] LOG:  listening on IPv6 address '::', port 5432",
    "2026-09-13 21:00:02 UTC [1] LOG:  database system was shut down at 2026-09-13 20:59:58 UTC",
    "2026-09-13 21:00:02 UTC [1] LOG:  database system is ready to accept connections",
    "2026-09-13 21:05:14 UTC [28] LOG: checkpoint starting: time",
    "2026-09-13 21:05:16 UTC [28] LOG: checkpoint complete: wrote 42 buffers (0.3%); 0 WAL file(s) added",
  ],
  "e9f2a3c5d6b7": [
    "1:M 13 Sep 2026 21:00:03.112 * Running mode=standalone, port=6379.",
    "1:M 13 Sep 2026 21:00:03.114 # Server initialized",
    "1:M 13 Sep 2026 21:00:03.115 * Ready to accept connections tcp",
    "1:M 13 Sep 2026 21:12:00.542 * 100 changes in 300 seconds. Saving...",
    "1:M 13 Sep 2026 21:12:00.549 * Background saving terminated with success",
  ],
  "a3b9c8d7e6f5": [
    "Starting stripe-mock server v0.170.0 on port 12111...",
    "Loaded 1,420 OpenAPI operations across 42 tags",
    "Mock router listening on http://0.0.0.0:12111",
    "POST /v1/customers -> 200 OK (latency 12ms)",
    "POST /v1/payment_intents -> 200 OK (latency 18ms)",
  ],
};

export class MockBridge implements SystemBridge {
  private ports: PortInfo[] = JSON.parse(JSON.stringify(INITIAL_PORTS));
  private containers: DockerContainer[] = JSON.parse(JSON.stringify(INITIAL_CONTAINERS));
  private envProfiles: EnvProfile[] = JSON.parse(JSON.stringify(INITIAL_ENV_PROFILES));

  async getListeningPorts(): Promise<PortInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...this.ports];
  }

  async killProcess(pid: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const initialCount = this.ports.length;
    this.ports = this.ports.filter((p) => p.pid !== pid);
    return this.ports.length < initialCount;
  }

  async killProcessTree(pid: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const initialCount = this.ports.length;

    // Find all ports with this PID or where parentPid is this PID
    this.ports = this.ports.filter((p) => p.pid !== pid && p.parentPid !== pid);
    return this.ports.length < initialCount;
  }

  async checkPortHealth(port: number): Promise<HttpHealth | null> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const target = this.ports.find((p) => p.port === port);
    if (!target) return null;

    if (target.category === "web") {
      return {
        status: 200,
        statusText: "OK",
        latencyMs: Math.round(8 + Math.random() * 20),
        checkedAt: "Just now",
      };
    }
    return null;
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

  async getContainerLogs(id: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const lines = MOCK_LOGS[id] || [
      `2026-09-13 21:15:00 Container ${id} started successfully`,
      "Listening for incoming traffic on container socket...",
      "Status: healthy. 0 errors, 0 warnings.",
    ];
    return lines.join("\n");
  }

  async pruneStoppedContainers(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const beforeCount = this.containers.length;
    this.containers = this.containers.filter((c) => c.status === "running");
    return beforeCount - this.containers.length;
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

  async getEnvDiff(): Promise<EnvDiffResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      profiles: [
        { id: "local", name: "Local Dev", fileName: ".env.local" },
        { id: "staging", name: "Remote Staging", fileName: ".env.staging" },
        { id: "production", name: "Production", fileName: ".env.production" },
      ],
      entries: [
        {
          key: "DATABASE_URL",
          values: {
            local: "postgres://postgres:postgres@localhost:5432/app_dev",
            staging: "postgres://db_user:secure@staging-db.internal:5432/app_staging",
            production: "postgres://prod_user:vault-managed@prod-cluster.internal:5432/app_prod",
          },
          isSecret: true,
        },
        {
          key: "REDIS_HOST",
          values: {
            local: "localhost:6379",
            staging: "redis-staging.internal:6379",
            production: "redis-cluster.internal:6379",
          },
          isSecret: false,
        },
        {
          key: "JWT_SECRET_KEY",
          values: {
            local: "dev_insecure_jwt_secret_12345",
            staging: "stg_9f83ac8728b7e610d9f4e",
            production: "prd_a82bc9910d54ef021897c",
          },
          isSecret: true,
        },
        {
          key: "NEXT_PUBLIC_API_URL",
          values: {
            local: "http://localhost:8080/api/v1",
            staging: "https://api-staging.docktray.dev/v1",
            production: "https://api.docktray.dev/v1",
          },
          isSecret: false,
        },
        {
          key: "STRIPE_SECRET_KEY",
          values: {
            local: "sk_test_mock_12345",
            staging: null, // Notice: missing in staging to show warning
            production: "sk_live_vault_provisioned_key",
          },
          isSecret: true,
        },
        {
          key: "LOG_LEVEL",
          values: {
            local: "debug",
            staging: "info",
            production: "warn",
          },
          isSecret: false,
        },
      ],
    };
  }

  async createLocalTunnel(port: number): Promise<TunnelInfo> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      port,
      publicUrl: `https://docktray-preview-${port}.loca.lt`,
      expiresAt: "In 2 hours",
    };
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
