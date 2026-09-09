'use client';

import { useState } from 'react';
import { GraduationCap, Award, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import CardTilt from './CardTilt';
import Badge from '@/components/ui/Badge';

export default function EducationCertifications({ education = [], certifications = [] }) {
  const [activeTab, setActiveTab] = useState('both'); // 'both', 'education', 'certifications'

  const hasEducation = education && education.length > 0;
  const hasCertifications = certifications && certifications.length > 0;

  if (!hasEducation && !hasCertifications) return null;

  return (
    <section id="education" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Qualifications & Credentials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Education & Certifications
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Column 1: Education */}
          {hasEducation && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Formal Education</h3>
              </div>

              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <CardTilt key={edu._id || idx} maxTilt={5}>
                    <div className="p-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{edu.degree}</h4>
                          <p className="text-primary font-medium text-sm mt-0.5">{edu.institution}</p>
                          {edu.field && (
                            <p className="text-xs text-muted-foreground mt-0.5">{edu.field}</p>
                          )}
                        </div>

                        <Badge variant="outline" className="font-mono text-xs">
                          {edu.startDate} – {edu.endDate || 'Present'}
                        </Badge>
                      </div>

                      {edu.description && (
                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </CardTilt>
                ))}
              </div>
            </div>
          )}

          {/* Column 2: Certifications */}
          {hasCertifications && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Certifications & Licenses</h3>
              </div>

              <div className="space-y-6">
                {certifications.map((cert, idx) => (
                  <CardTilt key={cert._id || idx} maxTilt={5}>
                    <div className="p-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-accent/40 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{cert.name}</h4>
                          <p className="text-accent font-medium text-sm mt-0.5">{cert.issuer}</p>
                        </div>

                        <Badge variant="secondary" className="font-mono text-xs">
                          {cert.issueDate}
                        </Badge>
                      </div>

                      {cert.credentialId && (
                        <p className="mt-2 text-xs font-mono text-muted-foreground">
                          Credential ID: {cert.credentialId}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Verified Credential</span>
                        </span>

                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <span>Verify credential</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardTilt>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
