'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { getPaginatedData, patchData } from '@/lib/api';
import type { Notification } from '@/types/api';

export default function StudentNotificationsPage() {
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getPaginatedData<Notification[]>('/notifications'),
  });
  const readAll = useMutation({
    mutationFn: () => patchData('/notifications/read-all', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <>
      <PageHeader title="Notifications" actions={<Button variant="secondary" onClick={() => readAll.mutate()}>Mark all read</Button>} />
      <Card>
        <CardContent className="space-y-2">
          {notifications.data?.data.map((notification) => (
            <div key={notification.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{notification.title}</p>
                <span className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
            </div>
          ))}
          {notifications.data?.data.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No notifications found</p>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
