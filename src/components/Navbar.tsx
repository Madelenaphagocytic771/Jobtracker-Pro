'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Briefcase, LogOut, ChevronDown, LayoutDashboard, Kanban, List, CalendarDays, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  { href: '/', label: '看板', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/kanban', label: '投递', icon: <Kanban className="h-4 w-4" /> },
  { href: '/table', label: '列表', icon: <List className="h-4 w-4" /> },
  { href: '/calendar', label: '日历', icon: <CalendarDays className="h-4 w-4" /> },
  { href: '/settings', label: '设置', icon: <Settings className="h-4 w-4" /> },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.replace('/login');
  }

  const user = session?.user;
  const avatar = user?.name?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-screen-2xl flex h-14 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-foreground">JobTracker</span>
            <span className="hidden sm:inline text-primary">Pro</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'text-primary bg-primary/8'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {item.icon}
                  {item.label}
                  {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="切换主题">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  {avatar}
                </div>
                <span className="text-sm font-medium hidden sm:inline max-w-[80px] truncate">{user.name}</span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', showUserMenu && 'rotate-180')} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover shadow-xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0">{avatar}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm">
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex border-t">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.icon}
              {item.label}
              {active && <span className="w-4 h-0.5 bg-primary rounded-full" />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
