# STARTS Forward

**A global health collaboration workspace, with STARTS Bridge as its in-app AI assistant.**

STARTS means Science • Technology • Research • Action • Transforming Solutions. The platform helps students and early-career professionals organize community evidence, explore complementary collaborators and develop supervised paid project proposals that connect research to service delivery.

## Run the working demo (no accounts or API keys required)

Install **Node.js 22 or newer** and npm, then run:

```sh
git clone https://github.com/denissandy01-ux/STARTS-Forward-.git
cd STARTS-Forward-
npm ci
cp .env.starts-forward.example .env
npm run dev:web
```

Open **http://127.0.0.1:3100**. Keep the server terminal open. The empty credentials in the example enable a guided demo with synthetic teams and local project storage. Do not fill Auth0 fields until you are ready to configure login.

### Try a complete workflow

1. On Overview, choose a health priority and enter your project focus.
2. Explore Intelligence: Evidence, Systems, Match, SDG, Collaboration, Implementation, Influence, Opportunity and Impact.
3. Use Global network to explore synthetic collaborators and prepare a collaboration brief.
4. Use Paid projects to prepare a supervised project proposal with funding requirements.
5. Review the proposal and choose Approve & save locally, or Decline.
6. Open Shared projects with the same priority selected; reload and retrieve the saved record.
7. Record sourced notes in Evidence studio and user-reported measures in Impact tracker.

Approval creates a local record, not a job offer, funding commitment or message to a partner.

## Activate real AI conversation (optional)

Edit root `.env` locally:

```dotenv
MODEL_PROVIDER=openai
OPENAI_API_KEY=your-api-key
MODEL=your-tool-capable-model-id
```

Choose a model your API account can access. API usage requires available credit. Restart the server and open STARTS Bridge on Overview. Keys stay on the server; never commit `.env`. The last live request during development was blocked by exhausted API credit, so successful live conversation has not yet been verified. The guided demo does not make model calls.

## Enable Auth0 user login (optional)

Create your own Auth0 **Regular Web Application**. Set its allowed callback to `http://127.0.0.1:3100/auth/callback`, and its allowed logout URL and web origin to `http://127.0.0.1:3100`. Add your domain, client ID and client secret to root `.env`; set `AUTH0_ENABLED=true` and generate `AUTH0_SECRET` with `openssl rand -hex 32`. Keep `APP_BASE_URL=http://127.0.0.1:3100`.

Restart, open `/login`, and sign in through Auth0 Universal Login. Login redirects were verified during development; a complete user login/callback/logout cycle remains to be verified. See [detailed activation steps](docs/activate-ai-login.md).

With authentication enabled, records are private per user on the local server. Browser notes remain in this browser. Team invitations and cross-device synchronization are not implemented. Partial Auth0 configuration blocks access until completed.

## Verify and run a production build locally

```sh
npm run verify
npm run build --workspace web
npm run start --workspace web
```

Stop the development server before running the build and start commands. Both servers use port 3100. Verification includes TypeScript and 102 offline tests covering domain behavior, approval boundaries and authentication rejection. Runtime data is under `apps/web/.data/` and excluded from Git.

## Scope and limitations

- Prototype teams, partner relationships and project examples are synthetic; no institutional affiliations are implied.
- Curated SDG, UN, UNESCO and WHO links and summaries guide the assistant. They are not a complete retrieved corpus or governance certification.
- The server binds to loopback. Public source code does not mean the app is publicly deployed.
- Use synthetic/public data. Public deployment needs additional security, authorization, privacy and accessibility review. Inherited dependency audit findings remain; see [technical notes](STARTS-FORWARD-README.md).
- Generated editorial imagery is labeled; [image provenance](docs/generated-imagery.md) and [architecture](docs/refinement-architecture.md) describe the implementation.

## Built with and attribution

Built on the MIT-licensed [CopilotKit Agents Everywhere starter kit](https://github.com/CopilotKit/agents-everywhere-starter-kit), using Next.js, React, CopilotKit, OpenAI model integration and Auth0. The original license is preserved in [LICENSE](LICENSE). STARTS Forward adds the health collaboration workflow, domain instructions, nine capabilities, map/matching, paid project briefs, evidence and impact tools, local persistence and login integration. The inherited Slack, mobile and voice examples are not STARTS Forward deliverables.

<details>
<summary>Original starter kit documentation</summary>

<div align="center">

# Agents, Everywhere Hackathon Starter Kit

![Agents, Everywhere hackathon — OpenAI, CopilotKit, OpenRouter, Exa, Auth0, and Ambiguous AI](assets/banner.png)

**Build an agent that belongs where people already work, talk, and live.**

[Overview](#overview) · [Get started](#get-started) · [Templates](#templates) · [Coding agent](#coding-agent) · [Resources](#resources)

</div>

## Overview

Build for **[Agents, Everywhere: Bots, Channels, & More](https://aitinkerers.org/hackathons/global/agents-everywhere)**, the AI Tinkerers global hackathon on **September 12–13, 2026**. Choose your city on the event page for its local schedule. Put an agent inside a conversation, an app, a phone, or a physical environment. Make the context of that place essential to what it can do.

This kit gives you three runnable templates, files to hand to your coding agent, and sponsor setup notes. Pick a user, a problem, and one complete interaction. You can use any stack; you do not need every sponsor or every surface.

Your project and its core functionality must be created during the event. Existing libraries, templates, and starter code are allowed; describe what you reuse and what you build. Read [the rules](hackathon-rules.md), then follow your city's participant portal for the current deadline and judging criteria.

## Get started

Use Node.js 22+, then clone and install the kit:

```bash
git clone https://github.com/CopilotKit/agents-everywhere-starter-kit.git
cd agents-everywhere-starter-kit
npm ci
cp .env.example .env
```

Choose one template and configure only the credentials it needs. Slack and web use the root install; React Native has its own install under `apps/mobile` because Expo pins its React Native stack separately.

Paste this into your coding agent:

```text
Read AGENTS.md, hackathon-overview.md, hackathon-rules.md, and
using-sponsor-tools.md. Help me choose one template app README for my idea,
then adapt this checkout into our own project. Ask me who it is for and
what the agent should do in that setting. Follow this README's CopilotKit
onboarding section for the selected app; keep its existing infrastructure.
Use only the integrations the idea needs. Verify a complete interaction and
prepare SUBMISSION.md, distinguishing inherited code from our event work.
```

### CopilotKit onboarding

For web, paste this into your coding agent:

```text
Help me get started with CopilotKit. Run this command and follow the instructions:

npx --yes copilotkit@latest onboard start
```

For Slack, follow [Channels setup](apps/channel/README.md#get-started). For React Native, follow the [Expo setup instructions](apps/mobile/README.md#get-started).

## Templates

These starting points serve different kinds of context. **CopilotKit Channels** brings the Slack agent into the conversation; **CopilotKit React** connects the web agent to the app people are using; **CopilotKit React Native** brings the same agent pattern onto a phone.

### 1. Slack — an agent that joins the thread

**OpenAI + CopilotKit Channels + Exa**

An agent reads what people already said, researches with Exa, and answers in the same thread with native cards and source links. Start with a support conversation, a research discussion, or a team decision.

The included Slack app supplies thread history, subscriptions, search, and Channels UI. Configure your model, Exa, and a managed Channel, then run `npm run dev:slack`. No public tunnel is needed. Teams or other chat platforms can use the same Channels pattern, but this starter ships the Slack app.

**[Use the Slack template →](apps/channel/)**

### 2. Web — an agent inside your app

**OpenAI + CopilotKit React + Ambiguous AI**

An agent sees the page you are on and turns a request into a real workplace record you can still find after a refresh. Adapt it to customer follow-ups, a project workspace, or a personal planning app.

The included web app supplies page context, frontend tools, agent-rendered UI, and a browser approval step. Connect an Ambiguous AI workspace, then run `npm run dev:web`; approved follow-ups are saved through the server and can be read back after refresh.

**[Use the web template →](apps/web/)**

### 3. React Native — an agent in your pocket

**OpenAI or OpenRouter + CopilotKit React Native**

A mobile agent reads app state, renders native cards, and waits for a tap before changing local sample data. Start with a personal finance assistant, a field checklist, an inventory counter, or any workflow where phone context and approval matter.

The included Expo app supplies seeded finance state, native rendered tool UI, a human-in-the-loop expense approval, and a mobile-specific CopilotKit runtime endpoint served by the web app. Configure your model provider, start `npm run dev:web`, then run the mobile app from `apps/mobile`.

**[Use the React Native template →](apps/mobile/)**

### Make the demo yours

The supplied on-call and finance assistants are **infrastructure examples**: read ambient context, call a tool, render useful UI, and return a verifiable result. Choose a different user, problem, dataset, and interaction; the goal is your own project, not another version of the starter scenario.

Use the [demo prompts](dev-docs/demo-prompts.md) to learn how the pieces connect, then replace the sample domain. In the Slack sample incident flow, approval cards record decisions without executing production actions. In the web follow-up flow, the page approval button saves the reviewed Ambiguous task. In the mobile finance flow, approval changes local in-memory sample data. Enforce the same kind of write boundary around any external action you add.

Want another surface pattern? The web app also includes a voice route, and the shared agent can connect to remote MCP tools when configured. The event surfaces are inspiration, not separate tracks or a requirement to build multiple apps.

## Coding agent

Give your agent these files before it starts coding:

| File | What it provides |
|---|---|
| [hackathon-overview.md](hackathon-overview.md) | The challenge, four surfaces, and official judging criteria |
| [hackathon-rules.md](hackathon-rules.md) | Build eligibility, inherited code, and required deliverables |
| [using-sponsor-tools.md](using-sponsor-tools.md) | Every sponsor featured in this kit: access, authentication, configuration, and a first working call |
| [AGENTS.md](AGENTS.md) | Repository conventions and verification commands |
| [Channels skill](.agents/skills/build-channels-agent/SKILL.md) | Verified Channels APIs for the Slack template |

The app READMEs provide launch commands, files to customize, and a concrete result to check. Start with one template and add a second surface only if it helps your user.

## Resources

| Need | Go here |
|---|---|
| Event details, deadline, and judging | [Find your city](https://aitinkerers.org/hackathons/global/agents-everywhere), then open its participant portal and handbook |
| OpenAI agent development | [Agents SDK quickstart](https://openai.github.io/openai-agents-js/guides/quickstart/) |
| OpenRouter access and model choice | [Quickstart](https://openrouter.ai/docs/quickstart) · [Keys](https://openrouter.ai/keys) · [Model catalog](https://openrouter.ai/models) · [Model switching](dev-docs/model-switching.md) |
| CopilotKit app development | [Docs](https://docs.copilotkit.ai/) · [Tools and context](dev-docs/tools-and-context.md) · [Discord channel for technical questions](https://discord.com/channels/1122926057641742418/1548038338848489532) |
| CopilotKit Channels | [Channels guide](https://copilotkit.ai/channels-guide.md) · [Screenshot walkthrough](dev-docs/channels-sdk-walkthrough/README.md) · [OpenTag example app](https://github.com/CopilotKit/OpenTag) |
| Exa quickstart | [Search API guide](https://exa.ai/docs/reference/search-api-guide) · [Kit setup](using-sponsor-tools.md#exa) |
| Auth0 API authorization | [Node API](https://auth0.com/docs/quickstart/backend/nodejs) · [Kit setup](using-sponsor-tools.md#auth0) |
| Ambiguous AI quickstart | [Developer guide](https://www.ambiguous.ai/llms.txt) · [Kit setup](using-sponsor-tools.md#ambiguous-ai) |
| Rehearse and debug | [Demo prompts](dev-docs/demo-prompts.md) · [Troubleshooting](dev-docs/troubleshooting.md) |
| Prepare your entry | [Submission checklist](SUBMISSION.md) |

For credit redemption instructions, choose your city on the [global event page](https://aitinkerers.org/hackathons/global/agents-everywhere) and check its participant portal's **Credits & Offers** section.

For technical questions during the event, check your city's participant portal and ask your local organizers.

For the Slack/web workspaces, `npm run verify` runs typechecks and offline tests without credentials. The mobile app has its own install, tests, typecheck, and Metro export checks under `apps/mobile`. Each app reports missing configuration when the relevant integration is used. Live sponsor calls and platform delivery require your accounts. See [developer docs](dev-docs/README.md) for detailed setup and deployment.

</details>
