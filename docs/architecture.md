# Architecture specification

DockTray separates system communication from the presentation layer using an abstracted bridge interface. This allows developers to work on the UI in standard web browsers while retaining full native integration when packaged as a desktop binary with Tauri.

## High-level overview

```
+-------------------------------------------------------------+
|                      React 19 Frontend                      |
| (TrayHeader, PortList, DockerList, EnvSwitcher, SearchBar)  |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      System Bridge API                      |
|                   (src/bridge/index.ts)                     |
+-------------------------------------------------------------+
            |                                     |
            | (Standard browser)                  | (Tauri runtime)
            v                                     v
+-----------------------+             +-----------------------+
|      Mock Bridge      |             |     Tauri Bridge      |
| (src/bridge/mock.ts)  |             | (src/bridge/tauri.ts) |
+-----------------------+             +-----------------------+
                                                  |
                                                  v
                                      +-----------------------+
                                      |     Rust Backend      |
                                      |  (src-tauri/src/)     |
                                      +-----------------------+
                                        /         |         \
                                       v          v          v
                                  [Sockets]   [Process]   [Docker]
                                  netstat2    sysinfo     bollard
```

## Bridge layer design

The bridge exposes a unified contract (`SystemBridge`):

```typescript
export interface SystemBridge {
  getListeningPorts(): Promise<PortInfo[]>;
  killProcess(pid: number): Promise<boolean>;
  getContainers(): Promise<DockerContainer[]>;
  restartContainer(id: string): Promise<boolean>;
  stopContainer(id: string): Promise<boolean>;
  getEnvProfiles(projectPath?: string): Promise<EnvProfile[]>;
  switchEnvProfile(profileId: string, projectPath?: string): Promise<boolean>;
  getSystemStats(): Promise<SystemStats>;
}
```

When the frontend mounts, `getBridge()` evaluates whether `window.__TAURI_INTERNALS__` exists:
- In browser mode, `MockBridge` handles calls using in-memory mock datasets and simulates realistic system responses.
- In desktop mode, `TauriBridge` forwards requests to Tauri commands via `@tauri-apps/api/core`.

## Rust backend components

### 1. Port scanner (`src-tauri/src/commands/ports.rs`)
The scanner gathers all active TCP and UDP sockets in listening status using `netstat2`.
For each listening socket, it resolves:
- Port number and protocol (TCP or UDP, IPv4 or IPv6)
- Associated process ID (PID)
- Process binary name and execution path
- Resident set memory size (RSS) via `sysinfo::System`
- Socket uptime

### 2. Process manager (`src-tauri/src/commands/process.rs`)
Process termination works cross-platform:
- On Windows, it invokes process termination via Windows API or `sysinfo::Process::kill`.
- On Unix (macOS and Linux), it issues `SIGTERM` followed by `SIGKILL` if the process does not terminate within 500ms.
- The command verifies whether the target PID still exists before returning a boolean result.

### 3. Docker controller (`src-tauri/src/commands/docker.rs`)
Docker integration relies on the `bollard` asynchronous library:
- On Windows, it connects over `//./pipe/docker_engine`.
- On macOS and Linux, it connects over `/var/run/docker.sock`.
- If the Docker daemon is unreachable, the call returns an empty container list with an offline status flag instead of throwing an unhandled panic.

### 4. Environment profile switcher (`src-tauri/src/commands/env_profiles.rs`)
Manages configuration profiles for active local repositories:
- Reads candidate profiles such as `.env.development`, `.env.staging`, `.env.production`.
- Swaps the active `.env` file via atomic file replacement.

## Window management and popover behavior

The application window is configured as a borderless popover:
- Clicking the tray icon calculates the tray icon coordinate and positions the window directly beneath it.
- Losing focus (the `onBlur` or focus-lost event) automatically hides the window to prevent desktop clutter.
- A global hotkey (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS) triggers the window visibility toggle.
