'use client';

import { Briefcase, Calendar, MapPin, ExternalLink } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import CardTilt from './CardTilt';

export default function Experience({ experience = [] }) {
  if (!experience || experience.length === 0) return null;

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Career Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Work Experience
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mt-4" />
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-border/80 ml-4 sm:ml-32 space-y-12 pl-6 sm:pl-10">
          {experience.map((item, idx) => (
            <div key={item._id || idx} className="relative group">

              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary shadow-sm group-hover:scale-125 transition-transform" />

              {/* Left Date Label on wider screens */}
              <div className="hidden sm:block absolute -left-36 top-1 text-right w-24">
                <span className="text-xs font-bold font-mono text-primary uppercase">
                  {item.startDate}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {item.endDate || (item.isCurrent ? 'Present' : '')}
                </span>
              </div>

              {/* Experience Card */}
              <CardTilt maxTilt={5}>
                <div className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm hover:shadow-md hover:border-primary/40 transition-all">

                  {/* Header: Role, Company, Badges */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">
                          {item.role}
                        </h3>
                        {item.isCurrent && (
                          <Badge variant="success" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm font-medium text-muted-foreground">
                        <span className="text-foreground font-semibold flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-primary" />
                          {item.company}
                        </span>

                        {item.employmentType && (
                          <span>• {item.employmentType}</span>
                        )}

                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Date indicator */}
                    <div className="sm:hidden flex items-center gap-1.5 text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.startDate} – {item.endDate || 'Present'}</span>
                    </div>

                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <span>Visit site</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Bullet Points */}
                  {item.bullets && item.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {item.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardTilt>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
