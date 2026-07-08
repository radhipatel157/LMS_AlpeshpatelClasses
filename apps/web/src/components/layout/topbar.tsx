'use client';

import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';
import type { User } from '@/types/api';

export function Topbar({ user }: { user: User }) {
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div>
        <div className="text-sm text-muted-foreground">Signed in as</div>
        <div className="font-semibold">{user.name}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Notifications">
          <Bell size={18} />
        </Button>
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
