'use client';

import { useEffect, useState } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Switch from '@/components/ui/Switch';
import { Save, Plus, Trash2, Sparkles, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import BookLoader from '@/components/ui/BookLoader';

export default function AdminProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [logoImageUploading, setLogoImageUploading] = useState(false);
  const [adminLogoUploading, setAdminLogoUploading] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    title: '',
    headline: '',
    bio: '',
    location: '',
    currentFocus: '',
    availabilityStatus: '',
    profileImage: '',
    logoText: '',
    logoImage: '',
    adminTitle: 'Admin Console',
    adminLogoImage: '',
    roles: [],
    stats: [],
    resumeUrl: '',
    resumeButtonVisible: true,
    contactEmail: '',
    contactEmailVisible: true,
    contactPhone: '',
    contactPhoneVisible: true
  });

  const [footer, setFooter] = useState({
    text: '',
    copyright: ''
  });

  const [socialLinks, setSocialLinks] = useState([]);
  const [newRoleInput, setNewRoleInput] = useState('');

  // AI Polish State
  const [polishingBio, setPolishingBio] = useState(false);
  const [polishingHeadline, setPolishingHeadline] = useState(false);

  const handlePolishText = async (targetType) => {
    const original = targetType === 'bio' ? profile.bio : profile.headline;
    if (!original || !original.trim()) return;

    if (targetType === 'bio') setPolishingBio(true);
    else setPolishingHeadline(true);

    try {
      const res = await api.aiPolishText({
        text: original,
        targetType,
        tone: 'modern'
      });
      if (res?.data?.polishedText) {
        if (targetType === 'bio') {
          setProfile((prev) => ({ ...prev, bio: res.data.polishedText }));
        } else {
          setProfile((prev) => ({ ...prev, headline: res.data.polishedText }));
        }
        toast.success(`✨ ${targetType === 'bio' ? 'Bio' : 'Headline'} polished by AI!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to polish text.');
    } finally {
      if (targetType === 'bio') setPolishingBio(false);
      else setPolishingHeadline(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, socialsRes] = await Promise.all([
        api.getSettings(),
        api.getSocialLinks()
      ]);

      if (settingsRes?.data) {
        setProfile(settingsRes.data.profile || {});
        setFooter(settingsRes.data.footer || {});
      }
      if (socialsRes?.data) {
        setSocialLinks(socialsRes.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const makeImageUploadHandler = (fieldKey, setUploading) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.data?.url) setProfile((prev) => ({ ...prev, [fieldKey]: res.data.url }));
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({ profile, footer });
      toast.success('Profile and site content updated successfully!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-settings-updated', { detail: { profile, footer } }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  // Role Management
  const addRole = () => {
    if (!newRoleInput.trim()) return;
    setProfile({
      ...profile,
      roles: [...(profile.roles || []), newRoleInput.trim()]
    });
    setNewRoleInput('');
  };

  const removeRole = (index) => {
    setProfile({
      ...profile,
      roles: (profile.roles || []).filter((_, i) => i !== index)
    });
  };

  // Stat Management
  const addStat = () => {
    setProfile({
      ...profile,
      stats: [...(profile.stats || []), { label: 'New Metric', value: '10+' }]
    });
  };

  const updateStat = (index, field, val) => {
    const updated = [...(profile.stats || [])];
    updated[index][field] = val;
    setProfile({ ...profile, stats: updated });
  };

  const removeStat = (index) => {
    setProfile({
      ...profile,
      stats: (profile.stats || []).filter((_, i) => i !== index)
    });
  };

  // Social Links
  const addSocial = async () => {
    try {
      const res = await api.createSocialLink({
        platform: 'New Platform',
        label: 'Profile Link',
        url: 'https://',
        icon: 'Globe'
      });
      if (res?.data) {
        setSocialLinks([...socialLinks, res.data]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add social link.');
    }
  };

  const updateSocial = async (id, data) => {
    try {
      await api.updateSocialLink(id, data);
      setSocialLinks(socialLinks.map((s) => (s._id === id ? { ...s, ...data } : s)));
    } catch (err) {
      toast.error(err.message || 'Failed to update social link.');
    }
  };

  const deleteSocial = async (id) => {
    try {
      await api.deleteSocialLink(id);
      setSocialLinks(socialLinks.filter((s) => s._id !== id));
      toast.success('Social link removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete social link.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <BookLoader label="Loading profile configuration..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Profile & Public Content
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update personal bio, animated roles, statistics, resume, and contact details.
          </p>
        </div>

        <Button onClick={handleSaveSettings} isLoading={saving} className="gap-2 shadow-sm">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </Button>
      </div>



      {/* Form Sections */}
      <form onSubmit={handleSaveSettings} className="space-y-8">

        {/* 1. Hero Identity */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-5">
          <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border/50">
            Hero & Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Display Name
              </label>
              <Input
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Professional Title
              </label>
              <Input
                value={profile.title || ''}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              />
            </div>

            {/* Profile Portrait / Avatar Photo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Profile Photo / Portrait (Used as Admin Avatar & Public Avatar)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Input
                  placeholder="/uploads/avatar.png or https://..."
                  value={profile.profileImage || ''}
                  onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                <input id="profile-image-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={makeImageUploadHandler('profileImage', setProfileImageUploading)} />
                <button type="button" title="Upload profile photo" disabled={profileImageUploading}
                  onClick={() => document.getElementById('profile-image-file').click()}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)', background: profileImageUploading ? 'var(--muted)' : 'transparent', color: profileImageUploading ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: profileImageUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (!profileImageUploading) e.currentTarget.style.background = 'var(--muted)'; }}
                  onMouseLeave={e => { if (!profileImageUploading) e.currentTarget.style.background = 'transparent'; }}
                >
                  {profileImageUploading ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</> : <><Upload size={13} />Upload Photo</>}
                </button>
              </div>
              {profile.profileImage && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={getMediaUrl(profile.profileImage)} alt="Profile preview" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 9999, border: '2px solid var(--primary)' }} />
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all' }}>{profile.profileImage}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-foreground">
                Hero Headline / Introduction
              </label>
              <button
                type="button"
                onClick={() => handlePolishText('headline')}
                disabled={polishingHeadline || !profile.headline}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium disabled:opacity-40"
              >
                {polishingHeadline ? (
                  <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Elevate with AI</span>
              </button>
            </div>
            <Input
              value={profile.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Availability Status Badge
            </label>
            <Input
              placeholder="e.g. Available for high-impact opportunities"
              value={profile.availabilityStatus || ''}
              onChange={(e) => setProfile({ ...profile, availabilityStatus: e.target.value })}
            />
          </div>

          {/* Animated Hero Roles */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              Animated Hero Roles (Rotates automatically on hero)
            </label>
            <div className="space-y-2 mb-3">
              {(profile.roles || []).map((role, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={role}
                    onChange={(e) => {
                      const updated = [...profile.roles];
                      updated[idx] = e.target.value;
                      setProfile({ ...profile, roles: updated });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeRole(idx)}
                    className="p-2.5 text-muted-foreground hover:text-destructive rounded-lg border border-border"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Add another role string..."
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRole();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addRole} className="gap-1 flex-shrink-0">
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Brand & Resume */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-5">
          <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border/50">
            Brand Assets & Resume
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Navbar Brand Logo Text
              </label>
              <Input
                value={profile.logoText || ''}
                onChange={(e) => setProfile({ ...profile, logoText: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Brand Logo Image
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Input
                  placeholder="/uploads/... or external URL"
                  value={profile.logoImage || ''}
                  onChange={(e) => setProfile({ ...profile, logoImage: e.target.value })}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                <input id="logo-image-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={makeImageUploadHandler('logoImage', setLogoImageUploading)} />
                <button type="button" title="Upload logo from computer" disabled={logoImageUploading}
                  onClick={() => document.getElementById('logo-image-file').click()}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)', background: logoImageUploading ? 'var(--muted)' : 'transparent', color: logoImageUploading ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: logoImageUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (!logoImageUploading) e.currentTarget.style.background = 'var(--muted)'; }}
                  onMouseLeave={e => { if (!logoImageUploading) e.currentTarget.style.background = 'transparent'; }}
                >
                  {logoImageUploading ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</> : <><Upload size={13} />Upload</>}
                </button>
              </div>
              {profile.logoImage && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={getMediaUrl(profile.logoImage)} alt="Logo preview" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all' }}>{profile.logoImage}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Active Resume Document URL (PDF or link)
              </label>
              <Input
                placeholder="/uploads/resume.pdf"
                value={profile.resumeUrl || ''}
                onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
              />
            </div>

            <div className="flex items-center pt-6">
              <Switch
                id="resume-toggle"
                checked={profile.resumeButtonVisible !== false}
                onChange={(val) => setProfile({ ...profile, resumeButtonVisible: val })}
                label="Show Resume Download Buttons on Site"
              />
            </div>
          </div>

          {/* Admin Console Header Customization */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>Admin Console Sidebar Branding (Logo & Dynamic Title)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customize the logo image and brand title text displayed at the top of your Admin Console sidebar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Admin Header Dynamic Title Text
                </label>
                <Input
                  placeholder="e.g. Admin Console or My Portfolio HQ"
                  value={profile.adminTitle || ''}
                  onChange={(e) => setProfile({ ...profile, adminTitle: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Leave blank or customize with your name/title. Defaults to Admin Console.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Admin Logo Photo (Uses your Profile Photo by default)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Input
                    placeholder="Defaults to your profile photo"
                    value={profile.adminLogoImage || ''}
                    onChange={(e) => setProfile({ ...profile, adminLogoImage: e.target.value })}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                  <input id="admin-logo-image-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={makeImageUploadHandler('adminLogoImage', setAdminLogoUploading)} />
                  <button type="button" title="Upload custom photo or logo for admin" disabled={adminLogoUploading}
                    onClick={() => document.getElementById('admin-logo-image-file').click()}
                    style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)', background: adminLogoUploading ? 'var(--muted)' : 'transparent', color: adminLogoUploading ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: adminLogoUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                    onMouseEnter={e => { if (!adminLogoUploading) e.currentTarget.style.background = 'var(--muted)'; }}
                    onMouseLeave={e => { if (!adminLogoUploading) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {adminLogoUploading ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</> : <><Upload size={13} />Upload</>}
                  </button>
                </div>
                {(profile.adminLogoImage || profile.profileImage || profile.logoImage) && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={getMediaUrl(profile.adminLogoImage || profile.profileImage || profile.logoImage)}
                      alt="Admin logo preview"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: 34, height: 34, objectFit: 'cover', borderRadius: 9999, border: '2px solid var(--primary)' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      Active header avatar: {profile.adminLogoImage ? 'Custom Admin Photo' : profile.profileImage ? 'Using Profile Photo' : 'Using Brand Logo'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. About & Dynamic Statistics */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-5">
          <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border/50">
            About Section & Metrics
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-foreground">
                Full Biography
              </label>
              <button
                type="button"
                onClick={() => handlePolishText('bio')}
                disabled={polishingBio || !profile.bio}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium disabled:opacity-40"
              >
                {polishingBio ? (
                  <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Polish Bio with AI</span>
              </button>
            </div>
            <Textarea
              rows={4}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Location
              </label>
              <Input
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Current Focus
              </label>
              <Input
                value={profile.currentFocus || ''}
                onChange={(e) => setProfile({ ...profile, currentFocus: e.target.value })}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Highlight Statistics Cards
              </label>
              <Button type="button" size="sm" variant="outline" onClick={addStat} className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Metric</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(profile.stats || []).map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
                  <Input
                    placeholder="Value (e.g. 6+)"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                    className="w-24 text-center font-mono font-bold"
                  />
                  <Input
                    placeholder="Label (e.g. Years Experience)"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(idx)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Contact & Footer */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-6">
          <div className="pb-3 border-b border-border/50">
            <h2 className="text-lg font-bold text-foreground">
              Contact Details & Footer
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage individual field visibility and content displayed on your website.
            </p>
          </div>

          {/* Contact Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/30">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Contact Info
              </span>
              <Switch
                id="toggle-contact-visible"
                checked={profile.contactVisible !== false}
                onChange={(checked) => setProfile({ ...profile, contactVisible: checked })}
                label={profile.contactVisible !== false ? 'Section: Visible' : 'Section: Hidden'}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Contact Email
                  </label>
                  <Switch
                    id="toggle-email-visible"
                    checked={profile.contactEmailVisible !== false}
                    onChange={(checked) => setProfile({ ...profile, contactEmailVisible: checked })}
                    label={profile.contactEmailVisible !== false ? 'Visible' : 'Hidden'}
                  />
                </div>
                <Input
                  value={profile.contactEmail || ''}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                  placeholder="e.g. email@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Contact Phone
                  </label>
                  <Switch
                    id="toggle-phone-visible"
                    checked={profile.contactPhoneVisible !== false}
                    onChange={(checked) => setProfile({ ...profile, contactPhoneVisible: checked })}
                    label={profile.contactPhoneVisible !== false ? 'Visible' : 'Hidden'}
                  />
                </div>
                <Input
                  value={profile.contactPhone || ''}
                  onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>
            </div>
          </div>

          {/* Footer Fields */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between pb-2 border-b border-border/30">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Footer Info
              </span>
              <Switch
                id="toggle-footer-visible"
                checked={footer.visible !== false}
                onChange={(checked) => setFooter({ ...footer, visible: checked })}
                label={footer.visible !== false ? 'Section: Visible' : 'Section: Hidden'}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Footer Tagline
                </label>
                <Input
                  value={footer.text || ''}
                  onChange={(e) => setFooter({ ...footer, text: e.target.value })}
                  placeholder="Footer tagline..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Footer Copyright Text
                </label>
                <Input
                  value={footer.copyright || ''}
                  onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                  placeholder="Copyright text..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Social Links Management */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/80 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h2 className="text-lg font-bold text-foreground">
              Social Links
            </h2>
            <Button type="button" size="sm" variant="outline" onClick={addSocial} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Social Link</span>
            </Button>
          </div>

          <div className="space-y-3">
            {socialLinks.map((social) => (
              <div
                key={social._id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3.5 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="sm:col-span-3">
                  <Input
                    placeholder="Platform (GitHub, etc.)"
                    value={social.platform}
                    onChange={(e) =>
                      setSocialLinks(socialLinks.map((s) =>
                        s._id === social._id ? { ...s, platform: e.target.value } : s
                      ))
                    }
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) updateSocial(social._id, { platform: val });
                    }}
                  />
                </div>
                <div className="sm:col-span-5">
                  <Input
                    placeholder="URL (https://...)"
                    value={social.url}
                    onChange={(e) =>
                      setSocialLinks(socialLinks.map((s) =>
                        s._id === social._id ? { ...s, url: e.target.value } : s
                      ))
                    }
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) updateSocial(social._id, { url: val });
                    }}
                  />
                </div>
                <div className="sm:col-span-3 flex items-center gap-2">
                  <Switch
                    checked={social.visible !== false}
                    onChange={(val) => updateSocial(social._id, { visible: val })}
                    label="Visible"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => deleteSocial(social._id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" isLoading={saving} className="gap-2 shadow-lg shadow-primary/20">
            <Save className="h-4 w-4" />
            <span>Save All Profile Changes</span>
          </Button>
        </div>

      </form>
    </div>
  );
}
