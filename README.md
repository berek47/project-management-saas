# Workspace OS

Workspace OS is a full-stack project management application with a polished Next.js frontend, an Express API, Supabase authentication, Prisma, and PostgreSQL.

It supports:

- email/password authentication with Supabase
- scoped workspaces per signed-in user
- project create, edit, and delete flows
- task creation and status management
- board, list, table, and timeline project views
- search across tasks, projects, and people
- dark mode and a presentation-ready UI

## Stack

- `client/` - Next.js 14, Redux Toolkit, RTK Query, Tailwind, MUI
- `server/` - Express, Prisma, PostgreSQL
- `Supabase` - authentication and session handling
- `docker-compose.yml` - local Postgres for development

## Local Setup

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Configure environment files

Copy:

- `client/.env.example` -> `client/.env.local`
- `server/.env.example` -> `server/.env`

Local examples:

`client/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

`server/.env`

```env
NODE_ENV=development
PORT=8000
CLIENT_URL="http://localhost:3000"
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_publishable_key
DATABASE_URL="postgresql://bereket:bereket123@localhost:5433/project_management_saas?schema=public"
```

### 4. Prepare the database

```bash
cd server
npx prisma generate
npx prisma migrate deploy
npm run seed
```

### 5. Start the apps

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

App URLs:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`

## Validation

Frontend:

```bash
cd client
npm run lint
npm run build
```

Backend:

```bash
cd server
npm run build
npx tsc --noEmit
```

## Deployment

Production env templates are included:

- [client/.env.production.example](client/.env.production.example)
- [server/.env.production.example](server/.env.production.example)

Detailed deployment notes:

- [DEPLOYMENT.md](DEPLOYMENT.md)

## Notes

- The app can run in preview auth mode if Supabase env values are still placeholders.
- First-time authenticated users are automatically given a starter team, project, and tasks.
- The repository intentionally separates auth, API, and database concerns so local development and deployment stay straightforward.
