// ─── User Roles ──────────────────────────────────────────────────
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

// ─── Content Status ──────────────────────────────────────────────
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// ─── Assignment Status ───────────────────────────────────────────
export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

// ─── Submission Status ───────────────────────────────────────────
export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  EVALUATED = 'evaluated',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// ─── Notification Types ──────────────────────────────────────────
export enum NotificationType {
  NEW_LESSON = 'NEW_LESSON',
  NEW_VIDEO = 'NEW_VIDEO',
  ASSIGNMENT_CREATED = 'ASSIGNMENT_CREATED',
  ASSIGNMENT_DEADLINE = 'ASSIGNMENT_DEADLINE',
  SUBMISSION_RECEIVED = 'SUBMISSION_RECEIVED',
  MARKS_PUBLISHED = 'MARKS_PUBLISHED',
  ASSIGNMENT_REJECTED = 'ASSIGNMENT_REJECTED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

// ─── Activity Actions ────────────────────────────────────────────
export enum ActivityAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SUBMIT = 'SUBMIT',
  WATCH = 'WATCH',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EVALUATE = 'EVALUATE',
  BROADCAST = 'BROADCAST',
}

// ─── Resource Types ──────────────────────────────────────────────
export enum ResourceType {
  PDF = 'pdf',
  DOCUMENT = 'document',
  IMAGE = 'image',
}
