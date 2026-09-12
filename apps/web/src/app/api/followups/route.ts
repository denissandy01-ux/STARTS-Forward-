import { resolve } from "node:path";
import { createFollowupHandler } from "@/lib/server/followup-http";
import { configuredWorkplace } from "@/lib/server/workplace";
import { DemoWorkplace } from "@/lib/server/demo-workplace";
import { findPriority } from "@/lib/bridge";
import { authConfiguration } from "@/lib/auth-config";
import { getAuth0 } from "@/lib/auth0";
import { createHash } from "node:crypto";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createFollowupHandler({
  connect: () =>
    process.env.AMBIGUOUS_API_KEY?.trim() ? configuredWorkplace() : { workplace: new DemoWorkplace(resolve(".data/bridge-demo-records")), close: async () => {} },
  directory: resolve(process.env.WEB_APPROVAL_DIR || (process.env.AMBIGUOUS_API_KEY?.trim() ? ".data/bridge-live-approvals" : ".data/bridge-demo-approvals")),
  resolveRecord: findPriority,
});
async function authenticatedHandler(request: Request) {
  const config = authConfiguration();
  if (!config.enabled) return handler(request);
  if (!config.ready) return Response.json({ error: "Login configuration is incomplete." }, { status: 503 });
  const user = (await getAuth0().getSession())?.user;
  if (!user?.sub) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  // Separate physical stores also isolate direct record-ID reads and approvals.
  const key = createHash("sha256").update(user.sub).digest("hex");
  return createFollowupHandler({
    connect: () => ({ workplace: new DemoWorkplace(resolve(".data/users", key, "records")), close: async () => {} }),
    directory: resolve(".data/users", key, "approvals"), resolveRecord: findPriority,
  })(request);
}
export const GET = authenticatedHandler;
export const POST = authenticatedHandler;
