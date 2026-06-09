# syntax=docker/dockerfile:1

# ---- deps: install dependencies and generate the Prisma client ----
FROM node:20-alpine AS deps
WORKDIR /app

# bcrypt is a native addon with no musl prebuilt, so it compiles from source
# (needs python3/make/g++). openssl is required by the Prisma engine on Alpine.
RUN apk add --no-cache python3 make g++ openssl

# Install ALL deps (incl. dev) so the Prisma CLI is available to generate.
# node:20-alpine ships npm 10, but the committed package-lock.json is authored
# by npm 11 (lockfileVersion 3); npm 10 resolves optional deps differently and
# rejects `npm ci` as out-of-sync. Pin npm to the lock's major to keep them in
# step. Bump this if you upgrade npm locally.
COPY package*.json ./
RUN npm install -g npm@11 && npm ci

# Generate the Prisma client, then strip dev dependencies. Pruning leaves
# @prisma/client (a runtime dep) and the generated client output untouched.
COPY prisma ./prisma
RUN npx prisma generate \
  && npm prune --omit=dev

# ---- production: minimal runtime image ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Runtime shared lib for the Prisma query engine (no build tools needed here —
# bcrypt's compiled binary is copied in via node_modules).
RUN apk add --no-cache openssl

# Port the app listens on. Settable at build time; the app reads process.env.PORT
# at runtime, so the platform can also inject/override it.
ARG PORT=3000
ENV PORT=$PORT

# Production-only node_modules (with the generated Prisma client) from deps.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Application source. The .dockerignore keeps out node_modules, tests, and any
# .env file — config and secrets come from the platform at runtime.
COPY --chown=node:node . .

# Run as the unprivileged user that the official Node image already provides.
USER node

# Documents the listening port (the app binds process.env.PORT at runtime).
EXPOSE ${PORT}

# Liveness probe against the unauthenticated /health route. Uses Node's built-in
# fetch so no extra tooling is needed in the image.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# No --env-file here (unlike the npm `start` script) — env vars come from the
# platform at runtime.
CMD ["node", "server.js"]
