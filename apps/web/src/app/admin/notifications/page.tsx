'use client';

import { useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, TextArea } from '@/components/ui/field';
import { postData } from '@/lib/api';

export default function AdminNotificationsPage() {
  const broadcast = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      postData('/notifications/broadcast', {
        title: body.title,
        body: body.body,
        link: body.link || undefined,
        targetRole: body.targetRole || undefined,
      }),
  });

  return (
    <>
      <PageHeader title="Broadcast Notification" description="Send a system alert to all users or a role group." />
      <Card>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              broadcast.mutate(Object.fromEntries(new FormData(event.currentTarget)));
            }}
          >
            <Field label="Title" name="title" required />
            <TextArea label="Message" name="body" required />
            <Field label="Deep link" name="link" placeholder="/student/assignments" />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Target</span>
              <select name="targetRole" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">All users</option>
                <option value="ADMIN">Admins</option>
                <option value="TEACHER">Teachers</option>
                <option value="STUDENT">Students</option>
              </select>
            </label>
            <Button disabled={broadcast.isPending}>{broadcast.isPending ? 'Sending...' : 'Send broadcast'}</Button>
            {broadcast.isSuccess ? <p className="text-sm text-success">Broadcast sent.</p> : null}
          </form>
        </CardContent>
      </Card>
    </>
  );
}
