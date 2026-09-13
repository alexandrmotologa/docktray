export type PortProtocol = "TCP" | "UDP";

export type PortCategory = "web" | "database" | "cache" | "system" | "other";

export interface PortInfo {
  port: number;
  protocol: PortProtocol;
  ip: string;
  pid: number;
  processName: string;
  commandPath?: string;
  memoryMb: number;
  uptimeSec: number;
  category: PortCategory;
  pinned?: boolean;
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
}

export interface EnvProfile {
  id: string;
  name: string;
  fileName: string;
  isActive: boolean;
  variablesCount: number;
}

export interface SystemStats {
  totalMemoryMb: number;
  usedMemoryMb: number;
  freeMemoryMb: number;
  cpuUsagePercent: number;
  listeningPortCount: number;
  dockerAvailable: boolean;
}

export type ActiveTab = "ports" | "docker" | "env";

export interface SystemBridge {
  getListeningPorts(): Promise<PortInfo[]>;
  killProcess(pid: number): Promise<boolean>;
  getContainers(): Promise<DockerContainer[]>;
  restartContainer(id: string): Promise<boolean>;
  stopContainer(id: string): Promise<boolean>;
  getEnvProfiles(projectPath?: string): Promise<EnvProfile[]>;
  switchEnvProfile(profileId: string, projectPath?: string): Promise<boolean>;
  getSystemStats(): Promise<SystemStats>;
  isMock(): boolean;
}
