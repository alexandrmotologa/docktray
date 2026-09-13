import { DockerContainer, EnvProfile, PortInfo, SystemBridge, SystemStats } from "../types";

// Tauri invoke dynamically loaded or imported
type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

let invokePromise: Promise<InvokeFn> | null = null;

async function getInvoke(): Promise<InvokeFn> {
  if (!invokePromise) {
    invokePromise = import("@tauri-apps/api/core").then((mod) => mod.invoke);
  }
  return invokePromise;
}

export class TauriBridge implements SystemBridge {
  async getListeningPorts(): Promise<PortInfo[]> {
    const invoke = await getInvoke();
    return invoke<PortInfo[]>("get_listening_ports");
  }

  async killProcess(pid: number): Promise<boolean> {
    const invoke = await getInvoke();
    return invoke<boolean>("kill_process", { pid });
  }

  async getContainers(): Promise<DockerContainer[]> {
    const invoke = await getInvoke();
    return invoke<DockerContainer[]>("get_docker_containers");
  }

  async restartContainer(id: string): Promise<boolean> {
    const invoke = await getInvoke();
    return invoke<boolean>("restart_docker_container", { id });
  }

  async stopContainer(id: string): Promise<boolean> {
    const invoke = await getInvoke();
    return invoke<boolean>("stop_docker_container", { id });
  }

  async getEnvProfiles(projectPath?: string): Promise<EnvProfile[]> {
    const invoke = await getInvoke();
    return invoke<EnvProfile[]>("get_env_profiles", { projectPath });
  }

  async switchEnvProfile(profileId: string, projectPath?: string): Promise<boolean> {
    const invoke = await getInvoke();
    return invoke<boolean>("switch_env_profile", { profileId, projectPath });
  }

  async getSystemStats(): Promise<SystemStats> {
    const invoke = await getInvoke();
    return invoke<SystemStats>("get_system_stats");
  }

  isMock(): boolean {
    return false;
  }
}

export const tauriBridgeInstance = new TauriBridge();
