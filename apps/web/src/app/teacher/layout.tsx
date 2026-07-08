import { ProtectedShell } from '@/components/layout/protected-shell';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell role="TEACHER">{children}</ProtectedShell>;
}
