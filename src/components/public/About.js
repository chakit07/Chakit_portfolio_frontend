'use client';

import { MapPin, Compass, CheckCircle2 } from 'lucide-react';
import CardTilt from './CardTilt';

export default function About({ settings }) {
  const profile = settings?.profile || {};
  const stats = profile.stats || [];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Background & Focus
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            About Me
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Biography & Details */}
          <div className="lg:col-span-7 space-y-6 text-muted-foreground leading-relaxed text-base sm:text-lg">
            <p className="text-foreground font-medium text-xl leading-snug">
              {profile.title || 'Senior Full-Stack Developer'}
            </p>

            <p>{profile.bio}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {profile.location && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 border border-border/50 text-sm">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">Location</span>
                    <span className="font-medium text-foreground">{profile.location}</span>
                  </div>
                </div>
              )}

              {profile.currentFocus && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 border border-border/50 text-sm">
                  <Compass className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">Current Focus</span>
                    <span className="font-medium text-foreground">{profile.currentFocus}</span>
                  </div>
                </div>
              )}
            </div>

            {profile.availabilityStatus && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium pt-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{profile.availabilityStatus}</span>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Highlight Statistics Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <CardTilt key={idx} maxTilt={8}>
                <div className="p-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-center text-center h-36">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary font-mono tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground mt-2">
                    {stat.label}
                  </span>
                </div>
              </CardTilt>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
