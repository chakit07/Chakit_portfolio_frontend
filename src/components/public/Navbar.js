'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme-provider';
import { Sun, Moon, Menu, X, FileText, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getMediaUrl } from '@/lib/api';

export default function Navbar({ settings, sections = [] }) {
  const { theme, setTheme, mounted } = useTheme();
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Active section scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sectionElements = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 120;

      sectionElements.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Filter only visible sections for nav links
  const visibleNavSections = (sections || [])
    .filter((s) => s.visible && s.id !== 'hero')
    .sort((a, b) => a.order - b.order);

  const profile = settings?.profile || {};
  const logoText = profile.logoText || 'Portfolio';
  const resumeUrl = profile.resumeUrl;
  const showResume = profile.resumeButtonVisible !== false;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/60 shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="#hero"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          {profile.logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getMediaUrl(profile.logoImage)} alt={logoText} className="h-8 w-auto object-contain rounded" />
          ) : (
            <span className="font-mono bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {logoText}
            </span>
          )}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-secondary/50 p-1.5 border border-border/40 backdrop-blur-md">
          <Link
            href="#hero"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeSection === 'hero'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            }`}
          >
            Home
          </Link>
          {visibleNavSections.map((sec) => (
            <Link
              key={sec.id}
              href={`#${sec.id}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                activeSection === sec.id
                  ? 'bg-background text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              {sec.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions: Theme Toggle & Resume & Admin */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              className="p-2 rounded-xl border border-border/60 bg-secondary/60 text-foreground transition-colors hover:bg-accent/20 hover:border-accent"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>
          )}

          {/* Resume Download CTA */}
          {showResume && resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Resume</span>
              </Button>
            </a>
          )}

          <Link href="#contact">
            <Button size="sm" className="gap-1.5 shadow-md shadow-primary/20">
              <span>Let&apos;s Talk</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-border/50 text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg border border-border/50 text-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-2">
            <Link
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-lg text-base font-medium text-foreground hover:bg-secondary"
            >
              Home
            </Link>
            {visibleNavSections.map((sec) => (
              <Link
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-base font-medium capitalize text-foreground hover:bg-secondary"
              >
                {sec.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-border/60 flex flex-col gap-2">
              {showResume && resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full gap-2 justify-center">
                    <FileText className="h-4 w-4" />
                    <span>Download Resume</span>
                  </Button>
                </a>
              )}
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center">Let&apos;s Talk</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
