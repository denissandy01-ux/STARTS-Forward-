# STARTS Forward web prototype

A coalition workspace that turns an illustrative community health priority into a reviewed project charter with partner responsibilities, paid early-career role concepts, SDG alignment, a service handoff and outcome measures.

## Run locally

The prototype is installed in this directory. On this Mac:

```sh
./start-local.sh
```

Open http://127.0.0.1:3100. If it is already running, use that address without starting a second server.

For a fresh checkout, install Node.js 22+ and run:

```sh
npm ci
cp .env.starts-forward.example .env
npm run dev:web
```

## Try the complete workflow

1. Select Access to care, Digital inclusion, Community evidence or Maternal-health referrals.
2. Explore the Collaboration and Career pathways tabs.
3. Click Build a shared project. Read the proposed charter.
4. Click Decline: no project record is created.
5. Prepare another proposal and click Approve & save locally.
6. Open Shared projects, refresh the browser, then reopen Shared projects. The same record ID remains. Select the relevant priority to see its records.
7. Visit Partner network and Knowledge library for proposed contributions and official sources.

One Community-to-Care Bridge record was saved as part of browser verification. It is synthetic demo content.

## Demo versus live AI

With no model key, the app is an interactive guided demo: prompts return predefined, priority-specific guidance and project buttons assemble a deterministic charter. Coordinator notes are appended as unverified input, not interpreted by AI. This mode makes no model calls.

The existing CopilotKit runtime and live chat integration are preserved. To enable AI, edit root `.env` locally and restart:

```dotenv
MODEL_PROVIDER=openai
OPENAI_API_KEY=your-key
MODEL=a-model-your-api-account-can-use
```

Do not paste credentials into chat, expose them in client code, or commit `.env`. The configured indicator means configuration is present, not that a live request was verified. OpenRouter and other starter-supported providers retain their existing configuration paths.

The STARTS Bridge prompt lives in `apps/web/src/lib/bridge-instructions.ts` and is re-exported by `bridge.ts`. Page context includes the selected priority, partner types, source summaries, learning workspace, current proposal and saved records. Frontend tools can run a coordinated capability, select a priority, show the evidence library, propose a charter, and retrieve or refresh records. Only the page's approval operation saves the immutable server-held proposal. Raw workplace writes are not exposed to chat.

The knowledge library contains curated summaries and official source links, not a complete ingested corpus, semantic search, or current web retrieval. Domain guardrails are instructions, not a claim of comprehensive policy enforcement. Live model grounding and adversarial behavior require evaluation once credentials are configured.

## Storage

Without `AMBIGUOUS_API_KEY`, approved projects are JSON records under `apps/web/.data/bridge-demo-records/`. Approval metadata is stored separately under `apps/web/.data/bridge-demo-approvals/`. Both survive restarts on the same disk. They are ignored by Git. Drafts require a browser session and expire after ten minutes; unsaved drafts are not restored after reload.

To use the starter's Ambiguous MCP adapter, set `AMBIGUOUS_API_KEY` in root `.env` and restart. New writes then use the external workspace and separate approval metadata. There is no automatic migration of local records, and a failed external write does not fall back to local storage. Verify workspace identity and live create/read/decline behavior before using real project data.

This is a loopback-only, single-workspace prototype. Browser sessions protect proposal decisions; they are not user authentication. Local records are shared by users of this local app. Public deployment needs authentication, authorization, data governance, validated source ingestion, accessibility review and dependency remediation. Use only synthetic/public data here.

## Verification completed September 12, 2026

- `npm run verify`: 99 tests passed (37 agent core, 22 channel, 40 web), including Bridge persistence/approval, team matching, capability grounding and charter length checks.
- `npm run build --workspace web`: passed. An inherited Google Vertex provider bundling warning remains.
- Browser: rendered at 1440×1000 and 390×844; decline leaves zero records; approve returns a UUID; reload retrieves the same record; switching priority updates career roles; source library displays official links.
- Live model calls, Ambiguous account integration, and managed CopilotKit Intelligence were not tested because credentials were not configured.

## Dependency audit

The inherited dependency tree reports 14 audit findings: 11 moderate, 2 high, 1 critical. High findings involve PostCSS and Undici; resolve and retest before public deployment. No breaking dependency upgrade was applied during this prototype build.

The critical `agent-core` advisory matches the unscoped package name, but this installation resolves `node_modules/agent-core` to the repository's `packages/agent-core` workspace (not a downloaded registry package). Verify this provenance whenever installing or renaming workspaces; do not treat the advisory as evidence this local source is malware.

## What was reused and created

Inherited: Next.js and React app, CopilotKit provider/runtime, model adapter, Ambiguous MCP adapter, cookie/origin checks, immutable approvals, write reconciliation and starter tests. The Slack/mobile examples remain inherited and are not STARTS Forward deliverables.

Created: STARTS Forward responsive interface; synthetic priorities and workforce pathways; curated governance/source library; STARTS Bridge instructions and domain tools; local persistent demo adapter; generalized record lookup in the approval service; domain persistence tests; setup and demonstration documentation.

The CopilotKit onboarding command was inspected. Managed Intelligence onboarding was not completed or provisioned; the prototype uses the starter's existing model-provider integration.

## Student-centered global platform refinement

The platform now implements the expanded brief in `docs/product-vision.md` while retaining the starter infrastructure and original save flow. Architecture details and scope are in `docs/refinement-architecture.md`.

New features:

- Three pillars and the STARTS definition: Science • Technology • Research • Action • Transforming Solutions.
- Nine coordinated capabilities in one runtime prompt, a shared typed analysis layer and a `run_capability` frontend tool. Preview results are explicitly rule-based without live AI credentials.
- Global network with searchable/filterable synthetic teams, Natural Earth map geometry and reciprocal recommendations between Haiti, Colombia, Rwanda and South Florida.
- Evidence studio with public/aggregate notes, source/date/limitations and cross-sector dependencies.
- Influence ladder with potential decision owners, missing connections, required artifacts and reported connection status.
- Paid micro-project briefs with local students, South Florida peers, faculty and NGO supervision, compensation requirements and selectable outputs.
- Impact tracker separating outputs, institutional decisions, implementation and observed outcomes; source-backed user entries persist in this browser.
- Generated editorial imagery for South Florida, Caribbean, Latin America, student collaboration and global health teamwork, visibly labeled illustrative.

Navigation, priority and selected team are reflected in the local URL so reloads can return to the same context. Evidence and impact forms clear unsaved inputs when their priority changes. Evidence/impact/connection notes live in browser storage, separate from server-saved proposals. They are not synchronized across users or browsers.

Browser QA created one clearly named synthetic evidence note, one synthetic output measure and an approved maternal-health paid-project example. These are demonstration records, not real research, funding or outcomes. The original saved access-to-care project remains intact.

After refinement, 99 offline tests pass. New browser checks verify region/priority filters, saved evidence feeding the capability layer after reload, influence status persistence, paid-project output selection and approval, and impact entry persistence per priority. Live model and external integrations still require credentials and independent validation.

## Auth0 login and AI activation

See `docs/activate-ai-login.md` for account setup and the exact callback URL. Auth0 v4 adds login/logout, protected pages and APIs, and private local project stores per signed-in user. Browser notes also use per-user keys. Login requires an Auth0 Regular Web Application; live chat requires a model API key. Neither credential set was available, so real login/logout and model responses remain unverified. The UI explicitly shows this setup state.

Verification: 102 offline tests pass, including actual middleware rejection of unauthenticated AI/project requests and incomplete authentication configuration. Production build passed (provider/Auth0 dynamic dependency warnings remain); `/login` was checked in the browser. Existing dependency audit findings remain unchanged. This is still a local prototype, not a publicly deployed multi-user service.
