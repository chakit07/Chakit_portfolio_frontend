'use client';

import { useEffect, useRef } from 'react';

/**
 * BackgroundCanvas — renders an animated canvas background with:
 *  - Floating, soft radial gradient "orbs" that drift slowly
 *  - A subtle dot-grid overlay
 *  - A slow aurora shimmer layer
 * Works in both light and dark mode.
 */
export default function BackgroundCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isDark = () => document.documentElement.classList.contains('dark');

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

    const orbs = [
      { x: 0.15, y: 0.20, r: 0.32, dx: 0.00008, dy: 0.00005, phase: 0.0, colorDark: [99, 102, 241], colorLight: [99, 102, 241] },
      { x: 0.75, y: 0.15, r: 0.28, dx: -0.00006, dy: 0.00007, phase: 1.2, colorDark: [59, 130, 246], colorLight: [59, 130, 246] },
      { x: 0.85, y: 0.65, r: 0.26, dx: -0.00007, dy: -0.00004, phase: 2.4, colorDark: [139, 92, 246], colorLight: [99, 102, 241] },
      { x: 0.20, y: 0.75, r: 0.22, dx: 0.00009, dy: -0.00006, phase: 0.8, colorDark: [16, 185, 129], colorLight: [16, 185, 129] },
      { x: 0.50, y: 0.45, r: 0.20, dx: -0.00005, dy: 0.00008, phase: 3.6, colorDark: [244, 114, 182], colorLight: [219, 39, 119] },
    ];

    const GRID_SPACING = 36;
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
        const alpha = dark ? 0.18 : 0.10;

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        grad.addColorStop(0, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0)`);

        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      const auroraY = H * 0.25 + Math.sin(t * 0.008) * H * 0.06;
      const auroraGrad = ctx.createLinearGradient(0, auroraY - 120, 0, auroraY + 120);
      if (dark) {
        auroraGrad.addColorStop(0, 'rgba(99,102,241,0)');
        auroraGrad.addColorStop(0.3, `rgba(99,102,241,${0.04 + Math.sin(t * 0.012) * 0.02})`);
        auroraGrad.addColorStop(0.6, `rgba(59,130,246,${0.05 + Math.cos(t * 0.009) * 0.02})`);
        auroraGrad.addColorStop(1, 'rgba(59,130,246,0)');
      } else {
        auroraGrad.addColorStop(0, 'rgba(99,102,241,0)');
        auroraGrad.addColorStop(0.4, `rgba(99,102,241,${0.035 + Math.sin(t * 0.012) * 0.015})`);
        auroraGrad.addColorStop(0.7, `rgba(59,130,246,${0.03 + Math.cos(t * 0.009) * 0.01})`);
        auroraGrad.addColorStop(1, 'rgba(59,130,246,0)');
      }
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, auroraY - 120, W, 240);

      const dotAlpha = dark ? 0.18 : 0.12;
      const dotColor = dark
        ? `rgba(148, 163, 184, ${dotAlpha})`
        : `rgba(100, 116, 139, ${dotAlpha})`;
      ctx.fillStyle = dotColor;
      for (let gx = GRID_SPACING / 2; gx < W; gx += GRID_SPACING) {
        for (let gy = GRID_SPACING / 2; gy < H; gy += GRID_SPACING) {
          const dx = gx - W / 2;
          const dy = gy - H / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pulse = Math.sin(t * 0.025 - dist * 0.008) * 0.4 + 0.6;
          const r = 1.2 * pulse;
          ctx.beginPath();
          ctx.arc(gx, gy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
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
  );
}
