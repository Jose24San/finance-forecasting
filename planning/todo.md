# ✅ Finpilot Development TODO Checklist

A comprehensive breakdown of implementation steps based on the full Finpilot specification.

---

## 🔧 Milestone 1: Monorepo & Schema Foundation

- [ ] Initialize NX monorepo
- [ ] Create `/apps/web` (Next.js + TypeScript)
- [ ] Create `/apps/api` (Fastify + TypeScript)
- [ ] Add `/libs/ui`, `/libs/auth`, `/libs/api-clients`
- [ ] Set up Tailwind CSS in `web`
- [ ] Install Prisma + create `prisma/schema.prisma`
- [ ] Configure environment variables for Supabase connection
- [ ] Run initial Prisma migration

---

## 🧱 Milestone 2: Backend API Setup

- [ ] Scaffold Fastify server
- [ ] Connect Prisma to backend
- [ ] Create basic routes for:

  - [ ] `POST /scenario`
  - [ ] `GET /scenario/:id`
  - [ ] `PUT /scenario/:id`
  - [ ] `DELETE /scenario/:id`
  - [ ] Similar routes for `asset`, `incomeStream`, `milestone`

- [ ] Create forecast route: `POST /forecast`
- [ ] Write backend unit tests (Jest/Vitest)

---

## 🧑‍💻 Milestone 3: Frontend Setup + Auth

- [ ] Scaffold base Next.js app
- [ ] Install Supabase JS SDK
- [ ] Connect Supabase Auth:

  - [ ] Email/password auth
  - [ ] Google OAuth if easy

- [ ] Build login/signup pages
- [ ] Create Zustand auth context
- [ ] Protect authenticated routes

---

## 🖥 Milestone 4: Scenario Editor UI

- [ ] Create dashboard page
- [ ] Add personal profile form (age, location, dependents)
- [ ] Create inputs for:

  - [ ] Assets
  - [ ] Income streams
  - [ ] Milestones

- [ ] Use Zustand for form state
- [ ] Form validation and auto-save draft locally

---

## 🧮 Milestone 5: Forecasting Engine (v1)

- [ ] Build TypeScript function to:

  - [ ] Project income over time
  - [ ] Project asset growth (7% stocks, 3% real estate)
  - [ ] Apply milestone impacts (costs, timing)
  - [ ] Apply inflation (2.5%)

- [ ] Return timeline (array of years with net worth, income, and expenses)
- [ ] Integrate into `POST /forecast`

---

## 📈 Milestone 6: Scenario Visualization

- [ ] Use Recharts to build:

  - [ ] Net worth timeline chart
  - [ ] Drill-down year-by-year table

- [ ] Highlight risk years visually (negative or low net worth)
- [ ] Connect forecast data from API

---

## 🔒 Milestone 7: Save + Share

- [ ] Implement scenario persistence (Supabase)
- [ ] Add “Save Scenario” button
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
- [ ] Add “Export” button to scenario view
- [ ] Display “Share Scenario” modal with link

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
