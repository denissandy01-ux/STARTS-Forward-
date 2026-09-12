const fields = ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "AUTH0_SECRET", "APP_BASE_URL"] as const;
export function authConfiguration(env: Record<string, string | undefined> = process.env) {
  const missing = fields.filter(key => !env[key]?.trim());
  const enabled = env.AUTH0_ENABLED === "true" || fields.slice(0, 3).some(key => !!env[key]?.trim());
  const validSecret = /^[a-f0-9]{64}$/i.test(env.AUTH0_SECRET || "");
  let validUrl = false;
  try { const url = new URL(env.APP_BASE_URL || ""); validUrl = url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)); } catch {}
  return { enabled, ready: missing.length === 0 && validSecret && validUrl, missing };
}
