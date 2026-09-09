'use client';

import { useState } from 'react';
import Link from 'next/link';
import CardTilt from './CardTilt';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ExternalLink, Github, Star, ArrowUpRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';

export default function Projects({ projects = [], categories = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter projects by category
  const filteredProjects = projects.filter((p) => {
    if (selectedCategory === 'all') return true;
    const catId = p.category?._id || p.category;
    return catId === selectedCategory;
  });

  return (
    <section id="projects" className="py-24 bg-secondary/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Selected Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Featured Projects
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mt-4" />
        </div>

        {/* Category Filters */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border/60'
              }`}
            >
              All Works
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat._id
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <CardTilt key={project._id} maxTilt={8} className="h-full">
              <div className="group h-full flex flex-col rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300">

                {/* Thumbnail / Header Graphic */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted/60 flex items-center justify-center border-b border-border/40">
                  {project.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaUrl(project.thumbnail)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/15 via-accent/10 to-muted flex items-center justify-center p-6 text-center">
                      <span className="font-mono text-xl font-bold text-foreground/70 group-hover:scale-105 transition-transform">
                        {project.title}
                      </span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-500/90 text-white font-medium gap-1 shadow-sm backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-current" />
                        <span>Featured</span>
                      </Badge>
                    </div>
                  )}

                  {/* Category Pill */}
                  {project.category?.name && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-xs">
                        {project.category.name}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors flex items-center justify-between">
                      <Link href={`/projects/${project.slug}`}>
                        <span>{project.title}</span>
                      </Link>
                      <Link
                        href={`/projects/${project.slug}`}
                        aria-label={`View details of ${project.title}`}
                        className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </Link>
                    </h3>

                    <p className="mt-2.5 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50">
                    {/* Tech Stack Pills */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.slice(0, 5).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-secondary/80 text-[11px] font-mono text-muted-foreground border border-border/40"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 5 && (
                          <span className="text-[11px] font-mono text-muted-foreground self-center">
                            +{project.techStack.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/projects/${project.slug}`} className="text-xs font-semibold text-primary hover:underline">
                        Details & Case Study →
                      </Link>

                      <div className="flex items-center gap-2">
                        {project.repoUrl && (
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub Repository"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}

                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Live Demo"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </CardTilt>
          ))}
        </div>

      </div>
    </section>
  );
}
