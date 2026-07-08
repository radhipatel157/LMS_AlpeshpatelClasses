'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { postData } from '@/lib/api';

export default function ForgotPasswordPage() {
  const mutation = useMutation({
    mutationFn: (email: string) => postData('/auth/forgot-password', { email }),
  });

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const email = new FormData(event.currentTarget).get('email')?.toString() ?? '';
              mutation.mutate(email);
            }}
          >
            <Field label="Email" name="email" type="email" required />
            <Button disabled={mutation.isPending}>{mutation.isPending ? 'Sending...' : 'Send reset link'}</Button>
            {mutation.isSuccess ? <p className="text-sm text-success">If the email exists, a reset link has been sent.</p> : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
