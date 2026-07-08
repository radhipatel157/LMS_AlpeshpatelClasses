import { ProtectedShell } from '@/components/layout/protected-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell role="ADMIN">{children}</ProtectedShell>;
}
