'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import About from '@/components/public/About';
import Skills from '@/components/public/Skills';
import Experience from '@/components/public/Experience';
import Projects from '@/components/public/Projects';
import EducationCertifications from '@/components/public/EducationCertifications';
import Contact from '@/components/public/Contact';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPublicPortfolio();
      if (res && res.data) {
        setData(res.data);
      } else {
        setError('No data received from API.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to the API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="relative w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading portfolio...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio Service Offline</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          The backend API server at port 5000 is currently unreachable. Make sure the backend server is running.
        </p>
        <Button onClick={fetchPortfolio} className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  const {
    settings = {},
    projectCategories = [],
    projects = [],
    skills = [],
    experience = [],
    education = [],
    certifications = [],
    socialLinks = []
  } = data || {};

  // Sort sections by their configured order
  const configuredSections = settings?.sections && settings.sections.length > 0
    ? [...settings.sections].sort((a, b) => a.order - b.order)
    : [
        { id: 'hero', name: 'Hero', order: 1, visible: true },
        { id: 'about', name: 'About', order: 2, visible: true },
        { id: 'skills', name: 'Skills', order: 3, visible: true },
        { id: 'experience', name: 'Experience', order: 4, visible: true },
        { id: 'projects', name: 'Projects', order: 5, visible: true },
        { id: 'education', name: 'Education & Certifications', order: 6, visible: true },
        { id: 'contact', name: 'Contact', order: 7, visible: true }
      ];

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'hero':
        return <Hero key="hero" settings={settings} socialLinks={socialLinks} />;
      case 'about':
        return <About key="about" settings={settings} />;
      case 'skills':
        return skills.length > 0 ? <Skills key="skills" skills={skills} /> : null;
      case 'experience':
        return experience.length > 0 ? <Experience key="experience" experience={experience} /> : null;
      case 'projects':
        return projects.length > 0 ? (
          <Projects key="projects" projects={projects} categories={projectCategories} />
        ) : null;
      case 'education':
        return (education.length > 0 || certifications.length > 0) ? (
          <EducationCertifications
            key="education"
            education={education}
            certifications={certifications}
          />
        ) : null;
      case 'contact':
        return <Contact key="contact" settings={settings} socialLinks={socialLinks} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <Navbar settings={settings} sections={configuredSections} />

      {/* Main Dynamic Ordered Sections */}
      <main className="flex-grow">
        {configuredSections
          .filter((sec) => sec.visible !== false)
          .map((sec) => renderSection(sec.id))}
      </main>

      {/* Footer */}
      <Footer settings={settings} socialLinks={socialLinks} />
    </div>
  );
}
