export type PortProtocol = "TCP" | "UDP";

export type PortCategory = "web" | "database" | "cache" | "system" | "other";

export interface HttpHealth {
  status: number;
  statusText: string;
  latencyMs: number;
  checkedAt: string;
}

export interface PortInfo {
  port: number;
  protocol: PortProtocol;
  ip: string;
  pid: number;
  parentPid?: number;
  parentName?: string;
  childPids?: number[];
  processName: string;
  commandPath?: string;
  memoryMb: number;
  uptimeSec: number;
  category: PortCategory;
  pinned?: boolean;
  httpHealth?: HttpHealth;
}

export interface DockerPortMapping {
  privatePort: number;
  publicPort?: number;
  type: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: "running" | "exited" | "paused" | "restarting";
  state: string;
  ports: DockerPortMapping[];
  memoryUsageMb: number;
  cpuPercent: number;
  uptime: string;
  composeProject?: string;
  composeService?: string;
}

export interface EnvProfile {
  id: string;
  name: string;
  fileName: string;
  isActive: boolean;
  variablesCount: number;
}

export interface EnvDiffEntry {
  key: string;
  values: Record<string, string | null>;
  isSecret: boolean;
}

export interface EnvDiffResult {
  profiles: Array<{ id: string; name: string; fileName: string }>;
  entries: EnvDiffEntry[];
}

export interface SystemStats {
  totalMemoryMb: number;
  usedMemoryMb: number;
  freeMemoryMb: number;
  cpuUsagePercent: number;
  listeningPortCount: number;
  dockerAvailable: boolean;
}

export interface AppSettings {
  pollIntervalMs: number;
  autoPauseOnBlur: boolean;
  enableSoundEffects: boolean;
  defaultKillMode: "single" | "tree";
}

export type ActiveTab = "ports" | "docker" | "env";

export interface TunnelInfo {
  port: number;
  publicUrl: string;
  expiresAt: string;
}

export interface SystemBridge {
  getListeningPorts(): Promise<PortInfo[]>;
  killProcess(pid: number): Promise<boolean>;
  killProcessTree(pid: number): Promise<boolean>;
  checkPortHealth(port: number): Promise<HttpHealth | null>;
  getContainers(): Promise<DockerContainer[]>;
  restartContainer(id: string): Promise<boolean>;
  stopContainer(id: string): Promise<boolean>;
  getContainerLogs(id: string, tail?: number): Promise<string>;
  pruneStoppedContainers(): Promise<number>;
  getEnvProfiles(projectPath?: string): Promise<EnvProfile[]>;
  switchEnvProfile(profileId: string, projectPath?: string): Promise<boolean>;
  getEnvDiff(projectPath?: string): Promise<EnvDiffResult>;
  createLocalTunnel(port: number): Promise<TunnelInfo>;
  getSystemStats(): Promise<SystemStats>;
  isMock(): boolean;
}
