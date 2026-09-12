import { test } from "node:test";
import assert from "node:assert/strict";
import { authConfiguration } from "./auth-config";
test("missing and partial Auth0 configuration cannot enable a working login", () => {
  assert.equal(authConfiguration({}).enabled, false);
  assert.equal(authConfiguration({ AUTH0_ENABLED: "true" }).ready, false);
  assert.equal(authConfiguration({ AUTH0_DOMAIN: "tenant.auth0.com" }).enabled, true);
});
test("Auth0 requires all credentials, a 32-byte secret and a secure or loopback URL", () => {
  const env = { AUTH0_DOMAIN: "tenant.auth0.com", AUTH0_CLIENT_ID: "client", AUTH0_CLIENT_SECRET: "secret", AUTH0_SECRET: "ab".repeat(32), APP_BASE_URL: "http://127.0.0.1:3100" };
  assert.equal(authConfiguration(env).ready, true);
  assert.equal(authConfiguration({ ...env, AUTH0_SECRET: "short" }).ready, false);
  assert.equal(authConfiguration({ ...env, APP_BASE_URL: "http://public.example" }).ready, false);
});
