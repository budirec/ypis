# YPIS — Tempeh Production ERP · Agent Guide

> **Read this file in full before writing a single line of code.**  
> It is the single source of truth for conventions, tooling versions, and project layout.

---

## 1  Project Overview

**YPIS** is a production-ready ERP / Inventory / Sales platform built for a tempeh manufacturing company.  
Four core business domains:

| Domain | Responsibility |
|--------|---------------|
| **Auth** | JWT-based authentication & RBAC |
| **Inventory** | Raw-material tracking, stock levels, adjustments |
| **Production** | Batch creation, tempeh recipe management, production runs |
| **Sales** | Orders, invoicing, customer management |

---

## 2  Monorepo Layout

```
ypis/
├── backend/          # NestJS API (Node 20, TypeScript 5)
├── frontend/         # Next.js 16 app (React 19, TypeScript 5)
├── docker-compose.yml
└── AGENTS.md         ← you are here
```

Each sub-project has its own `package.json`; there is **no shared root workspace**.  
**All NPM commands must be run inside their respective Docker containers.**
Example: `docker compose exec tempeh_backend npm install`

---

## 3  Tech Stack & Exact Versions

### Backend (`backend/`)
| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20 (Alpine in Docker) |
| Framework | NestJS | ^11 |
| Language | TypeScript | ^5.7 |
| ORM | Prisma (Client v2 API) | ^7 |
| Database | PostgreSQL | 15 |
| Cache / Queue broker | Redis | 7 |
| Queue library | BullMQ | ^5 |
| Redis client | ioredis | ^5 |
| Test runner | Jest + ts-jest | ^30 / ^29 |

### Frontend (`frontend/`)
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | **16.2.2** (App Router) |
| UI runtime | React | **19.2.4** |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | **v4** (PostCSS plugin) |
| Component primitives | Base UI (`@base-ui/react`) | ^1.3 |
| Component library | shadcn/ui | ^4 |
| Data fetching | TanStack Query | ^5 |
| Icons | lucide-react | ^1.7 |

> **⚠️ Version drift warning**  
> Next.js 16, React 19, and Tailwind v4 all have breaking changes relative to common training data.  
> Before using any API from these packages, check `node_modules/<pkg>/dist/docs/` or the changelog.  
> The frontend's own `AGENTS.md` (`frontend/AGENTS.md`) has additional front-end-specific rules — read it too.

---

## 4  Infrastructure (Docker Compose)

Services defined in `docker-compose.yml`:

| Service | Container name | Exposed port |
|---------|---------------|-------------|
| PostgreSQL 15 | `tempeh_postgres` | internal only |
| Redis 7 | `tempeh_redis` | internal only |
| NestJS backend | `tempeh_backend` | internal only |
| Next.js frontend | `tempeh_frontend` | **3000 → 3000** |

All services share the `tempeh_net` bridge network.  
Volumes `postgres_data` and `redis_data` persist across restarts.

Start the full stack:
```bash
docker compose up -d
```

---

## 5  Backend Conventions

### Module structure
Follow NestJS **feature-module** pattern.  
Every domain gets its own module folder under `backend/src/<domain>/`:
```
src/<domain>/
├── <domain>.module.ts
├── <domain>.controller.ts
├── <domain>.service.ts
├── dto/
├── entities/          # Prisma-backed domain types
└── <domain>.service.spec.ts
```

### Prisma
- Schema lives at `backend/prisma/schema.prisma`.
- Generated client output: `backend/generated/prisma/` (do **not** commit this directory).
- Use `prisma.config.ts` at the root of `backend/` for Prisma CLI configuration.
- After any schema change: `docker compose exec tempeh_backend npx prisma migrate dev --name <description>`

### Environment variables
Defined in `backend/.env` (gitignored).  
Required keys at minimum:
- `DATABASE_URL` — Prisma connection string (PostgreSQL or Prisma Postgres tunnel)

Never hardcode credentials. Add new variables to `.env` **and** document them here.

### Queue workers (BullMQ)
- Register queue producers via `@nestjs/bullmq` in the relevant feature module.
- Processor classes use the `@Processor('<queue-name>')` decorator.
- Redis connection is managed by a shared `BullMQ` module — do **not** create ad-hoc `ioredis` connections inside feature code.

### Linting & formatting
```bash
docker compose exec tempeh_backend npm run lint    # ESLint --fix
docker compose exec tempeh_backend npm run format  # Prettier
```
Config: `eslint.config.mjs`, `.prettierrc`.

---

## 6  Frontend Conventions

### Next.js App Router
- All pages/layouts live under `frontend/src/app/`.
- Components shared across routes go in `frontend/src/components/`.
- Utility helpers and client-side lib code go in `frontend/src/lib/`.

### Tailwind CSS v4
- Configuration is via `postcss.config.mjs` (PostCSS plugin), **not** `tailwind.config.js`.
- Utility classes and design tokens are defined with the new `@theme` / CSS-first API.
- Do **not** use `tailwind.config.js` or `@layer` directives from Tailwind v3.

### Component authoring
- Use **shadcn/ui** components (installed via `docker compose exec tempeh_frontend npx shadcn add <component>`).
- Primitive accessibility layer: **Base UI** (`@base-ui/react`).
- Class merging: always use `cn()` from `src/lib/utils.ts` (combines `clsx` + `tailwind-merge`).
- Variants: use `class-variance-authority` (`cva`).

### Data fetching
- Server components: use `fetch` directly with Next.js caching semantics.
- Client components: wrap mutations/queries in TanStack Query (`useQuery`, `useMutation`).
- Do **not** use SWR or other data-fetching libraries.

### Linting
```bash
docker compose exec tempeh_frontend npm run lint   # ESLint (eslint-config-next)
```

---

## 7  Running Commands in Docker

All development tasks must happen within the running containers.
Ensure the stack is up with `docker compose up -d` before running commands.

### Backend Operations
```bash
docker compose exec tempeh_backend npm install
docker compose exec tempeh_backend npm run build
```

### Frontend Operations
```bash
docker compose exec tempeh_frontend npm install
docker compose exec tempeh_frontend npx shadcn add <component>
```

---

## 8  Testing

### Backend unit tests
```bash
docker compose exec tempeh_backend npm run test           # Jest
docker compose exec tempeh_backend npm run test:cov       # with coverage
```
Test files co-located with source: `*.spec.ts` inside `src/`.

### Backend e2e tests
```bash
docker compose exec tempeh_backend npm run test:e2e       # uses test/jest-e2e.json
```

### Frontend
No test runner is configured yet. Add one before writing tests.

---

## 9  Code-Generation Rules for Agents

1. **Always scope your work to one domain at a time.** Don't create cross-domain imports unless going through the proper NestJS dependency injection boundary.
2. **Never bypass the ORM.** All DB access goes through Prisma — no raw SQL strings unless Prisma's raw query API is explicitly needed.
3. **DTOs are mandatory.** Every controller route must use `class-validator`-decorated DTOs (`CreateXxxDto`, `UpdateXxxDto`).
4. **No environment-variable magic.** Read config via `@nestjs/config` `ConfigService`, never `process.env` directly in service code.
5. **Queue jobs are typed.** Define a TypeScript interface for every BullMQ job data payload.
6. **Frontend API calls use a typed client.** Define return types for every fetch/query — `any` is forbidden.
7. **Tailwind classes only.** Do not write `style={{}}` inline styles — use Tailwind utilities or CSS Modules for edge cases.
8. **Keep components small.** A component file > 200 lines is a signal to extract sub-components.
9. **Don't modify `docker-compose.yml`** without updating the port/network table in §4 of this file.
10. **Run lint before declaring work done.** A PR with lint errors will be rejected.
11. **Docker Exec Only.** All script executions (`npm`, `npx`, `nest`, `prisma`) must happen through `docker compose exec tempeh_<service>`. Never run them on the host machine directly.
12. **Keep AGENTS.md Updated.** Always update this `AGENTS.md` file whenever structural deviations, new architectural patterns, new core dependencies, or new rule requirements emerge as the project evolves.
