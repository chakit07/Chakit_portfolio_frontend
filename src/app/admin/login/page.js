'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter both username/email and password.');
      toast.warning('Please enter both username/email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.login(identifier, password);
      if (res && res.success) {
        toast.success('Welcome back! Logged in successfully.');
        router.push('/admin');
        router.refresh();
      } else {
        const msg = res.message || 'Login failed.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.message || 'Invalid credentials or connection error.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background ambient blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-3 shadow-inner">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Portfolio Admin Access
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Secure dashboard to manage your content, projects, and site settings
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2.5 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="admin or admin@portfolio.local"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="w-full mt-2 gap-2 shadow-lg shadow-primary/25"
            >
              <span>Sign In to Dashboard</span>
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/60 text-center">
            <p className="text-xs text-muted-foreground">
              Note: Public registration is disabled. Administrator accounts are managed securely via CLI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
