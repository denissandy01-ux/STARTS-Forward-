# Activate STARTS Bridge and Auth0

The live CopilotKit conversation integration already exists. No account credentials were present during this change. Auth0 SDK v4 login, logout, callback handling and protected workspace/API routes are now implemented using Next.js 15 middleware.

## Account owner setup

Edit root `.env` locally; never paste secrets into chat or commit this file.

1. Set `MODEL_PROVIDER=openai`, fill `OPENAI_API_KEY`, and set `MODEL` to a tool-capable model available to your API account. An API account with usage access is required. Restart the app after configuration. A configured indicator is not proof that the key/model works.
2. In https://manage.auth0.com create a **Regular Web Application**, named STARTS Forward. Do not use the starter's machine-to-machine application.
3. Set Allowed Callback URLs to `http://127.0.0.1:3100/auth/callback`.
4. Set Allowed Logout URLs and Allowed Web Origins to `http://127.0.0.1:3100`.
5. Copy Domain, Client ID and Client Secret into `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`. Keep the generated local `AUTH0_SECRET`. Set `AUTH0_ENABLED=true`. `APP_BASE_URL` is already set to `http://127.0.0.1:3100`.
6. Enable the intended Auth0 user connection and registration policy. Auth0 Universal Login handles passwords; STARTS Forward does not collect them.
7. Restart with `./start-local.sh`. Open `/login`, sign in, then send STARTS Bridge: “Explain this priority and propose one supervised paid project. Do not save it yet.” Review the answer and the proposal, approve or decline, and verify the record in Shared projects.
8. Sign out and confirm APIs reject unauthenticated requests. Sign in as a different test user and confirm the first user's records are absent.

## Storage and behavior

With Auth0 enabled, saved proposals and records use separate `.data/users/<hashed-user-id>/` folders. Existing guest/demo records are not imported. Browser learning notes use per-user storage keys, remain local to this browser and are not encrypted against other people with access to the browser profile. Chat history is not a durable cross-device archive.

The Ambiguous adapter remains available only in unauthenticated local demo mode. Authenticated records use the private local store until external workspace authorization is implemented. Authentication is not a collaboration sharing/invitation system. Server remains loopback-only; this change does not publish the website or fix the inherited dependency audit findings.

Partial Auth0 configuration blocks protected routes instead of falling back to guest access. No credentials means the original guided demo remains available, with a sign-in setup page. The Auth0 access-token endpoint is disabled because the client does not need provider tokens.

## References

- https://auth0.com/docs/quickstart/webapp/nextjs
- https://github.com/auth0/nextjs-auth0 (SDK v4; middleware.ts for Next.js 15)
- https://developers.openai.com/api/reference/overview (server-side API authentication)
