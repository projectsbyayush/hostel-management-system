# Hostel Management System

A complete, working Hostel Management System for a college project — React frontend,
Spring Boot backend, and MySQL database. Built for a clean classroom demonstration:
six focused pages, realistic demo data on first launch, and code simple enough to
explain in a viva.

## Features

| Page | What works |
|---|---|
| **Dashboard** | Total students, rooms, available beds, pending fee balance (all from the DB), room-occupancy chart, 6-month fee-collection chart, recent registrations, pending complaints |
| **Students** | Add / view / edit / delete, search by name, ID or phone, filter by status. Duplicate IDs and emails are rejected; deletion is blocked when allocation, fee or complaint records exist |
| **Rooms** | Add / edit / delete, search, filter by type and status (Available, Full, Partially Occupied, Maintenance). Occupancy is computed from live allocations; capacity cannot drop below current occupancy |
| **Room Allotment** | Allot students to rooms, check out, active/history tabs, search. Backend enforces: one active room per student, no over-capacity, no maintenance rooms |
| **Fees & Payments** | Fee records with due dates, partial payments, payment history, outstanding balance auto-computed, paid/partial/pending filters, printable receipts (₹, `BigDecimal`/`DECIMAL`) |
| **Complaints** | Add / edit / delete, Open → In Progress → Resolved workflow, search, status & priority filters |

Single administrator login (JWT + BCrypt). All tables, forms, edits, deletes, payments,
allotments and status changes talk to the real backend and persist in MySQL.

## Tech Stack

- **Frontend:** React 18 + Vite, HeroUI 2, Tailwind CSS 3, React Router 6, Axios, Lucide icons, Recharts
- **Backend:** Java 25, Spring Boot 3.5, Spring Web / Data JPA / Security / Validation, Flyway, JJWT, Maven
- **Database:** MySQL 8 (schema + demo data via Flyway migrations `V1__schema.sql`, `V2__demo_data.sql`)

## Prerequisites

- JDK 17+ (tested with JDK 25)
- Maven 3.9+
- Node.js 18+ and npm
- MySQL 8 — either a standalone install or the MySQL bundled with **XAMPP**
  (XAMPP default `root` user with **empty password** works with zero configuration)

## 1. Create and configure the database

No manual SQL needed. Start MySQL, then create an empty database (or let the app create it):

```sql
CREATE DATABASE IF NOT EXISTS hostel_db CHARACTER SET utf8mb4;
```

**Using XAMPP:** open the XAMPP Control Panel and click **Start** next to MySQL.
XAMPP uses user `root` with an **empty password** on port `3306`, which matches the
backend defaults — no environment variables or configuration needed.

**Using standalone MySQL:** if your credentials differ from `root` / empty password,
configure them (defaults are fine for local demo):

```powershell
# Windows PowerShell (per session, before starting the backend)
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-mysql-password"
```

Linux/macOS: `export DB_USERNAME=root DB_PASSWORD=secret`.
See `backend/.env.example` for all variables (`DB_URL`, `SERVER_PORT`, `JWT_SECRET`, ...).

On first backend start, Flyway creates all tables and loads demo data:
16 students, 7 rooms, 9 active + 2 past allocations, 15 fee records with payments,
5 complaints, and the admin user.

## 2. Start the backend

First time only, create your local config (git-ignored — secrets stay out of git):

```powershell
copy backend\.env.example backend\.env
```

Then start the backend:

```powershell
cd backend
mvn spring-boot:run
```

Or build once and run the jar:

```powershell
cd backend
mvn package -DskipTests
java -jar target/hostel-management-1.0.0.jar
```

Backend runs at **http://localhost:8080**, API under `/api/...`.

## 3. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**. The Vite dev server proxies `/api` to the
backend, so no CORS setup is needed in development.

Production build: `npm run build` (output in `frontend/dist/`).

## 4. Log in

| Field | Value |
|---|---|
| URL | http://localhost:5173/login |
| Username | `ADMIN_USERNAME` from `backend/.env` |
| Password | `ADMIN_PASSWORD` from `backend/.env` |

Single administrator account (no multi-role system, per the project brief). The login
credentials live only in your local `backend/.env` file (git-ignored) — they are not
printed here, not stored in SQL, and not shown in the UI. The password in the database
is a BCrypt hash, and the admin account is (re)created from the `.env` values at every
backend start — change the password there and restart to apply it. Change `JWT_SECRET`
for any shared use.

## Project structure

```
hostel-management-system/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/hostel/
│       │   ├── HostelApplication.java
│       │   ├── config/        # SecurityConfig (JWT, BCrypt, CORS)
│       │   ├── security/      # JwtUtil, JwtAuthenticationFilter, entry point
│       │   ├── controller/    # REST endpoints (auth, dashboard, students, rooms,
│       │   │                #   allocations, fees, complaints)
│       │   ├── service/       # business rules + transactions
│       │   ├── repository/    # Spring Data JPA queries + one native query
│       │   ├── entity/        # User, Student, Room, Allocation, Fee, Payment, Complaint
│       │   ├── model/         # enums (statuses, types, priorities)
│       │   ├── dto/           # request/response records with Bean Validation
│       │   └── exception/     # ApiError + global handler (consistent JSON errors)
│       └── resources/
│           ├── application.properties
│           └── db/migration/  # V1__schema.sql, V2__demo_data.sql
├── frontend/
│   ├── package.json  vite.config.js  tailwind.config.js  index.html
│   └── src/
│       ├── main.jsx  App.jsx  index.css
│       ├── api/client.js            # axios instance + 401 handling
│       ├── context/                 # AuthContext, ToastContext
│       ├── router/RequireAuth.jsx   # protected routes
│       ├── components/
│       │   ├── layout/AppLayout.jsx # sidebar + top bar + mobile drawer
│       │   └── ui/                  # badges, dialogs, modals, forms, empty states
│       ├── pages/                   # Login, Dashboard, Students, Rooms,
│       │                           # Allotments, Fees, Complaints, Receipt
│       └── utils/format.js          # ₹ formatting, dates
├── tools/
│   ├── api-tests.ps1    # 56 automated backend checks (see "Verification")
│   ├── run-backend.cmd  # Windows helper to launch the backend jar
│   └── run-frontend.cmd # Windows helper to launch the dev server
└── README.md
```

## API endpoints (all except `/api/auth/login` need `Authorization: Bearer <token>`)

```
POST /api/auth/login                 { usernameOrEmail, password } -> { token, user }
GET  /api/auth/me

GET  /api/dashboard/stats | /room-occupancy | /monthly-collections
     /recent-students | /pending-complaints

GET    /api/students[?q=&status=]     POST   /api/students
GET    /api/students/{id}             PUT    /api/students/{id}
                                      DELETE /api/students/{id}

GET    /api/rooms[?q=&status=&type=]  POST   /api/rooms
GET    /api/rooms/{id}                PUT    /api/rooms/{id}
                                      DELETE /api/rooms/{id}

GET    /api/allocations[?q=&status=]  POST   /api/allocations          (allot)
                                      POST   /api/allocations/{id}/checkout

GET    /api/fees[?q=&status=]         POST   /api/fees
GET    /api/fees/{id}                 POST   /api/fees/{id}/payments
GET    /api/fees/{id}/payments        GET    /api/fees/{id}/balance

GET    /api/complaints[?q=&status=]   POST   /api/complaints
GET    /api/complaints/{id}           PUT    /api/complaints/{id}
                                      PATCH  /api/complaints/{id}/status  { status }
                                      DELETE /api/complaints/{id}
```

## Business rules (enforced on the backend)

- A student can hold only **one active** room allocation.
- A room can never exceed its capacity; rooms under **maintenance** accept no allotments.
- Check-out closes the allocation and immediately frees the bed.
- Room capacity cannot be reduced below current occupancy; rooms/students with
  linked records cannot be deleted (HTTP 409 with an explanation).
- Payments must be `0 < amount ≤ balance`; duplicate payment references are rejected;
  money uses `BigDecimal` / `DECIMAL(12,2)` and fee status (Paid / Partially Paid /
  Pending) is derived from stored records.

## Verification

Backend checks (`tools/api-tests.ps1`, PowerShell) run against a live MySQL instance:

- **56/56 passed** — login + wrong-password 401, unauthenticated 401, dashboard
  numbers (16 students, 7 rooms, 4 free beds, ₹110,000 pending, 4 open complaints),
  student CRUD + search + filters + duplicate/validation/deletion rules,
  room CRUD + derived Full/Partial filters + capacity guard,
  allot / duplicate-student / full-room / maintenance rejections / checkout /
  bed-freed check / double-checkout rejection,
  fee CRUD + payment + partial balance + overpayment/zero/duplicate-reference
  rejections + paid-in-full flow, complaint CRUD + status changes.
- `mvn clean package` — BUILD SUCCESS; `npm run build` — success.
- Frontend smoke test: dev server serves the SPA (200), `/api` proxy forwards
  login and dashboard calls to the backend, entry modules transform with no errors.
- Every sidebar link maps to a real working page; every form submits to the API;
  loading, empty, and error states are implemented on all pages.

## What was deliberately left out

No microservices, Docker/Kubernetes, cloud deployment, email/SMS, payment gateways,
AI/chatbots, multi-role workflows, visitor or staff modules — per the project brief.
This is a local, single-admin college project.

## Troubleshooting

- **Backend fails with a Flyway checksum error on `V2__demo_data.sql`** (only if you
  ran a version from before the admin login moved to `backend/.env`): your local
  database has the old migration recorded. Drop it once and restart — Flyway
  recreates everything including demo data:
  ```sql
  DROP DATABASE hostel_db;
  ```
- **Login not working:** check `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env`
  and restart the backend (the admin account is seeded at startup).
