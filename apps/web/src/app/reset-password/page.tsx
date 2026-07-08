'use client';

import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { postData } from '@/lib/api';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordShell />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordShell({ children }: { children?: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
        </CardHeader>
        <CardContent>{children ?? <div className="text-sm text-muted-foreground">Loading...</div>}</CardContent>
      </Card>
    </main>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const mutation = useMutation({
    mutationFn: (newPassword: string) =>
      postData('/auth/reset-password', { token: params.get('token') ?? '', newPassword }),
  });

  return (
    <ResetPasswordShell>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const password = new FormData(event.currentTarget).get('password')?.toString() ?? '';
          mutation.mutate(password);
        }}
      >
        <Field label="New password" name="password" type="password" minLength={8} required />
        <Button disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save password'}</Button>
        {mutation.isSuccess ? <p className="text-sm text-success">Password reset successfully.</p> : null}
      </form>
    </ResetPasswordShell>
  );
}
