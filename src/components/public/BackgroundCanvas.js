'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Background3D = dynamic(() => import('./Background3D'), { ssr: false });

/**
 * BackgroundCanvas:
 * Renders the chosen 3D WebGL background animation (Constellation, Cyber Waves,
 * Prism Crystals, Energy Helix, Floating Orbs) with automatic light & dark mode
 * color balancing and a high-performance 2D gradient fallback for reduced motion.
 * Hidden on /admin routes.
 */
export default function BackgroundCanvas() {
  const pathname = usePathname();
  const { theme, accentColor, backgroundPreset = 'constellation', animationSpeed = 1.0, mounted } = useTheme();
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Don't render the 3D background on any admin page
  if (pathname?.startsWith('/admin')) return null;

  // Check WebGL and reduced motion
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // 2D Canvas Fallback (Used when preset === 'none' or reduced motion or no WebGL)
  const is2DFallback = backgroundPreset === 'none' || prefersReducedMotion || !hasWebGL;

  useEffect(() => {
    if (!is2DFallback) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = Math.max(window.innerHeight, document.body.scrollHeight);
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener('resize', resize);

    const isDark = () => document.documentElement.classList.contains('dark') || theme === 'dark';

    const orbs = [
      { x: 0.15, y: 0.20, r: 0.32, dx: 0.00008, dy: 0.00005, phase: 0.0, colorDark: [99, 102, 241], colorLight: [99, 102, 241] },
      { x: 0.75, y: 0.15, r: 0.28, dx: -0.00006, dy: 0.00007, phase: 1.2, colorDark: [59, 130, 246], colorLight: [59, 130, 246] },
      { x: 0.85, y: 0.65, r: 0.26, dx: -0.00007, dy: -0.00004, phase: 2.4, colorDark: [139, 92, 246], colorLight: [99, 102, 241] },
      { x: 0.20, y: 0.75, r: 0.22, dx: 0.00009, dy: -0.00006, phase: 0.8, colorDark: [16, 185, 129], colorLight: [16, 185, 129] },
    ];

    let t = 0;
    const draw = () => {
      t += 0.4;
      ctx.clearRect(0, 0, W, H);
      const dark = isDark();

      ctx.fillStyle = dark ? 'hsl(224, 71%, 4%)' : 'hsl(210, 40%, 98%)';
      ctx.fillRect(0, 0, W, H);

      orbs.forEach((orb) => {
        const ox = (orb.x + Math.sin(t * orb.dx * 1000 + orb.phase) * 0.12) * W;
        const oy = (orb.y + Math.cos(t * orb.dy * 1000 + orb.phase) * 0.10) * H;
        const radius = orb.r * Math.min(W, H);
        const col = dark ? orb.colorDark : orb.colorLight;
        const alpha = dark ? 0.15 : 0.08;

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        grad.addColorStop(0, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha})`);
        grad.addColorStop(0.6, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha * 0.3})`);
        grad.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0)`);

        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [is2DFallback, theme]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* 3D WebGL Background Animation */}
      {!is2DFallback && (
        <Background3D
          key={`${backgroundPreset}-${theme}`}
          preset={backgroundPreset}
          theme={theme}
          accentColor={accentColor}
          speed={animationSpeed}
        />
      )}

      {/* 2D Canvas Fallback */}
      {is2DFallback && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}
