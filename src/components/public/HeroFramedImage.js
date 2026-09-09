'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * HeroFramedImage
 * Renders an uploaded portrait or hero visual with 6 selectable border styles.
 * The admin controls: borderEffect, borderColor, borderWidth, borderRadius.
 */
export default function HeroFramedImage({
  src,
  alt = 'Hero Visual',
  accentColor = '#6366f1',
  borderEffect = 'glow-gradient',
  borderColor = '',           // custom override colour (hex)
  borderWidth = 2,            // px (for styles that honour it)
  borderRadius = 'xl',        // 'none'|'sm'|'md'|'lg'|'xl'|'2xl'|'full'
  cardTilt = true,
  className = ''
}) {
  const containerRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const effectColor = borderColor || accentColor;

  // Border radius map
  const radiusMap = {
    none: '0px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px'
  };
  const innerRadiusMap = {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '22px',
    '2xl': '30px',
    full: '9999px'
  };
  const br = radiusMap[borderRadius] || radiusMap['xl'];
  const brInner = innerRadiusMap[borderRadius] || innerRadiusMap['xl'];

  // Smooth mouse-tracking parallax tilt
  const handleMouseMove = (e) => {
    if (!cardTilt || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -9);
    setRotateY(((x - centerX) / centerX) * 9);
  };
  const handleMouseLeave = () => { setIsHovered(false); setRotateX(0); setRotateY(0); };
  const handleMouseEnter = () => setIsHovered(true);

  const imgCls = 'max-h-[420px] w-auto max-w-[340px] sm:max-w-[400px] object-cover transition-transform duration-500 group-hover:scale-[1.01]';

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY, scale: isHovered ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, mass: 0.6 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={`relative group flex items-center justify-center select-none cursor-pointer ${className}`}
    >
      {/* ═══════════════════════════════════════════════════════════
          PRESET 1 — GLOW GRADIENT (Glowing Gradient Rim + Aura)
      ═══════════════════════════════════════════════════════════ */}
      {borderEffect === 'glow-gradient' && (
        <>
          <div
            className="absolute -inset-3 blur-2xl opacity-45 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none"
            style={{
              borderRadius: br,
              background: `radial-gradient(circle, ${effectColor} 0%, rgba(99,102,241,0.4) 50%, transparent 75%)`
            }}
          />
          <div
            className="relative shadow-2xl transition-shadow duration-500 group-hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.5)]"
            style={{
              padding: `${Math.max(2, borderWidth)}px`,
              borderRadius: br,
              background: `linear-gradient(135deg, ${effectColor}, #818cf8, #38bdf8, ${effectColor})`
            }}
          >
            <div className="relative overflow-hidden bg-background/90 border border-white/10 backdrop-blur-md" style={{ borderRadius: brInner }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className={imgCls} style={{ borderRadius: brInner }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" style={{ borderRadius: brInner }} />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" style={{ borderRadius: `0 0 ${brInner} ${brInner}` }} />
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRESET 2 — CYBER NEON (Futuristic Tech Frame)
      ═══════════════════════════════════════════════════════════ */}
      {borderEffect === 'cyber-neon' && (
        <>
          <div
            className="absolute -inset-2 blur-xl opacity-40 group-hover:opacity-65 transition-opacity duration-500 pointer-events-none"
            style={{ borderRadius: br, background: effectColor }}
          />
          <div
            className="relative shadow-2xl transition-all duration-300"
            style={{
              padding: `${Math.max(2, borderWidth)}px`,
              borderRadius: br,
              background: `linear-gradient(135deg, ${effectColor}, #38bdf8, ${effectColor})`,
              boxShadow: `0 0 30px ${effectColor}40`
            }}
          >
            <div className="relative overflow-hidden bg-card/95 border border-white/10" style={{ borderRadius: brInner }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className={imgCls} style={{ borderRadius: brInner }} />
              <span className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none drop-shadow-[0_0_6px_#38bdf8]" />
              <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none drop-shadow-[0_0_6px_#38bdf8]" />
              <span className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none drop-shadow-[0_0_6px_#38bdf8]" />
              <span className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none drop-shadow-[0_0_6px_#38bdf8]" />
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-background/80 border border-primary/40 backdrop-blur-md flex items-center gap-1.5 shadow-sm pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRESET 3 — GLASS CARD (Frosted Glassmorphic Frame)
      ═══════════════════════════════════════════════════════════ */}
      {borderEffect === 'glass-card' && (
        <>
          <div
            className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl opacity-50 pointer-events-none"
            style={{ borderRadius: br }}
          />
          <div
            className="relative bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/40"
            style={{ padding: '12px', borderRadius: br }}
          >
            <div className="relative overflow-hidden border border-white/20 shadow-inner" style={{ borderRadius: brInner }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className={imgCls} style={{ borderRadius: brInner }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRESET 4 — MINIMAL CLEAN (Sleek Rounded Studio)
      ═══════════════════════════════════════════════════════════ */}
      {borderEffect === 'minimal-clean' && (
        <div
          className="relative bg-card/60 shadow-2xl shadow-primary/10 transition-colors duration-300 group-hover:border-primary/60"
          style={{
            padding: `${Math.max(1, borderWidth)}px`,
            borderRadius: br,
            border: `${borderWidth}px solid ${effectColor}40`
          }}
        >
          <div className="relative overflow-hidden" style={{ borderRadius: brInner }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className={imgCls} style={{ borderRadius: brInner }} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRESET 5 — SPIN CONIC (Animated Rotating Gradient Border)
      ═══════════════════════════════════════════════════════════ */}
      {borderEffect === 'spin-conic' && (
        <>
          {/* Aura glow */}
          <div
            className="absolute -inset-2 blur-xl opacity-30 group-hover:opacity-55 transition-opacity duration-700 pointer-events-none"
            style={{ borderRadius: br, background: effectColor }}
          />
          {/* Spinning conic container — CSS animation via inline keyframe override */}
          <div
            className="relative"
            style={{
              padding: `${Math.max(3, borderWidth + 1)}px`,
              borderRadius: br,
              background: `conic-gradient(from 0deg, ${effectColor}, #818cf8, #38bdf8, #a78bfa, ${effectColor})`,
              animation: 'hero-spin-border 3s linear infinite',
            }}
          >
            <div className="relative overflow-hidden bg-background" style={{ borderRadius: brInner }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className={imgCls} style={{ borderRadius: brInner }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none" style={{ borderRadius: brInner }} />
            </div>
          </div>
          <style>{`
            @keyframes hero-spin-border {
              from { filter: hue-rotate(0deg); }
              to   { filter: hue-rotate(360deg); }
            }
          `}</style>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRESET 6 — BLOB OUTLINE (Organic Morphing Border)
      ═══════════════════════════════════════════════════════════ */}
      {borderEffect === 'blob-outline' && (
        <>
          {/* Morphing blob aura behind */}
          <div
            className="absolute -inset-4 opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${effectColor} 0%, transparent 65%)`,
              borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
              animation: 'hero-blob-morph 8s ease-in-out infinite',
              filter: 'blur(18px)'
            }}
          />
          <div
            className="relative overflow-hidden shadow-2xl"
            style={{
              padding: `${Math.max(3, borderWidth + 1)}px`,
              background: `linear-gradient(135deg, ${effectColor}, #818cf8 50%, #38bdf8)`,
              borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
              animation: 'hero-blob-morph 8s ease-in-out infinite',
            }}
          >
            <div
              className="overflow-hidden bg-background"
              style={{
                borderRadius: '58% 42% 53% 47% / 48% 58% 42% 52%',
                animation: 'hero-blob-morph 8s ease-in-out infinite reverse',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-h-[420px] w-auto max-w-[340px] sm:max-w-[400px] object-cover"
                style={{
                  borderRadius: '58% 42% 53% 47% / 48% 58% 42% 52%',
                  animation: 'hero-blob-morph 8s ease-in-out infinite reverse',
                }}
              />
            </div>
          </div>
          <style>{`
            @keyframes hero-blob-morph {
              0%,100% { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
              33%      { border-radius: 40% 60% 45% 55% / 60% 40% 60% 40%; }
              66%      { border-radius: 55% 45% 60% 40% / 40% 55% 45% 55%; }
            }
          `}</style>
        </>
      )}
    </motion.div>
  );
}
