# AuthPlatform — Multi-Role Authentication & Profile Management

**🚀 Live Demo**: [https://auth-platform-three.vercel.app/](https://auth-platform-three.vercel.app/)

A production-grade, multi-role authentication and profile management platform built with **Next.js 16**, **Prisma 7**, **PostgreSQL**, and modern SaaS-grade UI. Supports 5 distinct roles (Admin, Vendor, Client, Support Staff, Broker) each with dedicated dashboards, protected routes, and role-specific features.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App Router                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Public   │  │   Auth   │  │ Dashboard│  │   API    │    │
│  │  Routes   │  │  Routes  │  │  Routes  │  │  Routes  │    │
│  │  (Landing)│  │(/login,  │  │(/admin,  │  │(/api/    │    │
│  │           │  │/register)│  │/vendor,  │  │auth,     │    │
│  │           │  │          │  │/client,  │  │admin,    │    │
│  │           │  │          │  │/support, │  │profile)  │    │
│  │           │  │          │  │/broker)  │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Proxy (Next.js 16)                  │   │
│  │  • Route Guard (redirect unauthenticated to /login)  │   │
│  │  • Role-Based Access (prevent cross-role access)     │   │
│  │  • Auth Redirect (redirect authenticated away from   │   │
│  │    auth pages to their role dashboard)               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Layout Pattern                     │   │
│  │  Layout (Server Component)                            │   │
│  │    → Read HttpOnly cookie (access_token)              │   │
│  │    → Verify JWT via jose                              │   │
│  │    → Check role matches layout scope                  │   │
│  │    → Construct AuthSession                            │   │
│  │    → Pass to DashboardLayoutClient                    │   │
│  │                                                       │   │
│  │  DashboardLayoutClient (Client Component)             │   │
│  │    → Verify initialSession                            │   │
│  │    → Check role access                                │   │
│  │    → Refresh session from /api/auth/session           │   │
│  │    → Render DashboardShell with sidebar + navbar      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Authentication Flow                      │   │
│  │  Register → Login → JWT (access + refresh tokens)    │   │
│  │  → HttpOnly Secure Cookies → Session in DB           │   │
│  │  → Proxy guard → Layout guard → Page render         │   │
│  │                                                       │   │
│  │  Forgot Password → Verify Current Password → Token   │   │
│  │  Email Verification → Token-based verification       │   │
│  │  Session Management → List/Revoke sessions           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Caching Architecture                     │   │
│  │  Server-side: In-memory cache with TTL (ServerCache) │   │
│  │    → getOrSet() pattern for API routes               │   │
│  │    → invalidate() on data mutations                  │   │
│  │    → Per-key TTL (30s–5min based on data stability)  │   │
│  │                                                       │   │
│  │  Client-side: Zustand data-store with stale-while-   │   │
│  │    revalidate pattern                                 │   │
│  │    → useCachedFetch hook for all data pages          │   │
│  │    → Fresh data shown instantly, background refresh  │   │
│  │    → refetch() for manual cache invalidation         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                     │
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ users│  │ roles│  │prof- │  │sess- │  │activ-│        │
│  │      │  │      │  │iles  │  │ions  │  │ity_  │        │
│  │      │  │      │  │      │  │      │  │logs  │        │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘        │
│  ┌──────┐                                                   │
│  │pass- │                                                   │
│  │word_ │                                                   │
│  │resets│                                                   │
│  └──────┘                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Features

### Authentication
- ✅ Custom JWT authentication (no third-party providers)
- ✅ Register with email, full name, password
- ✅ Login with email/password + "Remember me" option
- ✅ Forgot password → current password verification + reset token (1-hour expiry)
- ✅ Reset password with token verification
- ✅ Email verification flow
- ✅ Logout with session cleanup
- ✅ Access token (7-day expiry) + Refresh token (30-day expiry)
- ✅ HttpOnly, Secure, SameSite=Lax cookies
- ✅ bcryptjs password hashing (12 salt rounds)
- ✅ JWT signing/verification with `jose` (HS256 algorithm)

### Role-Based Access Control
- ✅ 5 roles: Admin, Vendor, Client, Support Staff, Broker
- ✅ Proxy route guard (redirects unauthenticated users)
- ✅ Proxy role guard (prevents cross-role dashboard access)
- ✅ Server-side layout guards (each role layout verifies JWT + role)
- ✅ Client-side session refresh on dashboard entry
- ✅ Role-specific sidebar navigation

### User Management (Admin)
- ✅ View all users with search and filter (All/Active/Inactive)
- ✅ Toggle user active/inactive status with one click
- ✅ Self-deactivation protection (admin cannot deactivate own account)
- ✅ Server cache invalidation on status change
- ✅ Client cache refresh after toggle

### Dashboards & Pages
- ✅ **Admin**: Dashboard, Users, Roles, Activity Logs, Profile, Security, Sessions
- ✅ **Vendor**: Dashboard, Analytics, Profile, Security, Sessions
- ✅ **Client**: Dashboard, Activity, Profile, Security, Sessions
- ✅ **Support Staff**: Dashboard, Tickets, User Lookup, Activity Center, Profile, Security, Sessions
- ✅ **Broker**: Dashboard, Relationships, Analytics, Profile, Security, Sessions

### Profile Management (Shared Components)
- ✅ Profile page with edit form (Basic Info, Address, Professional)
- ✅ Profile image upload via **Cloudinary** (face-aware cropping, server-side upload)
- ✅ Profile image deletion (Cloudinary cleanup + DB field clear)
- ✅ Security page with change password form + strength indicators
- ✅ Sessions page with device detection + session revocation

### Caching Infrastructure
- ✅ **Server-side**: In-memory `ServerCache` with TTL per data type
  - Dashboard stats: 1 min, User list: 30s, Roles: 5 min, Activity logs: 30s
  - `getOrSet()` pattern avoids redundant DB queries
  - `invalidate()` / `invalidatePattern()` on mutations
- ✅ **Client-side**: Zustand `DataStore` with stale-while-revalidate
  - `useCachedFetch` hook for all data-fetching pages
  - Instant render from cache, background revalidation
  - `refetch()` for manual invalidation after mutations
  - Per-key TTL matching server-side cache durations

### UI/UX
- ✅ Shadcn/ui-style custom components (Card, Button, Input, Badge, etc.)
- ✅ Framer Motion animations (fadeInUp, staggerContainer, page transitions)
- ✅ **Animated theme toggle** — smooth icon rotation/scale transition between Sun ↔ Moon
- ✅ **Smooth theme transitions** — background, text, borders, shadows all animate on dark/light switch
- ✅ Dark/Light/System mode with next-themes
- ✅ Responsive design (mobile sidebar overlay, desktop fixed sidebar)
- ✅ Loading skeletons for all data-fetching pages
- ✅ Tailwind CSS v4 with CSS variable-based theme system
- ✅ Clickable "AP" logo on login/register pages → navigates to home page

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 7.8.0 |
| Auth | jose (JWT) | 6.2.3 |
| Password | bcryptjs | 3.0.3 |
| Validation | Zod | 4.4.3 |
| Forms | React Hook Form + @hookform/resolvers | 7.75.0 |
| State | Zustand | 5.0.13 |
| Animation | Framer Motion | 12.38.0 |
| Icons | Lucide React | 1.14.0 |
| Styling | Tailwind CSS v4 | 4.x |
| Themes | next-themes | 0.4.6 |
| Notifications | Sonner | 2.0.7 |
| Image Upload | Cloudinary | 2.x |

---

## 📁 Project Structure

```
auth-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (6 models)
│   └── seed.ts                # Seed script (5 roles + admin user)
├── docs/
│   ├── er-diagram.md          # Crow's Foot ER diagram (Mermaid)
│   └ chen-diagram.md          # Chen notation diagram (Mermaid)
├── src/
│   ├── proxy.ts               # Route guards + role-based access (Next.js 16)
│   ├── app/
│   │   ├── layout.tsx          # Root layout (ThemeProvider, theme transitions)
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Tailwind v4 CSS theme variables + transition rules
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── layout.tsx      # Auth layout (centered card)
│   │   │   ├── login/          # Login page (AP logo → home)
│   │   │   ├── register/       # Register page (AP logo → home)
│   │   │   ├── forgot-password/ # Forgot password page
│   │   │   ├── reset-password/  # Reset password page
│   │   │   └── verify-email/    # Email verification page
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   ├── admin/          # Admin role pages
│   │   │   │   ├── layout.tsx  # Admin server layout (JWT + role check)
│   │   │   │   ├── dashboard/  # Admin dashboard
│   │   │   │   ├── users/      # User management (active/inactive toggle)
│   │   │   │   ├── roles/      # Role management
│   │   │   │   ├── activity-logs/ # Activity log viewer
│   │   │   │   ├── profile/    # Profile (shared component)
│   │   │   │   ├── security/   # Security (shared component)
│   │   │   │   └── sessions/   # Sessions (shared component)
│   │   │   ├── vendor/         # Vendor role pages
│   │   │   ├── client/         # Client role pages
│   │   │   ├── support/        # Support Staff role pages
│   │   │   └── broker/         # Broker role pages
│   │   └── api/                # API routes
│   │       ├── auth/           # Auth APIs (login, register, etc.)
│   │       ├── admin/          # Admin APIs (dashboard, users, roles, activity-logs)
│   │       │   └── users/      # GET list + PATCH toggle active/inactive
│   │       ├── vendor/         # Vendor APIs (dashboard)
│   │       ├── client/         # Client APIs (dashboard)
│   │       ├── support/        # Support APIs (dashboard, tickets, user-lookup)
│   │       ├── broker/         # Broker APIs (dashboard, relationships)
│   │       ├── profile/        # Shared profile API (GET/PUT)
│   │       │   └── image/      # Profile image API (POST upload Cloudinary, DELETE remove)
│   │       ├── security/       # Shared security API (change-password)
│   │       ├── sessions/       # Shared sessions API
│   │       └── activity/       # Shared activity API
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui-style components
│   │   │   ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│   │   │   ├── checkbox.tsx, input.tsx, label.tsx, select.tsx
│   │   │   ├── skeleton.tsx, textarea.tsx, theme-toggle.tsx (animated)
│   │   │   └── page-transition.tsx
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── dashboard-shell.tsx   # Shell (sidebar + navbar + content)
│   │   │   ├── dashboard-layout-client.tsx # Client wrapper
│   │   │   ├── sidebar.tsx           # Responsive sidebar
│   │   │   ├── navbar.tsx            # Top navbar
│   │   │   ├── breadcrumbs.tsx       # Breadcrumb navigation
│   │   │   ├── profile-page.tsx      # Shared profile component
│   │   │   ├── security-page.tsx     # Shared security component
│   │   │   └── sessions-page.tsx     # Shared sessions component
│   │   └── providers/
│   │       └── theme-provider.tsx     # next-themes provider
│   ├── config/
│   │   └── constants.ts        # App constants, sidebar items, route maps
│   ├── hooks/
│   │   └── use-cached-fetch.ts # Cached data fetching hook (stale-while-revalidate)
│   ├── lib/
│   │   ├── auth.ts             # JWT auth (create/verify/delete/refresh session)
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── cache.ts            # Server-side in-memory cache with TTL
│   │   ├── cloudinary.ts       # Cloudinary upload/delete utilities
│   │   ├── prefetch.ts         # Route prefetching helpers
│   │   ├── utils.ts            # Utility functions (cn, formatDate, etc.)
│   │   └── validations.ts      # Zod validation schemas
│   ├── services/
│   │   └── auth.ts             # Auth service (login, register, forgot/reset, verify)
│   ├── store/
│   │   ├── auth-store.ts       # Zustand auth state store
│   │   └── data-store.ts       # Zustand client-side data cache store
│   ├── actions/
│   │   └── auth.ts             # Server actions (formSubmit wrapper)
│   └── types/
│       └── index.ts            # TypeScript interfaces & types
├── docker-compose.yml          # PostgreSQL + Next.js containers
├── Dockerfile                  # Multi-stage production build
├── .env.example                # Environment variable template
├── .dockerignore               # Docker build exclusions
├── next.config.ts              # Next.js config (standalone output)
├── package.json                # Dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ 
- **PostgreSQL** 16+ (or use Docker)
- **npm** 10+
- **Cloudinary account** (for profile image uploads — free tier works)

### 1. Clone & Install

```bash
cd auth-platform
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` — your PostgreSQL connection string
- `AUTH_SECRET` — a strong random secret (generate with `openssl rand -base64 32`)
- `CLOUDINARY_CLOUD_NAME` — your Cloudinary cloud name
- `CLOUDINARY_API_KEY` — your Cloudinary API key
- `CLOUDINARY_API_SECRET` — your Cloudinary API secret

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Seed default roles and admin user
npm run db:seed
```

### 4. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Default Admin Account

After seeding, the following admin account is created:

| Field | Value |
|---|---|
| Email | `admin@authplatform.com` |
| Password | `Admin@123456` |
| Role | Admin |

> ⚠️ **Change this password immediately after first login in production!**

---

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Start PostgreSQL + Next.js
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Production Build Only

```bash
docker build -t authplatform .
docker run -p 3000:3000 authplatform
```

The Docker setup:
- Uses multi-stage build (deps → build → production)
- Runs `prisma migrate deploy` + `prisma db seed` on startup
- Outputs standalone Next.js server for minimal image size
- PostgreSQL data persisted in Docker volume

---

## 🔐 Security Architecture

### JWT Token Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Lifecycle                           │
│                                                              │
│  Login/Register                                              │
│    → Create AuthSession payload                              │
│    → Sign Access Token (HS256, 7-day expiry)                │
│    → Sign Refresh Token (HS256, 30-day expiry)              │
│    → Store session in DB (Session table)                     │
│    → Set HttpOnly cookies: access_token, refresh_token       │
│                                                              │
│  Every Request                                               │
│    → Proxy reads access_token cookie                        │
│    → Verify JWT signature + expiry                           │
│    → Extract AuthSession payload                             │
│    → Check role-based route access                           │
│                                                              │
│  Dashboard Layout                                            │
│    → Server component reads access_token cookie              │
│    → Verify JWT + check role matches layout                  │
│    → Client component refreshes session from API             │
│                                                              │
│  Session Refresh                                             │
│    → Read refresh_token cookie                               │
│    → Verify refresh JWT                                      │
│    → Delete old session from DB                              │
│    → Create new session + new tokens                         │
│    → Set new cookies                                         │
│                                                              │
│  Logout                                                      │
│    → Delete session from DB                                  │
│    → Delete expired sessions for user                        │
│    → Clear both cookies                                      │
└─────────────────────────────────────────────────────────────┘
```

### Security Measures

| Measure | Implementation |
|---|---|
| Password Hashing | bcryptjs with 12 salt rounds |
| JWT Signing | HS256 with server-only secret |
| Cookie Security | HttpOnly, Secure (prod), SameSite=Lax |
| Token Expiry | Access: 7 days, Refresh: 30 days |
| Session Storage | Database-backed (Prisma Session model) |
| Route Protection | Proxy + Server Layout double guard |
| Role Isolation | Each role layout checks `payload.roleName` |
| Input Validation | Zod v4 schemas on all API inputs |
| CSRF Protection | SameSite=Lax cookies + POST-only mutations |
| Password Reset | Time-limited tokens (1-hour expiry) |
| Image Upload | Server-side Cloudinary upload (no client-side secrets) |
| Self-Deactivation Guard | Admin cannot deactivate own account |

---

## 📊 Database Schema

See [ER Diagram](docs/er-diagram.md) for Crow's Foot notation and [Chen Diagram](docs/chen-diagram.md) for Chen notation.

### Models

| Model | Purpose | Key Fields |
|---|---|---|
| **User** | Core user entity | id, fullName, email, passwordHash, roleId, isVerified, isActive |
| **Role** | Role definition | id, roleName (Admin/Vendor/Client/Support Staff/Broker) |
| **Profile** | Extended user info | id, userId, phone, address, companyName, bio, profileImage (Cloudinary URL), preferences |
| **Session** | Active sessions | id, userId, accessToken, refreshToken, expiresAt, ipAddress, userAgent |
| **PasswordReset** | Reset tokens | id, userId, token, expiresAt |
| **ActivityLog** | Audit trail | id, userId, action, module, ipAddress, createdAt |

---

## 🎨 UI Theme System

The platform uses Tailwind CSS v4 with CSS variable-based theming and **smooth animated transitions** between dark and light modes:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more HSL variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... dark mode overrides */
}
```

### Theme Transition Animation

When switching between dark and light mode, all themed properties animate smoothly:

- **Background color** — 0.3s ease transition
- **Text color** — 0.3s ease transition
- **Border color** — 0.3s ease transition
- **Box shadow** — 0.3s ease transition
- **Theme toggle icon** — Framer Motion scale + rotation animation (Sun ↔ Moon)

The `ThemeProvider` in `layout.tsx` does NOT use `disableTransitionOnChange`, allowing CSS transitions to play on theme switch. Form inputs (`input`, `textarea`, `select`) are excluded from transitions to prevent focus/typing lag.

---

## 📝 API Routes

### Auth APIs (`/api/auth/`)

| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Login with email/password |
| `/api/auth/register` | POST | Register new user |
| `/api/auth/logout` | POST | Logout + session cleanup |
| `/api/auth/forgot-password` | POST | Verify current password & get reset token |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/verify-email` | POST | Verify email with token |
| `/api/auth/session` | GET | Get current session info |

### Admin APIs (`/api/admin/`)

| Route | Method | Description |
|---|---|---|
| `/api/admin/dashboard` | GET | Admin dashboard stats |
| `/api/admin/users` | GET | List all users with search/filter |
| `/api/admin/users` | PATCH | Toggle user active/inactive status |
| `/api/admin/roles` | GET | List all roles with user counts |
| `/api/admin/activity-logs` | GET | Activity logs with search/filter/pagination |

### Role Dashboard APIs

| Route | Method | Description |
|---|---|---|
| `/api/vendor/dashboard` | GET | Vendor dashboard stats |
| `/api/client/dashboard` | GET | Client dashboard stats |
| `/api/support/dashboard` | GET | Support dashboard stats |
| `/api/broker/dashboard` | GET | Broker dashboard stats |

### Role Feature APIs

| Route | Method | Description |
|---|---|---|
| `/api/support/tickets` | GET | Support tickets with search/filter |
| `/api/support/user-lookup` | GET | User search for support staff |
| `/api/broker/relationships` | GET | Broker client relationships |
| `/api/activity` | GET | User's own activity logs |

### Shared APIs

| Route | Method | Description |
|---|---|---|
| `/api/profile` | GET/PUT | View/update user profile |
| `/api/profile/image` | POST | Upload profile image (Cloudinary) |
| `/api/profile/image` | DELETE | Remove profile image (Cloudinary cleanup) |
| `/api/security/change-password` | PUT | Change password |
| `/api/sessions` | GET/DELETE | List/revoke sessions |

---

## ⚡ Caching Architecture

### Server-Side Cache (`src/lib/cache.ts`)

An in-memory `ServerCache` class with TTL support, used by all API routes:

```typescript
// Example: Admin dashboard stats
const stats = await serverCache.getOrSet(dashboardCacheKey('admin'), async () => {
  return computeDashboardStats();
}, CACHE_TTL.DASHBOARD_STATS); // 1 minute TTL
```

| Cache Key | TTL | Purpose |
|---|---|---|
| `dashboard:<role>` | 60s | Dashboard statistics per role |
| `admin:users` | 30s | User list (invalidated on active/inactive toggle) |
| `admin:roles` | 5min | Role list (rarely changes) |
| `admin:activity` | 30s | Admin activity logs |
| `activity:<userId>` | 30s | Per-user activity logs |
| `profile:<userId>` | 60s | User profile data |
| `sessions:<userId>` | 15s | Active sessions (can be revoked) |

**Invalidation**: `serverCache.invalidate(key)` is called after any mutation (e.g., toggling user status invalidates `admin:users`).

### Client-Side Cache (`src/store/data-store.ts` + `src/hooks/use-cached-fetch.ts`)

A Zustand store implementing **stale-while-revalidate** pattern:

```typescript
// Example: Admin users page
const { data, loading, refetch } = useCachedFetch<AdminUsersData>(
  usersKey(),
  '/api/admin/users',
  { ttl: CLIENT_TTL.USER_LIST }
);
```

- **First render**: Fetches from API, stores in Zustand with TTL
- **Subsequent renders**: Returns cached data instantly, revalidates in background if stale
- **After mutations**: Call `refetch()` to force fresh data from server

---

## 🖼️ Cloudinary Integration

Profile image uploads use **Cloudinary** for cloud-based image storage and optimization:

- **Upload**: Server-side upload via `cloudinary` npm package (no API secrets exposed to client)
  - Face-aware cropping (`gravity: "face"`) for profile images
  - 200×200 thumbnail transformation
  - Stored in `profile_images/<userId>` folder
- **Delete**: Server-side deletion via `destroy()` API, removes from Cloudinary and clears DB field
- **Storage**: Cloudinary URL stored in `Profile.profileImage` field (replaces base64 encoding)
- **Environment**: Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env`

---

## 🧪 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check

npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create & apply migrations
npm run db:push      # Push schema without migration files
npm run db:seed      # Seed database with roles + admin
npm run db:studio    # Open Prisma Studio (visual DB editor)
npm run db:reset     # Reset database (destructive!)
```

---

## 🔄 Extending the Platform

### Adding a New Role

1. Add role name to `RoleName` type in [`src/types/index.ts`](src/types/index.ts)
2. Add role to seed script in [`prisma/seed.ts`](prisma/seed.ts)
3. Add sidebar items in [`src/config/constants.ts`](src/config/constants.ts)
4. Add `ROLE_DASHBOARD_MAP` and `ROLE_ROUTE_PREFIX` entries
5. Create layout in `src/app/(dashboard)/<role>/layout.tsx`
6. Create dashboard pages under `src/app/(dashboard)/<role>/`
7. Create API routes under `src/app/api/<role>/`
8. Add cache key builder and TTL constant in [`src/lib/cache.ts`](src/lib/cache.ts)
9. Add client cache key and TTL constant in [`src/store/data-store.ts`](src/store/data-store.ts)
10. Run `npm run db:migrate` and `npm run db:seed`

### Adding Domain-Specific Models

The current schema covers auth, profiles, sessions, and activity logs. To add domain models (Products, Orders, Tickets, Deals):

1. Add models to [`prisma/schema.prisma`](prisma/schema.prisma)
2. Run `npm run db:migrate` to create the migration
3. Add cache key builder and TTL in [`src/lib/cache.ts`](src/lib/cache.ts)
4. Update the role-specific dashboard API routes to query new models (use `serverCache.getOrSet()`)
5. Update the role-specific dashboard pages to display new data (use `useCachedFetch`)

---

## ⚠️ Production Checklist

- [ ] Change `AUTH_SECRET` to a strong random value
- [ ] Change default admin password after first login
- [ ] Set `NODE_ENV=production`
- [ ] Enable `secure: true` on cookies (automatic when `NODE_ENV=production`)
- [ ] Configure proper PostgreSQL connection with SSL
- [ ] Configure password reset flow (current password verification + token-based reset)
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting on auth endpoints
- [ ] Review and restrict database permissions
- [ ] Set up HTTPS with proper SSL certificates
- [ ] Configure backup strategy for PostgreSQL
- [ ] Set Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- [ ] Review Cloudinary upload limits and transformation settings

---

## 📄 License

This project is provided as-is for educational and production use. No specific license restrictions apply.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a Pull Request
