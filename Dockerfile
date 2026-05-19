# ---- Build stage ----
FROM node:20.18.0-alpine AS builder

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Build server (generate Prisma client + compile TypeScript)
COPY server ./server
RUN cd server && npx prisma generate && npm run build

# Build Next.js client
COPY client ./client
RUN cd client && npm run build

# ---- Production stage ----
FROM node:20.18.0-alpine

WORKDIR /app

# Server runtime files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma

# Client runtime files
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/package*.json ./client/
COPY --from=builder /app/client/node_modules ./client/node_modules
COPY --from=builder /app/client/next.config.mjs ./client/

EXPOSE 3000 8000

# Start API server and Next.js client
CMD sh -c "node server/dist/src/index.js & cd client && npx next start -p 3000"
