'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { getRole, useMe } from '@/hooks/use-auth';
import type { Role } from '@/types/api';

export function ProtectedShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const me = useMe();
  const actualRole = getRole(me.data);

  useEffect(() => {
    if (me.isError) router.replace('/login');
    if (actualRole && actualRole !== role) {
      router.replace(actualRole === 'ADMIN' ? '/admin' : actualRole === 'TEACHER' ? '/teacher' : '/student');
    }
  }, [actualRole, me.isError, role, router]);

  if (me.isLoading || !me.data || actualRole !== role) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <div className="min-w-0 flex-1">
        <Topbar user={me.data} />
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
