import { UserRole } from './enums';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  roleId: string;
  avatarUrl?: string | null;
}

export interface PaginatedMeta {
  page: number;
  perPage: number;
  total: number;
  hasNext: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface UploadedFileMeta {
  url: string;
  publicId?: string;
  mimeType?: string;
  fileSize?: number;
  fileName?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  path: string;
  timestamp: string;
}
