<p align="center">
  <img src="docs/images/logo.png?raw=true" alt="DockTray Logo" width="140" style="border-radius: 28px;" />
</p>

<h1 align="center">DockTray</h1>

<p align="center">
  <strong>The vigilant system tray utility for ports, rogue processes, and Docker containers.</strong>
</p>

<p align="center">
  <a href="https://github.com/alexandrmotologa/docktray/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/alexandrmotologa/docktray/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI Status"></a>
  <img src="https://img.shields.io/badge/Tauri-v2.0-24C8D8?logo=tauri&logoColor=white&style=flat-square" alt="Tauri 2.0">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 19">
  <img src="https://img.shields.io/badge/Rust-1.80+-DEA584?logo=rust&logoColor=black&style=flat-square" alt="Rust">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=flat-square" alt="License MIT">
</p>

<p align="center">
  <img src="docs/images/demo.gif?raw=true" alt="DockTray Interactive Demo" width="620" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

---

## Overview

DockTray lives in your menubar or taskbar, monitoring active TCP and UDP listening ports, terminating rogue processes with one click, and providing a unified view of your Docker containers.

Developers frequently run into situations where a local port like `3000`, `5173`, or `8080` remains locked by an unresponsive background process. DockTray detects the process ID, parent process tree, memory allocation, and port protocol, letting you free the port immediately without manual shell commands like `lsof -i` or `netstat`.

## Key capabilities

- **Port Conflict Sentinel:** Detects when your pinned development ports are occupied and displays an instant "Free Port" banner.
- **Recursive Process Tree Killing:** Eliminates both the root process and all child workers (such as parent `npm run dev` and spawned `node` instances).
- **HTTP Health and Latency Probing:** Real-time HTTP response status (`200 OK`) and latency indicators (`14ms`) on active web servers.
- **Docker Live Logs:** Terminal-styled log viewer with live polling, auto-scroll, and clipboard copy.
- **Docker Compose Grouping:** Containers organized by project stack (`core-infrastructure`, `messaging-stack`) with one-click cleanup (`Prune Stopped`).
- **Environment Profile Diff:** Compare `.env.local`, `.env.staging`, and `.env.production` side by side with missing variable detection and masked secrets.
- **Local Tunnel Sharing:** Generate temporary public tunnel URLs to preview local web applications on mobile devices.
- **Full Keyboard Navigation:** Browse with arrow keys, launch with `Enter`, and trigger quick kills with keyboard shortcuts.
- **Web Simulation Layer:** Full browser preview mode (`npm run dev:web`) running against an interactive mock bridge for rapid testing without native build tools.

---

## Visual Tour

### Port Conflict Sentinel & HTTP Health Probes
When a priority port like `:3000` is locked, DockTray alerts you immediately and provides a one-click resolution.

<p align="center">
  <img src="docs/images/screenshot-ports.png?raw=true" alt="Ports View with Conflict Banner" width="480" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

### Live Docker Logs & Compose Grouping
Inspect container logs in real time and manage multi-container project stacks directly from the tray popover.

<p align="center">
  <img src="docs/images/screenshot-docker-logs.png?raw=true" alt="Docker Containers and Logs Viewer" width="480" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

### Environment Profile Diff Viewer
Identify missing configuration keys between local development, staging, and production environments before running into runtime crashes.

<p align="center">
  <img src="docs/images/screenshot-env-diff.png?raw=true" alt="Environment Profile Diff Table" width="480" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

### Public Localhost Tunnel Sharing
Share any active web port with teammates or mobile devices using temporary public tunnel addresses.

<p align="center">
  <img src="docs/images/screenshot-tunnel.png?raw=true" alt="Public Local Tunnel Modal" width="440" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

---

## Architecture

DockTray decouples the user interface from operating system calls through a unified system bridge:

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

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Desktop runtime:** Tauri 2.0.
- **System inspection:** `netstat2` and `sysinfo` crates.
- **Docker integration:** `bollard` client connecting to the Docker daemon socket or Windows named pipe.

Technical specifications are detailed in [docs/architecture.md](docs/architecture.md).

---

## Getting Started

### Prerequisites

- Node.js 20 or newer
- Rust toolchain 1.80 or newer (required for native desktop binaries)
- Optional: Docker Desktop or Docker Engine

### Web Preview Mode

You can run and test the complete application in any browser without compiling the Rust backend. The application detects the browser runtime and starts in mock mode:

```bash
# Install dependencies
npm install

# Start web preview
npm run dev:web
```

Open `http://localhost:5173` to test port monitoring, container logs, and profile diffing.

### Native Desktop Application

To build and run the native desktop utility:

```bash
# Start native development build
npm run tauri dev

# Build production bundle
npm run tauri build
```

The resulting binaries will be placed in `src-tauri/target/release/`.

---

## Keyboard Shortcuts

- `Ctrl + K` or `Cmd + K`: Focus the search and filter input.
- `Arrow Up` / `Arrow Down`: Navigate through listening ports.
- `Enter`: Open `http://localhost:<port>` for the selected port.
- `Escape`: Clear search filter or close the active modal.
- `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS): Summon the DockTray popover globally.

---

## Automated Tests

Run the Vitest test suite:

```bash
npm run test
```

Run TypeScript compilation and static verification:

```bash
npm run typecheck
npm run build
```

---

## Brand Mascot

DockTray features the **Dock Osprey** (Sea Hawk) as its official mascot. Perched vigilantly atop harbor dock poles, the osprey surveys the entire coastline with 360-degree vision, diving with laser precision to snatch rogue processes.

The official vector logo is stored in [docs/images/logo.svg](docs/images/logo.svg) and [docs/images/logo.png](docs/images/logo.png).

---

## License

This project is released under the [MIT License](LICENSE).
