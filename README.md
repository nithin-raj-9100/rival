# Task Management Application

Full-stack task management application with React frontend and Node.js backend.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT (bcrypt + jsonwebtoken)
- **Validation:** Zod (shared between frontend & backend)
- **State:** TanStack React Query (server state), React Hook Form (forms)
- **Real-time:** Server-Sent Events (SSE)
- **Deployment:** Frontend on Vercel, Backend on Railway

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 16+ (or Docker)

### Setup

1. Clone and install:

```bash
git clone <repo-url>
cd task
pnpm install
```

2. Start PostgreSQL (choose one):

```bash
# Option A: Docker
docker compose up -d

# Option B: Local PostgreSQL
# Make sure PostgreSQL is running on port 5432
```

3. Set up environment:

```bash
cp .env.example backend/.env
# Edit backend/.env with your values
```

4. Run database migrations:

```bash
cd backend
pnpm prisma migrate dev --name init
pnpm prisma generate
cd ..
```

5. Start development servers:

```bash
# Terminal 1 — Backend
cd backend && pnpm dev

# Terminal 2 — Frontend
cd frontend && pnpm dev
```

Visit http://localhost:3000

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for signing JWTs | Required |
| `PORT` | Backend server port | `4000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend API URL (frontend) | `http://localhost:4000/api` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `5242880` (5MB) |

## API Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Tasks (all require `Authorization: Bearer <token>`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks (filter, sort, search, pagination) |
| GET | `/api/tasks/:id` | Get single task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

**Query params for GET /tasks:** `status`, `priority`, `search`, `sort` (createdAt/dueDate/priority), `order` (asc/desc), `page`, `limit`

### Task Extras
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/tasks/:id/attachments` | Upload file (multipart) |
| GET | `/api/tasks/:id/attachments` | List attachments |
| GET | `/api/tasks/:id/activity` | Task activity log |

### Admin (requires ADMIN role)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/tasks` | View all users' tasks |

### Real-time
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/events` | SSE stream for real-time updates |

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

## Running Tests

```bash
# Backend tests (requires PostgreSQL)
cd backend && pnpm test

# Frontend tests
cd frontend && pnpm test
```

## Deployment

### Backend (Railway)
1. Create a Railway project with PostgreSQL plugin
2. Set environment variables from `.env.example`
3. Deploy: `railway up` or connect GitHub repo

### Frontend (Vercel)
1. Import project to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
3. Deploy

## Project Structure

```
task/
├── backend/                 # Express + TypeScript API
│   ├── src/
│   │   ├── middleware/       # Auth, validation, error handling, admin check
│   │   ├── routes/           # auth, tasks, attachments, activity, admin, events
│   │   ├── services/         # Business logic per domain
│   │   └── utils/            # JWT helpers, password hashing, Zod schemas
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── tests/
├── frontend/                # Next.js App Router
│   ├── src/
│   │   ├── app/              # Pages (login, signup, tasks, admin)
│   │   ├── components/       # UI components (shadcn) + feature components
│   │   ├── hooks/            # useTasks, useSSE, etc.
│   │   ├── lib/              # API client, validators
│   │   └── providers/        # Auth, Theme, Query providers
│   └── tests/
├── docker-compose.yml       # PostgreSQL for local dev
├── .env.example             # Environment variable template
└── .github/workflows/ci.yml # CI pipeline
```

## Features

### Core
- [x] Task CRUD with PostgreSQL persistence
- [x] JWT authentication with bcrypt password hashing
- [x] Task filtering by status, priority, search, with sorting and pagination
- [x] User isolation — users can only access their own tasks
- [x] Client-side validation with Zod
- [x] Responsive design (mobile + desktop)
- [x] Loading, empty, and error states

### Bonus
- [x] **Role-based access** — Admin role can view all users' tasks
- [x] **Real-time updates** — SSE endpoint pushes live changes to connected clients
- [x] **Optimistic UI** — Task mutations update the UI before server confirmation, with rollback
- [x] **Task attachments** — File upload (images, PDF, Word docs) with drag-and-drop
- [x] **Activity log** — History of all changes per task
- [x] **Docker** — docker-compose for PostgreSQL
- [x] **CI pipeline** — GitHub Actions runs lint + typecheck + tests on push
- [x] **Dark mode** — Theme toggle with system preference detection and persistence

## Assumptions & Trade-offs

1. **Cross-domain auth:** JWT is stored in `localStorage` and sent via `Authorization` header. This is necessary because the backend and frontend are deployed on different domains. In a single-domain setup, `httpOnly` cookies would be preferred.

2. **Real-time via SSE:** SSE provides live updates for task changes. Railway supports persistent connections, which makes this work. If deployed on serverless platforms with connection timeouts, polling would be a fallback.

3. **File storage:** Files are stored locally in `uploads/` for development. For production, the code is structured to easily swap in Vercel Blob or S3.

4. **Zod v4:** The frontend uses Zod v4 (latest) while the backend uses Zod v3. The validators are defined separately for each to avoid version conflicts. The schemas are kept in sync manually.

5. **No email verification:** For simplicity, signup creates the account immediately. A production app would include email verification.

6. **Pagination defaults:** Default page size is 10 with a max of 50. These can be configured.
