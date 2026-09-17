# Real Estate CRM

A small full-stack CRM that lets a sales team manage leads and property bookings.

**Stack:** React + Redux Toolkit + RTK Query · Express.js · MySQL · Prisma ORM

## Features

- **Lead management** — create, edit, search, filter, delete leads
- **Lead stages** — New → Contacted → Site Visit → Interested → Negotiation → Booked → Lost
- **Assignment** — assign leads to sales employees, add follow-up dates and notes
- **Bulk import** — upload an Excel (.xlsx/.xls) file to create many leads at once
- **File attachments** — upload PDF or Excel files to a lead (ID proof, brochures, etc.)
- **Property management** — Projects → Buildings → Units, with price/type/availability
- **Booking flow** — connect a lead to a unit; **a unit can never be double-booked**
  (enforced with a Prisma transaction that re-checks availability at write time)
- **Dashboard** — lead counts by stage, unit availability, revenue booked, upcoming follow-ups
- **Auth** — JWT login with Admin and Sales Employee roles
- **UI** — reusable component library (Button, Input, Select, Modal, DataTable, Badge,
  StatCard, ConfirmDialog…) on one consistent theme, with toast notifications for every
  action (react-toastify)

## Project Structure

```
crm/
├── backend/        Express API + Prisma + MySQL
└── frontend/       React + Redux Toolkit + RTK Query (Vite)
```

## 1. Backend Setup

### Prerequisites
- Node.js 18+
- MySQL 8+ running locally (or a hosted MySQL instance)

### Steps

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your real database credentials:

```
DATABASE_URL="mysql://root:yourpassword@localhost:3306/realestate_crm"
JWT_SECRET="some_long_random_string"
```

Create the database (MySQL must already be running):

```sql
CREATE DATABASE realestate_crm;
```

Run Prisma migrations to create all tables:

```bash
npx prisma migrate dev --name init
```

Seed demo data (an Admin user, a Sales user, a sample project with units, and two leads):

```bash
node prisma/seed.js
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Health check: `GET /api/health`.

**Demo logins created by the seed script:**
| Role  | Email            | Password    |
|-------|------------------|-------------|
| Admin | admin@crm.com    | Admin@123   |
| Sales | sales@crm.com    | Sales@123   |

## 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173` and talks to the API at the URL set in
`VITE_API_URL` (defaults to `http://localhost:5000/api`).

## 3. Excel Import Format

When importing leads via **Leads → Import Excel**, the sheet's first row should have
these column headers (case-insensitive), with `Name` and `Phone` required:

| Name | Phone | Email | Source | Stage |
|------|-------|-------|--------|-------|
| Ravi Kumar | 9876543210 | ravi@x.com | Website | NEW |

## 4. Deployment Notes

- **Backend**: deploy to any Node host (Render, Railway, a VPS). Point `DATABASE_URL`
  at your production MySQL instance and run `npx prisma migrate deploy` on release.
- **Frontend**: `npm run build` produces a static `dist/` folder deployable to Vercel,
  Netlify, or any static host. Set `VITE_API_URL` to your deployed backend's URL.
- Don't forget to set `CLIENT_URL` in the backend `.env` to your deployed frontend's
  origin so CORS allows it.

## Key Decisions

1. **Booking safety over a hard DB constraint.** Rather than a MySQL unique constraint
   (which would block re-booking a *cancelled* unit's history), double-booking is
   prevented inside a Prisma `$transaction`: it re-reads the unit's status and only
   confirms the booking if it is still `AVAILABLE`, then flips it to `BOOKED` in the
   same transaction. This keeps full booking history while still making a race
   impossible.
2. **RTK Query over manual Redux/thunks.** Since almost every screen is "fetch from
   API, mutate, refetch," RTK Query's cache tags (`Lead`, `Unit`, `Booking`, `Dashboard`)
   let each mutation automatically invalidate exactly the queries it affects, instead of
   hand-writing loading/error state for every request.
3. **One shared component library, one theme.** Every page is built from the same
   `Button` / `Input` / `Select` / `Modal` / `DataTable` primitives in
   `src/components/ui`, styled from a single Tailwind theme (`tailwind.config.js`).
   This keeps the UI visually consistent and means new pages/features reuse existing
   pieces instead of styling one-offs.
4. **Excel import is additive, not upsert-based.** Duplicate leads aren't merged on
   import — for a sales CRM, it's safer for a human to review and merge duplicates than
   for an import script to silently overwrite existing lead data/notes.
5. **Role is stored but not yet UI-gated.** Both Admin and Sales Employee can currently
   access the same screens; the backend already has `restrictTo("ADMIN")` middleware
   ready to lock down specific routes (e.g. deleting projects) once the exact
   permission rules are decided.

## What I'd Add With More Time

- Role-based UI (hide/disable actions Sales employees shouldn't see)
- Server-side pagination for the Units table (currently loads all units)
- PDF export of the dashboard/booking summary
- Email/SMS notifications for upcoming follow-ups
