'use client';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status !== 401 || !original || original._retry || original.url?.includes('/auth/refresh')) {
      throw error;
    }

    original._retry = true;
    refreshing ??= api.post('/auth/refresh').then(() => undefined).finally(() => {
      refreshing = null;
    });
    await refreshing;
    return api(original);
  },
);

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
};

export type PaginatedData<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export async function getData<T>(url: string, config?: AxiosRequestConfig) {
  const response = await api.get<ApiEnvelope<T>>(url, config);
  return response.data.data;
}

export async function getPaginatedData<T>(url: string, config?: AxiosRequestConfig): Promise<PaginatedData<T>> {
  const response = await api.get<ApiEnvelope<T>>(url, config);
  return { data: response.data.data, meta: response.data.meta };
}

export async function postData<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
  const response = await api.post<ApiEnvelope<T>>(url, body, config);
  return response.data.data;
}

export async function patchData<T, B = unknown>(url: string, body?: B) {
  const response = await api.patch<ApiEnvelope<T>>(url, body);
  return response.data.data;
}

export async function deleteData<T>(url: string) {
  const response = await api.delete<ApiEnvelope<T>>(url);
  return response.data.data;
}

export async function uploadFile(file: File, folder?: string) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ApiEnvelope<{
    url: string;
    publicId: string;
    mimeType: string;
    fileSize: number;
    fileName: string;
  }>>('/uploads', formData, {
    params: folder ? { folder } : undefined,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}
