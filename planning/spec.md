# Finpilot: MVP Developer Specification

## 🧭 Product Overview

**Finpilot** is a web-based financial forecasting SaaS platform that helps users model their future financial trajectories—including retirement, large purchases, and life events—based on real-world variables like investment growth, inflation, taxes, and milestone planning. The application supports both novices and power users, and is designed to surface insights and highlight risks across different financial strategies.

---

## 🎯 Core MVP Features

### User Capabilities (Free Tier)

- Enter basic profile (age, income, filing status, location, dependents)
- Create and manage 1 scenario
- Add assets, income streams, and milestones
- Forecast based on pre-set growth/inflation/tax assumptions
- View net worth timeline with milestone overlays
- Tooltip guidance throughout
- Share read-only scenario link
- Export scenario to PDF

### Premium Tier Unlocks

- Multiple saved scenarios
- Additional milestone types (e.g., death of spouse)
- Monte Carlo simulations
- Financial literacy nudges
- More than X milestones

---

## 🧱 Architecture

### Tech Stack

- **Frontend**: Next.js (TypeScript), Tailwind CSS, shadcn/ui, Zustand for state
- **Backend**: Fastify (Node.js) hosted on Fly.io
- **Database**: Supabase (PostgreSQL) using Prisma ORM
- **Auth**: Supabase Auth (Email + Google/Apple OAuth)
- **Payments**: Stripe
- **Hosting**: Vercel (Frontend), Fly.io (Backend)

### Folder Structure (NX Monorepo)

```
/apps
  /web (Next.js frontend)
  /api (Fastify backend)
/libs
  /ui
  /auth
  /api-clients
/prisma
  schema.prisma
```

---

## 🔐 Authentication & Onboarding

- Email/password required to save scenarios
- OAuth (Google/Apple) if easily implementable
- Guest mode allows sandboxing with no data persistence
- Prompt to sign up to save progress or unlock features

---

## 🗂️ Data Model (See Prisma schema for full details)

### Key Entities

- `User`: Authentication, tier level
- `Scenario`: A saved financial forecast
- `Milestone`: Events like retirement, college, purchase
- `Asset`: Taggable investments or home equity
- `IncomeStream`: Earnings over time
- `WithdrawalOrder`: Defines asset liquidation order (if custom)
- `Settings`: Scenario-level assumptions (growth, strategy)
- `TaxBracket`: Country- and year-specific tax banding
- `HouseholdMember`: Supports modeling of spouse/children/etc.

All relationships are reflected in the ERD.

---

## 📊 Forecasting Engine Logic

### Defaults

- Stock growth: 7%, Real estate: 3%, Inflation: 2.5%
- Withdrawal order: Tax-efficient (`Taxable → Tax-Deferred → Tax-Free`)
- Users can override per asset or milestone

### Milestone Types

- Retirement, College, Major Purchase, Income Changes, Death of Spouse (premium), Custom

### Asset Categories

- Taxable, Tax-Deferred, Tax-Free, Real Estate, Crypto

### Income Modeling

- Start with flat salary
- Optional raise %
- Allow sabbaticals or career breaks by month
- Track savings allocation by % of raise or income

---

## 📄 Forecast Output

### Views

- Timeline chart (net worth + milestones)
- Drill-down table by year
- Summary insights (e.g., shortfall alerts, retirement readiness score)

### Features

- Monte Carlo simulation (premium)
- Visual callouts for risk years
- Confidence scores for major milestones

---

## 💬 UX/UI Considerations

- Minimalist, modern aesthetic
- Dark mode support from day one
- Simple 3–5 step onboarding tour
- Short tooltips everywhere (centralized config)

---

## 🔐 Data & Privacy

- All user data tied to auth token or anonymous session (for guest use)
- No third-party data integrations at launch
- All values entered manually

---

## 🧪 Testing Plan

### Unit Tests (Jest)

- Forecast calculation engine (inputs → output)
- Tax logic (based on brackets)
- Asset growth over time

### Integration Tests

- Scenario creation → save
- Milestone impact on forecast
- Auth and payment tier enforcement

### UI Tests (Playwright/Cypress)

- Tooltip visibility
- Scenario switching
- Guest mode → upgrade prompt

---

## 🚫 Deferred for Now

- CSV import/export (except PDF)
- Plaid, Zillow, or any real-time API integrations
- Advisor collaboration (long-term roadmap)
- Revision history / undo / autosave

---

## 📈 Future Considerations

- Advisor access role & collaborative features
- Localization + international support
- Automated financial insights using AI + tax optimization
- Real-time data integrations via APIs (Zillow, Plaid)

---

## 🧪 Developer Notes

- All user-editable values should be overrideable in UI
- Use enums in schema where possible for safety
- Prepare backend to eventually support data ingestion from integrations
- Maintain tier gating logic via central config for flexibility

---

This specification should be used to stand up the project from a monorepo scaffold through to UI prototyping, backend scaffolding, and first interactive forecast outputs. Let me know if you'd like this converted into a GitHub README, product roadmap, or ticket backlog next.
