# PLPG - Personalized Learning Path Generator

A full-stack application for generating personalized learning roadmaps to help developers transition between tech roles.

## Tech Stack

- **Frontend**: React 18, Vite, TanStack Query, Zustand, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma
- **Auth**: Clerk
- **Database**: PostgreSQL
- **Cache**: Redis
- **Monorepo**: Turborepo with pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Clerk account (for auth)
- Stripe account (for payments - optional)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd plpg
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Database

```bash
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

### 4. Initialize Database

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/v1/health

## Project Structure

```
plpg/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   └── api/                    # Express backend
├── packages/
│   ├── shared/                 # Shared types, utils, validation, Prisma
│   ├── ui/                     # Shared UI components (future)
│   ├── config/                 # Shared ESLint, TypeScript, Tailwind configs
│   └── roadmap-engine/         # DAG logic (future)
├── infrastructure/
│   ├── docker/                 # Docker configurations
│   └── scripts/                # Utility scripts
├── docs/                       # Documentation
└── .github/                    # GitHub workflows
```

## Available Scripts

### Root Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type check all packages |
| `pnpm format` | Format code with Prettier |

### Database Commands

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:studio` | Open Prisma Studio |

## Development Workflow

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
Scopes: web, api, shared, config, ui, engine, infra, deps, release
```

Examples:
- `feat(web): add dashboard page`
- `fix(api): resolve auth middleware issue`
- `chore(deps): update dependencies`

### Pre-commit Hooks

Husky runs the following on each commit:
- ESLint with auto-fix
- Prettier formatting
- Commitlint validation

## Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test -- --watch
```

## API Documentation

API specification is available at `docs/api-spec.yaml` (OpenAPI 3.0).

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk API secret key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

## License

Private - All rights reserved
