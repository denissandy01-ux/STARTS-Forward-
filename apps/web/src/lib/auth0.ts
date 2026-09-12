import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { authConfiguration } from "./auth-config";
let client: Auth0Client | undefined;
export function getAuth0() {
  if (!authConfiguration().ready) throw new Error("Auth0 configuration is incomplete.");
  return client ??= new Auth0Client({ enableAccessTokenEndpoint: false });
}
