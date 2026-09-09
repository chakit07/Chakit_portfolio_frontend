'use client';

import AIJobMatcher from '@/components/public/AIJobMatcher';

export default function RoleMatcherAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Role Fit & Compatibility Matcher</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analyze job descriptions against your skills and projects using AI.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 p-2 sm:p-4">
        <AIJobMatcher />
      </div>
    </div>
  );
}
