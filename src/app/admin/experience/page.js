'use client';

import { useEffect, useState } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Switch from '@/components/ui/Switch';
import Dialog from '@/components/ui/Dialog';
import Badge from '@/components/ui/Badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Briefcase, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { PencilLoader } from '@/components/ui/BookLoader';

export default function AdminExperiencePage() {
  const toast = useToast();
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    employmentType: 'Full-time',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    bullets: '',
    website: '',
    logo: ''
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.data?.url) setFormData((prev) => ({ ...prev, logo: res.data.url }));
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getExperience();
      if (res?.data) setExperience(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load experience records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentId(null);
    setFormData({
      company: '',
      role: '',
      employmentType: 'Full-time',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      bullets: '',
      website: '',
      logo: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (exp) => {
    setModalMode('edit');
    setCurrentId(exp._id);
    setFormData({
      company: exp.company || '',
      role: exp.role || '',
      employmentType: exp.employmentType || 'Full-time',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: Boolean(exp.isCurrent),
      description: exp.description || '',
      bullets: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : '',
      website: exp.website || '',
      logo: exp.logo || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      bullets: formData.bullets.split('\n').map((b) => b.trim()).filter(Boolean)
    };

    try {
      if (modalMode === 'create') {
        const res = await api.createExperience(payload);
        if (res?.data) {
          setExperience([...experience, res.data]);
          toast.success('Experience record created!');
        }
      } else {
        const res = await api.updateExperience(currentId, payload);
        if (res?.data) {
          setExperience(experience.map((e) => (e._id === currentId ? res.data : e)));
          toast.success('Experience record updated!');
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save experience.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteExperience(itemToDelete._id);
      setExperience(experience.filter((e) => e._id !== itemToDelete._id));
      toast.success(`Deleted "${itemToDelete.company} - ${itemToDelete.role}".`);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete experience record.');
    }
  };

  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= experience.length) return;

    const updated = [...experience];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const itemsPayload = updated.map((item, idx) => ({
      id: item._id,
      order: idx + 1
    }));

    setExperience(updated);
    try {
      await api.reorderExperience(itemsPayload);
    } catch (err) {
      console.error('Reordering experience error:', err);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Work Experience
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your employment history, key leadership accomplishments, and ongoing positions.
          </p>
        </div>

        <Button onClick={openCreateModal} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Experience</span>
        </Button>
      </div>



      {/* Experience List */}
      <div className="rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-sm">
        {loading ? (
          <PencilLoader label="Loading experience entries..." />
        ) : experience.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No work experience recorded. Click Add Experience to add your career history.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {experience.map((item, idx) => (
              <div
                key={item._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
              >
                {/* Left: Reorder, Role, Company, Dates */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      aria-label="Move up"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === experience.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      aria-label="Move down"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">
                        {item.role}
                      </h3>
                      <span className="text-sm font-semibold text-primary">
                        @ {item.company}
                      </span>
                      {item.isCurrent && (
                        <Badge variant="success" className="text-[10px] px-1.5 py-0">
                          Ongoing
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{item.startDate} – {item.endDate || (item.isCurrent ? 'Present' : '')}</span>
                      {item.location && <span>• {item.location}</span>}
                      {item.employmentType && <span>• {item.employmentType}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    className="gap-1.5 text-xs"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                    aria-label={`Delete ${item.company}`}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Create/Edit Dialog */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Add Work Experience' : 'Edit Work Experience'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Company Name <span className="text-primary">*</span>
              </label>
              <Input
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Job Role / Title <span className="text-primary">*</span>
              </label>
              <Input
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Senior Full-Stack Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA (or Remote)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Start Date <span className="text-primary">*</span>
              </label>
              <Input
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="e.g. Jan 2023"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                End Date
              </label>
              <Input
                disabled={formData.isCurrent}
                value={formData.isCurrent ? 'Present' : formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                placeholder="e.g. Present or Dec 2024"
              />
            </div>

            <div className="flex items-center pt-5">
              <Switch
                checked={formData.isCurrent}
                onChange={(val) => setFormData({ ...formData, isCurrent: val })}
                label="Current Position"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              High-level Description
            </label>
            <Textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of responsibilities and team context."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Achievement Bullets (One per line)
            </label>
            <Textarea
              rows={4}
              value={formData.bullets}
              onChange={(e) => setFormData({ ...formData, bullets: e.target.value })}
              placeholder="Led architecture of...&#10;Reduced load times by 40%...&#10;Mentored 5 junior developers..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Company Website URL (Optional)
            </label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Company Logo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Input
                placeholder="/uploads/... or https://..."
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
              <input id="company-logo-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              <button type="button" title="Upload company logo from computer" disabled={logoUploading}
                onClick={() => document.getElementById('company-logo-file').click()}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)', background: logoUploading ? 'var(--muted)' : 'transparent', color: logoUploading ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: logoUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                onMouseEnter={e => { if (!logoUploading) e.currentTarget.style.background = 'var(--muted)'; }}
                onMouseLeave={e => { if (!logoUploading) e.currentTarget.style.background = 'transparent'; }}
              >
                {logoUploading ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</> : <><Upload size={13} />Upload</>}
              </button>
            </div>
            {formData.logo && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={getMediaUrl(formData.logo)} alt="Logo preview" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all' }}>{formData.logo}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {modalMode === 'create' ? 'Add Experience' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Deletion"
        description={`Are you sure you want to remove the experience record for "${itemToDelete?.company}"?`}
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            Delete Record
          </Button>
        </div>
      </Dialog>

    </div>
  );
}
