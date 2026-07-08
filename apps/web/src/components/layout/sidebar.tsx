'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  PlaySquare,
  UserCircle,
  School,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/types/api';

const nav = {
  ADMIN: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/teachers', label: 'Teachers', icon: Users },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/academics', label: 'Academics', icon: School },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/notifications', label: 'Broadcast', icon: Bell },
    { href: '/admin/profile', label: 'Profile', icon: UserCircle },
  ],
  TEACHER: [
    { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/lessons', label: 'Lessons', icon: BookOpen },
    { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardCheck },
    { href: '/teacher/progress', label: 'Video Progress', icon: PlaySquare },
    { href: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/teacher/profile', label: 'Profile', icon: UserCircle },
  ],
  STUDENT: [
    { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/learn', label: 'Learn', icon: PlaySquare },
    { href: '/student/assignments', label: 'Assignments', icon: ClipboardCheck },
    { href: '/student/notifications', label: 'Inbox', icon: Bell },
    { href: '/student/history', label: 'History', icon: BookOpen },
    { href: '/student/profile', label: 'Profile', icon: UserCircle },
  ],
} satisfies Record<Role, Array<{ href: string; label: string; icon: typeof LayoutDashboard }>>;

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap size={20} />
        </div>
        <div>
          <div className="font-semibold">MyClass LMS</div>
          <div className="text-xs text-muted-foreground capitalize">{role.toLowerCase()}</div>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {nav[role].map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                active && 'bg-primary/10 text-primary',
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
