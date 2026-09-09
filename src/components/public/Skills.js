'use client';

import { useState } from 'react';
import CardTilt from './CardTilt';
import Badge from '@/components/ui/Badge';
import { Cpu, Code, Layers, Server, Cloud, Wrench } from 'lucide-react';

export default function Skills({ skills = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter skills by category if not 'all'
  const categories = skills || [];

  const categoryIconMap = {
    languages: Code,
    'frontend & ui': Layers,
    'backend & data': Server,
    'devops & tooling': Cloud,
    default: Cpu
  };

  return (
    <section id="skills" className="py-24 bg-secondary/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Technical Arsenal
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Skills & Capabilities
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mt-4" />
        </div>

        {/* Category Pills / Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/60'
            }`}
          >
            All Categories
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

        {/* Skill Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories
            .filter((cat) => selectedCategory === 'all' || selectedCategory === cat._id)
            .map((cat) => {
              const catKey = cat.name.toLowerCase();
              const IconComp = categoryIconMap[catKey] || categoryIconMap.default;

              return (
                <CardTilt key={cat._id} maxTilt={6} className="h-full">
                  <div className="p-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/40 transition-all h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border/40">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-base text-foreground tracking-tight">
                        {cat.name}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      {cat.skills.map((skill) => (
                        <div
                          key={skill._id}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/40 transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                          {skill.proficiency && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground font-mono">
                              {skill.proficiency}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardTilt>
              );
            })}
        </div>

      </div>
    </section>
  );
}
