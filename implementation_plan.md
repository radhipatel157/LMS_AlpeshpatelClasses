# MyClass LMS — Backend Implementation Plan

Build the complete NestJS backend for MyClass LMS as specified in `MyClass_LMS_Technical_Spec.md`.

## User Review Required

> [!IMPORTANT]
> The spec defines a **Turborepo monorepo** with `apps/api` (NestJS) and `apps/web` (Next.js). Since you only want the backend now, we will scaffold the full monorepo structure but only implement the `apps/api` NestJS backend. The `apps/web` (frontend) will be added later.

> [!IMPORTANT]
> **Database**: The spec requires MySQL on Hostinger. For local development, you'll need MySQL running locally (or via Docker). We will configure Prisma with a `DATABASE_URL` in `.env` that you fill in. All migrations will be ready to run with `npx prisma migrate dev`.

> [!WARNING]
> **No NestJS → Next.js migration**: Unlike your previous conversations, this spec explicitly uses **NestJS** as the backend. We will follow the spec exactly.

## Open Questions

> [!IMPORTANT]
> Do you have **MySQL** installed locally, or should we add a `docker-compose.yml` for a local MySQL container? Please confirm before we run migrations.

> [!IMPORTANT]
> Do you have a **Cloudinary** account? We need `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for file uploads. We will stub the module if you don't have credentials yet.

---

## Proposed Changes

### 1. Monorepo Root

#### [NEW] `e:\LMS_Classplus\package.json`
Turborepo monorepo root with workspaces for `apps/*` and `packages/*`.

#### [NEW] `e:\LMS_Classplus\turbo.json`
Turborepo pipeline config for build, dev, test tasks.

#### [NEW] `e:\LMS_Classplus\.gitignore`
Standard Node.js + NestJS gitignore.

#### [NEW] `e:\LMS_Classplus\.env.example`
Template for all environment variables (both frontend and backend).

---

### 2. Shared Packages

#### [NEW] `packages/database/`
- `schema.prisma` — Complete Prisma schema with all 19 tables as per spec Section 9
- `package.json` — Package config for the database package
- `src/index.ts` — Exports PrismaClient singleton

#### [NEW] `packages/shared/`
- `src/enums.ts` — Role enums, status enums, notification types
- `src/constants.ts` — File size limits, allowed MIME types, pagination defaults
- `src/types.ts` — Shared TypeScript interfaces

#### [NEW] `packages/validation/`
- `src/auth.schemas.ts` — Zod schemas for login, register, reset password
- `src/academic.schemas.ts` — Zod schemas for standards, subjects, chapters, lessons
- `src/video.schemas.ts` — Zod schemas for video + heartbeat payload
- `src/assignment.schemas.ts` — Zod schemas for assignments + submissions

---

### 3. NestJS Backend (`apps/api`)

#### [NEW] `apps/api/` — Full NestJS project scaffolded via NestJS CLI

##### Bootstrap
- `src/main.ts` — Bootstrap with Helmet, CORS, global pipes, Swagger
- `src/app.module.ts` — Root module importing all feature modules

##### Common
- `src/common/guards/jwt.guard.ts` — JWT authentication guard
- `src/common/guards/roles.guard.ts` — Role-based authorization guard
- `src/common/decorators/roles.decorator.ts` — `@Roles()` decorator
- `src/common/decorators/get-user.decorator.ts` — `@GetUser()` decorator
- `src/common/filters/http-exception.filter.ts` — Global exception filter (consistent error envelope)
- `src/common/interceptors/response.interceptor.ts` — Wraps responses in `{ success, data, meta }`
- `src/common/pipes/zod-validation.pipe.ts` — Zod validation pipe
- `src/common/prisma/prisma.service.ts` — PrismaService (NestJS injectable)
- `src/common/prisma/prisma.module.ts` — PrismaModule (global)

##### Modules (14 total)

**Auth Module** (`src/modules/auth/`)
- Login, logout, refresh token, forgot password, reset password
- `/api/auth/me`, `/api/auth/sessions`, `/api/auth/sessions/:id`
- JWT strategy, bcrypt password hashing, session management, refresh token rotation

**Users Module** (`src/modules/users/`)
- Admin CRUD for all users
- Profile update (own), password change, avatar upload

**Students Module** (`src/modules/students/`)
- Student profile management (extends users)
- Enrollment in standards

**Teachers Module** (`src/modules/teachers/`)
- Teacher profile management
- Subject assignments

**Standards Module** (`src/modules/standards/`)
- CRUD for class grades (Class 10, Class 11, etc.)
- Admin-only write access

**Subjects Module** (`src/modules/subjects/`)
- CRUD within a standard
- Admin/Teacher write access

**Chapters Module** (`src/modules/chapters/`)
- CRUD within a subject
- Drag-and-drop order management (`PATCH /order`)

**Lessons Module** (`src/modules/lessons/`)
- CRUD within a chapter
- Publish/archive workflow
- Resources (PDF notes via Cloudinary)

**Videos Module** (`src/modules/videos/`)
- Video metadata CRUD (YouTube ID + metadata, no file upload)
- Soft delete

**Video Progress Module** (`src/modules/video-progress/`)
- `POST /heartbeat` — Upsert progress + write watch session
- Continue watching, watch history
- Teacher view of student progress per video

**Assignments Module** (`src/modules/assignments/`)
- Full CRUD + publish/close workflow
- Cloudinary file attachments (teacher uploads)

**Submissions Module** (`src/modules/submissions/`)
- Student file submission (Cloudinary)
- MIME type + file size validation
- Deadline enforcement, isLate flag, resubmission
- Teacher evaluation (marks + remarks + approve/reject)

**Notifications Module** (`src/modules/notifications/`)
- Create, read, mark-read, delete
- Admin broadcast
- CRON job for 24h deadline reminders

**Analytics Module** (`src/modules/analytics/`)
- Admin: overview stats, watch hours, submission rates, DAU
- Teacher: student progress, weak students, video engagement
- Student: progress %, streak, daily watch time

**Uploads Module** (`src/modules/uploads/`)
- Cloudinary upload handler (Multer middleware)
- Returns signed Cloudinary URL

---

## Implementation Order

```
1. Monorepo root setup (package.json, turbo.json)
2. packages/database (Prisma schema - all 19 tables)
3. packages/shared (enums, constants, types)
4. apps/api scaffold (NestJS CLI)
5. PrismaModule + PrismaService
6. Common (guards, filters, interceptors, decorators, pipes)
7. Auth module (login, JWT, sessions)
8. Users module (CRUD, profile)
9. Academic modules (Standards → Subjects → Chapters → Lessons)
10. Videos module
11. Video Progress module (heartbeat, tracking)
12. Assignments module
13. Submissions module
14. Notifications module + CRON
15. Analytics module
16. Uploads module (Cloudinary)
17. main.ts (Swagger, Helmet, global setup)
18. .env files + README
```

---

## Verification Plan

### Automated Tests
- `npm run build` — verify TypeScript compiles with zero errors
- `npx prisma validate` — verify Prisma schema is valid
- Swagger UI accessible at `http://localhost:3001/api/docs`

### Manual Verification
- Seed script creates default roles (ADMIN, TEACHER, STUDENT) and one admin user
- Login returns HTTP-only cookies
- All endpoints show correct 401/403 on unauthorized access
- Video heartbeat correctly upserts `video_progress` record
- File upload returns Cloudinary URL

---

## Key Spec Decisions

| Decision | Value from Spec |
|---|---|
| Auth | JWT, HTTP-only cookies, 15min access / 7d refresh |
| Password hashing | bcrypt, salt rounds: 12 |
| File upload | Multer + Cloudinary SDK, max 10MB, 5 files |
| Pagination | Cursor-based, default 20/page, max 100 |
| Video completion | isCompleted = true at ≥ 90% |
| Heartbeat interval | 15 seconds |
| Rate limiting | 100 req/min global, 10 req/min on auth routes |
| Soft delete | `deletedAt` nullable timestamp on all major tables |
