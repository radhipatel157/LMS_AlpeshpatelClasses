'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { useLogin } from '@/hooks/use-auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@myclass.in', password: 'Admin@123456' },
  });

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap size={24} />
          </div>
          <CardTitle>MyClass LMS</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
            <Field label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
            <Field
              label="Password"
              type="password"
              error={form.formState.errors.password?.message}
              {...form.register('password')}
            />
            {login.isError ? <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">Login failed. Check your credentials.</div> : null}
            <Button className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
