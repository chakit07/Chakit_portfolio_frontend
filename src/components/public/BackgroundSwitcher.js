'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Waves, Gem, Orbit, Disc, EyeOff, ChevronUp, Check } from 'lucide-react';

const PRESETS = [
  {
    id: 'constellation',
    name: 'Constellation',
    desc: '3D neural galaxy & connected starfield',
    icon: Sparkles,
    gradient: 'from-sky-500 to-indigo-500'
  },
  {
    id: 'cyber-waves',
    name: 'Cyber Waves',
    desc: '3D undulating synthwave horizon grid',
    icon: Waves,
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'prism-crystals',
    name: 'Prism Crystals',
    desc: '3D tumbling glass geometric polyhedra',
    icon: Gem,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'energy-helix',
    name: 'Energy Helix',
    desc: '3D dual particle ribbon vortex',
    icon: Orbit,
    gradient: 'from-indigo-500 to-cyan-400'
  },
  {
    id: 'floating-orbs',
    name: 'Floating Orbs',
    desc: '3D ethereal ambient luminous spheres',
    icon: Disc,
    gradient: 'from-emerald-400 to-teal-600'
  },
  {
    id: 'none',
    name: 'Minimal Canvas',
    desc: 'Soft 2D gradient aurora orbs',
    icon: EyeOff,
    gradient: 'from-slate-400 to-slate-600'
  }
];

export default function BackgroundSwitcher() {
  const { backgroundPreset = 'constellation', setBackgroundPreset, theme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  const currentPreset = PRESETS.find((p) => p.id === backgroundPreset) || PRESETS[0];
  const IconComponent = currentPreset.icon;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-6 z-50 select-none font-sans"
    >
      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-3 w-80 max-w-[calc(100vw-3rem)] rounded-2xl border border-border/70 bg-background/90 p-3 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: theme === 'dark'
                ? '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.15)'
                : '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 20px rgba(59, 130, 246, 0.1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    3D Backgrounds
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Real-time WebGL {theme === 'dark' ? '• Dark Mode' : '• Light Mode'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
                5 Styles
              </span>
            </div>

            {/* Presets List */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {PRESETS.map((preset) => {
                const ItemIcon = preset.icon;
                const isSelected = backgroundPreset === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBackgroundPreset(preset.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-primary/15 border border-primary/40 shadow-sm'
                        : 'hover:bg-secondary/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-tr ${preset.gradient} shadow-sm flex-shrink-0`}
                      >
                        <ItemIcon size={14} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {preset.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {preset.desc}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customize 3D Background"
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full border border-border/80 bg-background/85 hover:bg-background text-foreground shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        style={{
          boxShadow: theme === 'dark'
            ? '0 8px 25px -6px rgba(0, 0, 0, 0.5), 0 0 14px rgba(99, 102, 241, 0.2)'
            : '0 8px 25px -6px rgba(0, 0, 0, 0.1), 0 0 14px rgba(59, 130, 246, 0.15)'
        }}
      >
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-white bg-gradient-to-tr ${currentPreset.gradient} shadow-xs`}
        >
          <IconComponent size={11} />
        </div>
        <span className="text-xs font-semibold tracking-tight text-foreground">
          3D: {currentPreset.name}
        </span>
        <ChevronUp
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'group-hover:-translate-y-0.5'
          }`}
        />
      </button>
    </div>
  );
}
