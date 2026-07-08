**MyClass LMS**

Complete Technical Specification Document

_Production-Grade Educational LMS Platform_

| **Property**     | **Value**                       |
| ---------------- | ------------------------------- |
| Document Version | 1.0                             |
| Project Name     | MyClass LMS                     |
| Document Type    | Full Technical Specification    |
| Prepared For     | Development Team / Coding Agent |
| Platform Type    | Web Application (LMS)           |
| Status           | Ready for Development           |

_This document is the single source of truth for the MyClass LMS project. It covers architecture, database schema, API design, frontend structure, security, and development phases in full detail._

**SECTION 1 - PROJECT OVERVIEW**

# **1\. Project Overview**

MyClass LMS is a production-grade, full-stack Learning Management System designed for schools, coaching institutes, private teachers, tuition classes, and online academies. The platform is focused primarily on video-based learning, assignment submission, and structured progress tracking.

## **1.1 Product Vision**

Build a modern, scalable LMS platform comparable to Classplus - tailored for Indian education markets - that supports thousands of students with real-time progress tracking, teacher management, and admin-level analytics. The system must feel premium, responsive, and highly maintainable.

## **1.2 Core Focus Areas**

- Video-based learning with YouTube Unlisted video embedding and full watch tracking
- Assignment submission and evaluation workflow
- Structured academic hierarchy (Standard → Subject → Chapter → Lesson → Video)
- Role-based dashboards for Admin, Teacher, and Student
- Real-time analytics and engagement reporting
- Mobile-first responsive UI

## **1.3 Target Users**

| **User Role** | **Description**                                                          |
| ------------- | ------------------------------------------------------------------------ |
| Admin         | Full system control - manages teachers, students, content, and analytics |
| Teacher       | Uploads lessons, creates assignments, tracks student engagement          |
| Student       | Watches videos, submits assignments, tracks own progress                 |

## **1.4 Comparable Platforms**

- Classplus - primary reference for UX patterns
- Google Classroom - assignment and notification workflows
- Teachmint - academic hierarchy and teacher tools

**SECTION 2 - TECHNOLOGY STACK**

# **2\. Technology Stack**

The following stack is final and non-negotiable. Every technology choice has been made for scalability, developer experience, and deployment compatibility with Hostinger VPS.

## **2.1 Frontend**

| **Technology**  | **Version / Config** | **Purpose**                                   |
| --------------- | -------------------- | --------------------------------------------- |
| Next.js         | App Router (latest)  | Core React framework with SSR and routing     |
| TypeScript      | Strict mode          | Type safety across all components and APIs    |
| Tailwind CSS    | v3+                  | Utility-first responsive styling              |
| shadcn/ui       | Latest               | Professional, accessible UI component library |
| Zustand         | Latest               | Lightweight global state management           |
| TanStack Query  | v5                   | Server state, caching, and API sync           |
| React Hook Form | v7                   | Performant form handling                      |
| Zod             | Latest               | Schema validation for forms and APIs          |
| Recharts        | Latest               | Analytics charts and dashboards               |

## **2.2 Backend**

| **Technology**          | **Config**       | **Purpose**                                 |
| ----------------------- | ---------------- | ------------------------------------------- |
| NestJS                  | Latest (REST)    | Modular, enterprise-grade backend framework |
| Prisma ORM              | MySQL adapter    | Type-safe database queries and migrations   |
| JWT                     | Access + Refresh | Authentication token strategy               |
| Zod / class-validator   | DTOs             | API input validation                        |
| Multer + Cloudinary SDK | Latest           | File upload handling                        |
| Helmet                  | Latest           | Secure HTTP headers                         |
| Throttler               | NestJS built-in  | Rate limiting                               |
| Swagger                 | NestJS module    | Auto-generated API documentation            |

## **2.3 Database**

| **DATABASE** | MySQL - hosted on Hostinger MySQL. Managed via Prisma ORM. Optimized with indexes on all foreign keys and high-volume fields. |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |

## **2.4 Storage & Media**

| **Service**        | **Purpose**                                                       |
| ------------------ | ----------------------------------------------------------------- |
| Cloudinary         | PDF notes, thumbnails, profile images, assignment attachments     |
| YouTube (Unlisted) | All video content - free CDN, adaptive streaming, global delivery |

## **2.5 Hosting & Deployment**

| **Layer**            | **Platform**                                                |
| -------------------- | ----------------------------------------------------------- |
| Frontend (Next.js)   | Vercel - optimal for Next.js, edge optimization included    |
| Backend (NestJS API) | Hostinger VPS - minimum 2 GB RAM, 2 vCPU (4 GB recommended) |
| Database (MySQL)     | Hostinger MySQL - local to backend VPS for low latency      |
| Process Manager      | PM2 - keeps NestJS alive with auto-restart                  |
| Reverse Proxy        | NGINX - handles SSL termination and routing                 |

## **2.6 Additional Dev Tools**

| **Tool**                 | **Purpose**                              |
| ------------------------ | ---------------------------------------- |
| Prisma Studio            | Visual DB browser during development     |
| Swagger UI               | API documentation and manual testing     |
| ESLint + Prettier        | Code quality and consistent formatting   |
| Turborepo                | Monorepo build orchestration             |
| Resend                   | Transactional email (OTP, notifications) |
| Firebase Cloud Messaging | Future push notification infrastructure  |

**SECTION 3 - SYSTEM ARCHITECTURE**

# **3\. System Architecture**

## **3.1 Architecture Style**

The project follows a Modular Monorepo architecture using Turborepo. The frontend and backend are separate applications within the same repository, sharing common packages for types, validation schemas, and UI components.

## **3.2 Monorepo Folder Structure**

myclass-lms/

├── apps/

│ ├── web/ ← Next.js frontend

│ └── api/ ← NestJS backend

│

├── packages/

│ ├── database/ ← Prisma schema + migrations

│ ├── ui/ ← Shared shadcn/ui components

│ ├── shared/ ← Common types, constants, enums

│ ├── validation/ ← Zod schemas shared across apps

│ └── config/ ← ESLint, TypeScript, Tailwind configs

│

├── turbo.json

└── package.json

## **3.3 Backend Module Architecture (NestJS)**

api/src/

├── main.ts ← Bootstrap, global pipes, Swagger

├── app.module.ts ← Root module

│

├── modules/

│ ├── auth/ ← Login, logout, refresh, guards

│ ├── users/ ← User CRUD, role assignment

│ ├── students/ ← Student profile management

│ ├── teachers/ ← Teacher profile management

│ ├── standards/ ← Grade/class management

│ ├── subjects/ ← Subject management

│ ├── chapters/ ← Chapter management

│ ├── lessons/ ← Lesson management

│ ├── videos/ ← Video metadata and embedding

│ ├── video-progress/ ← Watch tracking and heartbeat

│ ├── assignments/ ← Assignment CRUD and publishing

│ ├── submissions/ ← Student upload and evaluation

│ ├── notifications/ ← In-app notification engine

│ ├── analytics/ ← Dashboard stats and reports

│ └── uploads/ ← Cloudinary upload module

│

├── common/

│ ├── guards/ ← JWT guard, Role guard

│ ├── decorators/ ← @Roles(), @GetUser()

│ ├── filters/ ← Global exception filter

│ ├── interceptors/ ← Response transform, logging

│ └── pipes/ ← Zod validation pipe

## **3.4 Frontend Folder Structure (Next.js App Router)**

web/src/

├── app/

│ ├── (auth)/ ← Login, Register, Forgot Password

│ ├── (admin)/ ← Admin dashboard routes

│ ├── (teacher)/ ← Teacher dashboard routes

│ ├── (student)/ ← Student dashboard routes

│ └── api/ ← Next.js API routes (minimal)

│

├── components/

│ ├── ui/ ← shadcn/ui base components

│ ├── layout/ ← Sidebar, Navbar, PageWrapper

│ ├── video/ ← VideoPlayer, ProgressBar

│ ├── assignment/ ← AssignmentCard, SubmissionForm

│ ├── analytics/ ← Charts, StatCards

│ └── shared/ ← Reusable across roles

│

├── lib/

│ ├── api.ts ← Axios/fetch instance with interceptors

│ ├── auth.ts ← Auth helpers

│ └── utils.ts ← cn(), formatDate(), etc.

│

├── store/ ← Zustand stores

├── hooks/ ← Custom React hooks

└── types/ ← Frontend TypeScript types

**SECTION 4 - USER ROLES & PERMISSIONS**

# **4\. User Roles & Access Control**

The system uses Role-Based Access Control (RBAC). Every API route and frontend page is protected by role guards. Roles are stored in the database and evaluated on every request via JWT claims.

## **4.1 Role Definitions**

| **Role**      | **Code** | **Description**                                               |
| ------------- | -------- | ------------------------------------------------------------- |
| Administrator | ADMIN    | Full system access. Manages all users, content, and settings. |
| Teacher       | TEACHER  | Creates and manages content, evaluates student work.          |
| Student       | STUDENT  | Consumes content, submits assignments, tracks progress.       |

## **4.2 Permission Matrix**

| **Feature**          | **Admin** | **Teacher** | **Student** |
| -------------------- | --------- | ----------- | ----------- |
| User Management      | ✓ Full    | ✗           | ✗           |
| Academic Structure   | ✓ Full    | ✓ View      | ✓ View      |
| Create Lessons       | ✓         | ✓           | ✗           |
| Upload Videos        | ✓         | ✓           | ✗           |
| Create Assignments   | ✓         | ✓           | ✗           |
| Evaluate Submissions | ✓         | ✓           | ✗           |
| Submit Assignments   | ✗         | ✗           | ✓           |
| Watch Videos         | ✓         | ✓           | ✓           |
| View Analytics       | ✓ All     | ✓ Own       | ✓ Own       |
| Manage Notifications | ✓ Full    | ✓ Create    | ✓ Read      |
| System Settings      | ✓         | ✗           | ✗           |

**SECTION 5 - AUTHENTICATION SYSTEM**

# **5\. Authentication System**

## **5.1 Auth Strategy**

JWT (JSON Web Tokens) with Access + Refresh Token strategy. Tokens are stored in HTTP-only cookies to prevent XSS attacks. The access token has a short lifespan; the refresh token rotates on every use.

## **5.2 Token Configuration**

| **Token Type**  | **Specification**                                   |
| --------------- | --------------------------------------------------- |
| Access Token    | JWT - expires in 15 minutes                         |
| Refresh Token   | JWT - expires in 7 days, rotated on each use        |
| Storage         | HTTP-only, Secure, SameSite=Strict cookies          |
| Algorithm       | HS256 with separate secrets for access and refresh  |
| Device Tracking | Session record stored in DB with device info and IP |

## **5.3 Auth Endpoints**

| **Method** | **Endpoint**              | **Description**                                                     |
| ---------- | ------------------------- | ------------------------------------------------------------------- |
| POST       | /api/auth/login           | Authenticate with email + password. Returns access token in cookie. |
| POST       | /api/auth/logout          | Invalidate session, clear cookies.                                  |
| POST       | /api/auth/refresh         | Issue new access token using refresh token cookie.                  |
| POST       | /api/auth/forgot-password | Send OTP/reset link to registered email.                            |
| POST       | /api/auth/reset-password  | Reset password using valid OTP token.                               |
| GET        | /api/auth/me              | Return currently authenticated user profile.                        |
| GET        | /api/auth/sessions        | List all active sessions for the user.                              |
| DELETE     | /api/auth/sessions/:id    | Revoke a specific session.                                          |

## **5.4 Auth Flow**

- User submits email + password to POST /api/auth/login
- Backend validates credentials, hashes compared with bcrypt
- On success: Access Token (15 min) and Refresh Token (7 days) set as HTTP-only cookies
- Session record created in DB with userId, device, IP, and refresh token hash
- Frontend reads user data from /api/auth/me on load
- TanStack Query auto-refreshes token on 401 using /api/auth/refresh
- On logout: cookies cleared, session deleted from DB

## **5.5 Security Controls**

- Password hashing with bcrypt (salt rounds: 12)
- CSRF protection via SameSite cookie attribute
- Rate limiting on auth endpoints: 10 requests/minute per IP
- Login attempt logging in activity_logs table
- Refresh token rotation - old token invalidated on every refresh
- Session revocation support (admin can kill all sessions for a user)

**SECTION 6 - ACADEMIC STRUCTURE**

# **6\. Academic Content Hierarchy**

The entire content model is based on a strict hierarchy that mirrors real Indian school structures. Every level is independently manageable.

## **6.1 Hierarchy Model**

Standard (e.g. Class 10)

└── Subject (e.g. Mathematics)

└── Chapter (e.g. Algebra)

└── Lesson (e.g. Linear Equations)

├── Videos (YouTube embedded)

├── Notes (PDF via Cloudinary)

└── Assignments

## **6.2 Content States**

| **State** | **Behavior**                                                |
| --------- | ----------------------------------------------------------- |
| draft     | Only visible to teachers and admins. Not shown to students. |
| published | Visible to enrolled students in the correct standard.       |
| archived  | Hidden from all listings. Data preserved for reports.       |

## **6.3 Academic CRUD Endpoints**

| **Resource** | **Base Route**             | **Operations**                                       |
| ------------ | -------------------------- | ---------------------------------------------------- |
| Standards    | /api/standards             | GET all, GET one, POST, PATCH, DELETE (Admin)        |
| Subjects     | /api/subjects              | GET by standard, POST, PATCH, DELETE (Admin/Teacher) |
| Chapters     | /api/chapters              | GET by subject, POST, PATCH, PATCH order, DELETE     |
| Lessons      | /api/lessons               | GET by chapter, POST, PATCH, PATCH order, DELETE     |
| Resources    | /api/lessons/:id/resources | GET, POST, DELETE - notes/PDFs for a lesson          |

**SECTION 7 - VIDEO LEARNING SYSTEM**

# **7\. Video Learning System**

This is the core differentiating feature of MyClass LMS. Every video is a YouTube Unlisted embed with full server-side progress tracking, resume functionality, and engagement analytics.

## **7.1 Video Model**

| **Field**             | **Description**                                 |
| --------------------- | ----------------------------------------------- |
| id                    | UUID primary key                                |
| lessonId              | FK to lessons table                             |
| title                 | Display title of the video                      |
| youtubeId             | YouTube video ID extracted from URL             |
| thumbnailUrl          | Auto-generated or custom thumbnail (Cloudinary) |
| duration              | Total video duration in seconds                 |
| order                 | Sort order within the lesson                    |
| status                | draft \| published \| archived                  |
| createdAt / updatedAt | Timestamps                                      |

## **7.2 Video Player Requirements**

- Embed YouTube IFrame API (no YouTube branding controls exposed)
- Resume from last watched position on load
- Fullscreen support - keyboard shortcut F
- Mobile-optimized with touch seek controls
- Progress bar showing watched vs total duration
- Auto-save progress every 15 seconds via heartbeat API
- Keyboard shortcuts: Space (play/pause), Arrow keys (seek 10s), F (fullscreen)

## **7.3 Watch Tracking Architecture**

The tracking system works via a heartbeat mechanism. The frontend sends periodic updates to the backend, which stores cumulative progress per student per video.

### **Heartbeat Flow**

- Video starts playing in the YouTube IFrame
- Frontend JavaScript polls player state every 15 seconds
- On each tick, sends POST /api/video-progress/heartbeat with payload
- Backend upserts video_progress record for the student+video pair
- Session-level data written to watch_sessions for granular analytics
- On video end or page unload, a final sync is forced

### **Heartbeat Payload (Frontend → Backend)**

POST /api/video-progress/heartbeat

{

videoId: string,

currentPosition: number, // seconds

watchedSeconds: number, // total seconds watched this session

completionPercentage: number, // 0-100

sessionId: string // UUID generated per play session

}

## **7.4 video_progress Table**

| **Column**           | **Type & Description**                   |
| -------------------- | ---------------------------------------- |
| id                   | UUID - primary key                       |
| studentId            | FK → users.id (indexed)                  |
| videoId              | FK → videos.id (indexed)                 |
| watchedSeconds       | INT - total seconds watched (cumulative) |
| completionPercentage | DECIMAL(5,2) - 0.00 to 100.00            |
| lastPosition         | INT - resume point in seconds            |
| isCompleted          | BOOLEAN - true when ≥ 90% watched        |
| lastWatchedAt        | DATETIME - last heartbeat timestamp      |
| createdAt            | DATETIME                                 |
| updatedAt            | DATETIME                                 |

## **7.5 watch_sessions Table**

| **Column**     | **Type & Description**                           |
| -------------- | ------------------------------------------------ |
| id             | UUID - primary key                               |
| progressId     | FK → video_progress.id (indexed)                 |
| studentId      | FK → users.id (indexed)                          |
| videoId        | FK → videos.id (indexed)                         |
| sessionId      | VARCHAR - client-generated UUID per play session |
| startPosition  | INT - where session started (seconds)            |
| endPosition    | INT - where session ended (seconds)              |
| watchedSeconds | INT - seconds watched in this session            |
| startedAt      | DATETIME                                         |
| endedAt        | DATETIME                                         |

## **7.6 Video API Endpoints**

| **Method** | **Endpoint**                          | **Description**                                |
| ---------- | ------------------------------------- | ---------------------------------------------- |
| GET        | /api/videos/:lessonId                 | Get all videos for a lesson                    |
| POST       | /api/videos                           | Create video record (Teacher/Admin)            |
| PATCH      | /api/videos/:id                       | Update video metadata                          |
| DELETE     | /api/videos/:id                       | Soft-delete video                              |
| POST       | /api/video-progress/heartbeat         | Save watch progress (Student)                  |
| GET        | /api/video-progress/:videoId          | Get student's progress for a video             |
| GET        | /api/video-progress/history           | Get student's full watch history               |
| GET        | /api/video-progress/continue-watching | Get in-progress videos for student             |
| GET        | /api/video-progress/teacher/:videoId  | Get all student progress for a video (Teacher) |

**SECTION 8 - ASSIGNMENT SYSTEM**

# **8\. Assignment System**

## **8.1 Assignment Model**

| **Field**             | **Description**                                  |
| --------------------- | ------------------------------------------------ |
| id                    | UUID - primary key                               |
| lessonId              | FK → lessons.id                                  |
| teacherId             | FK → users.id - who created it                   |
| title                 | Assignment title                                 |
| instructions          | Rich text instructions (stored as HTML/markdown) |
| totalMarks            | INT - maximum marks                              |
| deadline              | DATETIME - submission cutoff                     |
| allowResubmission     | BOOLEAN - can student resubmit before deadline   |
| attachments           | JSON array - Cloudinary URLs of attached files   |
| status                | draft \| published \| closed                     |
| createdAt / updatedAt | Timestamps                                       |

## **8.2 Submission Model**

| **Field**         | **Description**                                           |
| ----------------- | --------------------------------------------------------- |
| id                | UUID - primary key                                        |
| assignmentId      | FK → assignments.id (indexed)                             |
| studentId         | FK → users.id (indexed)                                   |
| submittedFiles    | JSON array - Cloudinary URLs of submitted files           |
| submittedAt       | DATETIME - timestamp of submission                        |
| isLate            | BOOLEAN - flagged if submitted after deadline             |
| resubmissionCount | INT - number of times resubmitted                         |
| status            | pending \| submitted \| evaluated \| approved \| rejected |
| marksObtained     | INT - filled by teacher                                   |
| remarks           | TEXT - teacher feedback                                   |
| evaluatedAt       | DATETIME - when teacher graded                            |
| evaluatedBy       | FK → users.id - teacher who graded                        |

## **8.3 Assignment Workflow**

- Teacher creates assignment, attaches files, sets deadline → status: draft
- Teacher publishes assignment → status: published → notification sent to all students in standard
- Student views assignment on dashboard
- Student uploads submission files (PDF, DOCX, JPG, PNG)
- Backend validates: deadline not passed, file type allowed, file size ≤ 10 MB
- Submission saved to DB, isLate flag set if past deadline
- Student can resubmit if allowResubmission = true and before deadline
- Teacher reviews submissions, adds marks + remarks → status: evaluated
- Teacher approves or rejects → notification sent to student

## **8.4 File Upload Rules**

| **Rule**                 | **Value**                                         |
| ------------------------ | ------------------------------------------------- |
| Allowed Types            | PDF, DOCX, DOC, JPG, JPEG, PNG                    |
| Max File Size            | 10 MB per file                                    |
| Max Files per Submission | 5 files                                           |
| Storage                  | Cloudinary with signed uploads                    |
| Validation               | MIME type checked server-side, not just extension |

## **8.5 Assignment API Endpoints**

| **Method** | **Endpoint**                   | **Description**                        |
| ---------- | ------------------------------ | -------------------------------------- |
| GET        | /api/assignments/:lessonId     | Get all assignments for a lesson       |
| POST       | /api/assignments               | Create assignment (Teacher/Admin)      |
| PATCH      | /api/assignments/:id           | Update assignment details              |
| PATCH      | /api/assignments/:id/publish   | Publish assignment                     |
| PATCH      | /api/assignments/:id/close     | Close assignment (no more submissions) |
| DELETE     | /api/assignments/:id           | Soft-delete assignment                 |
| GET        | /api/submissions/:assignmentId | Get all submissions (Teacher)          |
| POST       | /api/submissions               | Submit assignment (Student)            |
| POST       | /api/submissions/:id/resubmit  | Resubmit assignment (Student)          |
| PATCH      | /api/submissions/:id/evaluate  | Add marks and remarks (Teacher)        |
| GET        | /api/submissions/my            | Student's own submission history       |

**SECTION 9 - COMPLETE DATABASE SCHEMA**

# **9\. Complete Database Schema**

All tables use UUID primary keys. Soft delete is supported via deletedAt nullable timestamp. All FK columns are indexed. createdAt and updatedAt are on every table.

## **9.1 Core Tables Overview**

| **Table Name**         | **Description**                                 |
| ---------------------- | ----------------------------------------------- |
| users                  | Central user table for all roles                |
| roles                  | Role definitions (Admin, Teacher, Student)      |
| sessions               | Active JWT refresh token sessions               |
| students               | Student profile data (extends users)            |
| teachers               | Teacher profile data (extends users)            |
| standards              | Grade/class levels (e.g. Class 10)              |
| subjects               | Subjects within a standard                      |
| chapters               | Chapters within a subject                       |
| lessons                | Lessons within a chapter                        |
| videos                 | Video records linked to lessons                 |
| video_progress         | Cumulative watch progress per student per video |
| watch_sessions         | Granular session-level tracking data            |
| assignments            | Assignment definitions created by teachers      |
| assignment_submissions | Student submissions for assignments             |
| notifications          | All notification records                        |
| notification_reads     | Tracks which notifications each user has read   |
| activity_logs          | Audit trail for all major system events         |
| bookmarks              | Student-saved lessons                           |
| settings               | Key-value system configuration                  |

## **9.2 Prisma Schema**

### **users**

model User {

id String @id @default(uuid())

email String @unique

passwordHash String

name String

phone String?

avatarUrl String?

roleId String

role Role @relation(fields: \[roleId\], references: \[id\])

isActive Boolean @default(true)

deletedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

sessions Session\[\]

student Student?

teacher Teacher?

notifications Notification\[\]

activityLogs ActivityLog\[\]

bookmarks Bookmark\[\]

@@index(\[email\])

@@index(\[roleId\])

}

### **roles**

model Role {

id String @id @default(uuid())

name String @unique // ADMIN | TEACHER | STUDENT

users User\[\]

}

### **sessions**

model Session {

id String @id @default(uuid())

userId String

user User @relation(fields: \[userId\], references: \[id\])

refreshTokenHash String

deviceInfo String?

ipAddress String?

expiresAt DateTime

createdAt DateTime @default(now())

@@index(\[userId\])

}

### **standards, subjects, chapters, lessons**

model Standard {

id String @id @default(uuid())

name String // e.g. 'Class 10'

order Int @default(0)

isActive Boolean @default(true)

deletedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

subjects Subject\[\]

}

model Subject {

id String @id @default(uuid())

standardId String

standard Standard @relation(fields: \[standardId\], references: \[id\])

name String

description String?

order Int @default(0)

status String @default('published') // draft|published|archived

deletedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

chapters Chapter\[\]

@@index(\[standardId\])

}

model Chapter {

id String @id @default(uuid())

subjectId String

subject Subject @relation(fields: \[subjectId\], references: \[id\])

name String

order Int @default(0)

status String @default('published')

deletedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

lessons Lesson\[\]

@@index(\[subjectId\])

}

model Lesson {

id String @id @default(uuid())

chapterId String

chapter Chapter @relation(fields: \[chapterId\], references: \[id\])

title String

description String?

order Int @default(0)

status String @default('draft') // draft|published|archived

deletedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

videos Video\[\]

assignments Assignment\[\]

bookmarks Bookmark\[\]

@@index(\[chapterId\])

}

### **videos**

model Video {

id String @id @default(uuid())

lessonId String

lesson Lesson @relation(fields: \[lessonId\], references: \[id\])

title String

youtubeId String

thumbnailUrl String?

duration Int // seconds

order Int @default(0)

status String @default('draft')

deletedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

progress VideoProgress\[\]

sessions WatchSession\[\]

@@index(\[lessonId\])

}

### **video_progress**

model VideoProgress {

id String @id @default(uuid())

studentId String

videoId String

student User @relation(fields: \[studentId\], references: \[id\])

video Video @relation(fields: \[videoId\], references: \[id\])

watchedSeconds Int @default(0)

completionPercentage Decimal @default(0) @db.Decimal(5, 2)

lastPosition Int @default(0)

isCompleted Boolean @default(false)

lastWatchedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

sessions WatchSession\[\]

@@unique(\[studentId, videoId\])

@@index(\[studentId\])

@@index(\[videoId\])

}

### **watch_sessions**

model WatchSession {

id String @id @default(uuid())

progressId String

progress VideoProgress @relation(fields: \[progressId\], references: \[id\])

studentId String

videoId String

sessionId String // client UUID per play

startPosition Int

endPosition Int

watchedSeconds Int

startedAt DateTime

endedAt DateTime?

@@index(\[progressId\])

@@index(\[studentId\])

@@index(\[videoId\])

}

### **assignments & submissions**

model Assignment {

id String @id @default(uuid())

lessonId String

lesson Lesson @relation(fields: \[lessonId\], references: \[id\])

teacherId String

teacher User @relation(fields: \[teacherId\], references: \[id\])

title String

instructions String @db.Text

totalMarks Int

deadline DateTime

allowResubmission Boolean @default(false)

attachments Json? // JSON array of Cloudinary URLs

status String @default('draft')

deletedAt DateTime?

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

submissions AssignmentSubmission\[\]

@@index(\[lessonId\])

@@index(\[teacherId\])

}

model AssignmentSubmission {

id String @id @default(uuid())

assignmentId String

assignment Assignment @relation(fields: \[assignmentId\], references: \[id\])

studentId String

student User @relation(fields: \[studentId\], references: \[id\])

submittedFiles Json // JSON array of Cloudinary URLs

submittedAt DateTime @default(now())

isLate Boolean @default(false)

resubmissionCount Int @default(0)

status String @default('submitted')

marksObtained Int?

remarks String? @db.Text

evaluatedAt DateTime?

evaluatedBy String?

@@index(\[assignmentId\])

@@index(\[studentId\])

}

### **notifications**

model Notification {

id String @id @default(uuid())

userId String

user User @relation(fields: \[userId\], references: \[id\])

type String // NEW_LESSON | ASSIGNMENT_DEADLINE | MARKS_PUBLISHED | etc.

title String

body String

link String? // Deep link in app

isRead Boolean @default(false)

readAt DateTime?

createdAt DateTime @default(now())

@@index(\[userId\])

@@index(\[isRead\])

}

### **activity_logs, bookmarks**

model ActivityLog {

id String @id @default(uuid())

userId String

user User @relation(fields: \[userId\], references: \[id\])

action String // LOGIN | LOGOUT | SUBMIT | WATCH | etc.

entity String? // e.g. 'Assignment', 'Video'

entityId String?

metadata Json?

ipAddress String?

createdAt DateTime @default(now())

@@index(\[userId\])

@@index(\[createdAt\])

}

model Bookmark {

id String @id @default(uuid())

studentId String

student User @relation(fields: \[studentId\], references: \[id\])

lessonId String

lesson Lesson @relation(fields: \[lessonId\], references: \[id\])

createdAt DateTime @default(now())

@@unique(\[studentId, lessonId\])

}

**SECTION 10 - API DESIGN SPECIFICATION**

# **10\. API Design Specification**

## **10.1 API Conventions**

- Base URL: <https://api.myclass.in/api> (production)
- All requests use JSON (Content-Type: application/json)
- Authentication via HTTP-only cookie (no Bearer header for browser clients)
- All endpoints return a consistent response envelope
- Pagination is cursor-based for performance on large datasets
- Soft-deleted records are excluded from all GET responses by default

## **10.2 Standard Response Format**

// Success

{

"success": true,

"data": { ... },

"meta": {

"page": 1,

"perPage": 20,

"total": 150,

"hasNext": true

}

}

// Error

{

"success": false,

"error": {

"code": "VALIDATION_ERROR",

"message": "email must be a valid email address",

"details": \[ ... \]

}

}

## **10.3 Error Codes**

| **Code**              | **Meaning**                                    |
| --------------------- | ---------------------------------------------- |
| VALIDATION_ERROR      | Input failed Zod/class-validator schema        |
| UNAUTHORIZED          | No valid session or token                      |
| FORBIDDEN             | Authenticated but insufficient role            |
| NOT_FOUND             | Resource does not exist                        |
| CONFLICT              | Duplicate resource (e.g. email already exists) |
| DEADLINE_PASSED       | Submission after assignment deadline           |
| FILE_TOO_LARGE        | Uploaded file exceeds 10 MB limit              |
| INVALID_FILE_TYPE     | MIME type not allowed                          |
| RATE_LIMIT_EXCEEDED   | Too many requests                              |
| INTERNAL_SERVER_ERROR | Unhandled backend exception                    |

## **10.4 Complete API Route Map**

### **Auth Routes**

| **Method** | **Route**                 | **Auth Required** |
| ---------- | ------------------------- | ----------------- |
| POST       | /api/auth/login           | No                |
| POST       | /api/auth/logout          | Yes               |
| POST       | /api/auth/refresh         | Cookie only       |
| POST       | /api/auth/forgot-password | No                |
| POST       | /api/auth/reset-password  | OTP token         |
| GET        | /api/auth/me              | Yes               |
| GET        | /api/auth/sessions        | Yes               |
| DELETE     | /api/auth/sessions/:id    | Yes               |

### **User & Profile Routes**

| **Method** | **Route**             | **Role**                    |
| ---------- | --------------------- | --------------------------- |
| GET        | /api/users            | Admin                       |
| POST       | /api/users            | Admin                       |
| GET        | /api/users/:id        | Admin                       |
| PATCH      | /api/users/:id        | Admin                       |
| DELETE     | /api/users/:id        | Admin (soft delete)         |
| PATCH      | /api/profile          | Authenticated (own profile) |
| PATCH      | /api/profile/password | Authenticated               |
| PATCH      | /api/profile/avatar   | Authenticated               |

### **Academic Content Routes**

| **Method**   | **Route**                | **Role**            |
| ------------ | ------------------------ | ------------------- |
| GET/POST     | /api/standards           | Admin / All         |
| PATCH/DELETE | /api/standards/:id       | Admin               |
| GET/POST     | /api/subjects            | Admin,Teacher / All |
| PATCH/DELETE | /api/subjects/:id        | Admin,Teacher       |
| GET/POST     | /api/chapters            | Admin,Teacher / All |
| PATCH/DELETE | /api/chapters/:id        | Admin,Teacher       |
| GET/POST     | /api/lessons             | Admin,Teacher / All |
| PATCH/DELETE | /api/lessons/:id         | Admin,Teacher       |
| PATCH        | /api/lessons/:id/publish | Admin,Teacher       |

### **Video Routes**

| **Method** | **Route**                             | **Role**      |
| ---------- | ------------------------------------- | ------------- |
| GET        | /api/videos/:lessonId                 | Authenticated |
| POST       | /api/videos                           | Admin,Teacher |
| PATCH      | /api/videos/:id                       | Admin,Teacher |
| DELETE     | /api/videos/:id                       | Admin,Teacher |
| POST       | /api/video-progress/heartbeat         | Student       |
| GET        | /api/video-progress/:videoId          | Student (own) |
| GET        | /api/video-progress/history           | Student (own) |
| GET        | /api/video-progress/continue-watching | Student       |
| GET        | /api/video-progress/teacher/:videoId  | Teacher,Admin |

### **Assignment & Submission Routes**

| **Method** | **Route**                      | **Role**                         |
| ---------- | ------------------------------ | -------------------------------- |
| GET        | /api/assignments               | Authenticated (filtered by role) |
| POST       | /api/assignments               | Teacher,Admin                    |
| PATCH      | /api/assignments/:id           | Teacher,Admin                    |
| DELETE     | /api/assignments/:id           | Teacher,Admin                    |
| PATCH      | /api/assignments/:id/publish   | Teacher,Admin                    |
| GET        | /api/submissions/:assignmentId | Teacher,Admin                    |
| POST       | /api/submissions               | Student                          |
| POST       | /api/submissions/:id/resubmit  | Student                          |
| PATCH      | /api/submissions/:id/evaluate  | Teacher,Admin                    |
| GET        | /api/submissions/my            | Student                          |

### **Analytics Routes**

| **Method** | **Route**                                   | **Role** |
| ---------- | ------------------------------------------- | -------- |
| GET        | /api/analytics/admin/overview               | Admin    |
| GET        | /api/analytics/admin/watch-hours            | Admin    |
| GET        | /api/analytics/admin/submission-rate        | Admin    |
| GET        | /api/analytics/teacher/my-students          | Teacher  |
| GET        | /api/analytics/teacher/engagement/:lessonId | Teacher  |
| GET        | /api/analytics/student/progress             | Student  |
| GET        | /api/analytics/student/streak               | Student  |

**SECTION 11 - FRONTEND PAGES & COMPONENTS**

# **11\. Frontend Pages & Components**

## **11.1 Public Pages**

| **Route**        | **Page Description**                               |
| ---------------- | -------------------------------------------------- |
| /                | Landing/Home page - product features, CTA to login |
| /login           | Unified login with role detection                  |
| /forgot-password | Email entry to request password reset              |
| /reset-password  | OTP + new password form                            |

## **11.2 Admin Dashboard Pages**

| **Route**            | **Page Description**                                               |
| -------------------- | ------------------------------------------------------------------ |
| /admin/dashboard     | Overview cards: total students, teachers, watch hours, submissions |
| /admin/teachers      | Teacher list - add, edit, deactivate                               |
| /admin/students      | Student list - search, filter by standard                          |
| /admin/standards     | Manage class grades                                                |
| /admin/subjects      | Manage subjects per standard                                       |
| /admin/chapters      | Manage chapters per subject                                        |
| /admin/lessons       | Manage lessons per chapter                                         |
| /admin/analytics     | Charts: daily active users, watch time, submission rate            |
| /admin/notifications | Create and broadcast notifications                                 |
| /admin/activity-logs | System audit trail                                                 |

## **11.3 Teacher Dashboard Pages**

| **Route**                            | **Page Description**                                     |
| ------------------------------------ | -------------------------------------------------------- |
| /teacher/dashboard                   | Summary: my lessons, pending submissions, student alerts |
| /teacher/lessons                     | Manage own lessons - add videos, notes                   |
| /teacher/lessons/:id/videos          | Upload/manage videos for a lesson                        |
| /teacher/lessons/:id/assignments     | Create/manage assignments                                |
| /teacher/assignments/:id/submissions | Review and grade submissions                             |
| /teacher/analytics                   | Engagement report, weak student list, watch stats        |
| /teacher/notifications               | Create lesson/assignment notifications                   |

## **11.4 Student Dashboard Pages**

| **Route**                | **Page Description**                                     |
| ------------------------ | -------------------------------------------------------- |
| /student/dashboard       | Continue watching, pending assignments, progress widgets |
| /student/lessons         | Browse lessons by standard → subject → chapter           |
| /student/lessons/:id     | Lesson detail: video list, notes, assignments            |
| /student/watch/:videoId  | Full-screen video player with tracking                   |
| /student/assignments     | All pending and past assignments                         |
| /student/assignments/:id | Assignment detail + submission form                      |
| /student/history         | Complete watch history                                   |
| /student/bookmarks       | Saved lessons                                            |
| /student/notifications   | Notification inbox                                       |
| /student/profile         | Profile settings and password change                     |

## **11.5 Core Reusable Components**

| **Component**            | **Description**                                      |
| ------------------------ | ---------------------------------------------------- |
| &lt;Sidebar&gt;          | Role-aware collapsible sidebar with navigation links |
| &lt;TopNavbar&gt;        | User avatar, notifications bell, dark/light toggle   |
| &lt;StatCard&gt;         | KPI card with icon, value, trend indicator           |
| &lt;VideoPlayer&gt;      | YouTube IFrame wrapper with heartbeat logic          |
| &lt;ProgressBar&gt;      | Animated completion percentage bar                   |
| &lt;AssignmentCard&gt;   | Summary card with deadline badge and status chip     |
| &lt;SubmissionForm&gt;   | Drag-and-drop file upload with validation            |
| &lt;DataTable&gt;        | Sortable, filterable, paginated table (shadcn)       |
| &lt;NotificationBell&gt; | Badge with unread count, dropdown list               |
| &lt;RoleGuard&gt;        | Wrapper that hides content based on role             |
| &lt;SkeletonLoader&gt;   | Loading placeholder for async content                |
| &lt;ConfirmDialog&gt;    | Reusable modal for destructive actions               |
| &lt;FileUploader&gt;     | Cloudinary upload with preview and validation        |
| &lt;SearchInput&gt;      | Debounced global search with filter chips            |

**SECTION 12 - NOTIFICATION SYSTEM**

# **12\. Notification System**

## **12.1 Notification Types**

| **Type Code**       | **Trigger Event**                               |
| ------------------- | ----------------------------------------------- |
| NEW_LESSON          | Teacher publishes a new lesson                  |
| NEW_VIDEO           | Teacher adds video to existing lesson           |
| ASSIGNMENT_CREATED  | Teacher creates and publishes assignment        |
| ASSIGNMENT_DEADLINE | 24 hours before assignment deadline (CRON)      |
| SUBMISSION_RECEIVED | Student submits - teacher is notified           |
| MARKS_PUBLISHED     | Teacher evaluates submission - student notified |
| ASSIGNMENT_REJECTED | Teacher rejects submission - student notified   |
| SYSTEM_ALERT        | Admin broadcasts a message to all users         |

## **12.2 Notification Delivery**

- In-app: stored in notifications table, shown in /notifications page and bell icon
- Email-ready: Resend integration stub - implement when email credentials available
- WhatsApp-ready: API hook prepared in notification service - plug-in ready
- CRON-based reminders: Handled via NestJS @Cron decorators for deadline alerts

## **12.3 Notification API**

| **Method** | **Endpoint**                    | **Description**                      |
| ---------- | ------------------------------- | ------------------------------------ |
| GET        | /api/notifications              | Get user's notifications (paginated) |
| PATCH      | /api/notifications/:id/read     | Mark single notification as read     |
| PATCH      | /api/notifications/read-all     | Mark all as read                     |
| DELETE     | /api/notifications/:id          | Delete notification                  |
| POST       | /api/notifications/broadcast    | Admin: send to all or role group     |
| GET        | /api/notifications/unread-count | Get badge count for bell icon        |

**SECTION 13 - ANALYTICS ENGINE**

# **13\. Analytics Engine**

## **13.1 Admin Analytics**

| **Metric**                 | **Query Source**                                      |
| -------------------------- | ----------------------------------------------------- |
| Total registered students  | COUNT(users WHERE role = STUDENT)                     |
| Total active teachers      | COUNT(users WHERE role = TEACHER AND isActive = true) |
| Total watch hours          | SUM(video_progress.watchedSeconds) / 3600             |
| Assignment completion rate | submitted / total_published \* 100                    |
| Daily active users (DAU)   | COUNT DISTINCT userId from activity_logs by date      |
| Top 10 most watched videos | SUM(watch_sessions.watchedSeconds) GROUP BY videoId   |
| Teacher performance        | AVG(completionPercentage) per teacher's lessons       |

## **13.2 Teacher Analytics**

| **Metric**             | **Description**                                                   |
| ---------------------- | ----------------------------------------------------------------- |
| Student progress       | Per-student completion % across all lessons in teacher's subjects |
| Weak students          | Students with avg completion < 50% flagged automatically          |
| Incomplete videos      | Videos with < 30% avg completion across all students              |
| Watch analytics        | Total views + avg watch duration per video                        |
| Assignment performance | Submission rate and avg marks per assignment                      |

## **13.3 Student Analytics**

| **Metric**               | **Description**                                       |
| ------------------------ | ----------------------------------------------------- |
| Progress percentage      | Completed lessons / total lessons in standard         |
| Learning streak          | Consecutive days with watch activity                  |
| Daily watch time         | Sum of watchedSeconds per day (last 30 days)          |
| Completed lessons count  | Lessons where all videos ≥ 90% complete               |
| Assignment score average | Avg marksObtained / totalMarks across all graded work |

## **13.4 Dashboard Charts (Recharts)**

- Admin: Line chart - DAU over last 30 days
- Admin: Bar chart - watch hours by subject
- Admin: Pie chart - submission status breakdown
- Teacher: Bar chart - per-student completion % for a lesson
- Student: Area chart - daily watch time trend
- Student: Radial bar - overall progress percentage

**SECTION 14 - SECURITY IMPLEMENTATION**

# **14\. Security Implementation**

## **14.1 Backend Security (NestJS)**

| **Control**        | **Implementation**                                                       |
| ------------------ | ------------------------------------------------------------------------ |
| Helmet             | Sets secure HTTP headers on all responses                                |
| Rate Limiting      | NestJS ThrottlerModule: 100 req/min global, 10 req/min on auth routes    |
| CORS               | Whitelist: only frontend domain allowed                                  |
| SQL Injection      | Prisma parameterized queries - no raw SQL allowed                        |
| XSS Prevention     | Input sanitization in DTOs, Helmet CSP headers                           |
| CSRF Protection    | SameSite=Strict cookies prevent cross-site requests                      |
| File Upload Safety | MIME type validation, file size limits, Cloudinary signed uploads        |
| Role Guards        | NestJS Guard on every protected endpoint                                 |
| Audit Logging      | All auth events, submissions, and admin actions written to activity_logs |

## **14.2 Frontend Security**

- No sensitive data stored in localStorage or sessionStorage
- All API calls use credentials: 'include' for cookie auth
- Route-level auth check on all dashboard pages using middleware
- Role-based component rendering - UI elements hidden based on JWT claims
- File uploads validated client-side before hitting the server (second layer)

## **14.3 VPS Security (Hostinger)**

- NGINX configured with SSL (Let's Encrypt) - HTTP → HTTPS redirect
- PM2 runs NestJS as non-root user
- UFW firewall: only ports 22, 80, 443 open
- Environment variables via .env file, never committed to git
- Automated MySQL backups via cron on VPS

**SECTION 15 - ENVIRONMENT VARIABLES**

# **15\. Environment Variables**

## **15.1 Backend (.env for NestJS API)**

\# App

NODE_ENV=production

PORT=3001

\# Database

DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/myclass_db"

\# JWT

JWT_SECRET=your_access_token_secret_here

JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_token_secret_here

JWT_REFRESH_EXPIRES_IN=7d

\# Cloudinary

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

\# Email (Resend)

RESEND_API_KEY=your_resend_key

EMAIL_FROM=<noreply@myclass.in>

\# Frontend URL (CORS)

FRONTEND_URL=<https://myclass.in>

## **15.2 Frontend (.env.local for Next.js)**

NEXT_PUBLIC_API_URL=<https://api.myclass.in>

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=myclass_unsigned_preset

NEXT_PUBLIC_APP_NAME=MyClass LMS

**SECTION 16 - DEVELOPMENT PHASES**

# **16\. Development Phases & Task Breakdown**

Build the project in strict phases. Do NOT build future phases until the current phase is fully working and tested. Each phase ends with a functional, deployable build.

## **Phase 1 - Foundation (Week 1-2)**

### **Goals: Auth, Roles, Database, Base Dashboards**

- Monorepo setup with Turborepo, configure shared packages
- MySQL database on Hostinger, Prisma connected
- Run all migrations, seed default roles (ADMIN, TEACHER, STUDENT)
- NestJS Auth module: login, logout, refresh, JWT guards
- Password hashing with bcrypt
- Session table implementation with refresh token rotation
- Next.js login page with React Hook Form + Zod
- Role-aware redirect after login
- Base dashboard shell: Sidebar + Navbar for all 3 roles
- Dark/light mode toggle with Tailwind + next-themes
- Protected route middleware in Next.js
- Swagger docs setup for backend

## **Phase 2 - Academic Structure (Week 3-4)**

### **Goals: Full content hierarchy - Standards through Lessons**

- NestJS modules: Standards, Subjects, Chapters, Lessons
- CRUD endpoints with role guards (Admin/Teacher only for write)
- Drag-and-drop order management for chapters and lessons
- Draft/published/archived status workflow
- Admin pages: manage standards, subjects, chapters, lessons
- Teacher pages: view and manage own lessons
- Student pages: browse lessons by hierarchy
- Breadcrumb navigation component

## **Phase 3 - Video System (Week 5-6)**

### **Goals: Video upload, player, full tracking**

- Video model and CRUD endpoints
- YouTube IFrame API integration in VideoPlayer component
- 15-second heartbeat implementation (frontend + backend)
- video_progress upsert logic in NestJS
- watch_sessions recording per play session
- Resume from last position on video load
- Continue watching section on student dashboard
- Watch history page
- Teacher view: student progress per video
- isCompleted flag set at ≥ 90% completion

## **Phase 4 - Assignment System (Week 7-8)**

### **Goals: Full assignment creation, submission, and evaluation**

- Assignment CRUD with Cloudinary file attachment
- Assignment publish workflow + notification trigger
- Submission upload with MIME + size validation
- Deadline enforcement (isLate flag, block after close)
- Resubmission flow with counter
- Teacher evaluation UI: marks + remarks + approve/reject
- Student submission history page
- Assignment status badges (pending/submitted/evaluated)

## **Phase 5 - Analytics & Notifications (Week 9-10)**

### **Goals: Dashboards with real data, notification inbox**

- Analytics service: all queries for admin, teacher, student
- Recharts integration: all dashboard charts
- StatCards wired to live data
- Notification engine: create, store, read, delete
- CRON job for assignment deadline reminders (24h before)
- Notification bell with unread count
- Notifications inbox page
- Admin broadcast notification feature

## **Phase 6 - Polish & Deployment (Week 11-12)**

### **Goals: Performance, security hardening, production deployment**

- Skeleton loaders on all async pages
- Lazy loading for routes and heavy components
- TanStack Query cache configuration
- Helmet + rate limiting confirmed working
- CSRF, XSS, SQL injection testing
- File upload MIME validation edge case testing
- NGINX config on Hostinger VPS with SSL
- PM2 ecosystem file for auto-restart
- Vercel deployment with environment variables
- Smoke testing all user flows end-to-end
- Prisma DB optimization: verify all indexes applied
- Swagger docs finalized

**SECTION 17 - UI/UX DESIGN REQUIREMENTS**

# **17\. UI/UX Design Requirements**

## **17.1 Design System**

| **Element**   | **Specification**                                                 |
| ------------- | ----------------------------------------------------------------- |
| Primary Color | #2563EB (Blue-600 in Tailwind)                                    |
| Font Family   | Inter (Google Fonts) for all UI text                              |
| Border Radius | rounded-xl for cards, rounded-lg for inputs                       |
| Shadow        | shadow-sm on cards, shadow-md on modals                           |
| Dark Mode     | Supported via next-themes, all colors use Tailwind dark: variants |
| Layout        | Sidebar (w-64) + Main Content area, collapsible on mobile         |
| Breakpoints   | Mobile-first: sm (640px), md (768px), lg (1024px), xl (1280px)    |

## **17.2 Dashboard Layout**

- Fixed sidebar on desktop (w-64), slide-over drawer on mobile
- Top navbar: breadcrumb, search input, notifications bell, user avatar dropdown
- Main content area: max-w-7xl, padded, scrollable
- All cards use shadcn/ui Card component with consistent padding
- Loading states: shadcn Skeleton component on all data-dependent sections

## **17.3 Key UI Patterns**

- Data tables: shadcn DataTable with column sorting, search, and pagination
- Forms: React Hook Form + Zod with inline error messages below fields
- File uploads: Drag-and-drop zone with file type icons and size indicators
- Video player: full-width on mobile, 16:9 ratio enforced
- Progress bars: animated, color-coded (red &lt; 30%, yellow 30-70%, green &gt; 70%)
- Status badges: color-coded chips for assignment/submission/lesson status
- Empty states: illustrated empty state with CTA when no data
- Toast notifications: shadcn Toaster for success/error feedback

**SECTION 18 - PERFORMANCE OPTIMIZATION**

# **18\. Performance Optimization**

## **18.1 Frontend**

- Next.js dynamic imports for heavy pages (video player, analytics charts)
- TanStack Query: staleTime 5 min for academic content, 30s for notifications
- Image optimization via next/image for all avatars and thumbnails
- Route-level code splitting via Next.js App Router automatic chunking
- Zustand stores are lean - only UI state, not server data
- React.memo on StatCard and AssignmentCard components

## **18.2 Backend**

- All list endpoints are paginated (default 20 per page, max 100)
- All FK columns indexed in Prisma schema
- video_progress uses @@unique(\[studentId, videoId\]) for upsert performance
- Analytics queries use aggregation at DB level, not in application code
- Response compression with compression middleware in NestJS
- Prisma query logging in development to catch N+1 issues

## **18.3 Database Indexes Summary**

| **Table**              | **Indexed Columns**                              |
| ---------------------- | ------------------------------------------------ |
| users                  | email, roleId                                    |
| sessions               | userId                                           |
| subjects               | standardId                                       |
| chapters               | subjectId                                        |
| lessons                | chapterId                                        |
| videos                 | lessonId                                         |
| video_progress         | studentId, videoId, \[studentId+videoId\] unique |
| watch_sessions         | progressId, studentId, videoId                   |
| assignments            | lessonId, teacherId                              |
| assignment_submissions | assignmentId, studentId                          |
| notifications          | userId, isRead                                   |
| activity_logs          | userId, createdAt                                |

**SECTION 19 - DEPLOYMENT GUIDE**

# **19\. Deployment Configuration**

## **19.1 Frontend - Vercel**

- Connect GitHub repo to Vercel
- Set root directory to apps/web
- Add all NEXT*PUBLIC* environment variables in Vercel dashboard
- Set build command: turbo build --filter=web
- Production domain: <https://myclass.in>

## **19.2 Backend - Hostinger VPS**

\# Install Node.js (v20 LTS)

curl -fsSL <https://deb.nodesource.com/setup_20.x> | sudo bash -

sudo apt install -y nodejs

\# Install PM2

npm install -g pm2

\# Clone repo and install

git clone <https://github.com/yourrepo/myclass-lms.git>

cd myclass-lms && npm install

\# Build API

cd apps/api && npm run build

\# Start with PM2

pm2 start dist/main.js --name myclass-api

pm2 save && pm2 startup

## **19.3 NGINX Configuration**

server {

listen 443 ssl;

server_name api.myclass.in;

ssl_certificate /etc/letsencrypt/live/api.myclass.in/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/api.myclass.in/privkey.pem;

location / {

proxy_pass <http://localhost:3001>;

proxy_http_version 1.1;

proxy_set_header Upgrade \$http_upgrade;

proxy_set_header Connection 'upgrade';

proxy_set_header Host \$host;

proxy_cache_bypass \$http_upgrade;

}

}

## **19.4 Database - Hostinger MySQL**

- Create database myclass_db in Hostinger hPanel
- Create dedicated DB user with limited privileges
- Whitelist VPS IP in Hostinger MySQL remote access settings
- Run: npx prisma migrate deploy from VPS
- Run: npx prisma db seed to seed roles and admin account
- Set up automated daily backup via Hostinger or cron

**SECTION 20 - CODING STANDARDS**

# **20\. Coding Standards & Conventions**

## **20.1 Backend (NestJS)**

- Every module has: controller, service, dto, entity files
- DTOs use class-validator decorators with Zod-equivalent validation
- Services contain all business logic - controllers are thin
- Use @Roles() decorator + RolesGuard on every endpoint
- Never use raw SQL - Prisma queries only
- Always wrap service methods in try/catch, throw HttpException
- Use @ApiOperation() + @ApiResponse() on all endpoints for Swagger
- Naming: camelCase for variables, PascalCase for classes, kebab-case for file names

## **20.2 Frontend (Next.js)**

- Feature-based folder organization inside components/
- Every page uses a named export, never default export for pages
- Server Components by default - use 'use client' only when needed
- All API calls go through the shared lib/api.ts axios instance
- TanStack Query for all server state - no useState for API data
- Zustand only for UI state: sidebar open/close, theme, modals
- Forms: React Hook Form + Zod resolver - no manual form state
- TypeScript strict mode - no any types allowed
- Tailwind only - no custom CSS files (except globals.css for tokens)

## **20.3 Git Conventions**

| **Branch**    | **Purpose**                                               |
| ------------- | --------------------------------------------------------- |
| main          | Production-ready code only                                |
| develop       | Integration branch - all features merge here              |
| feature/xxx   | Individual feature branches (e.g. feature/video-tracking) |
| fix/xxx       | Bug fix branches                                          |
| release/x.x.x | Release preparation branches                              |

Commit message format: type(scope): description

Types: feat | fix | docs | style | refactor | test | chore

**SECTION 21 - PRE-LAUNCH CHECKLIST**

# **21\. Pre-Launch Checklist**

## **21.1 Backend Checklist**

- All Prisma migrations run and verified
- All endpoints return consistent response envelope
- All endpoints have role guards applied
- Rate limiting active on auth endpoints
- CORS configured to frontend domain only
- Helmet middleware active
- File upload MIME validation tested with invalid files
- JWT secret is a strong random string (min 64 chars)
- All environment variables set in production .env
- Swagger docs accessible at /api/docs
- Health check endpoint at /api/health returns 200

## **21.2 Frontend Checklist**

- All protected routes redirect to /login if not authenticated
- Role mismatch redirects to correct dashboard
- All forms show validation errors inline
- Loading skeletons shown on all async pages
- Video player resumes from correct position
- Heartbeat fires every 15 seconds during video playback
- File uploads reject invalid types with user-friendly error
- Dark mode works on all pages
- Mobile layout tested on 375px viewport
- 404 and error pages implemented

## **21.3 Deployment Checklist**

- SSL certificate issued and auto-renewal configured
- NGINX proxying to PM2 NestJS process
- PM2 startup script registered for auto-restart on reboot
- Database backups scheduled
- Frontend deployed to Vercel with all env vars
- CORS whitelist matches production frontend URL
- Activity logs writing to DB on login/logout
- Smoke test: login as all 3 roles and verify dashboards load

**END OF DOCUMENT**

_MyClass LMS - Technical Specification v1.0 | All sections complete | Ready for development_