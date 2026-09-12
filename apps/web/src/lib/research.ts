import { z } from "zod";
export const researchInput = z.object({ query: z.string().trim().min(3).max(500), scope: z.enum(["all", "governance"]).default("all") }).strict();
export type ResearchHit = { title: string; url: string; published?: string; excerpt: string };
export async function requestResearch(query: string, scope = "all"): Promise<ResearchHit[]> {
  const response = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, scope }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Research is unavailable.");
  return body.results;
}
export function safeResearchUrl(value: string) {
  try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
