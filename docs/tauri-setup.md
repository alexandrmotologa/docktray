# Tauri 2.0 desktop setup guide

This document outlines the required environment setup to build and run the native desktop binary on Windows, macOS, and Linux.

## Operating system requirements

### Windows

1. Install Visual Studio Build Tools 2022 or the C++ Build Tools workload.
2. Install WebView2 Runtime (pre-installed on Windows 10 and 11).
3. Install Rust using rustup:
   ```powershell
   winget install Rustlang.Rustup
   rustup default stable-msvc
   ```

### macOS

1. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
2. Install Rust:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

### Linux (Debian / Ubuntu)

1. Install required system packages:
   ```bash
   sudo apt-get update
   sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
   ```
2. Install Rust:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

## Development commands

From the root project directory:

```bash
# Run web client in hot reload mode alongside Tauri native wrapper
npm run tauri dev

# Compile standalone executable installer or portable binary
npm run tauri build
```

The resulting binaries will be placed in `src-tauri/target/release/`.

## Tray configuration details

Tauri 2.0 handles the tray icon natively through the `tauri::tray::TrayIconBuilder` API. Unlike older Tauri 1.x configurations, tray listeners are configured directly in Rust or through `tauri.conf.json`.

In `src-tauri/tauri.conf.json`:
- The main window is configured with `decorations: false`, `transparent: true`, and `visible: false` on startup.
- The window appears immediately when the user clicks the tray icon or triggers the global shortcut.
