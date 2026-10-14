# SafishaHub — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-11
**Status:** Living Document
**Owner:** SafishaHub Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [User Personas](#3-user-personas)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Current Feature Inventory](#5-current-feature-inventory)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Data Model](#8-data-model)
9. [UX & Design Principles](#9-ux--design-principles)
10. [Known Issues & Tech Debt](#10-known-issues--tech-debt)
11. [Roadmap & Prioritization](#11-roadmap--prioritization)
12. [Success Metrics](#12-success-metrics)
13. [Constraints & Assumptions](#13-constraints--assumptions)
14. [Glossary](#14-glossary)

---

## 1. Executive Summary

SafishaHub is a **web-based car wash management system** purpose-built for the Kenyan market. It enables car wash operators to record daily sales transactions, manage customer leads for auto-detailing services, track operational expenses, and analyze employee performance — all from any device with a browser.

The system currently runs as a React single-page application backed by Supabase (PostgreSQL) with M-Pesa payment support, WhatsApp receipt sharing, and Supabase Realtime for live multi-device updates.

### Current State

The product is a **functional MVP** with three core modules:

| Module | Description | Status |
|--------|-------------|--------|
| Daily Sales | Record vehicle, motorbike, and carpet wash transactions | Live |
| Lead Records | Capture and manage auto-detailing customer leads | Live |
| Admin Panel | Analytics, employee management, expenses, notes | Live |

### Key Numbers (as designed)
- **3** service categories (Vehicle, Motorbike, Carpet/Rug)
- **6+ service types** per category
- **4** payment methods (Cash, M-Pesa, Card, Bank Transfer)
- **6** database tables
- **0** authentication / access controls currently in place

---

## 2. Product Vision & Goals

### Vision Statement

> Enable every car wash business in Kenya to run paperless, stay organized, and grow revenue through data-driven insights — accessible on any device, even offline.

### Business Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **Operational Efficiency** | Replace paper-based or WhatsApp-group record keeping | P0 |
| **Revenue Visibility** | Real-time dashboard of daily/weekly/monthly revenue | P0 |
| **Staff Accountability** | Attribute every transaction to an employee | P1 |
| **Customer Pipeline** | Capture and convert auto-detailing leads | P1 |
| **Cost Tracking** | Track expenses to understand true profit margins | P1 |
| **Multi-Device Access** | Owner sees live data while attendants record sales | P2 |
| **Offline Resilience** | Continue working during internet outages | P2 |
| **Scalability** | Support multiple branches under one account | P3 |

### Non-Goals (Out of Scope for v1)

- Automated M-Pesa STK push / payment collection
- Full payroll / HR management
- Inventory management (car wash supplies)
- Customer loyalty or rewards programs
- WhatsApp/SMS automation platform integration
- Multi-tenant SaaS (multiple businesses per account)

---

## 3. User Personas

### Persona 1 — The Owner / Manager

**Name:** James
**Role:** Car wash business owner
**Tech Comfort:** Medium (uses WhatsApp, M-Pesa, basic smartphone)
**Goals:**
- See today's revenue without calling staff
- Compare employee performance fairly
- Know if a carpet was returned to the customer
- Track monthly expenses vs revenue
- Export records for accountant

**Pain Points:**
- Staff underreport sales on busy days
- Loses track of carpets left for cleaning
- No visibility when not physically present
- Paper records get lost or damaged

**Device:** Primarily smartphone, occasionally laptop

---

### Persona 2 — The Sales Attendant

**Name:** Kevin
**Role:** Car wash attendant / cashier
**Tech Comfort:** Low-Medium (smartphone native)
**Goals:**
- Record a sale quickly between customers
- Send customers a WhatsApp receipt
- Not make mistakes on amounts or service types

**Pain Points:**
- Slow or complicated forms lose him time
- Mistakes are hard to correct
- Remembering to record every transaction

**Device:** Budget Android smartphone

---

### Persona 3 — The Lead Intake Staff

**Name:** Aisha
**Role:** Front desk / customer relations
**Tech Comfort:** Medium
**Goals:**
- Log customer detailing requests accurately
- Follow up on pending leads
- Know what services the customer requested

**Pain Points:**
- Customer details get lost in WhatsApp chats
- No structured way to track follow-ups

**Device:** Tablet or laptop

---

## 4. System Architecture Overview

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.1.0 |
| Styling | Tailwind CSS | 3.4.18 |
| Charts | Recharts | 3.7.0 |
| Backend / DB | Supabase (PostgreSQL) | 2.90.1 SDK |
| Realtime | Supabase Realtime | via SDK |
| Routing | Custom state-based | — |
| Build Tool | Create React App | 5.0.1 |
| Hosting | Netlify (or equivalent static host) | — |

### Architecture Diagram (Current)

```
┌─────────────────────────────────────────┐
│              Browser (React SPA)         │
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌────────┐  │
│  │ Home.js │  │Records.js│  │Admin.js│  │
│  └────┬────┘  └────┬────┘  └───┬────┘  │
│       │            │            │        │
│  ┌────▼────────────▼────────────▼────┐  │
│  │        supabaseService.js         │  │
│  │   (CRUD layer + localStorage fallback) │
│  └─────────────────┬─────────────────┘  │
│                    │                    │
└────────────────────┼────────────────────┘
                     │ HTTPS + WebSocket
              ┌──────▼──────┐
              │   Supabase   │
              │  PostgreSQL  │
              │  + Realtime  │
              └─────────────┘
```

### State Management Pattern (Current)

```
App.js (currentPage state)
  ├── Home.js      — navigation only
  ├── Records.js   — local useState for form + sales
  ├── Autodetailing.js — local useState for leads form + list
  └── Admin.js     — local useState for all admin sub-sections
```

No global state management. No routing library. No form library.

---

## 5. Current Feature Inventory

### 5.1 Home Page

- Navigation hub with three primary buttons (Daily Sales, Lead Records, Admin Panel)
- Gradient visual design, mobile-optimized
- No authentication gate

### 5.2 Daily Sales Module (Records.js)

#### Step 1 — Employee Selection
- Grid of employee cards (name + phone number)
- Loaded from Supabase `employees` table
- No employee = no sale can be recorded

#### Step 2 — Service Category Selection
- Three category cards: Vehicle Wash, Motorbike Wash, Carpet/Rug Wash
- Visual icons per category

#### Step 3 — Sale Entry Form

**Common fields (all categories):**
- Date picker (defaults to today)
- Payment method: Cash / M-Pesa / Card / Bank Transfer
- M-Pesa Reference field (conditional, shown only when M-Pesa selected)
- Price (KSh, manual entry)

**Vehicle-specific fields:**
- Vehicle model (free text)
- Multi-select service types: Exterior Wash, Interior Clean, Full Detail, Vacuum, Buffing, Waxing, Polish

**Motorbike-specific fields:**
- Number of motorbikes (numeric)
- Multi-select service types: Basic Wash, Deep Clean, Polish, Chain Lubrication, Full Detail, Engine Clean

**Carpet-specific fields:**
- Carpet size: dropdown (3x5 to 12x15, Custom)
- Multi-select service types: Deep Clean, Stain Removal, Dry Cleaning, Steam Cleaning, Odor Removal, Scotchgard Protection

**Post-Save Actions:**
- WhatsApp receipt share (pre-filled message with sale details)
- "Record Another Sale" quick action
- Return to employee selection

**Sales History (in Records.js):**
- Per-employee or all-employee overview
- Time period filter: Day / Week / Month / Year
- Date picker
- Revenue and service count cards by category
- Service type breakdown per category

**CSV Export:**
- Exports filtered sales to CSV file
- Filename includes period and date

### 5.3 Lead Records Module (Autodetailing.js)

**Lead Capture Form:**
- Asset type tabs: Vehicle / Motorbike / Carpet

*Vehicle lead fields:*
- Customer Name, Phone
- Vehicle Model, Registration Number
- Customer Needs (textarea)

*Motorbike lead fields:*
- Customer Name, Phone
- Motorbike Model
- Customer Needs (textarea)

*Carpet lead fields:*
- Customer Name, Phone
- Carpet Type: Persian Rug / Shaggy Carpet / Wall-to-Wall / Area Rug / Runner / Other
- Carpet Size: Small / Medium / Large / Extra Large
- Customer Needs (textarea)

**Lead List:**
- Count badge (total leads)
- Inline editing of any lead field
- Delete with confirmation
- 3-second success toast on save

### 5.4 Admin Panel (Admin.js)

#### Carpet Pending Pickup Banner
- Amber alert shows number of unreturned carpets
- Per-carpet "Mark Returned" action
- Dismisses automatically when count reaches zero

#### Daily Sales Analytics Dashboard
- Date picker + Employee filter (All / Individual)
- KPI cards: Total Services, Total Revenue, Avg per Service, Transaction Count
- Category breakdown cards (Vehicle / Motorbike / Carpet):
  - Service count
  - Revenue
  - Service type breakdown (list of which types selected and how many)
  - "View Sales History" modal trigger

#### Sales History Modal
- Period filter: Day / Week / Month / Year
- Date picker
- Grouped by employee
- Inline editing: amount, payment method, service types
- Delete with confirmation
- Mark carpet as returned

#### Employee Performance Chart
- Period: Day / Week / Month / Year + date picker
- Metric: Revenue / Services / Both
- Recharts BarChart (dual-axis when "Both" selected)
- Top performer badge
- Employee-level bars with KSh and count labels

#### Employee Management
- Full CRUD (add, view, edit, delete)
- Fields: Name, Phone, ID Number, Photo (base64 upload, max 2MB)
- Inline editing with cancel

#### Expense Tracking
- Add expense (description, amount)
- List with inline edit and delete
- Persisted to Supabase `expenses` table

#### Notes / Incident Log
- Category selector
- Content textarea
- List with delete
- Persisted to Supabase `notes` table

#### Realtime Updates
- Supabase Realtime subscription on `sales` table
- INSERT / UPDATE / DELETE events trigger re-fetch
- Live updates across all connected devices

---

## 6. Functional Requirements

### FR-1: Transaction Recording

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-1.1 | System shall allow recording a sale for any employee currently in the employee list | Must | Live |
| FR-1.2 | System shall support three service categories: Vehicle, Motorbike, Carpet | Must | Live |
| FR-1.3 | System shall support four payment methods: Cash, M-Pesa, Card, Bank Transfer | Must | Live |
| FR-1.4 | System shall show M-Pesa reference field only when M-Pesa payment is selected | Should | Live |
| FR-1.5 | System shall allow selection of one or more service types per category | Should | Live |
| FR-1.6 | System shall persist each sale to Supabase with a timestamp, employee name, and all form fields | Must | Live |
| FR-1.7 | System shall fall back to localStorage if Supabase is unreachable | Should | Live (partial) |
| FR-1.8 | System shall generate a WhatsApp-shareable receipt message after a sale is recorded | Could | Live |
| FR-1.9 | System shall support CSV export of sales filtered by period | Could | Live |
| FR-1.10 | System shall allow recording multiple motorbikes in a single transaction | Should | Live |

### FR-2: Lead Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-2.1 | System shall capture leads for Vehicle, Motorbike, and Carpet detailing services | Must | Live |
| FR-2.2 | System shall store customer name and phone for every lead | Must | Live |
| FR-2.3 | System shall store asset-specific fields (model, registration, size, type) per category | Should | Live |
| FR-2.4 | System shall list all leads with ability to edit inline | Should | Live |
| FR-2.5 | System shall allow deletion of a lead with confirmation | Should | Live |
| FR-2.6 | System shall show a total lead count badge | Could | Live |
| FR-2.7 | System shall support lead status tracking (e.g., New, Contacted, Converted, Lost) | Should | Missing |
| FR-2.8 | System shall support follow-up date scheduling per lead | Could | Missing |

### FR-3: Analytics & Reporting

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-3.1 | System shall display daily revenue, service count, and average per service | Must | Live |
| FR-3.2 | System shall show revenue and service count broken down by category | Must | Live |
| FR-3.3 | System shall show employee performance comparison via bar chart | Should | Live |
| FR-3.4 | System shall support filtering by Day / Week / Month / Year periods | Should | Live |
| FR-3.5 | System shall support filtering by individual employee | Should | Live |
| FR-3.6 | System shall show which service types were performed and how many times | Should | Live |
| FR-3.7 | System shall display profit/loss comparison (revenue vs expenses) | Should | Missing |
| FR-3.8 | System shall support custom date range selection | Could | Missing |
| FR-3.9 | System shall support PDF export of daily/weekly reports | Could | Missing |
| FR-3.10 | System shall display trend charts (revenue over time, week-over-week) | Could | Missing |

### FR-4: Employee Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-4.1 | System shall maintain a list of employees with name, phone, and ID number | Must | Live |
| FR-4.2 | System shall allow adding, editing, and deleting employees | Must | Live |
| FR-4.3 | System shall support photo upload for employee profile (max 2MB) | Could | Live |
| FR-4.4 | System shall associate every sale with an employee | Must | Live |
| FR-4.5 | System shall support role assignment per employee (Owner, Manager, Attendant) | Should | Missing |
| FR-4.6 | System shall support salary/pay rate per employee | Could | Missing |

### FR-5: Expense Tracking

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-5.1 | System shall allow recording operational expenses with description and amount | Must | Live |
| FR-5.2 | System shall list all expenses with edit and delete capability | Must | Live |
| FR-5.3 | System shall persist expenses to Supabase | Must | Live |
| FR-5.4 | System shall categorize expenses (Supplies, Utilities, Maintenance, Wages, Other) | Should | Missing |
| FR-5.5 | System shall show total expenses for selected period alongside revenue | Should | Missing |

### FR-6: Carpet Return Tracking

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-6.1 | System shall flag carpets as pending return after service | Must | Live |
| FR-6.2 | System shall display a banner showing count of unreturned carpets | Must | Live |
| FR-6.3 | System shall allow marking a carpet as returned, recording the return date | Must | Live |
| FR-6.4 | System shall display customer/owner name for each pending carpet | Should | Live |

### FR-7: Authentication & Access Control

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-7.1 | System shall require authentication before accessing any module | Must | Missing |
| FR-7.2 | System shall support at minimum a PIN-based or password-based login | Must | Missing |
| FR-7.3 | System shall support role-based access (Owner sees admin; Attendant sees sales only) | Should | Missing |
| FR-7.4 | System shall maintain a session and not require re-login on every page | Should | Missing |
| FR-7.5 | System shall log out automatically after a configurable idle period | Could | Missing |

### FR-8: Offline & PWA

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-8.1 | System shall be installable as a PWA on Android/iOS devices | Should | Missing |
| FR-8.2 | System shall queue pending sales writes when offline and sync on reconnect | Should | Missing |
| FR-8.3 | System shall show a visible indicator when operating offline | Should | Missing |
| FR-8.4 | System shall serve cached UI assets when offline | Should | Missing |

### FR-9: Notifications

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-9.1 | System shall show non-blocking toast notifications in place of alert() dialogs | Should | Missing |
| FR-9.2 | System shall show loading indicators on async operations | Should | Partial |
| FR-9.3 | System shall confirm destructive operations (delete) before executing | Must | Partial (confirm()) |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P.1 | Initial page load time | < 3 seconds on 3G |
| NFR-P.2 | Sale record save round-trip | < 2 seconds |
| NFR-P.3 | Dashboard data load | < 3 seconds for 30 days of data |
| NFR-P.4 | CSV export generation | < 5 seconds for up to 1,000 records |
| NFR-P.5 | App must remain usable with up to 10,000 sales records | No full-table loads without pagination |

### 7.2 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-R.1 | System shall not lose a sale record due to network interruption | localStorage queue fallback |
| NFR-R.2 | Supabase Realtime disconnections shall reconnect automatically | Per Supabase SDK behavior |
| NFR-R.3 | Build process shall fail if environment variables are not configured | check-env.js enforces this |

### 7.3 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-S.1 | Supabase Row Level Security (RLS) policies shall be enabled on all tables | Must |
| NFR-S.2 | The Supabase anon key shall be restricted to authenticated sessions only (RLS) | Must |
| NFR-S.3 | Employee photos shall not be stored as base64 in localStorage | Should |
| NFR-S.4 | All destructive operations (delete) shall require confirmation | Must |
| NFR-S.5 | Session tokens shall not persist beyond browser session (or configurable TTL) | Should |

### 7.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-U.1 | All primary actions shall be reachable within 3 taps on mobile |
| NFR-U.2 | Form fields shall provide inline validation feedback, not alert() dialogs |
| NFR-U.3 | App shall be fully usable on screens 375px wide and above |
| NFR-U.4 | Touch targets shall be minimum 44x44px per WCAG guidelines |
| NFR-U.5 | Keyboard navigation shall work for all form inputs |

### 7.5 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-M.1 | No single component file shall exceed 500 lines |
| NFR-M.2 | Data transformation (DB → UI) shall be applied consistently in service layer |
| NFR-M.3 | Service types shall be configurable via Supabase `services` table, not hardcoded |
| NFR-M.4 | Browser back/forward navigation shall work correctly |

### 7.6 Compatibility

| ID | Requirement |
|----|-------------|
| NFR-C.1 | Shall work on Chrome for Android 90+, Safari iOS 14+ |
| NFR-C.2 | Shall work on Chrome/Edge/Firefox desktop (latest 2 versions) |
| NFR-C.3 | Shall not require app store installation (browser-first) |

---

## 8. Data Model

### Table: `sales`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid PK | Auto-generated |
| `date` | date | Date of service |
| `amount` | numeric | Price charged in KSh |
| `payment_method` | text | Cash / M-Pesa / Card / Bank Transfer |
| `mpesa_ref` | text | M-Pesa transaction reference (nullable) |
| `category` | text | vehicle / motorbike / carpet |
| `employee` | text | Employee name |
| `description` | text | Free-text description (legacy) |
| `service_type` | text | Comma-separated service types (legacy) |
| `vehicle_model` | text | Vehicle make/model (nullable) |
| `vehicle_service_type` | text[] | Array of selected vehicle service types |
| `number_of_motorbikes` | int | Count for motorbike transactions |
| `motorbike_service_type` | text[] | Array of selected motorbike service types |
| `size` | text | Carpet size (nullable) |
| `carpet_service_type` | text[] | Array of selected carpet service types |
| `returned` | boolean | Whether carpet was returned to customer |
| `returned_date` | timestamptz | When carpet was returned |
| `created_at` | timestamptz | Record creation timestamp |

### Table: `employees`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid PK | Auto-generated |
| `name` | text | Full name |
| `phone` | text | Phone number (07xxxxxxxx format expected) |
| `id_number` | text | National ID number |
| `email` | text | Email address (optional) |
| `role` | text | Role (unused in UI currently) |
| `salary` | numeric | Monthly salary (unused in UI currently) |
| `photo_url` | text | Base64 or URL (currently base64) |
| `created_at` | timestamptz | Record creation timestamp |

### Table: `expenses`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid PK | Auto-generated |
| `description` | text | Expense description |
| `amount` | numeric | Amount in KSh |
| `category` | text | Expense category (unused in UI) |
| `employee_id` | uuid FK | Associated employee (unused in UI) |
| `receipt_url` | text | Receipt image URL (unused in UI) |
| `created_at` | timestamptz | Record creation timestamp |

### Table: `notes`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid PK | Auto-generated |
| `category` | text | Note category (Incident, etc.) |
| `content` | text | Note body |
| `created_at` | timestamptz | Record creation timestamp |

### Table: `leads`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid PK | Auto-generated |
| `asset_type` | text | vehicle / motorbike / carpet |
| `customer_name` | text | Customer full name |
| `customer_phone` | text | Customer phone number |
| `customer_needs` | text | Free-text description of needs |
| `vehicle_model` | text | Vehicle model (nullable) |
| `registration_number` | text | Vehicle reg plate (nullable) |
| `motorbike_model` | text | Motorbike model (nullable) |
| `carpet_type` | text | Carpet type (nullable) |
| `carpet_size` | text | Carpet size category (nullable) |
| `date` | date | Date lead was created |
| `created_at` | timestamptz | Record creation timestamp |

**Missing from current leads table:**
- `status` — lead pipeline stage
- `follow_up_date` — scheduled follow-up
- `assigned_to` — employee responsible

### Table: `services`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid PK | Auto-generated |
| `category` | text | vehicle / motorbike / carpet |
| `name` | text | Service type name |
| `active` | boolean | Whether service is currently offered |

---

## 9. UX & Design Principles

### Design Language

- **Color palette:**
  - Vehicle / Sales: Blue (#3B82F6, #1D4ED8)
  - Carpet: Teal/Green (#10B981, #0D9488)
  - Admin: Purple (#7C3AED, #6D28D9)
  - Warning / Pending: Amber (#F59E0B)
  - Danger: Red (#EF4444)
- **Typography:** System fonts (Tailwind defaults)
- **Spacing:** Tailwind utility classes throughout
- **Borders / Radius:** `rounded-xl` for cards, `rounded-lg` for buttons
- **Shadows:** `shadow-md` / `shadow-lg` for elevation

### Mobile-First Principles

- Minimum touch target: 44px height on interactive elements
- Single-column layout on mobile, multi-column on tablet/desktop
- Sticky headers for navigation
- Bottom-anchored action buttons on forms where possible

### Interaction Patterns

| Pattern | Current Usage | Recommended |
|---------|--------------|-------------|
| Success feedback | Toast (leads), success panel (sales) | Consistent toast (Sonner) across all |
| Error feedback | `alert()` dialogs | Inline field errors + toast |
| Delete confirmation | `window.confirm()` | Modal dialog with button pair |
| Loading state | Spinner on some operations | Consistent skeleton/spinner |
| Inline editing | Used in leads, expenses, employees | Keep — good for quick edits |
| Multi-step form | Used in sales recording | Keep — reduces cognitive load |

---

## 10. Known Issues & Tech Debt

### Critical Issues

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| TD-1 | **No authentication** — any device can access all data | High | High |
| TD-2 | **transformSaleFromDB() not applied** in `getByDate()`/`getByEmployee()` — returns snake_case | Medium | Low |
| TD-3 | **alert() used throughout** — blocks thread, terrible UX on mobile | Medium | Medium |
| TD-4 | **No pagination** — all records loaded into memory | Medium | Medium |

### Architecture Issues

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| TD-5 | **Admin.js is 2180+ lines** — untestable, hard to modify | Medium | High |
| TD-6 | **No routing library** — browser back/forward broken, deep links impossible | Medium | Medium |
| TD-7 | **No form validation library** — validation logic scattered in component state | Low | Medium |
| TD-8 | **No global state** — data is re-fetched independently per component | Low | High |

### Data Issues

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| TD-9 | **Employee photos stored as base64** — inefficient localStorage usage | Low | Medium |
| TD-10 | **Service types partially hardcoded** — Records.js has fallback arrays | Low | Low |
| TD-11 | **`description` and `service_type` columns are legacy** — superseded by category-specific columns | Low | Low |
| TD-12 | **Leads table lacks status field** — no pipeline stage tracking | Medium | Low |

### Security Issues

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| TD-13 | **RLS not confirmed on all tables** — any Supabase anon key holder can read/write all data | Critical | Medium |
| TD-14 | **Supabase anon key visible in browser** — standard for anon key but RLS must enforce limits | Low (by design) | N/A |

---

## 11. Roadmap & Prioritization

### Phase 1 — Security & Stability (Immediate)

**Goal:** Make the app safe to deploy to production staff.

| Item | Description | Effort |
|------|-------------|--------|
| Authentication | PIN or Supabase Auth login gate before any module | Medium |
| RLS Policies | Enable and verify Row Level Security on all DB tables | Medium |
| Fix transformSaleFromDB | Apply transform consistently in all service layer methods | Low |
| Replace alert() | Add Sonner toast library, replace all alert()/confirm() calls | Medium |
| Loading states | Add consistent loading spinners to all async operations | Low |

**Acceptance Criteria for Phase 1:**
- [ ] Unauthenticated users cannot access any page
- [ ] Supabase data is not readable via public API without auth token
- [ ] No `alert()` calls remain in codebase
- [ ] All async operations show a loading indicator

---

### Phase 2 — Routing & Component Architecture

**Goal:** Make the app maintainable and navigable.

| Item | Description | Effort |
|------|-------------|--------|
| React Router v6 | Replace custom state routing with proper URL-based routing | Medium |
| Admin decomposition | Split Admin.js into: AdminDashboard, EmployeePanel, ExpensesPanel, NotesPanel, ChartSection | High |
| Form validation | Add Zod schemas + React Hook Form for Records.js and Autodetailing.js | Medium |
| Pagination | Add pagination to sales history, leads list, employee list | Medium |

**Acceptance Criteria for Phase 2:**
- [ ] Browser back/forward works on all pages
- [ ] No component file exceeds 500 lines
- [ ] Form submission shows field-level validation errors
- [ ] Sales history loads max 25 records per page

---

### Phase 3 — Feature Completeness

**Goal:** Fill gaps that prevent the app from replacing paper records entirely.

| Item | Description | Effort |
|------|-------------|--------|
| Lead status pipeline | Add status field: New → Contacted → Quoted → Converted / Lost | Medium |
| Lead follow-up date | Schedule follow-up date per lead, show overdue leads | Medium |
| Expense categories | Categorize expenses for P&L analysis | Low |
| Revenue vs Expenses view | Show profit/loss in admin dashboard | Medium |
| Custom date range | Allow arbitrary from/to date selection for reports | Medium |
| Shift tracking | Start/End shift, link sales to shift_id, shift summary | High |

**Acceptance Criteria for Phase 3:**
- [ ] Each lead has a status (New/Contacted/Quoted/Converted/Lost)
- [ ] Admin dashboard shows net profit (revenue − expenses) for selected period
- [ ] Users can filter analytics by any custom date range
- [ ] Shift start/end can be recorded and sales attributed to shift

---

### Phase 4 — PWA & Offline

**Goal:** Make the app reliably usable on mobile, including during internet outages.

| Item | Description | Effort |
|------|-------------|--------|
| PWA manifest | Configure manifest.json with icons, name, theme colors | Low |
| Service Worker | Enable CRA service worker (or Workbox) for asset caching | Medium |
| Offline queue | Queue failed sale writes, sync on reconnect with conflict resolution | High |
| Install prompt | Show "Add to Home Screen" banner for first-time mobile users | Low |

**Acceptance Criteria for Phase 4:**
- [ ] App installs to Android/iOS home screen
- [ ] Previously loaded UI works offline (no blank screen)
- [ ] Sales recorded offline sync to Supabase within 30 seconds of reconnection
- [ ] Offline indicator visible in UI header

---

### Phase 5 — Advanced Analytics & Scale

**Goal:** Provide actionable business insights to drive growth.

| Item | Description | Effort |
|------|-------------|--------|
| Trend line charts | Week-over-week, month-over-month revenue trends | Medium |
| Service type popularity | Heatmap or ranking of most-requested services | Medium |
| PDF report export | Daily/weekly/monthly report as downloadable PDF | High |
| Multi-branch support | Allow one account to manage multiple locations | High |
| Pricing templates | Pre-set price per service type to reduce manual entry errors | Medium |
| Real SMS receipts | Integrate Africa's Talking or similar SMS API | High |

---

## 12. Success Metrics

### Adoption Metrics

| Metric | Target (3 months post-launch) |
|--------|-------------------------------|
| Daily active sessions | > 5 sessions/day per business |
| Sales recorded per day | ≥ 90% of actual transactions (vs paper baseline) |
| Employee usage | All employees record at least 1 sale/day |
| App installed as PWA | > 50% of staff devices |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Zero data loss incidents | 100% (sales never lost due to app error) |
| Duplicate sale records | < 0.1% of all transactions |
| Page load time on 3G | < 3 seconds |
| Crash rate | < 0.5% of sessions |

### Business Impact Metrics

| Metric | Target |
|--------|--------|
| Revenue tracking accuracy | ≥ 98% match with cash drawer end-of-day |
| Time to record a sale | < 60 seconds from employee selection to save |
| Carpet return disputes | Reduced to 0 (all carpets tracked) |
| Lead conversion tracking | > 70% of leads have a recorded outcome |

---

## 13. Constraints & Assumptions

### Market Constraints

1. **M-Pesa is primary payment** — M-Pesa reference tracking is a first-class feature
2. **Low-bandwidth environment** — App must be lean; no large bundle sizes or images
3. **Budget Android devices** — Must perform on 2GB RAM Android phones, Chrome
4. **Swahili/English bilingual** — Future consideration; currently English only
5. **Single business initially** — No multi-tenant requirements in v1

### Technical Constraints

1. **Supabase free tier limits** — 500MB database, 1GB file storage, 2GB bandwidth/month
2. **CRA build toolchain** — Migrating to Vite would require coordination; constrained to react-scripts for now
3. **No CI/CD pipeline** — Deployments are manual (build + upload to Netlify)
4. **No automated testing** — Test infrastructure exists (CRA default) but no tests written

### Assumptions

1. Each business has a single Supabase project (isolated data per business)
2. The business owner manages employee setup and service configuration
3. Internet connectivity is available at least once per working day for sync
4. Staff members will be trained on the app (not zero-training onboarding)
5. Revenue is tracked in Kenyan Shillings (KSh) only

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Category** | The top-level service classification: Vehicle, Motorbike, or Carpet |
| **Service Type** | A specific service within a category (e.g., "Exterior Wash" under Vehicle) |
| **Sale / Transaction** | A single recorded customer service event |
| **Lead** | A prospective customer who has expressed interest in auto-detailing services |
| **Auto-Detailing** | Premium car cleaning services (usually deep clean, polish, restoration) |
| **Carpet Return** | The act of returning a cleaned carpet to its owner after drying/processing |
| **Returned** | Boolean flag on a carpet sale indicating the carpet has been handed back to the customer |
| **M-Pesa** | Safaricom's mobile money transfer service, dominant payment method in Kenya |
| **M-Pesa Ref** | The unique alphanumeric transaction code from an M-Pesa payment |
| **Shift** | A defined working period (e.g., morning 6am–2pm, afternoon 2pm–10pm) |
| **RLS** | Row Level Security — PostgreSQL/Supabase feature restricting data access per authenticated user |
| **PWA** | Progressive Web App — a web app installable on mobile devices |
| **Realtime** | Supabase WebSocket subscription that pushes DB changes live to connected clients |
| **localStorage** | Browser-based storage used as offline fallback when Supabase is unreachable |
| **KSh** | Kenyan Shilling, the currency unit used throughout the app |

---

*This PRD reflects the state of SafishaHub as of 2026-03-11. It should be updated as features are shipped or requirements change.*
