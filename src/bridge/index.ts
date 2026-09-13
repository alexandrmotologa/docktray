import { SystemBridge } from "../types";
import { mockBridgeInstance } from "./mockBridge";
import { tauriBridgeInstance } from "./tauriBridge";

export function isTauriEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ||
    (window as unknown as { __TAURI__?: unknown }).__TAURI__
  );
}

export function getBridge(): SystemBridge {
  if (isTauriEnvironment()) {
    return tauriBridgeInstance;
  }
  return mockBridgeInstance;
}

export { mockBridgeInstance, tauriBridgeInstance };
