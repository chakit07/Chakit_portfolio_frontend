'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  FolderGit2,
  Cpu,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  ImageIcon,
  Plus,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStats();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load database statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-3" />
        <p className="text-xs font-mono text-muted-foreground animate-pulse">
          Loading metrics...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-2xl bg-destructive/10 text-destructive">
        <p className="font-semibold">Error: {error || 'Unable to retrieve statistics.'}</p>
        <Button onClick={fetchStats} size="sm" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { counts = {}, recent = {} } = stats;

  const metricCards = [
    {
      title: 'Projects',
      value: counts.projects?.total || 0,
      detail: `${counts.projects?.published || 0} published, ${counts.projects?.draft || 0} drafts`,
      icon: FolderGit2,
      href: '/admin/projects',
      color: 'text-blue-500'
    },
    {
      title: 'Skills',
      value: counts.skills?.total || 0,
      detail: `Across ${counts.skills?.categories || 0} categories`,
      icon: Cpu,
      href: '/admin/skills',
      color: 'text-indigo-500'
    },
    {
      title: 'Work Experience',
      value: counts.experience || 0,
      detail: 'Career milestones',
      icon: Briefcase,
      href: '/admin/experience',
      color: 'text-emerald-500'
    },
    {
      title: 'Certifications',
      value: counts.certifications || 0,
      detail: 'Verified credentials',
      icon: Award,
      href: '/admin/certifications',
      color: 'text-amber-500'
    },
    {
      title: 'Education',
      value: counts.education || 0,
      detail: 'Degrees & institutions',
      icon: GraduationCap,
      href: '/admin/education',
      color: 'text-purple-500'
    },
    {
      title: 'Contact Messages',
      value: counts.messages?.total || 0,
      detail: `${counts.messages?.unread || 0} unread`,
      icon: Mail,
      href: '/admin/messages',
      color: counts.messages?.unread > 0 ? 'text-rose-500' : 'text-slate-500'
    }
  ];

  return (
    <div className="space-y-10">

      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Portfolio Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time counts and direct management across your MongoDB database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/projects">
            <Button size="sm" className="gap-2 shadow-sm shadow-primary/20">
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </Button>
          </Link>
          <Link href="/admin/profile">
            <Button size="sm" variant="secondary" className="gap-2">
              <span>Edit Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} href={card.href}>
              <div className="p-6 rounded-2xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-lg transition-all flex flex-col justify-between h-36 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-xl bg-secondary/80 ${card.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black font-mono tracking-tight text-foreground">
                    {card.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                    <span>{card.detail}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity: Latest Inbound Messages & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Contact Inquiries */}
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>Recent Inquiries</span>
              </div>
              <Link href="/admin/messages" className="text-xs text-primary hover:underline">
                View All
              </Link>
            </div>

            {recent.messages && recent.messages.length > 0 ? (
              <div className="space-y-3">
                {recent.messages.slice(0, 4).map((msg) => (
                  <Link
                    key={msg._id}
                    href="/admin/messages"
                    className="block p-3 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {msg.name}
                      </span>
                      {!msg.isRead && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Unread
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {msg.subject} — {msg.message}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No contact submissions yet.
              </p>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <FolderGit2 className="h-4 w-4 text-primary" />
                <span>Recent Projects</span>
              </div>
              <Link href="/admin/projects" className="text-xs text-primary hover:underline">
                Manage All
              </Link>
            </div>

            {recent.projects && recent.projects.length > 0 ? (
              <div className="space-y-3">
                {recent.projects.slice(0, 4).map((proj) => (
                  <Link
                    key={proj._id}
                    href="/admin/projects"
                    className="block p-3 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {proj.title}
                      </span>
                      <Badge
                        variant={proj.status === 'published' ? 'success' : 'secondary'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {proj.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {proj.category?.name || 'Uncategorized'} • {proj.techStack?.join(', ')}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No projects found. Click Add Project to get started.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
