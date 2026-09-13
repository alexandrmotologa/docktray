# Contributing to DockTray

Thank you for your interest in contributing to DockTray! We welcome contributions of all kinds, whether you are fixing a bug, improving documentation, or proposing new features.

---

## Code of Conduct

Please treat everyone in the community with respect, kindness, and constructive feedback. Open source thrives when developers collaborate positively.

---

## How to Contribute

### 1. Reporting Bugs & Requesting Features
- **Search existing issues** first to avoid duplicates.
- **For bugs:** Open an issue describing the bug, including steps to reproduce, expected vs. actual behavior, and environment details (OS, Rust toolchain version, Node.js version, and Docker engine version).
- **For feature requests:** Describe the problem you are trying to solve and propose a UI feature, tray action, or container diagnostic tool.

### 2. Pull Request Workflow

1. **Fork the repository** and clone locally:
   ```bash
   git clone https://github.com/alexandrmotologa/docktray.git
   # Or clone your personal fork if preparing a pull request:
   # git clone https://github.com/YOUR_USERNAME/docktray.git
   cd docktray
   ```

2. **Create a topic branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or: git checkout -b fix/issue-description
   ```

3. **Follow commit conventions:** We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add PID termination shortcut to process table`
   - `fix: prevent zombie process leaks in port polling daemon`
   - `docs: update Windows system tray autostart guide in README`
   - `perf: optimize native socket enumeration via Win32 netstat API`

4. **Ensure code quality:**
   - Keep code clean, readable, and strictly typed.
   - Run type checks and frontend unit tests: `npm run typecheck && npm test`.
   - Ensure Rust native components in `src-tauri` compile without warnings.

5. **Push and open a Pull Request:**
   - Push your branch to your fork:
     ```bash
     git push origin feat/your-feature-name
     ```
   - Open a Pull Request against the `main` branch.
   - Provide a clear PR title and description outlining the changes made and referencing any related issues (e.g., `Closes #12`).

---

## Development Setup

DockTray is built with **Tauri v2 (Rust)** on the backend and **React 19, TypeScript, Vite, and Tailwind CSS** on the frontend.

### Prerequisites
- **Node.js 20+ LTS** and `npm`
- **Rust toolchain (stable / 1.77+)** via [rustup.rs](https://rustup.rs/)
- *(Optional)* **Docker Desktop / Docker Engine** for testing container management features

### Steps
1. **Clone the repository and install frontend dependencies:**
   ```bash
   git clone https://github.com/alexandrmotologa/docktray.git
   cd docktray
   npm install
   ```

2. **Start the web UI in standalone preview mode:**
   ```bash
   npm run dev
   ```

3. **Launch the desktop application with Tauri live reload:**
   ```bash
   npm run tauri dev
   ```

4. **Run unit tests:**
   ```bash
   npm test
   ```

5. **Build the production desktop installer:**
   ```bash
   npm run tauri build
   ```

Refer to the **Quick Start** section in [README.md](README.md) for full configuration flags, architecture details, and usage examples.

---

## Questions & Discussions

If you have questions about architecture decisions or need guidance before submitting a large change, feel free to open a Discussion or an Issue with the `question` label.
