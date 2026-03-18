# Pentest Automation Dashboard

Production-ready dashboard for orchestrating penetration testing jobs with JWT authentication, BullMQ queueing, realtime Socket.IO logs, PostgreSQL persistence, and downloadable PDF reports.

## Stack

- Frontend: Next.js App Router, TypeScript, TailwindCSS
- Backend: Express API server
- Realtime: Socket.IO
- Database: PostgreSQL with Prisma ORM
- Queue: BullMQ with Redis
- Auth: JWT in secure HTTP-only cookies
- Storage: Persistent local report storage

## Architecture

- `app/`: Next.js pages and protected routes
- `components/`: Auth, dashboard, history, and detail UI
- `lib/`: Shared validation, fetch helpers, socket client, utilities
- `server/`: Express API, queue, worker, auth middleware, websocket bridge
- `prisma/`: Database schema
- `storage/reports/`: Generated PDF reports
- `docker/`: Runtime entrypoint for Docker deployments

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/pentest/start`
- `GET /api/pentest/history`
- `GET /api/pentest/:id`
- `GET /api/pentest/:id/logs`
- `GET /api/pentest/:id/download`

## Local Development

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Start PostgreSQL and Redis locally.

3. Install dependencies and generate Prisma client:

```bash
npm install
npm run prisma:generate
```

4. Apply database migrations:

```bash
npm run prisma:migrate
```

5. Run the app, API, and worker together:

```bash
npm run dev
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- API and Socket.IO: [http://localhost:4000](http://localhost:4000)

## Standalone Docker Deployment

The dashboard includes:

- `Dockerfile`: production image for web, API, and worker
- `docker-compose.yml`: full standalone dashboard stack

### 1. Prepare environment

```bash
cp .env.example .env
```

Make sure at minimum you set a strong `JWT_SECRET`. For Docker Compose, the internal PostgreSQL and Redis hosts are injected automatically, so you do not need to manually change them to container hostnames.

### 2. Build and run

```bash
docker compose up --build -d
```

### 3. Stop the stack

```bash
docker compose down
```

### 4. Remove containers and volumes

```bash
docker compose down -v
```

Compose services:

- `dashboard-web`: Next.js frontend
- `dashboard-api`: Express API and Socket.IO server
- `dashboard-worker`: BullMQ worker
- `dashboard-db`: PostgreSQL
- `dashboard-redis`: Redis

Published ports:

- `3000`: Web dashboard
- `4000`: API and Socket.IO
- `5432`: PostgreSQL
- `6379`: Redis

## Combined Docker Deployment With PentestBot

If you want the dashboard and Telegram automation bot to run together, use the parent-level compose file:

- [../docker-compose.yml](C:\Users\DELL\OneDrive\Dokumen\22.NarendraYudhistiraBagaskoro_XISIJA1\AUTOMATION%20PENTEST\docker-compose.yml)

From the parent folder:

```bash
cd ..
cp dashboard/.env.example dashboard/.env
cp pentestbot_2-main/.env.example pentestbot_2-main/.env
docker compose up --build -d
```

That combined stack starts:

- dashboard web
- dashboard API
- dashboard worker
- PostgreSQL
- Redis
- PentestBot

## Production Build Without Docker

```bash
npm run build
npm run start
```

## Security Notes

- Target input is validated and sanitized before job creation.
- Pentest job creation is rate-limited.
- All pentest routes require authentication.
- Internal execution commands are not exposed to the client.
- Socket connections reuse authenticated JWT cookie sessions.

## Mocked Pentest Runner

The current worker simulates these execution stages:

- Recon
- Scanning
- Exploitation
- Reporting

This keeps the system safe for local deployment while preserving a production-shaped queue, websocket, and reporting flow. To integrate real tooling later, replace the executor implementation in `server/modules/pentest/pentest.executor.ts` with hardened adapters that never interpolate raw user input into shell commands.

## Verification

Verified locally:

- `npm run prisma:generate`
- `npm run typecheck`
- `npm run build`
