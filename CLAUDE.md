# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Always read this file first before starting any task.**

## Commands

```bash
npm start          # dev server at localhost:3000
npm run build      # production build (check-env.js validates env vars before build)
npm test           # Jest / React Testing Library, watch mode
npm test -- --testPathPattern=MyComponent  # single test file
```

Required env vars (`.env`):
```
REACT_APP_SUPABASE_URL=https://maudknbtsodhkpdzkvwg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon-key>
```

If these are missing or contain `placeholder`, `isSupabaseConfigured()` returns `false` and the entire app falls back to `localStorage`.

## Supabase Project

- **Project**: SafishaHub — `maudknbtsodhkpdzkvwg` — `eu-west-2` — `ACTIVE_HEALTHY`
- **MCP**: `supabase` server configured in `C:/Users/ADMIN/.claude/settings.json` using `@supabase/mcp-server-supabase@latest` with `--project-ref maudknbtsodhkpdzkvwg`. Restart Claude Code after any settings change for MCP to take effect.
- **PAT**: stored in `C:/Users/ADMIN/.claude/settings.json` (never commit — use local only)
- **Management API base**: `https://api.supabase.com/v1/projects/maudknbtsodhkpdzkvwg`

## Database Schema

Six tables — no others. `customers` and `inventory` were dropped (empty, leftover from another project).

### `sales`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `date` | date | |
| `employee` | text | employee name (not FK) |
| `category` | text | `vehicle` / `motorbike` / `carpet` |
| `service_type` | text | legacy top-level label |
| `amount` | numeric | KSh |
| `payment_method` | text | Cash / M-Pesa / Card / Bank Transfer |
| `mpesa_ref` | text | nullable |
| `vehicle_model` | text | nullable |
| `vehicle_service_type` | text | comma-separated |
| `motorbike_service_type` | text | comma-separated |
| `number_of_motorbikes` | integer | nullable |
| `carpet_service_type` | text | comma-separated |
| `size` | text | carpet size (`8x11`, `6x10`, `5x7`, `rug`) |
| `description` | text | legacy, nullable |
| `returned` | boolean | carpet return flag |
| `returned_date` | timestamptz | nullable |
| `carpet_images` | text[] | Supabase Storage paths, default `{}` |
| `created_at` | timestamptz | |
| `timestamp` | timestamptz | legacy duplicate of created_at |

RLS: **OFF** (no auth yet — anon key has full access)

### `leads`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `asset_type` | text | `vehicle` / `motorbike` / `carpet` |
| `customer_name` | text | |
| `customer_phone` | text | |
| `vehicle_model` | text | nullable |
| `registration_number` | text | nullable |
| `motorbike_model` | text | nullable |
| `carpet_type` | text | nullable |
| `carpet_size` | text | nullable (`8x11`, `6x10`, `5x7`, `rug`) |
| `carpet_images` | text[] | Supabase Storage paths, default `{}` |
| `customer_needs` | text | nullable |
| `date` | date | nullable |
| `created_at` | timestamptz | |
| `timestamp` | timestamptz | legacy |

RLS: **OFF**

### `employees`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `phone` | text | |
| `id_number` | text | |
| `role` | text | not used in UI |
| `salary` | numeric | not used in UI |
| `photo_url` | text | nullable; Supabase Storage URL or base64 |
| `created_at` / `updated_at` | timestamptz | |

RLS: **OFF** (policies exist for `authenticated` role but RLS is disabled — they have no effect)

### `expenses`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `description` | text | |
| `amount` | numeric | KSh |
| `category` | text | not used in UI |
| `employee_id` | uuid | nullable FK, not used in UI |
| `receipt_url` | text | nullable, not used in UI |
| `created_at` | timestamptz | |

RLS: **OFF**

### `notes`
| Column | Type |
|---|---|
| `id` | uuid PK |
| `category` | text |
| `content` | text |
| `created_at` | timestamptz |

RLS: **ON** — policy: allow all (no auth required)

### `services`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `category` | text | `vehicle` / `motorbike` / `carpet` |
| `name` | text | service type label |
| `active` | boolean | filter: only active rows fetched |
| `created_at` | timestamptz | |

RLS: **ON** — policy: allow all (no auth required)

## Supabase Storage Buckets

| Bucket | Public | Limit | MIME types | Used by |
|---|---|---|---|---|
| `employee-photos` | yes | 5MB | jpg, png, webp | employeesService.uploadPhoto() |
| `receipts` | no | 10MB | jpg, png, pdf | not wired to UI yet |
| `carpet-images` | no | 5MB | jpg, png, webp | carpetImagesService |

`carpet-images` RLS policies: INSERT / SELECT / DELETE for `anon` role.

## Architecture

### Routing

No routing library. `App.js` renders one component based on `currentPage` state:

```
App.js  (currentPage ∈ 'home' | 'records' | 'autodetailing' | 'admin')
  ├── Home.js              — navigation hub
  ├── Records.js           — daily sales entry + history (~1071 lines)
  ├── Autodetailing.js     — lead capture + lead list (~766 lines)
  ├── Admin.js             — analytics, employees, expenses, notes (~2186 lines)
  └── CarpetImageUploader.js — shared image upload component (~174 lines)
```

Navigation calls `onNavigate(page)` prop — never `window.location`.

### Data layer

`src/services/supabaseService.js` (~754 lines) — single service layer. All DB operations go through it.

Pattern per method:
1. Check `isSupabaseConfigured()` → use `localStorage` fallback if false
2. Call Supabase → handle error → return data

Exported: `salesService`, `employeesService`, `expensesService`, `notesService`, `servicesService`, `carpetImagesService`

Dependencies used internally: `browser-image-compression` (for `carpetImagesService.upload()` only).

**Known inconsistency (TD-2):** `transformSaleFromDB()` (snake_case → camelCase) is applied in `salesService.getAll()` and `salesService.create()` only. `getByDate()` and `getByEmployee()` return raw snake_case. Always apply `transformSaleFromDB()` in new sales service methods.

### DB ↔ UI field mapping (sales)

| DB | React |
|---|---|
| `vehicle_model` | `vehicleModel` |
| `vehicle_service_type` | `vehicleServiceType` |
| `motorbike_service_type` | `motorbikeServiceType` |
| `number_of_motorbikes` | `numberOfMotorbikes` |
| `carpet_service_type` | `carpetServiceType` |
| `carpet_images` | `carpetImages` |
| `payment_method` | `paymentMethod` |
| `service_type` | `serviceType` |
| `created_at` | `createdAt` |

### State management

No global state. Each page component fetches independently on mount. Admin.js has a Supabase Realtime subscription on `sales` (INSERT/UPDATE/DELETE) — the only cross-device live sync.

### Carpet image upload

`CarpetImageUploader` (`src/components/CarpetImageUploader.js`) — shared optional image capture component.

Props: `images` (string[] of storage paths), `onChange(paths)`, `context` (`"sales"` | `"leads"`), `recordId` (string | null), `disabled` (boolean).

- Compresses client-side via `browser-image-compression` npm package (target: 500KB WebP, max 1920px)
- Uploads to `carpet-images` Supabase Storage bucket (private, anon INSERT/SELECT/DELETE policies)
- Stores storage path strings in `carpet_images` column (text[] in DB)
- Signed URLs (1hr TTL) fetched on mount via `carpetImagesService.getSignedUrls()`
- Max 3 images per record; supports camera capture and gallery upload
- `disabled=true` renders read-only thumbnail grid (no upload/remove buttons)
- Used in: carpet form in Records.js (`context="sales"`), carpet add-form + lead history in Autodetailing.js (`context="leads"`)
- When `recordId` is null (new record), uploads under `tmp-{timestamp}` folder — paths are saved with the record regardless

Storage path format: `{sales|leads}/{recordId|tmp-timestamp}/{timestamp}-{random}.webp`

### Service types (dynamic)

Fetched from `services` table at component mount in Records.js and Autodetailing.js. Falls back to hardcoded arrays if Supabase is unreachable.

### Carpet sizes (standardized)

Values: `8x11` / `6x10` / `5x7` / `rug`. Defined in:
- `carpetSizes` array in Records.js (line ~42)
- Hardcoded `<option>` blocks in Autodetailing.js (add form + edit form — two places)

All three must be updated together when sizes change.

### Styling

Tailwind CSS v3 utility classes primary. Inline styles used for dynamic values only. Do not add CSS-in-JS.

## Development Guidelines (Karpathy)

### 1. Think Before Coding
Before implementing: state assumptions explicitly, ask if uncertain. If multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so. If something is unclear, stop and ask.

### 2. Simplicity First
Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No error handling for impossible scenarios. If 200 lines could be 50, rewrite it.

### 3. Surgical Changes
Touch only what you must. Don't improve adjacent code, comments, or formatting. Don't refactor things that aren't broken. Match existing style. If you notice unrelated dead code, mention it — don't delete it. Remove only imports/variables/functions that YOUR changes made unused. Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
Transform tasks into verifiable goals before starting. For multi-step tasks, state a brief plan with verify steps. Loop until verified.

## Known Tech Debt

| ID | Issue |
|---|---|
| TD-1 | No authentication — any device accesses all data |
| TD-2 | `transformSaleFromDB()` not applied in `getByDate()` / `getByEmployee()` |
| TD-3 | `alert()` / `window.confirm()` still used throughout |
| TD-5 | Admin.js is ~2200 lines — monolithic |
| TD-6 | No routing library — browser back/forward broken |
| TD-12 | `leads` table has no `status` field — no pipeline stage tracking |
