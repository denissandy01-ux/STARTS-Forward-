import { BridgeWorkspace } from "@/components/bridge-workspace";
import { bridgeConfig } from "@/lib/server/bridge-config";
import { authConfiguration } from "@/lib/auth-config";
import { getAuth0 } from "@/lib/auth0";
import { createHash } from "node:crypto";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = authConfiguration().ready ? (await getAuth0().getSession())?.user : undefined;
  const account = user?.sub ? { name: user.name || user.nickname || "Student", key: createHash("sha256").update(user.sub).digest("hex") } : undefined;
  return <BridgeWorkspace {...bridgeConfig()} account={account} />;
}
