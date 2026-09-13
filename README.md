# DockTray

DockTray is a system tray utility for developers. It lives in your menubar or taskbar, monitors listening TCP and UDP ports on your machine, lets you terminate rogue processes with one click, and gives you a quick overview of running Docker containers.

Developers frequently run into issues where a local port like `3000` or `8080` remains locked by a forgotten background process. DockTray detects the process ID and memory consumption, displays the process name, and lets you kill it without running manual shell commands like `lsof -i` or `netstat`.

## Key capabilities

- Scan active IPv4 and IPv6 listening sockets in real time.
- Inspect process names, PIDs, memory usage, and open ports.
- Terminate unresponsive processes with one click.
- Launch `http://localhost:<port>` directly in your browser.
- Track local Docker containers, their memory footprint, and mapped ports.
- Restart or stop containers from the tray.
- Switch between environment profiles (`.env.local`, `.env.staging`, `.env.production`).
- Export listening port lists to clipboard as JSON or Markdown.
- Run in standard web browsers using a mock simulation layer for fast UI development without native dependencies.

## Architecture

DockTray uses Tauri 2.0 with a Rust backend and a React 19 frontend built on Vite and Tailwind CSS.

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Desktop runtime:** Tauri 2.0.
- **System inspection:** `netstat2` and `sysinfo` crates.
- **Docker communication:** `bollard` client talking to the Docker daemon socket or Windows named pipe.

Detailed architectural diagrams and bridge patterns are documented in [docs/architecture.md](docs/architecture.md).

## Getting started

### Prerequisites

- Node.js 20 or newer
- Rust toolchain 1.80 or newer (only needed for native desktop builds)
- Optional: Docker Desktop or Docker Engine

### Web preview mode

You can run and test the full user interface in any modern browser without compiling the Rust backend. The application detects the browser environment and activates an interactive mock bridge.

```bash
# Install dependencies
npm install

# Start web preview
npm run dev:web
```

Open `http://localhost:5173` to interact with the simulated ports, process terminations, and Docker containers.

### Native desktop application

To run the application inside Tauri with native system socket inspection:

```bash
# Start native development build
npm run tauri dev

# Build production bundle
npm run tauri build
```

## Keyboard shortcuts

- `Ctrl + K` or `Cmd + K`: Focus the search and filter input.
- `Escape`: Clear search filter or close active modal.
- `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS): Summon DockTray tray popover globally.

## Automated tests

Run the unit and component test suite:

```bash
npm run test
```

Run TypeScript compilation and static verification:

```bash
npm run typecheck
npm run build
```

## License

This project is released under the [MIT License](LICENSE).
