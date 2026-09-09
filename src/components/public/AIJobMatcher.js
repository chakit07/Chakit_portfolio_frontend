'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  RotateCcw,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

const SAMPLE_JDS = [
  {
    title: 'Full-Stack Engineer',
    text: 'Looking for a Senior Full-Stack Developer proficient in Next.js, Node.js, Express, and MongoDB. Experience designing clean REST APIs, handling secure authentication, and creating responsive, accessible UI components with Tailwind CSS is essential.'
  },
  {
    title: 'Frontend / UI Specialist',
    text: 'Seeking a Creative Frontend Engineer with strong React, Next.js, and Modern CSS skills. Experience with interactive 3D web experiences (Three.js), micro-interactions, responsive design systems, and fast performance optimization is highly preferred.'
  }
];

export default function AIJobMatcher() {
  const toast = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (textToUse) => {
    const jd = textToUse || jobDescription;
    if (!jd || jd.trim().length < 15) {
      const msg = 'Please provide a job description or list of requirements (at least 15 characters).';
      setError(msg);
      toast.warning(msg);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.aiMatchJob(jd.trim());
      if (res?.data) {
        setResult(res.data);
        toast.success(`Role match computed: ${res.data.matchPercentage}% compatibility!`);
      } else {
        const msg = 'Failed to compute job match. Please try again.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.message || 'Error communicating with AI evaluator.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription('');
    setResult(null);
    setError(null);
    toast.info('Role analysis reset.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-xl border border-border shadow-xl relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Recruiter AI Tool
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Role Fit & Skill Compatibility Matcher
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Paste your job requirements to instantly analyze compatibility with Chakit's real skills & projects.
          </p>
        </div>

        {result && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="self-start md:self-auto gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Match
          </Button>
        )}
      </div>

      {/* Input Section */}
      {!result && (
        <div className="space-y-4 relative z-10">
          <div>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (error) setError(null);
              }}
              rows={5}
              placeholder="Paste job description, required tech stack, or role responsibilities here..."
              className="w-full rounded-2xl bg-muted/50 border border-border/80 focus:border-primary p-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition resize-y font-sans"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sample Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Try sample:
            </span>
            {SAMPLE_JDS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setJobDescription(sample.text);
                  handleAnalyze(sample.text);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-primary/10 hover:text-primary border border-border/60 transition font-medium"
              >
                {sample.title}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <Button
              onClick={() => handleAnalyze()}
              disabled={loading || !jobDescription.trim()}
              className="w-full sm:w-auto px-6 py-2.5 gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Role Compatibility
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="space-y-6 relative z-10 animate-fade-in">
          {/* Top Score Banner */}
          <div className="p-5 rounded-2xl bg-secondary/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg shadow-primary/20">
                  {result.matchScore}%
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">Compatibility Score</span>
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold">
                    {result.verdict || 'Strong Match'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
                  {result.summary}
                </p>
              </div>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shrink-0"
            >
              Discuss Opportunity
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-2xl bg-card border border-border/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Direct Skill Matches ({result.matchedSkills?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Growth / Ramp-up Areas */}
            <div className="p-4 rounded-2xl bg-card border border-border/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                <Layers className="w-4 h-4" />
                Additional / Transferable Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingOrGrowthSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                  >
                    • {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Relevant Projects */}
          {result.recommendedProjects?.length > 0 && (
            <div className="p-5 rounded-2xl bg-card border border-border/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                <Briefcase className="w-4 h-4" />
                Top Relevant Projects to Evaluate
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommendedProjects.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{p.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {p.reason}
                      </p>
                    </div>
                    {p.slug && (
                      <Link
                        href={`/projects/${p.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline"
                      >
                        View Case Study
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
