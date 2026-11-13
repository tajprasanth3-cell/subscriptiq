# SubscriptIQ — Metered Subscription & Usage Ingestion Platform

SubscriptIQ is a modern, high-precision SaaS metered subscription management and idempotent usage event tracking platform. It enables multi-tenant organizations to monitor resource usage in real time, enforce plan quotas, bill overages predictably, and manage complete subscription lifecycles.

---

## 🎨 Design System & Screens Overview

The application implements all 8 official UI specifications with high-fidelity visual tokens:

| # | Screen | Path / Component | Core Capabilities |
|---|---|---|---|
| **01** | **Authentication** | `src/pages/LoginPage.tsx` | Split-screen branding, demo logins (Business Owner / Super Admin), organization registration |
| **02** | **Overview Dashboard** | `src/pages/DashboardOverview.tsx` | Quota meters, API usage trend chart, active alerts, quick actions |
| **03** | **Plans & Subscription** | `src/pages/PlansPage.tsx` | Tier selection (Basic, Pro, Enterprise), monthly/annual toggle, lifecycle state stepper |
| **04** | **Usage Events** | `src/pages/UsagePage.tsx` | Real-time event ingestion simulator, idempotency duplicate detection, CSV export |
| **05** | **Billing & Invoices** | `src/pages/BillingPage.tsx` | Current period line item breakdown, payment status, printable invoice modal, history |
| **06** | **Customers** | `src/pages/CustomersPage.tsx` | Multi-tenant organization list, status cycling, add customer modal, quota gauges |
| **07** | **Limits & Alerts** | `src/pages/AlertsPage.tsx` | Threshold percentage rules, exceeded limit actions, test alert dispatcher, notification feed |
| **08** | **Platform Admin** | `src/pages/AdminPage.tsx` | Fleet KPI metrics, revenue trajectory SVG chart, plan distribution donut chart, audit ledger |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (tested on Node v24.15.0)
- **npm**: v9+ (tested on npm 11.12.1)

### Installation & Local Development

The app runs as two processes: the Express API (`backend/`) and the React app (`frontend/`).

```bash
# 1. Install dependencies (first run only)
npm --prefix backend install
npm --prefix frontend install

# 2. Terminal 1 — start the API on http://localhost:4000
npm run backend:dev

# 3. Terminal 2 — start the frontend dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser and sign in with one of the
demo accounts:

| Portal | Email | Password |
|---|---|---|
| Business Owner | `owner@acme.com` | `password123` |
| Super Admin | `admin@subscriptiq.platform` | `adminpass` |
| Customer | `customer@techcorp.io` | `custpass` |

The frontend calls the API at `http://localhost:4000/api` by default. Override it with
`VITE_API_URL` in `frontend/.env` (see `frontend/.env.example`).

### Production Build

```bash
cd frontend
npm run build
```

The optimized static production assets will be built into `frontend/dist/`.

---

## 📁 Project Structure

```text
G:\Subscript\
├── frontend/
│   ├── public/
│   │   ├── favicon.svg             # Brand SVG icon
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                 # Brand illustrations & graphics
│   │   ├── components/
│   │   │   ├── common/             # Badge, Button, Card, ProgressBar, ToastContainer
│   │   │   ├── layout/             # AppLayout, Sidebar, Header
│   │   │   ├── dashboard/          # RevenueChart, PlanDistributionChart, ApiUsageTrendChart
│   │   │   └── billing/            # InvoiceModal (printable tax invoice)
│   │   ├── context/
│   │   │   └── AppContext.tsx      # Global state provider & actions
│   │   ├── data/
│   │   │   └── mockData.ts         # High-fidelity seed datasets matching designs
│   │   ├── pages/                  # The 8 full screen components
│   │   ├── types/
│   │   │   └── index.ts            # Strongly-typed domain models
│   │   ├── utils/
│   │   │   └── formatters.ts       # Currency and number formatting helpers
│   │   ├── App.tsx                 # Root router & shell
│   │   ├── index.css               # Tailwind CSS v4 setup
│   │   └── main.tsx                # React 19 entry
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── ui-designs/                     # Original extracted screen designs (PNG)
```

---

## 💡 Key Technical Features

1. **Idempotent Ingestion Testing**: On the **Usage** screen, click **"Test Duplicate"** to verify that duplicate event IDs are intercepted, marked as `Duplicate, ignored`, and do not double-bill customer quotas.
2. **Dynamic Quota Progress Meters**: Meter colors dynamically shift from Emerald (&le;70%) to Indigo (71–90%) to Amber (&gt;90%) to indicate proximity to thresholds.
3. **Interactive Tax Invoices**: Clicking **"Download invoice"** on any page opens a printable modal with verified payment details, line items, and taxes with full `window.print()` / PDF export support.
4. **Role Switching**: Click the profile avatar or organization card to seamlessly toggle between **Business Owner** and **Super Admin**.

