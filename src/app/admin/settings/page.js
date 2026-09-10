'use client';

import { useEffect, useState } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import BookLoader from '@/components/ui/BookLoader';
import Badge from '@/components/ui/Badge';
import {
  Save,
  Sparkles,
  Sliders,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Palette,
  Globe,
  Upload,
  Trash2,
  Layers,
  Camera
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fallbackImageUploading, setFallbackImageUploading] = useState(false);
  const [hologramImageUploading, setHologramImageUploading] = useState(false);
  const [ogImageUploading, setOgImageUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  const [seo, setSeo] = useState({
    siteTitle: '',
    siteDescription: '',
    keywords: [],
    ogImage: '',
    favicon: ''
  });

  const [appearance, setAppearance] = useState({
    accentColor: '#3b82f6',
    defaultTheme: 'dark'
  });

  const [visualEffects, setVisualEffects] = useState({
    enabled: true,
    preset: 'laptop',
    accentColor: '#6366f1',
    intensity: 1.0,
    particles: true,
    cardTilt: true,
    enableOnMobile: false,
    fallbackImage: '',
    hologramImage: '',
    backgroundPreset: 'constellation',
    imageBorderEffect: 'glow-gradient',
    borderColor: '',
    borderWidth: 2,
    borderRadius: 'xl'
  });

  const [sections, setSections] = useState([]);
  const [keywordsInput, setKeywordsInput] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res?.data) {
        setSeo(res.data.seo || {});
        setAppearance(res.data.appearance || {});
        setVisualEffects(res.data.visualEffects || {});
        setSections(res.data.sections || []);
        if (res.data.seo?.keywords) {
          setKeywordsInput(res.data.seo.keywords.join(', '));
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const makeImageUploadHandler = (setter, fieldKey, setUploading) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.data?.url) setter((prev) => ({ ...prev, [fieldKey]: res.data.url }));
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconUploading(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.data?.url) {
        const newFavicon = res.data.url;
        const updatedSeo = { ...seo, favicon: newFavicon };
        setSeo(updatedSeo);
        // Auto-save immediately to database so favicon applies right away
        await api.updateSettings({ seo: updatedSeo });
        toast.success('Favicon uploaded & applied to browser tab!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('admin-settings-updated', { detail: { seo: updatedSeo } }));
        }
      }
    } catch (err) {
      toast.error(err.message || 'Favicon upload failed.');
    } finally {
      setFaviconUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveAll = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setSaving(true);

    const payload = {
      seo: {
        ...seo,
        keywords: keywordsInput.split(',').map((s) => s.trim()).filter(Boolean)
      },
      appearance,
      visualEffects,
      sections
    };

    try {
      await api.updateSettings(payload);
      toast.success('Settings saved successfully!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-settings-updated', { detail: payload }));
      }
    } catch (err) {
      const errMsg = (err.data?.errors && err.data.errors.join(', ')) || err.message || 'Failed to update settings.';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Section Reordering and Visibility Toggle
  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate order indices
    const normalized = updated.map((sec, idx) => ({
      ...sec,
      order: idx + 1
    }));

    setSections(normalized);
  };

  const toggleSectionVisibility = (index) => {
    const updated = [...sections];
    updated[index].visible = !updated[index].visible;
    setSections(updated);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <BookLoader label="Loading settings & visual effects..." />
      </div>
    );
  }

  const presets = [
    { id: 'laptop', name: 'Floating 3D Laptop', desc: 'Sleek developer laptop with emissive code display & orbiting ring' },
    { id: 'geometry', name: 'Abstract Geometry', desc: 'Rotating wireframe icosahedron & orbiting celestial shapes' },
    { id: 'particles', name: 'Orbital Particles', desc: 'Gentle swirling particulate galaxy with wireframe sphere' },
    { id: 'hologram', name: '3D Photo Hologram', desc: 'Interactive 3D depth badge featuring your uploaded portrait with glowing aura and parallax tilt' }
  ];

  const backgroundPresets = [
    { id: 'constellation', name: 'Constellation', desc: '3D neural galaxy & connected starfield (dynamic web filaments)' },
    { id: 'cyber-waves', name: 'Cyber Waves', desc: '3D undulating synthwave horizon terrain grid & wireframe ripples' },
    { id: 'prism-crystals', name: 'Prism Crystals', desc: '3D tumbling glass geometric polyhedra with mouse parallax' },
    { id: 'energy-helix', name: 'Energy Helix', desc: '3D dual particle ribbon vortex revolving in harmonic resonance' },
    { id: 'floating-orbs', name: 'Floating Orbs', desc: '3D ethereal ambient luminous spheres with realistic lighting' },
    { id: 'none', name: 'Minimal Canvas', desc: 'Lightweight 2D ambient aurora orbs' }
  ];

  return (
    <div className="max-w-4xl space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Website & Visual Effects Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure SEO, 3D graphics presets, card tilt, accent themes, and public section layout.
          </p>
        </div>

        <Button onClick={handleSaveAll} isLoading={saving} className="gap-2 shadow-sm">
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </Button>
      </div>



      <form onSubmit={handleSaveAll} className="space-y-8">

        {/* 1. 3D HERO SCENE PRESET BOX */}
        <div className="p-6 rounded-2xl border-2 border-primary/30 bg-card/90 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  3D Hero Scene Preset
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose the interactive 3D model rendered in the top Hero section of your portfolio
                </p>
              </div>
            </div>

            <Switch
              checked={visualEffects.enabled}
              onChange={(val) => setVisualEffects({ ...visualEffects, enabled: val })}
              label="3D Hero Enabled"
            />
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              3D Scene Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setVisualEffects({ ...visualEffects, preset: preset.id })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    visualEffects.preset === preset.id
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border/70 hover:border-primary/40 bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{preset.name}</span>
                    {visualEffects.preset === preset.id && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Dedicated Hologram Photo Upload (Appears when 3D Photo Hologram is chosen) */}
            {visualEffects.preset === 'hologram' && (
              <div className="mt-4 p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                      3D Hologram Portrait Image
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload your portrait photo to display as the interactive 3D hologram in the Hero section.
                    </p>
                  </div>
                  {visualEffects.hologramImage && (
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                      Photo Active
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Input
                    placeholder="/uploads/... or https://..."
                    value={visualEffects.hologramImage || ''}
                    onChange={(e) => setVisualEffects({ ...visualEffects, hologramImage: e.target.value })}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                  <input
                    id="hologram-image-file"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={makeImageUploadHandler(setVisualEffects, 'hologramImage', setHologramImageUploading)}
                  />
                  <button
                    type="button"
                    title="Upload image from computer"
                    disabled={hologramImageUploading}
                    onClick={() => document.getElementById('hologram-image-file').click()}
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1.5px dashed var(--primary)',
                      background: hologramImageUploading ? 'var(--muted)' : 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: hologramImageUploading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { if (!hologramImageUploading) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; }}
                    onMouseLeave={e => { if (!hologramImageUploading) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
                  >
                    {hologramImageUploading ? (
                      <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</>
                    ) : (
                      <><Upload size={14} />Upload Photo</>
                    )}
                  </button>
                </div>

                {visualEffects.hologramImage && (
                  <div style={{
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'var(--card)',
                    border: '1.5px solid rgba(99, 102, 241, 0.35)',
                    boxShadow: '0 0 16px rgba(99, 102, 241, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          src={getMediaUrl(visualEffects.hologramImage)}
                          alt="3D Hologram Preview"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                          style={{
                            width: 54,
                            height: 54,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '2px solid var(--primary)',
                            boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)'
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          top: -3,
                          right: -3,
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          background: '#10b981',
                          border: '2px solid var(--card)'
                        }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)' }}>Live 3D Texture Preview</p>
                        <p style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{visualEffects.hologramImage}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Remove hologram photo"
                      onClick={() => setVisualEffects({ ...visualEffects, hologramImage: '' })}
                      style={{
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. 3D BACKGROUND ANIMATION STYLE BOX */}
        <div className="p-6 rounded-2xl border-2 border-primary/25 bg-card/90 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  3D Background Animation Style
                </h2>
                <p className="text-xs text-muted-foreground">
                  Sets the default full-page 3D WebGL animation loaded behind your entire portfolio (Light & Dark Mode)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold capitalize">
              {(visualEffects.backgroundPreset || 'constellation').replace('-', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {backgroundPresets.map((bgPreset) => {
              const isSelected = (visualEffects.backgroundPreset || 'constellation') === bgPreset.id;
              return (
                <div
                  key={bgPreset.id}
                  onClick={() => setVisualEffects({ ...visualEffects, backgroundPreset: bgPreset.id })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                      : 'border-border/70 hover:border-primary/40 bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{bgPreset.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    {bgPreset.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 3D LIGHTING, ACCENTS & PERFORMANCE CONTROLS BOX */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                3D Lighting, Motion & Performance Controls
              </h2>
              <p className="text-xs text-muted-foreground">
                Tune 3D glow colors, animation float intensity, particle effects, and mobile rendering
              </p>
            </div>
          </div>

          {/* Color & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                3D Accent Glow Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={visualEffects.accentColor || '#6366f1'}
                  onChange={(e) => setVisualEffects({ ...visualEffects, accentColor: e.target.value })}
                  className="h-10 w-16 rounded-lg border border-input cursor-pointer bg-background p-1"
                />
                <Input
                  value={visualEffects.accentColor || '#6366f1'}
                  onChange={(e) => setVisualEffects({ ...visualEffects, accentColor: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Animation Float Intensity: {visualEffects.intensity || 1.0}x
                </label>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={visualEffects.intensity || 1.0}
                onChange={(e) => setVisualEffects({ ...visualEffects, intensity: parseFloat(e.target.value) })}
                className="w-full accent-primary cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>Subtle (0.2x)</span>
                <span>Balanced (1.0x)</span>
                <span>Dynamic (2.0x)</span>
              </div>
            </div>
          </div>

          {/* Toggles: Particles, Card Tilt, Mobile 3D */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <Switch
              checked={visualEffects.particles !== false}
              onChange={(val) => setVisualEffects({ ...visualEffects, particles: val })}
              label="Orbiting Particles"
            />

            <Switch
              checked={visualEffects.cardTilt !== false}
              onChange={(val) => setVisualEffects({ ...visualEffects, cardTilt: val })}
              label="Card 3D Hover Tilt"
            />

            <Switch
              checked={Boolean(visualEffects.enableOnMobile)}
              onChange={(val) => setVisualEffects({ ...visualEffects, enableOnMobile: val })}
              label="Enable 3D on Mobile"
            />
          </div>
        </div>

        {/* 4. HERO PHOTO BORDER & FRAMING STYLES BOX */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Hero Photo & Framing Style
                </h2>
                <p className="text-xs text-muted-foreground">
                  Upload your portrait photo and customize its border framing and ambient effects in the hero section
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 font-semibold">
              Applied to Hero Section
            </span>
          </div>

          {/* Hero Portrait Photo Uploader */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hero Portrait Photo
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Shown in the Hero section and serves as the visual display for framing and 3D effects.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Input
                placeholder="/uploads/fallback.png or https://..."
                value={visualEffects.fallbackImage || ''}
                onChange={(e) => setVisualEffects({ ...visualEffects, fallbackImage: e.target.value })}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
              <input id="fallback-image-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={makeImageUploadHandler(setVisualEffects, 'fallbackImage', setFallbackImageUploading)} />
              <button
                type="button"
                title="Upload image from computer"
                disabled={fallbackImageUploading}
                onClick={() => document.getElementById('fallback-image-file').click()}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1.5px dashed var(--primary)',
                  background: fallbackImageUploading ? 'var(--muted)' : 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: fallbackImageUploading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.15)'
                }}
                onMouseEnter={e => { if (!fallbackImageUploading) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; }}
                onMouseLeave={e => { if (!fallbackImageUploading) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
              >
                {fallbackImageUploading ? (
                  <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</>
                ) : (
                  <><Upload size={14} />Upload Photo</>
                )}
              </button>
            </div>

            {/* Glowing Border Card for Uploaded Image Preview */}
            {visualEffects.fallbackImage && (
              <div style={{
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--card)',
                border: '1.5px solid rgba(99, 102, 241, 0.35)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={getMediaUrl(visualEffects.fallbackImage)}
                      alt="Fallback preview"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                      style={{
                        width: 58,
                        height: 58,
                        objectFit: 'cover',
                        borderRadius: 10,
                        border: '2px solid var(--primary)',
                        boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid var(--card)'
                    }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>
                        Active Hero Graphic
                      </p>
                      <span style={{
                        fontSize: 10,
                        fontFamily: 'monospace',
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        LIVE IN HERO
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {visualEffects.fallbackImage}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  title="Remove image"
                  onClick={() => setVisualEffects({ ...visualEffects, fallbackImage: '' })}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Border Style Selector Grid — 6 presets */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hero Photo Border Style
              </label>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Select the border framing and ambient effects applied to your uploaded portrait in the hero section.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                {
                  id: 'glow-gradient',
                  name: 'Glow Gradient',
                  tag: 'Vibrant Aura',
                  emoji: '🌈',
                  desc: 'Multi-color glowing rim with ambient radial backlight & glass sheen'
                },
                {
                  id: 'cyber-neon',
                  name: 'Cyber Neon',
                  tag: 'Futuristic HUD',
                  emoji: '⚡',
                  desc: 'Neon border outline with glowing tech corner brackets & active indicator'
                },
                {
                  id: 'glass-card',
                  name: 'Glassmorphic',
                  tag: 'Frosted Glass',
                  emoji: '🪟',
                  desc: 'Frosted glass container with glossy bevel, backdrop blur & halo'
                },
                {
                  id: 'minimal-clean',
                  name: 'Minimal Clean',
                  tag: 'Modern Studio',
                  emoji: '🎯',
                  desc: 'Clean rounded squircle with subtle elevation & sleek border'
                },
                {
                  id: 'spin-conic',
                  name: 'Spinning Conic',
                  tag: 'Animated',
                  emoji: '🌀',
                  desc: 'Continuously rotating rainbow conic-gradient border — eye-catching & dynamic'
                },
                {
                  id: 'blob-outline',
                  name: 'Blob Outline',
                  tag: 'Organic Shape',
                  emoji: '🫧',
                  desc: 'Morphing organic blob border that gently animates, giving a fluid artistic feel'
                }
              ].map((styleOpt) => {
                const isSelected = (visualEffects.imageBorderEffect || 'glow-gradient') === styleOpt.id;
                return (
                  <div
                    key={styleOpt.id}
                    onClick={() => setVisualEffects({ ...visualEffects, imageBorderEffect: styleOpt.id })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/15 shadow-sm ring-1 ring-primary/50'
                        : 'border-border/70 hover:border-primary/40 bg-secondary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-foreground">{styleOpt.emoji} {styleOpt.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/60 text-muted-foreground inline-block mb-1.5">
                      {styleOpt.tag}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-snug">{styleOpt.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Fine-grained border controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-4 rounded-xl bg-secondary/30 border border-border/50 mb-5">
              {/* Border Color */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Border Color Override</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={visualEffects.borderColor || visualEffects.accentColor || '#6366f1'}
                    onChange={(e) => setVisualEffects({ ...visualEffects, borderColor: e.target.value })}
                    className="h-9 w-12 rounded-lg border border-input cursor-pointer bg-background p-0.5"
                  />
                  <input
                    type="text"
                    value={visualEffects.borderColor || ''}
                    onChange={(e) => setVisualEffects({ ...visualEffects, borderColor: e.target.value })}
                    placeholder="#6366f1 (or empty = auto)"
                    className="flex-1 h-9 px-3 rounded-lg bg-background border border-input text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Leave empty to use 3D accent color</p>
              </div>

              {/* Border Width */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  Border Thickness: {visualEffects.borderWidth || 2}px
                </label>
                <input
                  type="range"
                  min="1" max="16" step="1"
                  value={visualEffects.borderWidth || 2}
                  onChange={(e) => setVisualEffects({ ...visualEffects, borderWidth: parseInt(e.target.value) })}
                  className="w-full accent-primary cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                  <span>Thin (1px)</span><span>Medium (8px)</span><span>Thick (16px)</span>
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Corner Roundness</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'none', label: '■', title: 'Sharp' },
                    { id: 'sm',   label: '▢', title: 'Small' },
                    { id: 'md',   label: '▣', title: 'Medium' },
                    { id: 'lg',   label: '⬜', title: 'Large' },
                    { id: 'xl',   label: '🟦', title: 'XL' },
                    { id: '2xl',  label: '💠', title: '2XL' },
                    { id: 'full', label: '⚪', title: 'Circle' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      title={r.title}
                      onClick={() => setVisualEffects({ ...visualEffects, borderRadius: r.id })}
                      className={`h-8 rounded text-xs font-bold transition-all ${
                        (visualEffects.borderRadius || 'xl') === r.id
                          ? 'bg-primary text-white shadow ring-1 ring-primary'
                          : 'bg-background border border-border/60 text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {r.title.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Mini Preview */}
            {(visualEffects.fallbackImage || visualEffects.hologramImage) && (
              <div className="p-5 rounded-2xl border border-dashed border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Live Border Preview</span>
                </div>
                <div className="flex items-center gap-8">
                  <BorderPreviewThumb
                    src={visualEffects.fallbackImage || visualEffects.hologramImage}
                    effect={visualEffects.imageBorderEffect || 'glow-gradient'}
                    color={visualEffects.borderColor || visualEffects.accentColor || '#6366f1'}
                    width={visualEffects.borderWidth || 2}
                    radius={visualEffects.borderRadius || 'xl'}
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {(visualEffects.imageBorderEffect || 'glow-gradient').replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {visualEffects.borderWidth || 2}px border · {visualEffects.borderRadius || 'xl'} radius
                    </p>
                    <p className="text-[11px] font-mono text-primary mt-0.5">
                      {visualEffects.borderColor || visualEffects.accentColor || '#6366f1'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. SECTION ORDER & VISIBILITY MANAGER */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
            <Sliders className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Section Ordering & Visibility
              </h2>
              <p className="text-xs text-muted-foreground">
                Reorder page sections up/down or toggle visibility. Changes appear instantly on the public website.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, -1)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(idx, 1)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="font-bold text-sm text-foreground">{sec.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">#{sec.id}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSectionVisibility(idx)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    sec.visible
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {sec.visible ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SEO & METADATA */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              SEO & Social Sharing Metadata
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Global Site Title
            </label>
            <Input
              value={seo.siteTitle || ''}
              onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
              placeholder="e.g. Jane Doe — Senior Full-Stack Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Meta Description (Search Engines)
            </label>
            <Input
              value={seo.siteDescription || ''}
              onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
              placeholder="150-160 characters describing your skills and projects."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Keywords (comma-separated)
            </label>
            <Input
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="Full-Stack Developer, Next.js, Node.js, Express, Three.js"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                OpenGraph Social Sharing Image
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Input
                  placeholder="/uploads/og-image.png"
                  value={seo.ogImage || ''}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                <input id="og-image-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={makeImageUploadHandler(setSeo, 'ogImage', setOgImageUploading)} />
                <button type="button" title="Upload OG image from computer" disabled={ogImageUploading}
                  onClick={() => document.getElementById('og-image-file').click()}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)', background: ogImageUploading ? 'var(--muted)' : 'transparent', color: ogImageUploading ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: ogImageUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (!ogImageUploading) e.currentTarget.style.background = 'var(--muted)'; }}
                  onMouseLeave={e => { if (!ogImageUploading) e.currentTarget.style.background = 'transparent'; }}
                >
                  {ogImageUploading ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</> : <><Upload size={13} />Upload</>}
                </button>
              </div>
              {seo.ogImage && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={getMediaUrl(seo.ogImage)} alt="OG image preview" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all' }}>{seo.ogImage}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Favicon URL / Icon (.ico, .png, .svg)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Input
                  placeholder="/uploads/favicon.ico or .svg"
                  value={seo.favicon || ''}
                  onChange={(e) => setSeo({ ...seo, favicon: e.target.value })}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                <input id="favicon-file" type="file" accept="image/*,.ico,.svg" style={{ display: 'none' }} onChange={handleFaviconUpload} />
                <button type="button" title="Upload favicon from computer" disabled={faviconUploading}
                  onClick={() => document.getElementById('favicon-file').click()}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)', background: faviconUploading ? 'var(--muted)' : 'transparent', color: faviconUploading ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: faviconUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (!faviconUploading) e.currentTarget.style.background = 'var(--muted)'; }}
                  onMouseLeave={e => { if (!faviconUploading) e.currentTarget.style.background = 'transparent'; }}
                >
                  {faviconUploading ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</> : <><Upload size={13} />Upload Favicon</>}
                </button>
              </div>
              {seo.favicon && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={getMediaUrl(seo.favicon)} alt="Favicon preview" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)', background: '#0a0d14', padding: 2 }} />
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all' }}>{seo.favicon}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. THEME & ACCENT COLOR */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Theme & Default Appearance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Default Theme on First Visit
              </label>
              <select
                value={appearance.defaultTheme || 'dark'}
                onChange={(e) => setAppearance({ ...appearance, defaultTheme: e.target.value })}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="dark">Dark Theme (Default)</option>
                <option value="light">Light Theme</option>
                <option value="system">System Preference</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Primary Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearance.accentColor || '#3b82f6'}
                  onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
                  className="h-10 w-16 rounded-lg border border-input cursor-pointer bg-background p-1"
                />
                <Input
                  value={appearance.accentColor || '#3b82f6'}
                  onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
          <div className="flex-1 w-full" />

          <Button type="submit" size="lg" isLoading={saving} className="gap-2 shadow-lg shadow-primary/20 shrink-0">
            <Save className="h-4 w-4" />
            <span>Save All Configuration Settings</span>
          </Button>
        </div>

      </form>
    </div>
  );
}

function BorderPreviewThumb({ src, effect, color, width = 2, radius = 'xl' }) {
  const radiusMap = {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    '2xl': '24px',
    full: '9999px'
  };
  const br = radiusMap[radius] || '18px';

  let borderStyle = {};
  let extraClass = '';

  if (effect === 'glow-gradient') {
    borderStyle = {
      boxShadow: `0 0 16px ${color}88, inset 0 0 8px ${color}44`,
      border: `${width}px solid ${color}`
    };
  } else if (effect === 'cyber-neon') {
    borderStyle = {
      boxShadow: `0 0 12px ${color}`,
      border: `${width}px solid ${color}`
    };
  } else if (effect === 'glass-card') {
    borderStyle = {
      boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)`,
      border: `${width}px solid rgba(255,255,255,0.25)`
    };
  } else if (effect === 'spin-conic') {
    borderStyle = {
      border: `${width}px solid ${color}`,
      boxShadow: `0 0 14px ${color}66`
    };
    extraClass = 'animate-pulse';
  } else if (effect === 'blob-outline') {
    borderStyle = {
      border: `${width}px dashed ${color}`,
      boxShadow: `0 0 10px ${color}55`
    };
  } else {
    borderStyle = {
      border: `${width}px solid ${color}`
    };
  }

  return (
    <div
      className={`relative w-20 h-20 overflow-hidden shrink-0 bg-secondary/50 flex items-center justify-center transition-all ${extraClass}`}
      style={{ borderRadius: br, ...borderStyle }}
    >
      <img
        src={getMediaUrl(src)}
        alt="Preview"
        className="w-full h-full object-cover"
        style={{ borderRadius: br }}
      />
    </div>
  );
}
