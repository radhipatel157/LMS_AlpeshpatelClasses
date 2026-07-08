// ─── File Upload ────────────────────────────────────────────────
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_SUBMISSION_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const ALLOWED_SUBMISSION_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.jpg',
  '.jpeg',
  '.png',
];

export const MAX_FILES_PER_SUBMISSION = 5;

// ─── Pagination ─────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Video ──────────────────────────────────────────────────────
export const VIDEO_COMPLETION_THRESHOLD = 90; // percent
export const HEARTBEAT_INTERVAL_SECONDS = 15;

// ─── Auth ───────────────────────────────────────────────────────
export const BCRYPT_SALT_ROUNDS = 12;
export const AUTH_RATE_LIMIT_REQUESTS = 10;
export const AUTH_RATE_LIMIT_WINDOW_SECONDS = 60;
export const GLOBAL_RATE_LIMIT_REQUESTS = 100;
export const GLOBAL_RATE_LIMIT_WINDOW_SECONDS = 60;

// ─── Notification Deadline Reminder ─────────────────────────────
export const DEADLINE_REMINDER_HOURS_BEFORE = 24;
