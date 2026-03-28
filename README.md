# LearnMate

LearnMate is a near-peer learning marketplace focused on measurable learning outcomes for three actor groups:

- Parents seeking trusted project and concept-learning support for children.
- Students (middle school, high school, university) seeking concept clarity.
- College freelancers monetizing teaching with accountability and structured delivery.

This repository is built for hackathon submission with a production-oriented full-stack implementation.

## 1) Product Summary

### Problem

Most tutoring and assignment-help marketplaces optimize for quick output, not durable understanding. This is most damaging for learners who need concept-first support and long-term confidence.

### Solution

LearnMate combines:

- Role-based onboarding and identity-linked profiles.
- Concept-first project and request flow.
- Learning DNA profile capture and updates.
- Freelancer demand intelligence and opportunity feed.
- AI-assisted class/session tooling.
- Post-session reporting and proof-of-learning support.

### Detailed User Flows (Judge-Friendly Walkthrough)

This section is written as a click-by-click script so reviewers can test the platform quickly without guessing hidden steps.

---

#### A) Parent Flow (Project Posting + Child Learning Tracking)

1. Open app home at [/](app/page.tsx).
2. Click **Create account** and sign up through Clerk at [app/(auth)/sign-up/[[...sign-up]]/page.tsx](app/(auth)/sign-up/[[...sign-up]]/page.tsx).
3. After auth, user lands on role selection at [app/onboarding/role/page.tsx](app/onboarding/role/page.tsx).
4. Select **Parent**.
5. Complete parent onboarding form at [app/onboarding/parent/page.tsx](app/onboarding/parent/page.tsx):
	- parent name/city
	- child name/grade
	- preferred help types and session mode
6. System writes user + child profile through Convex mutation in [convex/users.ts](convex/users.ts).
7. User is routed to parent dashboard at [app/(parent)/parent/dashboard/page.tsx](app/(parent)/parent/dashboard/page.tsx).
8. Click **Post Project** entry and open [app/(parent)/post-project/page.tsx](app/(parent)/post-project/page.tsx).
9. In wizard [components/project/ProjectPostingWizard.tsx](components/project/ProjectPostingWizard.tsx):
	- upload brief media/file or paste text
	- run brief extraction from [app/api/ai/extract-brief/route.ts](app/api/ai/extract-brief/route.ts)
	- run budget suggestion from [app/api/ai/suggest-price/route.ts](app/api/ai/suggest-price/route.ts)
	- submit project to Convex via [convex/projects.ts](convex/projects.ts)
10. Parent can later review project state/proposals and child DNA insight panels on dashboard.

Expected technical result:
- user doc exists
- child doc exists
- learning DNA linked or initialized
- project doc created with requester linkage

---

#### B) Student Flow (Self-Serve Learning Request + DNA Preferences)

1. Sign up/sign in via Clerk routes.
2. Land on role selector [app/onboarding/role/page.tsx](app/onboarding/role/page.tsx).
3. Select **Student**.
4. Complete student onboarding at [app/onboarding/student/page.tsx](app/onboarding/student/page.tsx):
	- education stage (middle/high/university)
	- school/university
	- grade/year
5. System persists student profile using [convex/users.ts](convex/users.ts).
6. Student enters dashboard at [app/(student)/student/dashboard/page.tsx](app/(student)/student/dashboard/page.tsx).
7. Student updates learning preferences (attention style, confusion triggers, strengths) using mutations in [convex/learningDNA.ts](convex/learningDNA.ts).
8. Student can post rapid support requests using crash-course flow at [app/(student)/post-crash-course/page.tsx](app/(student)/post-crash-course/page.tsx) and form logic in [components/project/CrashCoursePostingForm.tsx](components/project/CrashCoursePostingForm.tsx).

Expected technical result:
- student role fully initialized
- child + DNA document path created for student profile
- updates reflected in Convex and visible on reload

---

#### C) Freelancer Flow (Opportunity Discovery + Session Delivery)

1. Sign up/sign in.
2. Select **Freelancer** on role page.
3. Complete onboarding at [app/onboarding/freelancer/page.tsx](app/onboarding/freelancer/page.tsx):
	- skills
	- bio
	- hourly rate
4. User lands on freelancer dashboard [app/(freelancer)/freelancer/dashboard/page.tsx](app/(freelancer)/freelancer/dashboard/page.tsx).
5. Open **Opportunity Hub** [app/(freelancer)/opportunities/page.tsx](app/(freelancer)/opportunities/page.tsx) and click **Refresh from Exa**.
6. Exa route [app/api/exa/opportunities/route.ts](app/api/exa/opportunities/route.ts):
	- attempts live Exa query
	- on timeout/failure/empty result, generates unique fallback opportunities via OpenRouter
	- returns normalized records for UI + persistence
7. Opportunities are upserted in Convex through [convex/opportunities.ts](convex/opportunities.ts).
8. Open **Demand Signals** [app/(freelancer)/demand/page.tsx](app/(freelancer)/demand/page.tsx) and click **Run Apify Benchmarks**.
9. Apify route [app/api/apify/trigger/route.ts](app/api/apify/trigger/route.ts):
	- attempts actor run with timeout guard
	- retries with latest successful build if needed
	- on failure, returns unique OpenRouter-generated fallback demand signals
10. Open a session page [app/(freelancer)/session/[sessionId]/page.tsx](app/(freelancer)/session/[sessionId]/page.tsx):
	 - start/complete session state transitions
	 - use live copilot sidebar from [components/freelancer/SessionCoPilotSidebar.tsx](components/freelancer/SessionCoPilotSidebar.tsx)

Expected technical result:
- freelancer profile completed
- opportunity data available even if external APIs fail
- demand signal cards render live or fallback data
- session state transitions persist

---

#### D) Role Switching (Single Account, Multiple Modes)

1. After login, open top navbar selector in [components/shared/Navbar.tsx](components/shared/Navbar.tsx).
2. Switch between Parent, Student, Freelancer modes.
3. App calls role mutation in [convex/users.ts](convex/users.ts) and routes through [app/auth/continue/page.tsx](app/auth/continue/page.tsx).
4. Destination is computed by profile completeness via `getPostAuthDestination` in [convex/users.ts](convex/users.ts):
	- incomplete profile -> corresponding onboarding formz
	- complete profile -> corresponding dashboard

This allows judges to validate all three personas using one account.

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

- `openai/gpt-4o-mini` (configurable via env)

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

LearnMate is designed to reduce learning inequality by improving instructional quality and accountability. The platform focuses on understanding over shortcuts and provides transparent handoff, profile evolution, and role-specific workflows for parents, students, and freelancers.

## 10) License and Submission Notes

This repository is intended for hackathon evaluation and demonstration. Replace placeholder keys and configure production provider settings before public deployment.
