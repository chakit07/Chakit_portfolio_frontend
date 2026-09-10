'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import { SocialPlatformIcon } from './SocialIcon';
import Button from '@/components/ui/Button';
import { getMediaUrl } from '@/lib/api';
import HeroFramedImage from './HeroFramedImage';

// Lazy-load Three.js canvas on client with no SSR and a graceful fallback
const ThreeHeroCanvas = dynamic(() => import('./ThreeHeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-64 h-64 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center animate-pulse">
        <Sparkles className="h-8 w-8 text-primary/40" />
      </div>
    </div>
  )
});

export default function Hero({ settings, socialLinks = [] }) {
  const profile = settings?.profile || {};
  const visualEffects = settings?.visualEffects || {
    enabled: true,
    preset: 'laptop',
    accentColor: '#6366f1',
    intensity: 1.0,
    particles: true,
    cardTilt: true,
    enableOnMobile: false
  };

  const roles = profile.roles && profile.roles.length > 0
    ? profile.roles
    : ['Senior Full-Stack Engineer', 'UI/UX & 3D Web Creative', 'Node.js & Next.js Specialist'];

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  // Rotate roles every 3.2 seconds
  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [roles.length]);



  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background handled by global BackgroundCanvas */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-10rem)]">

          {/* 3D Interactive Visual Canvas / Profile Image (Top on mobile, Right on desktop) */}
          <div className="lg:col-span-5 h-[360px] sm:h-[480px] lg:h-[550px] w-full flex items-center justify-center relative order-1 lg:order-2">
            {visualEffects.enabled ? (
              <ThreeHeroCanvas
                preset={visualEffects.preset || 'laptop'}
                accentColor={visualEffects.accentColor || '#6366f1'}
                intensity={visualEffects.intensity || 1.0}
                particles={visualEffects.particles !== false}
                fallbackImage={getMediaUrl(visualEffects.fallbackImage)}
                imageUrl={getMediaUrl(visualEffects.hologramImage || visualEffects.fallbackImage || profile.profileImage)}
                enableOnMobile={Boolean(visualEffects.enableOnMobile)}
              />
            ) : visualEffects.fallbackImage ? (
              <HeroFramedImage
                src={getMediaUrl(visualEffects.fallbackImage)}
                alt={profile.name || 'Hero Visual'}
                accentColor={visualEffects.accentColor || '#6366f1'}
                borderEffect={visualEffects.imageBorderEffect || 'glow-gradient'}
                borderColor={visualEffects.borderColor || ''}
                borderWidth={visualEffects.borderWidth || 2}
                borderRadius={visualEffects.borderRadius || 'xl'}
                cardTilt={visualEffects.cardTilt !== false}
              />
            ) : profile.profileImage ? (
              <HeroFramedImage
                src={getMediaUrl(profile.profileImage)}
                alt={profile.name || 'Profile Picture'}
                accentColor={visualEffects.accentColor || '#6366f1'}
                borderEffect={visualEffects.imageBorderEffect || 'glow-gradient'}
                borderColor={visualEffects.borderColor || ''}
                borderWidth={visualEffects.borderWidth || 2}
                borderRadius={visualEffects.borderRadius || 'xl'}
                cardTilt={visualEffects.cardTilt !== false}
              />
            ) : (
              <div className="w-64 h-64 rounded-3xl bg-gradient-to-tr from-primary/30 to-accent/30 border border-primary/20 flex items-center justify-center shadow-2xl">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              </div>
            )}
          </div>

          {/* HTML Introduction & CTAs (Bottom on mobile, Left on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left z-10 order-2 lg:order-1">

            {/* Availability Status Badge */}
            {profile.availabilityStatus && (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{profile.availabilityStatus}</span>
              </div>
            )}

            {/* Main Heading & Dynamic Role Text */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                {profile.name || 'Chakit Sharma'}
              </span>
            </h1>

            {/* Animated Role Text */}
            <div className="h-10 sm:h-12 mt-3 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={roles[currentRoleIndex]}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="text-lg sm:text-2xl font-semibold text-muted-foreground font-mono"
                >
                  {roles[currentRoleIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Bio / Headline */}
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {profile.headline || profile.bio || 'Architecting resilient full-stack systems and high-craft interactive web experiences.'}
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#projects">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 group">
                  <span>View Projects</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="#contact">
                <Button size="lg" variant="secondary" className="gap-2">
                  <span>Contact Me</span>
                </Button>
              </Link>

              {profile.resumeUrl && profile.resumeButtonVisible !== false && (
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span>Resume</span>
                  </Button>
                </a>
              )}
            </div>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="mt-10 pt-6 border-t border-border/50 flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Connect:
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.map((link) => {
                    return (
                      <a
                        key={link._id || link.url}
                        href={link.platform?.toLowerCase() === 'email' ? `mailto:${link.url}` : link.url}
                        target={link.platform?.toLowerCase() === 'email' ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        aria-label={link.label || link.platform}
                        title={link.platform}
                        className="p-2 rounded-xl border border-border/60 bg-secondary/50 text-foreground transition-all hover:bg-primary/10 hover:border-primary hover:text-primary"
                      >
                        <SocialPlatformIcon platform={link.platform} size={16} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
