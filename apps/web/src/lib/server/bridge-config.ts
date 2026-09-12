import { resolveModel } from "agent-core";
import { authConfiguration } from "../auth-config";
export function bridgeConfig() {
  let live = false;
  try { resolveModel(); live = true; } catch { /* Guided demo until a provider is configured. */ }
  return { live, storage: authConfiguration().enabled ? "private local workspace" : process.env.AMBIGUOUS_API_KEY?.trim() ? "Ambiguous" : "local demo" };
}
