# Pahechan

Pahechan is a near-peer learning marketplace focused on measurable learning outcomes for three actor groups:

- Parents seeking trusted project and concept-learning support for children.
- Students (middle school, high school, university) seeking concept clarity.
- College freelancers monetizing teaching with accountability and structured delivery.

This repository is built for hackathon submission with a production-oriented full-stack implementation.

## 1) Product Summary

### Problem

Most tutoring and assignment-help marketplaces optimize for quick output, not durable understanding. This is most damaging for learners who need concept-first support and long-term confidence.

### Solution

Pahechan combines:

- Role-based onboarding and identity-linked profiles.
- Concept-first project and request flow.
- Learning DNA profile capture and updates.
- Freelancer demand intelligence and opportunity feed.
- AI-assisted class/session tooling.
- Post-session reporting and proof-of-learning support.

### Key User Journeys

- Parent creates account, selects role, completes onboarding, posts project, tracks proposals and child learning profile.
- Student creates account, selects role, completes onboarding, updates personal learning DNA, posts requests.
- Freelancer creates account, selects role, completes onboarding, publishes sessions and responds to demand signals.

## 2) Technical Architecture

### Frontend

- Framework: Next.js App Router
- Language: TypeScript
- Runtime: Bun
- UI: React + Tailwind
- Auth UI: Clerk hosted components

### Backend and Data

- Primary backend: Convex
- Data model: users, children, learningDNA, projects, proposals, sessions, group sessions, notifications, etc.
- Realtime + queries/mutations/actions via Convex generated API

### API Layer

- Next.js Route Handlers under app/api
- AI routes (OpenRouter-backed)
- Integrations for Exa, Apify, Resend

### Auth and Authorization

- Clerk for authentication/session handling
- Next proxy-based route protection in [proxy.ts](proxy.ts)
- Convex identity checks in mutations/queries
- User record upsert and onboarding completion linked to authenticated Clerk identity

## 3) Sponsor Track Integrations

### Convex

Convex is the core application backend.

- Schema: [convex/schema.ts](convex/schema.ts)
- Auth config: [convex/auth.config.ts](convex/auth.config.ts)
- User and onboarding persistence: [convex/users.ts](convex/users.ts)
- Learning profile persistence: [convex/learningDNA.ts](convex/learningDNA.ts)
- Child records: [convex/children.ts](convex/children.ts)
- Project/proposal/session modules: [convex/projects.ts](convex/projects.ts), [convex/proposals.ts](convex/proposals.ts), [convex/sessions.ts](convex/sessions.ts)

How it works:

- Client components use Convex hooks for live data and mutations.
- Authenticated writes depend on Convex `ctx.auth.getUserIdentity()`.
- Role and profile completion drive post-auth destination logic.

### Clerk

Clerk provides account creation, login, and profile/session primitives.

- Sign in: [app/(auth)/sign-in/[[...sign-in]]/page.tsx](app/(auth)/sign-in/[[...sign-in]]/page.tsx)
- Sign up: [app/(auth)/sign-up/[[...sign-up]]/page.tsx](app/(auth)/sign-up/[[...sign-up]]/page.tsx)
- Provider bridge to Convex: [components/shared/Providers.tsx](components/shared/Providers.tsx)
- User sync after auth: [components/shared/AuthSync.tsx](components/shared/AuthSync.tsx)

How it works:

- Clerk session issues JWT template token for Convex.
- Convex validates issuer and audience and resolves user identity.
- App stores role and onboarding data against that identity.

### OpenRouter (AI)

The AI layer is implemented using OpenAI SDK compatibility mode pointed at OpenRouter.

- Client setup: [lib/openai.ts](lib/openai.ts)
- AI routes:
	- [app/api/ai/extract-brief/route.ts](app/api/ai/extract-brief/route.ts)
	- [app/api/ai/classify-intent/route.ts](app/api/ai/classify-intent/route.ts)
	- [app/api/ai/compose-group-session/route.ts](app/api/ai/compose-group-session/route.ts)
	- [app/api/ai/generate-quiz/route.ts](app/api/ai/generate-quiz/route.ts)
	- [app/api/ai/copilot-stream/route.ts](app/api/ai/copilot-stream/route.ts)
	- [app/api/ai/suggest-price/route.ts](app/api/ai/suggest-price/route.ts)

Default model:

- `meta-llama/llama-3.3-70b-instruct:free` (configurable via env)

### Exa

- Route: [app/api/exa/opportunities/route.ts](app/api/exa/opportunities/route.ts)

Purpose:

- Fetches external opportunities relevant to freelancer profile/skills.

### Apify

- Route: [app/api/apify/trigger/route.ts](app/api/apify/trigger/route.ts)

Purpose:

- Triggers scraping workflows for market/opportunity intelligence.

### Resend

- Route: [app/api/ai/post-session-report/route.ts](app/api/ai/post-session-report/route.ts)

Purpose:

- Sends post-session report emails when keys are configured.

### Mobbin (design reference workflow)

Mobbin is used as design inspiration/provenance input, not runtime infrastructure.

- Optional env placeholder exists for future API workflow.
- Current app does not require Mobbin API calls to function.

## 4) Project Structure (Key Paths)

- App routes: [app](app)
- Components: [components](components)
- Convex backend: [convex](convex)
- Utilities and typed clients: [lib](lib)

## 5) Environment Variables

Copy [/.env.example](.env.example) to `.env.local` and fill values.

Required core values:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`

AI and integrations:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `EXA_API_KEY`
- `APIFY_TOKEN`
- `APIFY_ACTOR_ID`
- `RESEND_API_KEY`
- `REPORT_TO_EMAIL`

## 6) Local Development

### Install

```bash
bun install
```

### Run Convex local backend sync

```bash
bunx convex dev
```

### Run app

```bash
bun dev
```

### Production build check

```bash
bun run build
```

## 7) Production Deployment (Convex + Vercel)

### Step A: Deploy Convex first

```bash
bunx convex deploy --prod
```

Then set Convex deployment env vars (including `CLERK_JWT_ISSUER_DOMAIN`, OpenRouter and other secrets) in Convex dashboard for the production deployment.

### Step B: Deploy Next.js on Vercel

- Connect repository to Vercel.
- Set Vercel environment variables (frontend/server route handler vars).
- Ensure `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` point to the same production Convex deployment.

### Step C: Clerk setup alignment

- Create Clerk JWT template named `convex`.
- Audience must be `convex`.
- Issuer must match `CLERK_JWT_ISSUER_DOMAIN` used by Convex.

## 8) Role and Data Linkage Model

- Authentication identity comes from Clerk.
- Convex stores application user state linked by `clerkId`.
- Onboarding mutations are blocked unless authenticated.
- Role assignment and onboarding completion determine dashboard routing.

## 9) Non-Technical Submission Summary

Pahechan is designed to reduce learning inequality by improving instructional quality and accountability. The platform focuses on understanding over shortcuts and provides transparent handoff, profile evolution, and role-specific workflows for parents, students, and freelancers.

## 10) License and Submission Notes

This repository is intended for hackathon evaluation and demonstration. Replace placeholder keys and configure production provider settings before public deployment.
