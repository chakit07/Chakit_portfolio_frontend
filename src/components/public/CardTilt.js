'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function CardTilt({ children, className, maxTilt = 10, disabled = false, ...props }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    // Disable tilt on touch devices or if user prefers reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanTilt(!isTouch && !prefersReducedMotion && !disabled);
  }, [disabled]);

  const handleMouseMove = (e) => {
    if (!canTilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    if (!canTilt) return;
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn('card-3d relative rounded-2xl will-change-transform', className)}
      {...props}
    >
      {children}
    </div>
  );
}
