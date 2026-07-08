export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  isActive?: boolean;
  role?: { name: Role } | Role | string;
  avatarUrl?: string | null;
  student?: StudentProfile | null;
  teacher?: TeacherProfile | null;
};

export type StudentProfile = {
  id: string;
  userId: string;
  standardId?: string | null;
  parentPhone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  standard?: Standard | null;
  user?: User;
};

export type TeacherProfile = {
  id: string;
  userId: string;
  qualification?: string | null;
  bio?: string | null;
  user?: User;
};

export type Standard = {
  id: string;
  name: string;
  order: number;
  subjects?: Subject[];
  _count?: { subjects?: number; students?: number };
};

export type Subject = {
  id: string;
  standardId: string;
  name: string;
  description?: string | null;
  order: number;
  chapters?: Chapter[];
  standard?: Standard;
};

export type Chapter = {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  lessons?: Lesson[];
  subject?: Subject;
};

export type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  description?: string | null;
  order: number;
  status: string;
  videos?: Video[];
  assignments?: Assignment[];
  resources?: LessonResource[];
  chapter?: Chapter;
};

export type LessonResource = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileSize?: number;
};

export type Video = {
  id: string;
  lessonId: string;
  title: string;
  youtubeId: string;
  thumbnailUrl?: string | null;
  duration: number;
  order: number;
  status: string;
  lesson?: Lesson;
};

export type Assignment = {
  id: string;
  lessonId: string;
  teacherId: string;
  title: string;
  instructions: string;
  totalMarks: number;
  deadline: string;
  allowResubmission: boolean;
  attachments?: UploadedFileMeta[];
  status: string;
  lesson?: Lesson;
  submissions?: Submission[];
};

export type UploadedFileMeta = {
  url: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedFiles: UploadedFileMeta[];
  submittedAt: string;
  isLate: boolean;
  status: string;
  marksObtained?: number | null;
  remarks?: string | null;
  assignment?: Assignment;
  student?: User;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

export type VideoProgress = {
  id?: string;
  studentId?: string;
  videoId?: string;
  watchedSeconds: number;
  completionPercentage: number | string;
  lastPosition: number;
  isCompleted: boolean;
  lastWatchedAt?: string | null;
  video?: Video;
  student?: User;
};

export type PageMeta = {
  page?: number;
  perPage?: number;
  total?: number;
  hasNext?: boolean;
};
