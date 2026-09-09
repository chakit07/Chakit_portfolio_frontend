'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme-provider';
import {
  LayoutDashboard,
  UserCheck,
  FolderGit2,
  Cpu,
  Briefcase,
  GraduationCap,
  Award,
  Image as ImageIcon,
  Mail,
  Sliders,
  KeyRound,
  Sparkles,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();

  const [admin, setAdmin] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    const verifyAuth = async () => {
      try {
        const res = await api.getMe();
        if (res && res.success && res.admin) {
          setAdmin(res.admin);
        } else {
          router.replace('/admin/login');
        }
      } catch {
        router.replace('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  // If on login page, render children directly without admin shell
  if (isLoginPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-xs font-mono text-muted-foreground animate-pulse">
          Verifying security session...
        </p>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Profile & Content', href: '/admin/profile', icon: UserCheck },
    { label: 'Projects & Case Studies', href: '/admin/projects', icon: FolderGit2 },
    { label: 'Skills & Stack', href: '/admin/skills', icon: Cpu },
    { label: 'Role Fit Matcher', href: '/admin/role-matcher', icon: Sparkles },
    { label: 'Work Experience', href: '/admin/experience', icon: Briefcase },
    { label: 'Education', href: '/admin/education', icon: GraduationCap },
    { label: 'Certifications', href: '/admin/certifications', icon: Award },
    { label: 'Media Manager', href: '/admin/media', icon: ImageIcon },
    { label: 'Contact Inbox', href: '/admin/messages', icon: Mail },
    { label: 'Website & 3D Settings', href: '/admin/settings', icon: Sliders },
    { label: 'Account Security', href: '/admin/account', icon: KeyRound }
  ];

  // Breadcrumb segment title
  const currentNavItem = navItems.find((item) => item.href === pathname) || { label: 'Admin' };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/70 bg-card/60 backdrop-blur-xl p-4 sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center justify-between px-3 py-3 mb-6 border-b border-border/50">
          <Link href="/admin" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span>Admin Console</span>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-border/60 mt-4">
          <div className="px-3 py-2 mb-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Signed in as
            </span>
            <span className="text-sm font-semibold text-foreground truncate block">
              {admin?.username || 'Administrator'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border/50 text-foreground"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground font-semibold">{currentNavItem.label}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>View Live Site</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="p-2 rounded-xl border border-border/60 bg-secondary/50 text-foreground transition-colors hover:bg-secondary"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex text-xs text-muted-foreground hover:text-destructive gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-card border-r border-border p-5 flex flex-col z-50 h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <span className="font-bold text-base">Admin Console</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
