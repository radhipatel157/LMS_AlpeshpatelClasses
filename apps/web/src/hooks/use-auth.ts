'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getData, postData } from '@/lib/api';
import type { Role, User } from '@/types/api';

type LoginBody = { email: string; password: string };
type LoginResponse = { user: User & { role: Role } };

export function getRole(user?: User | null): Role | undefined {
  const role = user?.role;
  if (!role) return undefined;
  if (typeof role === 'string') return role as Role;
  return role.name;
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => getData<User>('/auth/me'),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: LoginBody) => postData<LoginResponse, LoginBody>('/auth/login', body),
    onSuccess: async ({ user }) => {
      queryClient.setQueryData(['me'], user);
      const role = getRole(user);
      router.push(role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/student');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => postData('/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      router.push('/login');
    },
  });
}
