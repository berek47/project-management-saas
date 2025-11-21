# Deployment Guide

## Recommended Split

- `client/` -> Vercel
- `server/` -> Render, Railway, Fly.io, or an EC2 instance
- `database` -> managed PostgreSQL
- `auth` -> Supabase Auth

## Client Production Env

Use [client/.env.production.example](client/.env.production.example).

Required values:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

## Server Production Env

Use [server/.env.production.example](server/.env.production.example).

Required values:

```env
NODE_ENV=production
PORT=8000
CLIENT_URL="https://your-domain.com"
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_publishable_key
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

## Supabase Settings

- `Authentication` -> `URL Configuration`
- set `Site URL` to your production frontend domain
- add any required redirect URLs for preview/staging domains

## Client Deploy Notes

- build command: `npm run build`
- output: Next.js application
- make sure `NEXT_PUBLIC_API_BASE_URL` points to the deployed backend

## Server Deploy Notes

- install command: `npm install`
- build command: `npm run build`
- start command: `npm start`
- run migrations before first launch:

```bash
npx prisma generate
npx prisma migrate deploy
```

- optional seed for demo environments only:

```bash
npm run seed
```

## Post-Deploy Checklist

1. Open the deployed frontend.
2. Sign in through Supabase.
3. Confirm `/projects`, `/tasks`, `/users`, `/teams`, and `/search` return data.
4. Create one project and one task.
5. Confirm task status updates persist.
