'use client';

import { useEffect } from 'react';
import { api, getMediaUrl } from '@/lib/api';

function setBrowserFavicon(rawUrl) {
  if (typeof document === 'undefined') return;

  const url = rawUrl ? getMediaUrl(rawUrl) : '/favicon.svg';

  // Determine correct MIME type
  const cleanPath = url.split('?')[0].toLowerCase();
  let mime = 'image/x-icon';
  if (cleanPath.endsWith('.png')) mime = 'image/png';
  else if (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg')) mime = 'image/jpeg';
  else if (cleanPath.endsWith('.svg')) mime = 'image/svg+xml';
  else if (cleanPath.endsWith('.webp')) mime = 'image/webp';
  else if (cleanPath.endsWith('.gif')) mime = 'image/gif';

  // Remove ALL existing icon links in <head> so browser doesn't conflict
  const existing = document.querySelectorAll("link[rel*='icon']");
  existing.forEach((el) => el.remove());

  // Cache buster to ensure the browser tab refreshes the favicon immediately
  const finalHref = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;

  // Create standard icon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = mime;
  link.href = finalHref;
  document.head.appendChild(link);

  // Create shortcut icon link
  const shortcut = document.createElement('link');
  shortcut.rel = 'shortcut icon';
  shortcut.type = mime;
  shortcut.href = finalHref;
  document.head.appendChild(shortcut);
}

export default function FaviconHead() {
  useEffect(() => {
    // Initial fetch from backend
    const loadCurrentFavicon = async () => {
      try {
        let faviconUrl = null;

        // Use public endpoint so non-logged-in visitors don't trigger a 401 in browser console
        try {
          const publicData = await api.getPublicPortfolio();
          faviconUrl = publicData?.data?.settings?.seo?.favicon;
        } catch {
          // fallback
        }

        setBrowserFavicon(faviconUrl || '/favicon.svg');
      } catch {
        setBrowserFavicon('/favicon.svg');
      }
    };

    loadCurrentFavicon();

    // Listen for live updates when admin updates or uploads a new favicon
    const handleSettingsUpdate = (e) => {
      const updatedFavicon = e?.detail?.seo?.favicon;
      if (updatedFavicon !== undefined) {
        setBrowserFavicon(updatedFavicon || '/favicon.svg');
      }
    };

    window.addEventListener('admin-settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('admin-settings-updated', handleSettingsUpdate);
    };
  }, []);

  return null;
}
