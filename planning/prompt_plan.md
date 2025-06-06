Excellent. Based on the full specification from `spec.md`, here is a **comprehensive development blueprint** for building Finpilot using a best-practices, test-driven, incremental approach. This plan is broken into four key parts:

Primsa typescript types live here
finpilot/node_modules/.prisma/client/index.d.ts

---

## ✅ Part 1: Strategic Blueprint (High-Level Steps)

1. **Monorepo Setup (NX, TypeScript)**
2. **Prisma Schema & Supabase DB Setup**
3. **Backend (Fastify API) Setup**
4. **Frontend (Next.js) Setup**
5. **Authentication (Supabase Email/OAuth)**
6. **Core Scenario Modeling (CRUD: scenario, asset, income, milestone)**
7. **Forecasting Engine**
8. **Scenario Visualization (Chart + Table)**
9. **Tier Gating & Stripe Payments**
10. **Guest Mode + Onboarding Tour**
11. **Sharing & PDF Export**
12. **Testing (unit, integration, UI)**

---

## ✅ Part 2: Iterative Chunks (Milestone Breakdown)

### 🚀 Milestone 1: Monorepo + Schema Foundation

- Initialize NX monorepo
- Add `/apps/web` and `/apps/api`
- Install Prisma, create schema for core entities
- Deploy Postgres DB (via Supabase)

### 🚀 Milestone 2: Backend API Setup

- Create Fastify server
- Add REST routes for user, scenario, asset, etc.
- Integrate Prisma with backend
- Basic testing with mocked data

### 🚀 Milestone 3: Frontend Setup + Auth

- Scaffold Next.js app
- Connect Supabase Auth (Email/password, Google if easy)
- Add auth guard + context
- Basic login/signup flow

### 🚀 Milestone 4: UI + State Management

- Implement Zustand for global state
- Create scenario input UI: profile, income, assets, milestones
- Validate client-side logic with mock calculations

### 🚀 Milestone 5: Forecasting Engine v1

- Server-side function to process scenario inputs
- Compute asset growth, milestones, income timeline
- Return yearly net worth projections

### 🚀 Milestone 6: Scenario Visualization

- Net worth over time chart
- Drill-down year-by-year table
- Highlight risk years or shortfalls

### 🚀 Milestone 7: Save + Share

- Save scenario to Supabase
- Create shareable link (read-only view)
- Export scenario as PDF (client-side or backend-rendered)

### 🚀 Milestone 8: Premium Features + Payments

- Stripe integration
- Gate milestone types, scenario count, and features
- UI upgrade modal + paywall handling

### 🚀 Milestone 9: Testing & Final Polish

- Write unit + integration tests
- Add tooltips, onboarding tour
- Prepare for launch with responsive UI

---

## ✅ Part 3: Final Iterated Steps (Codegen Prompts)

Below are step-by-step prompts you can feed into a code-generating LLM to implement each chunk incrementally. Each section builds directly on the last.

---

### 🧱 Prompt 1: Initialize Monorepo & Base Folders

```text
Create an NX monorepo with two apps:
- `web`: a Next.js (TypeScript) app using Tailwind CSS and Zustand
- `api`: a Fastify (Node.js) app using TypeScript and Prisma

Include folders:
- `/libs/ui`: shared UI components
- `/libs/auth`: authentication helpers
- `/libs/api-clients`: API SDKs or data fetchers

Also add a `prisma/schema.prisma` file and configure it for PostgreSQL.
```

---

### 🧱 Prompt 2: Define Prisma Schema

```text
Create a Prisma schema that includes:

- `User`: email, password, tier (free, core, pro)
- `Scenario`: linked to user
- `Milestone`, `Asset`, `IncomeStream`, `Settings`, `WithdrawalOrder`, `TaxBracket`, `HouseholdMember`

Include relationships, enums, and sensible defaults. Add migrations and seed data.
```

---

### 🧱 Prompt 3: Build API Endpoints (CRUD + Forecast)

```text
Using Fastify and Prisma, build REST endpoints for:

- Creating/updating/deleting scenarios
- Adding/removing assets, income streams, and milestones
- POST /forecast: accepts scenario ID and returns a forecasted timeline of yearly net worth

Write tests for each route using Vitest or Jest.
```

---

### 🧱 Prompt 4: Scaffold Next.js App + Supabase Auth

```text
Create a login/signup page in the Next.js app using Supabase Auth.

Add support for:
- Email/password auth
- Session-based auth context using Zustand
- Auth-protected pages (e.g., dashboard)

Include a basic loading state and error handling.
```

---

### 🧱 Prompt 5: Implement Scenario Editor UI

```text
Create a form-based editor to enter:
- Personal info
- Assets
- Income streams
- Milestones

Use shadcn/ui components and Zustand state. Add form validation and auto-save draft to local state.
```

---

### 🧱 Prompt 6: Create Forecasting Engine

```text
Write a TypeScript function that takes:
- A scenario object (with assets, income, and milestones)

Returns:
- An array of yearly projections (year, net worth, asset values, income, milestone impacts)

Use 7% stock growth, 3% real estate growth, and 2.5% inflation as defaults.
```

---

### 🧱 Prompt 7: Build Forecast UI

```text
Use Recharts to visualize:
- Net worth timeline (line chart)
- Risk years (highlighted)
- Drill-down table view per year

Link the chart to data returned from the backend forecast engine.
```

---

### 🧱 Prompt 8: Stripe Payments & Feature Gating

```text
Integrate Stripe Checkout. Support monthly and yearly billing.

Create:
- API route to create a Stripe session
- Webhook listener for subscription status
- Frontend upgrade modal and gating logic based on tier

Restrict features (e.g., Monte Carlo, scenario count) by checking user tier.
```

---

### 🧱 Prompt 9: Share Link + PDF Export

```text
Create:
- API endpoint that returns a signed read-only URL for a scenario
- PDF generation using react-pdf or headless Chrome (Net worth chart, summary)

Show share link modal with copy-to-clipboard button.
```

---

### 🧱 Prompt 10: Testing Plan Execution

```text
Write unit tests for:
- Forecast engine
- Asset growth
- Withdrawal logic

Write integration tests for:
- Scenario creation and persistence
- Auth + tier access
- Forecasting endpoint

Write UI tests (e.g., Playwright) for:
- Tooltip visibility
- Share scenario
- Guest mode onboarding
```

---

## ✅ What’s Next?

Would you like this output converted into:

- GitHub issues?
- Notion/Linear task list?
- A bundled developer onboarding doc?

Or should we now start executing the first coding prompt directly?
