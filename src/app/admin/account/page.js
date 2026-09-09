'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminAccountPage() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error('Current and new password are required.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      toast.success(res.message || 'Password changed successfully. All previous sessions have been invalidated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Account Security
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update administrator password and rotate active credentials.
        </p>
      </div>



      <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Change Password</h2>
            <p className="text-xs text-muted-foreground">
              Requires current password verification. All other active sessions will be terminated.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Current Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              New Password (min 8 characters)
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Confirm New Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-3">
            <Button type="submit" isLoading={saving} className="w-full gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Update Password & Invalidate Sessions</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
