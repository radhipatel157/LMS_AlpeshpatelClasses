'use client';

import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getRole, useLogout } from '@/hooks/use-auth';
import { getData, getPaginatedData, patchData } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Notification } from '@/types/api';
import type { User } from '@/types/api';

export function Topbar({ user }: { user: User }) {
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const role = getRole(user);
  const inboxHref = role === 'ADMIN' ? '/admin/notifications' : role === 'TEACHER' ? '/teacher/profile' : '/student/notifications';
  const queryClient = useQueryClient();
  const unread = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => getData<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30000,
  });
  const notifications = useQuery({
    queryKey: ['notifications-preview'],
    queryFn: () => getPaginatedData<Notification[]>('/notifications', { params: { perPage: 5 } }),
  });
  const readAll = useMutation({
    mutationFn: () => patchData('/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-preview'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div>
        <div className="text-sm text-muted-foreground">Signed in as</div>
        <div className="font-semibold">{user.name}</div>
      </div>
      <div className="flex items-center gap-2">
        <details className="relative">
          <summary className="list-none">
            <span className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent text-foreground transition hover:bg-muted" title="Notifications">
              <span className="relative">
                <Bell size={18} />
                {(unread.data?.count ?? 0) > 0 ? (
                  <span className="absolute -right-2 -top-2 rounded-full bg-danger px-1.5 text-[10px] font-semibold text-white">
                    {unread.data?.count}
                  </span>
                ) : null}
              </span>
            </span>
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-md border bg-card p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Notifications</p>
              <button type="button" className="text-xs font-medium text-primary" onClick={() => readAll.mutate()}>Mark all read</button>
            </div>
            <div className="space-y-2">
              {notifications.data?.data.length ? notifications.data.data.map((notification) => (
                <Link key={notification.id} href={notification.link ?? inboxHref} className="block rounded-md border p-2 text-sm hover:bg-muted">
                  <span className="font-medium">{notification.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{formatDate(notification.createdAt)}</span>
                </Link>
              )) : <p className="py-4 text-center text-sm text-muted-foreground">No notifications</p>}
            </div>
          </div>
        </details>
        <Button
          variant="ghost"
          size="icon"
          title="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => logout.mutate()}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  );
}
