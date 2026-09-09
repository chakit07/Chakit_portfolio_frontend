'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { SocialPlatformIcon } from './SocialIcon';

export default function Footer({ settings, socialLinks = [] }) {
  const profile = settings?.profile || {};
  const footer = settings?.footer || {};

  if (footer.visible === false) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-md py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand & Tagline */}
          <div className="text-center md:text-left">
            <Link
              href="#hero"
              className="text-lg font-bold font-mono tracking-tight text-foreground hover:opacity-80 transition-opacity"
            >
              {profile.logoText || 'Portfolio'}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {footer.text || 'Crafted with precision using Next.js, Node.js Express, Three.js, and MongoDB.'}
            </p>
          </div>

          {/* Social Links */}
          {socialLinks && socialLinks.length > 0 && (
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
                    className="p-2 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <SocialPlatformIcon platform={link.platform} size={16} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Back to top & Copyright */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{footer.copyright || '© 2026 All rights reserved.'}</span>

            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="p-2 rounded-xl border border-border/60 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
