# SubscriptIQ Backend

Node.js + TypeScript (Express) API for the **SubscriptIQ** metered subscription &
usage ingestion platform. It implements authentication, plan catalog, subscription
lifecycle, **idempotent usage ingestion**, usage meters, billing/invoices, customers,
limit rules & alerts, audit logging, and platform admin statistics.

It is a drop-in data source for the React frontend in `../frontend` — the same domain
model, seeded with the same demo dataset.

---

## Quick start

```bash
cd backend
npm install
cp .env.example .env      # optional, sensible defaults are built in
npm run dev               # http://localhost:4000
```

Production build:

```bash
npm run build             # tsc -> dist/
npm start                 # node dist/index.js
```

Other scripts:

| Script | Description |
|---|---|
| `npm run dev` | Watch-mode dev server (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the idempotency/unit test suite |
| `npm run reset:data` | Delete the persisted JSON database (re-seeds on next start) |

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | HTTP port |
| `NODE_ENV` | `development` | `production` hides error stacks and disables request logging |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed origins |
| `JWT_SECRET` | dev placeholder | **Change in production** |
| `JWT_EXPIRES_IN` | `7d` | Session token lifetime |
| `DATA_DIR` | `data` | Directory for the JSON data file |
| `DATA_FILE` | `db.json` | JSON data file name |

---

## Demo credentials

| Portal | Email | Password | Role |
|---|---|---|---|
| Owner | `owner@acme.com` | `password123` | Business Owner |
| Admin | `admin@subscriptiq.platform` | `adminpass` | Super Admin |
| Customer | `customer@techcorp.io` | `custpass` | Customer |

---

## Project structure

```text
backend/
├── src/
│   ├── index.ts               # Bootstrap + graceful shutdown
│   ├── app.ts                 # Express app assembly (helmet, cors, json, routes)
│   ├── config/env.ts          # Typed environment configuration
│   ├── data/seed.ts           # Seeded demo dataset (mirrors frontend mock data)
│   ├── store/store.ts         # In-memory state + JSON-file persistence
│   ├── types/                 # Domain types & Express augmentation
│   ├── middleware/            # auth, validation, error handling, request id
│   ├── utils/                 # jwt, password, errors, csv/format helpers
│   ├── validation/schemas.ts  # Zod request schemas
│   ├── services/              # Business logic (one module per domain)
│   ├── routes/                # Express routers (one module per domain)
│   └── tests/usage.test.ts    # Idempotency & classification tests
├── package.json
└── tsconfig.json
```

---

## API reference

All responses use a `{ "data": ... }` envelope. Errors use:

```json
{ "error": { "code": "NOT_FOUND", "message": "...", "details": null, "requestId": "..." } }
```

Authenticated routes require `Authorization: Bearer <token>`.

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Service status + store counts |

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/register` | — | `{ organizationName, email, password }` → new owner + org |
| GET | `/api/auth/me` | any | Current user |

### Plans
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/plans` | any | List all tiers |
| GET | `/api/plans/:id` | any | Get one tier (by id or name) |
| POST | `/api/plans` | Super Admin | Create tier |
| PATCH | `/api/plans/:id` | Super Admin | Update tier |
| DELETE | `/api/plans/:id` | Super Admin | Delete tier (keeps ≥ 1) |

### Subscription
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/subscription` | any | Current subscription |
| POST | `/api/subscription/change` | Owner/Admin | `{ plan, billingCycle? }` change tier |
| POST | `/api/subscription/cancel` | Owner/Admin | Cancel at period end |
| POST | `/api/subscription/reactivate` | Owner/Admin | Reactivate |
| PATCH | `/api/subscription/status` | Owner/Admin | Force lifecycle status |

### Usage
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/usage/meters` | any | Quota meters |
| GET | `/api/usage/events` | any | Paginated/filtered events (`tab`, `search`, `page`, `pageSize`) |
| GET | `/api/usage/events/stats` | any | Accepted / duplicate / rejected counts |
| GET | `/api/usage/events/export` | any | CSV export of events |
| POST | `/api/usage/events` | any | **Idempotent ingestion** (see below) |
| POST | `/api/usage/simulate` | any | `{ duplicate?, count? }` demo ingestion |
| DELETE | `/api/usage/events` | any | Clear the event log |

### Billing
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/billing/current` | any | Current-period invoice |
| GET | `/api/billing/invoices` | any | Paginated invoice history (`search`, `page`, `pageSize`) |
| GET | `/api/billing/invoices/:id` | any | Single invoice |
| GET | `/api/billing/invoices/:id/export` | any | CSV export |
| POST | `/api/billing/invoices/:id/pay` | Owner/Admin | Mark paid |

### Customers
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/customers` | any | Paginated/filtered (`search`, `status`, `page`, `pageSize`) |
| GET | `/api/customers/:id` | any | Single customer |
| POST | `/api/customers` | Owner/Admin | Create customer |
| PATCH | `/api/customers/:id` | Owner/Admin | Update customer |
| PATCH | `/api/customers/:id/status` | Owner/Admin | Set status |
| POST | `/api/customers/:id/cycle-status` | Owner/Admin | Cycle Active → Near limit → Suspended |
| DELETE | `/api/customers/:id` | Owner/Admin | Remove customer |

### Alerts
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/alerts/rules` | any | Threshold rules |
| PUT | `/api/alerts/rules` | Owner/Admin | Update threshold rules |
| GET | `/api/alerts/notifications` | any | Paginated feed + `unreadCount` |
| POST | `/api/alerts/notifications/test` | Owner/Admin | Dispatch a test alert |
| POST | `/api/alerts/notifications/read` | any | Mark all read |

### Admin (Super Admin only)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Super Admin | Fleet KPIs + plan distribution |
| GET | `/api/admin/audit-logs` | Super Admin | Paginated audit ledger (`search`, `page`, `pageSize`) |

---

## Idempotent usage ingestion

`POST /api/usage/events` applies these rules **in order**:

1. **Missing/invalid quantity** → `Rejected: no quantity` / `Rejected: invalid schema` (never metered)
2. **Event id already processed** → `Duplicate, ignored` (never metered twice)
3. **`block_usage` rule active and quota reached** → `Rejected: quota exceeded`
4. Otherwise → `Accepted` and the matching meter is incremented

Metering also evaluates the configured threshold rules and raises threshold
notifications when the first/second alert percentages are crossed.

```bash
# First call — accepted & metered
curl -X POST http://localhost:4000/api/usage/events \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"id":"evt_1","customer":"Acme","resource":"API requests","quantity":100}'

# Second call with the same id — safely ignored
# -> { "data": { "event": { "status": "Duplicate, ignored" }, "metered": false } }
```

---

## Data & persistence

State is held in memory and flushed to `data/db.json` after every mutation, so the
demo dataset survives restarts. Delete the `data/` directory (or run
`npm run reset:data`) to re-seed. Swap `src/store/store.ts` for a real database
client without touching the service layer.

---

## Connecting the frontend

The frontend is already wired to this API. It reads the base URL from
`VITE_API_URL` (defaults to `http://localhost:4000/api`), logs in through
`POST /api/auth/login`, stores the JWT in `localStorage`, and calls the endpoints
above for every screen. Response shapes match the frontend types in
`frontend/src/types/index.ts`.

To run the full stack:

1. Start the API (`npm run dev` in `backend/`).
2. Start the frontend (`npm run dev` in `frontend/`, or `npm run dev` at the repo root).
3. Sign in with any demo credential; the app loads live data instead of mock data.
   The header's **Switch Role** action re-authenticates as the matching demo user.
