'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api, getMediaUrl } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Star,
  Lock,
  Monitor,
  Eye,
  RotateCcw,
  Globe
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const slug = params?.slug;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('live'); // 'live' | 'image'
  const [iframeKey, setIframeKey] = useState(0);

  // AI Perspectives Lens State
  const [activeMode, setActiveMode] = useState('tldr');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');

  const handleFetchSummary = async (mode) => {
    if (!slug) return;
    setActiveMode(mode);
    setSummaryLoading(true);
    try {
      const res = await api.aiSummarizeProject(slug, mode);
      if (res?.data?.summary) {
        setSummaryContent(res.data.summary);
        toast.success('Generated perspective!');
      }
    } catch (err) {
      console.warn('Failed to generate summary:', err.message);
      toast.error(err.message || 'Could not generate perspective.');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getPublicProject(slug);
        if (res && res.data) {
          setProject(res.data);
          // Set initial view mode based on whether liveUrl is available
          if (!res.data.liveUrl) {
            setViewMode('image');
          }
        } else {
          setError('Project not found.');
        }
      } catch (err) {
        setError(err.message || 'Project not found or is currently not published.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading case study...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Project Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {error || 'The requested project case study could not be found or is in draft mode.'}
        </p>
        <Link href="/#projects" className="mt-6">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header Navigation */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-30 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/#projects">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Portfolio</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline">Source Code</span>
                </Button>
              </a>
            )}

            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-2 shadow-sm shadow-primary/20">
                  <span>Live Demo</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Case Study Article */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* Project Header Info */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {project.category?.name && (
              <Badge variant="secondary" className="text-xs">
                {project.category.name}
              </Badge>
            )}
            {project.featured && (
              <Badge className="bg-amber-500/90 text-white gap-1">
                <Star className="h-3 w-3 fill-current" />
                <span>Featured Project</span>
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {project.title}
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {project.summary}
          </p>

          {/* Tech Stack Pills */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-secondary text-xs font-mono font-medium text-foreground border border-border/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Browser Mockup Window with Live Preview / Image View */}
        <div className="w-full rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-card">
          {/* Top Browser Window Toolbar */}
          <div className="bg-muted/80 backdrop-blur-md px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4 select-none">
            {/* macOS Control Dots */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            {/* Fake URL Address Bar */}
            <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-background/80 border border-border/60 text-xs font-mono text-muted-foreground truncate">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate text-foreground/90 font-medium">
                {project.liveUrl || `https://${project.slug || 'portfolio'}.demo.com`}
              </span>
            </div>

            {/* View Mode & Action Controls */}
            <div className="flex items-center gap-2">
              {project.liveUrl && (
                <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl border border-border/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('live')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                      viewMode === 'live'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Live Site</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('image')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                      viewMode === 'image'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Snapshot</span>
                  </button>
                </div>
              )}

              {project.liveUrl && viewMode === 'live' && (
                <button
                  type="button"
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  title="Reload Live Preview"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Live Website in New Tab"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Browser Window Content Body */}
          <div className="relative w-full bg-background overflow-hidden">
            {viewMode === 'live' && project.liveUrl ? (
              <div className="relative w-full h-[500px] sm:h-[650px]">
                <iframe
                  key={iframeKey}
                  src={project.liveUrl}
                  title={`${project.title} Live Preview`}
                  className="w-full h-full border-0 bg-white"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ) : project.thumbnail ? (
              <div className="relative aspect-video w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(project.thumbnail)}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center min-h-[350px]">
                <Globe className="w-10 h-10 mb-2 opacity-40 text-primary" />
                <span>No live preview or image available for this project.</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Lens & Perspectives Box */}
        <div className="p-6 rounded-3xl bg-secondary/40 border border-primary/20 backdrop-blur-md shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Perspectives Lens</h3>
                <p className="text-xs text-muted-foreground">Tailor this case study for your background</p>
              </div>
            </div>

            {/* Mode Selectors */}
            <div className="flex flex-wrap items-center gap-1.5 bg-card/80 p-1 rounded-2xl border border-border">
              {[
                { id: 'tldr', label: '⚡ Recruiter TL;DR' },
                { id: 'technical', label: '🛠️ Tech Lead Deep Dive' },
                { id: 'simple', label: '💡 Layman View' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleFetchSummary(m.id)}
                  disabled={summaryLoading}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeMode === m.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Summary Content Display */}
          {summaryLoading && (
            <div className="p-4 rounded-2xl bg-card/60 border border-border/60 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Generating {activeMode} perspective...</span>
            </div>
          )}

          {!summaryLoading && summaryContent && (
            <div className="p-5 rounded-2xl bg-card/90 border border-primary/30 shadow-sm animate-fade-in space-y-2">
              <div className="flex items-center justify-between text-xs text-primary font-semibold uppercase tracking-wider">
                <span>Perspective: {activeMode === 'tldr' ? 'Recruiter TL;DR' : activeMode === 'technical' ? 'Tech Lead Deep-Dive' : 'Non-Technical Analogy'}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(summaryContent);
                    toast.success('Perspective copied to clipboard!');
                  }}
                  className="text-muted-foreground hover:text-foreground text-[11px] underline"
                >
                  Copy
                </button>
              </div>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {summaryContent}
              </div>
            </div>
          )}
        </div>

        {/* Full Detailed Description */}
        {project.description && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h2 className="text-2xl font-bold text-foreground">Overview & Architecture</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {project.description}
            </div>
          </div>
        )}

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h2 className="text-2xl font-bold text-foreground">Visual Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.gallery.map((imgUrl, gIdx) => (
                <div key={gIdx} className="rounded-2xl overflow-hidden border border-border/60 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getMediaUrl(imgUrl)} alt={`${project.title} Screenshot ${gIdx + 1}`} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Features */}
        {project.features && project.features.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h2 className="text-2xl font-bold text-foreground">Key Technical Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.features.map((feat, fIdx) => (
                <div key={fIdx} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenges & Solutions */}
        {(project.challenges?.length > 0 || project.solutions?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
            {project.challenges?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-amber-500 font-bold text-xl">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Key Challenges</span>
                </div>
                <ul className="space-y-3">
                  {project.challenges.map((c, cIdx) => (
                    <li key={cIdx} className="p-4 rounded-2xl border border-border/60 bg-secondary/30 text-sm text-muted-foreground leading-relaxed">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.solutions?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-primary font-bold text-xl">
                  <Lightbulb className="h-5 w-5" />
                  <span>Implemented Solutions</span>
                </div>
                <ul className="space-y-3">
                  {project.solutions.map((s, sIdx) => (
                    <li key={sIdx} className="p-4 rounded-2xl border border-border/60 bg-secondary/30 text-sm text-muted-foreground leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA bar */}
        <div className="pt-8 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
          <Link href="/#projects">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all projects</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="gap-2">
                  <Github className="h-4 w-4" />
                  <span>GitHub Repository</span>
                </Button>
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  <span>Visit Live Project</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
