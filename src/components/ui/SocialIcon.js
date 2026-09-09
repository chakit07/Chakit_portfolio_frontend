'use client';

import { Github, Linkedin, Twitter, Mail, Globe, Code, FileCode } from 'lucide-react';

export default function SocialIcon({ platform = '', url = '', className = 'h-4 w-4' }) {
  const p = (platform || '').toLowerCase().trim();
  const u = (url || '').toLowerCase().trim();

  const matches = (key) => p.includes(key) || u.includes(key);

  // LeetCode
  if (matches('leetcode')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863 0-.713.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.178 1.823.645l2.697 2.607c.48.48 1.258.48 1.738 0s.48-1.258 0-1.738l-2.697-2.607c-.947-.947-2.316-1.467-3.801-1.467s-2.854.52-3.801 1.467L3.22 10.942C2.273 11.89 1.75 13.258 1.75 14.743c0 1.485.523 2.853 1.47 3.801l4.332 4.363c.947.947 2.316 1.467 3.801 1.467s2.854-.52 3.801-1.467l2.697-2.607c.48-.48.48-1.258 0-1.738s-1.258-.48-1.738 0zM20.811 13.01H10.666c-.679 0-1.23.551-1.23 1.23s.551 1.23 1.23 1.23h10.145c.679 0 1.23-.551 1.23-1.23s-.551-1.23-1.23-1.23zM13.578 1.282c-.48-.48-1.258-.48-1.738 0-.48.48-.48 1.258 0 1.738l5.962 5.962c.48.48 1.258.48 1.738 0 .48-.48.48-1.258 0-1.738L13.578 1.282z" />
      </svg>
    );
  }

  // HackerRank
  if (matches('hackerrank')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm5.485 15.707l-2.8-1.617v-4.18l2.8 1.617v4.18zm-4.2-2.426L10.485 14.9v-4.18l2.8-1.617v4.18zm-4.2-2.426L6.285 12.465v-4.18l2.8-1.617v4.18zm8.4-1.617l-2.8-1.617V3.441l2.8 1.617v4.18z" />
      </svg>
    );
  }

  // CodeChef
  if (matches('codechef')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-4.5H8v-2h6v6.5z" />
      </svg>
    );
  }

  // Codeforces
  if (matches('codeforces')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.5 7.5A1.5 1.5 0 0 1 6 9v9a1.5 1.5 0 0 1-3 0V9a1.5 1.5 0 0 1 1.5-1.5zM12 3a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-3 0V4.5A1.5 1.5 0 0 1 12 3zm7.5 7.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-3 0v-6a1.5 1.5 0 0 1 1.5-1.5z" />
      </svg>
    );
  }

  // YouTube
  if (matches('youtube')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  // Medium
  if (matches('medium')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    );
  }

  // Dev.to
  if (matches('dev') || matches('devto')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H5.27v4.36h1.26c.41 0 .69-.08.87-.24.18-.16.27-.43.27-.8V10.85c0-.36-.08-.63-.25-.8zM0 3.8v16.4h24V3.8H0zm8.8 11.23c0 .87-.31 1.54-.93 2.01-.62.47-1.48.7-2.58.7H2.27V6.26h3.04c1.07 0 1.93.23 2.57.69.64.46.96 1.13.96 2v6.08zm6.05 2.71h-4.32V6.26h4.32v2.24h-2.12v1.98h1.96v2.18h-1.96v2.12h2.12v2.26zm6.89-6.66l-1.95 6.66h-2.31L15.5 11.08v6.95h-2.18V6.26h2.82l1.83 6.32 1.83-6.32h2.81v11.77h-2.18V11.08z" />
      </svg>
    );
  }

  // GitLab
  if (matches('gitlab')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.5 2a.43.43 0 0 1 .38.26l2.12 6.52h7.98l2.12-6.52A.43.43 0 0 1 18.48 2a.42.42 0 0 1 .39.22l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z" />
      </svg>
    );
  }

  // Instagram
  if (matches('instagram')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
  }

  // Standard Lucide Mappings
  if (matches('github')) return <Github className={className} />;
  if (matches('linkedin')) return <Linkedin className={className} />;
  if (matches('twitter') || matches('x.com')) return <Twitter className={className} />;
  if (matches('email') || matches('mail')) return <Mail className={className} />;

  // Default fallback for any platform (e.g. GeeksforGeeks, Kaggle, etc.)
  return <Globe className={className} />;
}
