import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

test("protected routes fail closed with incomplete configuration and reject unauthenticated API calls", async () => {
  const keys = ["AUTH0_ENABLED", "AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "AUTH0_SECRET", "APP_BASE_URL"];
  const original = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  try {
    for (const key of keys) delete process.env[key];
    process.env.AUTH0_ENABLED = "true";
    assert.equal((await middleware(new NextRequest("http://127.0.0.1:3100/api/followups"))).status, 503);
    assert.equal((await middleware(new NextRequest("http://127.0.0.1:3100/"))).status, 307);
    Object.assign(process.env, { AUTH0_DOMAIN: "test.auth0.com", AUTH0_CLIENT_ID: "test", AUTH0_CLIENT_SECRET: "test", AUTH0_SECRET: "ab".repeat(32), APP_BASE_URL: "http://127.0.0.1:3100" });
    const invalidCallback = await middleware(new NextRequest("http://127.0.0.1:3100/auth/callback?state=expired&code=invalid"));
    assert.equal(invalidCallback.status, 307);
    assert.equal(invalidCallback.headers.get("location"), "http://127.0.0.1:3100/login?notice=retry");
    assert.ok(!invalidCallback.headers.get("set-cookie")?.includes("__session="));
    assert.equal((await middleware(new NextRequest("http://127.0.0.1:3100/api/copilotkit"))).status, 401);
    assert.equal((await middleware(new NextRequest("http://127.0.0.1:3100/api/followups"))).status, 401);
    assert.equal((await middleware(new NextRequest("http://127.0.0.1:3100/"))).status, 307);
  } finally { for (const key of keys) { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; } }
});
