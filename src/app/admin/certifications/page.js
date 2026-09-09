'use client';

import { useEffect, useState } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dialog from '@/components/ui/Dialog';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Award, ExternalLink, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminCertificationsPage() {
  const toast = useToast();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    image: ''
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [certImageUploading, setCertImageUploading] = useState(false);

  const handleCertImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertImageUploading(true);
    try {
      const res = await api.uploadMedia(file);
      if (res?.data?.url) setFormData((prev) => ({ ...prev, image: res.data.url }));
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setCertImageUploading(false);
      e.target.value = '';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getCertifications();
      if (res?.data) setCerts(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load certifications.');
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
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      image: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (cert) => {
    setModalMode('edit');
    setCurrentId(cert._id);
    setFormData({
      name: cert.name || '',
      issuer: cert.issuer || '',
      issueDate: cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      image: cert.image || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await api.createCertification(formData);
        if (res?.data) {
          setCerts([...certs, res.data]);
          toast.success('Certification created!');
        }
      } else {
        const res = await api.updateCertification(currentId, formData);
        if (res?.data) {
          setCerts(certs.map((c) => (c._id === currentId ? res.data : c)));
          toast.success('Certification updated!');
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save certification.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteCertification(itemToDelete._id);
      setCerts(certs.filter((c) => c._id !== itemToDelete._id));
      toast.success(`Deleted "${itemToDelete.name}".`);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete certification.');
    }
  };

  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= certs.length) return;

    const updated = [...certs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const itemsPayload = updated.map((item, idx) => ({
      id: item._id,
      order: idx + 1
    }));

    setCerts(updated);
    try {
      await api.reorderCertifications(itemsPayload);
    } catch (err) {
      console.error('Reordering error:', err);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Certifications & Licenses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Display your industry credentials, verified skills, and certifications.
          </p>
        </div>

        <Button onClick={openCreateModal} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Certification</span>
        </Button>
      </div>



      {/* List */}
      <div className="rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-muted-foreground animate-pulse">
            Loading certifications...
          </div>
        ) : certs.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No certifications recorded. Click Add Certification to add credentials.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {certs.map((item, idx) => (
              <div
                key={item._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === certs.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground">
                      {item.name}
                    </h3>
                    <p className="text-sm font-medium text-accent mt-0.5">
                      {item.issuer}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Issued: {item.issueDate}</span>
                      {item.credentialId && <span>• ID: {item.credentialId}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  {item.credentialUrl && (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                      title="Verify Credential"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

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

      {/* Certification Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Add Certification' : 'Edit Certification'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Certification Name <span className="text-primary">*</span>
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. AWS Certified Solutions Architect"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Issuing Organization <span className="text-primary">*</span>
            </label>
            <Input
              required
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              placeholder="e.g. Amazon Web Services"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Issue Date <span className="text-primary">*</span>
              </label>
              <Input
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                placeholder="e.g. May 2024"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Expiry Date (Optional)
              </label>
              <Input
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="e.g. May 2027 or Never"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Credential ID
              </label>
              <Input
                value={formData.credentialId}
                onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                placeholder="e.g. AWS-12345"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Verification URL
              </label>
              <Input
                value={formData.credentialUrl}
                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Certificate / Badge Image
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Input
                placeholder="/uploads/... or https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
              <input id="cert-image-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCertImageUpload} />
              <button type="button" title="Upload badge image from computer" disabled={certImageUploading}
                onClick={() => document.getElementById('cert-image-file').click()}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px dashed var(--border)', background: certImageUploading ? 'var(--muted)' : 'transparent', color: certImageUploading ? 'var(--muted-foreground)' : 'var(--foreground)', fontSize: 12, fontWeight: 500, cursor: certImageUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                onMouseEnter={e => { if (!certImageUploading) e.currentTarget.style.background = 'var(--muted)'; }}
                onMouseLeave={e => { if (!certImageUploading) e.currentTarget.style.background = 'transparent'; }}
              >
                {certImageUploading ? <><span style={{ width: 13, height: 13, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</> : <><Upload size={13} />Upload</>}
              </button>
            </div>
            {formData.image && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={getMediaUrl(formData.image)} alt="Badge preview" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all' }}>{formData.image}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {modalMode === 'create' ? 'Add Certification' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete "${itemToDelete?.name}"?`}
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </div>
      </Dialog>

    </div>
  );
}
