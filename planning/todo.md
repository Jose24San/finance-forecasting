# ✅ Finpilot Development TODO Checklist

A comprehensive breakdown of implementation steps based on the full Finpilot specification.

---

## 🔧 Milestone 1: Monorepo & Schema Foundation

- [x] Initialize NX monorepo
- [x] Create `/apps/web` (Next.js + TypeScript)
- [x] Create `/apps/api` (Fastify + TypeScript)
- [x] Add `/libs/ui`, `/libs/auth`, `/libs/api-clients`
- [x] Set up Tailwind CSS in `web`
- [x] Install Prisma + create `prisma/schema.prisma`
- [x] Configure environment variables for Supabase connection
- [x] Run initial Prisma migration

---

## 🧱 Milestone 2: Backend API Setup

- [x] Scaffold Fastify server
- [x] Connect Prisma to backend
- [x] Create basic routes for:

  - [x] `POST /scenario`
  - [x] `GET /scenario/:id`
  - [x] `PUT /scenario/:id`
  - [x] `DELETE /scenario/:id`
  - [x] Similar routes for `asset`, `incomeStream`, `milestone`

- [x] Create forecast route: `POST /forecast`
- [x] Write backend unit tests (Jest/Vitest)

---

## 🧑‍💻 Milestone 3: Frontend Setup + Auth

- [x] Scaffold base Next.js app
- [x] Install Supabase JS SDK
- [x] Connect Supabase Auth:

  - [x] Email/password auth
  - [ ] Google OAuth if easy

- [x] Build login/signup pages
- [x] Create Zustand auth context
- [x] Protect authenticated routes
- [x] Write frontend unit tests

---

## 🖥 Milestone 4: Scenario Editor UI

- [x] Create dashboard page
- [x] Add personal profile form (age, location, dependents)
- [x] Create inputs for:

  - [x] Assets
  - [x] Income streams
  - [x] Milestones

- [x] Use Zustand for form state
- [x] Form validation and auto-save draft locally

---

## 🧮 Milestone 5: Forecasting Engine (v1)

- [x] Build TypeScript function to:

  - [x] Project income over time
  - [x] Project asset growth (7% stocks, 3% real estate)
  - [x] Apply milestone impacts (costs, timing)
  - [x] Apply inflation (2.5%)

- [x] Return timeline (array of years with net worth, income, and expenses)
- [x] Integrate into `POST /forecast`

---

## 📈 Milestone 6: Scenario Visualization

- [x] Use Recharts to build:

  - [x] Net worth timeline chart
  - [x] Drill-down year-by-year table

- [x] Highlight risk years visually (negative or low net worth)
- [ ] Connect forecast data from API

---

## 🔒 Milestone 7: Save + Share

- [x] Implement scenario persistence (Supabase)
- [x] Add "Save Scenario" button
- [ ] Generate read-only share link
- [ ] Create read-only UI version for public links

---

## 💳 Milestone 8: Stripe + Premium Features

- [ ] Integrate Stripe Checkout
- [ ] Create API endpoint for subscription session
- [ ] Add webhook for subscription status
- [ ] Define tier gating logic in backend
- [ ] Show upgrade modal on feature block
- [ ] Gate:

  - [ ] Scenario count > 1
  - [ ] Advanced milestones
  - [ ] Monte Carlo simulation
  - [ ] PDF export

---

## 📤 Milestone 9: Export & Share

- [ ] Create PDF export (net worth chart + milestone summary)
- [ ] Use `react-pdf` or backend renderer (if easier)
- [ ] Add "Export" button to scenario view
- [ ] Display "Share Scenario" modal with link

---

## 🧪 Milestone 10: Testing & Final Polish

- [ ] Unit tests:

  - [ ] Forecast logic
  - [ ] Tax rules
  - [ ] Asset withdrawal order

- [ ] Integration tests:

  - [ ] Auth flow
  - [ ] Scenario creation
  - [ ] Feature access by tier

- [ ] UI tests:

  - [ ] Tooltip visibility
  - [ ] Guest to signup conversion
  - [ ] Scenario switching

- [ ] Add onboarding tour (3–5 steps)
- [ ] Add short tooltips to all fields
- [ ] Add dark mode toggle (if not default)

---

## 📝 Post-MVP: Deferred or Future

- [ ] Monte Carlo simulation engine
- [ ] Milestone type: death of spouse
- [ ] Advisor collaboration mode
- [ ] CSV import/export
- [ ] Real-time integrations (Zillow, Plaid)
- [ ] Localization (multi-language, non-US tax)

---

This checklist should guide implementation from zero to a full MVP of Finpilot. Each milestone builds on the last and can be iterated safely with strong test coverage.
