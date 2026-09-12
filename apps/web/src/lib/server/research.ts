import { researchInput, safeResearchUrl, type ResearchHit } from "../research";
export async function handleResearch(request: Request, apiKey = process.env.EXA_API_KEY, fetcher: typeof fetch = fetch) {
  const headers = { "Cache-Control": "no-store" };
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(`${url.protocol}//${host}`).hostname) || request.headers.get("origin") !== `${url.protocol}//${host}`) return reply({ error: "Search from this application's own page." }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 2000) return reply({ error: "Search query is too long." }, 413);
    const parsed = researchInput.safeParse(JSON.parse(raw));
    if (!parsed.success) return reply({ error: "Enter a query of 3–500 characters and a valid source scope." }, 400);
    if (!apiKey?.trim()) return reply({ error: "Exa is not connected. Add EXA_API_KEY to the server .env and restart." }, 503);
    const response = await fetcher("https://api.exa.ai/search", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey.trim() }, signal: AbortSignal.timeout(20000), body: JSON.stringify({ query: parsed.data.query, type: "auto", numResults: 5, ...(parsed.data.scope === "governance" ? { includeDomains: ["un.org", "unesco.org", "who.int"] } : {}), contents: { highlights: { numSentences: 2, highlightsPerUrl: 1 } } }) });
    if (!response.ok) return reply({ error: response.status === 429 || response.status === 402 ? "Exa search credit or rate limit reached. Check your Exa account." : "Exa could not complete the search. Check its API key and try again." }, 502);
    const body = await response.json();
    if (!Array.isArray(body.results)) throw new Error("Invalid results");
    const results: ResearchHit[] = body.results.filter((h: any) => typeof h.url === "string" && safeResearchUrl(h.url)).slice(0, 5).map((h: any) => ({ title: String(h.title || h.url).slice(0,160), url: h.url.slice(0,1500), published: typeof h.publishedDate === "string" ? h.publishedDate : undefined, excerpt: String(h.highlights?.[0] || "No excerpt supplied. Open the source to review it.").slice(0,1600) }));
    return reply({ results, provider: "Exa", untrusted: true });
  } catch (error) { return reply({ error: error instanceof SyntaxError ? "Invalid search request." : "Search failed or timed out. Please try again." }, error instanceof SyntaxError ? 400 : 502); }
}
