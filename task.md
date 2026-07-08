# MyClass LMS — Complete Task List

## Completed Tasks
- [x] Monorepo Configuration
  - [x] Monorepo root `package.json`
  - [x] Turborepo `turbo.json` config
  - [x] Root `.gitignore`
  - [x] Local development `docker-compose.yml` for MySQL
- [x] Packages Setup
  - [x] `@myclass/database` config and full 19-table Prisma schema
  - [x] Database seeding script (roles, admin, settings, sample standards)
  - [x] `@myclass/shared` config, enums, constants, and index exports
- [x] API App Scaffold & Boilerplate
  - [x] NestJS API `package.json`, `tsconfig.json`, `nest-cli.json`
  - [x] `.env` configuration (with MySQL and Cloudinary credentials)
  - [x] API bootstrap `main.ts` with Helmet, CORS, cookies, global prefix, and Swagger
  - [x] `app.module.ts` root configuration
  - [x] PrismaModule and PrismaService integration
  - [x] Global filters and interceptors (`HttpExceptionFilter`, `ResponseInterceptor`)
  - [x] Custom decorators (`@Roles`, `@GetUser`)
  - [x] Security guards (`JwtAuthGuard`, `RolesGuard`)
- [x] Auth Module
  - [x] Login, logout, token refresh endpoints
  - [x] Session tracking & refresh token rotation in database
  - [x] Forgot & reset password stubs
- [x] Users Module
  - [x] Admin User CRUD operations
  - [x] Own Profile & Avatar update endpoints
- [x] Academic Hierarchy (Part 1)
  - [x] DTO definitions for academic resources
  - [x] Standards Module (CRUD & Archive)
  - [x] Subjects Module (CRUD & standard filter)

---

## Pending Tasks (Backend)

### Phase 2: Academic Structure (Continued)
- [ ] Chapters Module
  - [ ] Chapter CRUD operations
  - [ ] Drag-and-drop reordering endpoint (`PATCH /chapters/reorder`)
- [ ] Lessons Module
  - [ ] Lesson CRUD operations
  - [ ] Reordering endpoint (`PATCH /lessons/reorder`)
  - [ ] Publish / Draft status toggle endpoint (`PATCH /lessons/:id/publish`)
  - [ ] Lesson Resource CRUD (PDF notes attachments)

### Phase 3: Video Learning System
- [ ] Videos Module
  - [ ] Video Metadata CRUD (linked to Lesson)
  - [ ] YouTube ID extraction validation
- [ ] Video Progress & Heartbeat Module
  - [ ] Heartbeat endpoint (`POST /video-progress/heartbeat`)
  - [ ] Watch Sessions tracking (`watch_sessions` table logger)
  - [ ] Video progress history & resume-point retrieval (`GET /video-progress/:videoId`)
  - [ ] "Continue Watching" list query for students
  - [ ] Teacher view of student progress per video

### Phase 4: Assignment System
- [ ] Assignments Module
  - [ ] Assignment CRUD (Teacher/Admin only)
  - [ ] Publish (`PATCH /assignments/:id/publish`) & Close (`PATCH /assignments/:id/close`) endpoints
- [ ] Submissions Module
  - [ ] Submit assignment (Student PDF/attachment uploads)
  - [ ] Submission count and late submission detection logic
  - [ ] Evaluate submission (Teacher marks & remarks)
  - [ ] Student personal submission history endpoint

### Phase 5: Notifications & Analytics
- [ ] Notifications Module
  - [ ] In-app notification creation & retrieval
  - [ ] Mark single/all notifications as read
  - [ ] Admin notification broadcast endpoint
  - [ ] CRON task for deadline reminder (24 hours before)
- [ ] Analytics Module
  - [ ] Admin overview metrics & Daily Active Users (DAU) queries
  - [ ] Teacher classroom analytics & weak student detection (completion < 50%)
  - [ ] Student streak counting, watch time, and radial progress queries

### Phase 6: Core Profile Management & Upload integration
- [ ] Students Module (Student profiles)
  - [ ] CRUD operations for parent details, DOB, address
- [ ] Teachers Module (Teacher profiles)
  - [ ] CRUD operations for qualifications and bio
- [ ] Uploads Module
  - [ ] NestJS integration with Cloudinary Node SDK for signed file uploads

---

## Pending Tasks (Frontend)

### Phase 7: Next.js App Shell & Authentication
- [ ] Next.js Scaffold (`apps/web`)
  - [ ] Create Next.js project using Tailwind CSS and TypeScript
  - [ ] Configure `shadcn/ui` components library
  - [ ] Integrate Axios API client wrapper (`lib/api.ts`) with credential cookies
  - [ ] Set up state managers: Zustand for UI states, TanStack Query for server caching
- [ ] Public Pages
  - [ ] Marketing/Landing Home page
  - [ ] Unified Login page with role-based dashboard redirects
  - [ ] Password Reset pages (Forgot password, OTP entry form)
- [ ] Layout Shell
  - [ ] Collapsible Navigation Sidebar (collapses on mobile, displays navigation by role)
  - [ ] Navbar (breadcrumb trails, user dropdown, notifications bell badge, dark/light theme switch)

### Phase 8: Admin Dashboards & Management Pages
- [ ] Analytics Panel
  - [ ] Cards layout: total students, teachers, watch hours, submission rates
  - [ ] Recharts graphs: DAU line graph, watch time by subject bar chart, submissions pie chart
- [ ] Teacher & Student Management
  - [ ] Teacher accounts manager: list (DataTable), create user, edit details, active status toggle
  - [ ] Student accounts manager: searchable and filterable list by Standard/Class
- [ ] Academics Builder UI
  - [ ] Standards manager dashboard
  - [ ] Standard details page: Subject manager list
  - [ ] Subject details page: Chapters reordering list (drag-and-drop)
  - [ ] Chapter details page: Lessons reordering list
- [ ] Administrative Utilities
  - [ ] Broadcast notification dispatcher
  - [ ] System settings editor & system audit trail (ActivityLog DataTable)

### Phase 9: Teacher Dashboards & Features
- [ ] Core Dashboard page
  - [ ] Stats cards: total students, pending assignment evaluations, engagement indicators
- [ ] Lessons & Videos Manager
  - [ ] Manage lessons, draft/publish status changes
  - [ ] Lessons resources upload (PDF/notes attach tool)
  - [ ] Video attachments uploader (extracts YouTube metadata)
- [ ] Assignment & Submissions Reviewer
  - [ ] Assignment creator panel (deadline dates, instructions, allowed files selector)
  - [ ] Submissions list (DataTable showing student name, status, lateness)
  - [ ] Evaluation UI: Side-by-side files preview (Cloudinary link) + marks and feedback inputs
- [ ] Engagement Analytics
  - [ ] Student completion bars chart
  - [ ] At-risk student alert flags (completion < 50%)

### Phase 10: Student Dashboards & Player Integration
- [ ] Core Dashboard page
  - [ ] "Continue Watching" quick links carousel
  - [ ] Radial completion status bar (overall progress)
  - [ ] Streak metrics widget
- [ ] Academic Viewer
  - [ ] Browse Subjects by Standard
  - [ ] Chapter and Lessons browser
  - [ ] Lesson details page (lesson attachments, video playlist, assignments status)
- [ ] YouTube Video Player Integration
  - [ ] Fullscreen responsive YouTube player embed
  - [ ] 15-second heartbeat syncing logic (progress save/load)
  - [ ] Play, pause, and resume-tracking mechanisms
  - [ ] Continue watching progress updates
- [ ] Assignments & Inbox
  - [ ] Assignments list (badges for pending, submitted, evaluated status)
  - [ ] Drag-and-drop file submissions uploader (Cloudinary signature uploads)
  - [ ] History page (watch sessions history log) & Bookmarked Lessons list
  - [ ] Notifications bell dropdown list & notification inbox page

---

## Phase 11: End-to-End Testing & Production Setup
- [ ] Build & Type Checking validation across Monorepo
- [ ] Global Security Audits: Helmet rate-limiting, CORS whitelisting, cookies validation
- [ ] NGINX VPS deployment configs & PM2 configuration setup
- [ ] End-to-end smoke testing (register student, assign to teacher, view lesson, play video heartbeat, submit work, grade work)
