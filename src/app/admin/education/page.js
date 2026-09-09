'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Dialog from '@/components/ui/Dialog';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, GraduationCap } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminEducationPage() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);


  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getEducation();
      if (res?.data) setRecords(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load education records.');
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
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (edu) => {
    setModalMode('edit');
    setCurrentId(edu._id);
    setFormData({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      description: edu.description || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await api.createEducation(formData);
        if (res?.data) {
          setRecords([...records, res.data]);
          toast.success('Education record added!');
        }
      } else {
        const res = await api.updateEducation(currentId, formData);
        if (res?.data) {
          setRecords(records.map((r) => (r._id === currentId ? res.data : r)));
          toast.success('Education record updated!');
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save education record.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteEducation(itemToDelete._id);
      setRecords(records.filter((r) => r._id !== itemToDelete._id));
      toast.success('Education record deleted.');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete education record.');
    }
  };

  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= records.length) return;

    const updated = [...records];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const itemsPayload = updated.map((item, idx) => ({
      id: item._id,
      order: idx + 1
    }));

    setRecords(updated);
    try {
      await api.reorderEducation(itemsPayload);
    } catch (err) {
      console.error('Reordering education error:', err);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Education
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your degrees, academic achievements, and formal university education.
          </p>
        </div>

        <Button onClick={openCreateModal} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Education</span>
        </Button>
      </div>



      {/* List */}
      <div className="rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-muted-foreground animate-pulse">
            Loading education records...
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No education records recorded. Click Add Education to create one.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {records.map((item, idx) => (
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
                      disabled={idx === records.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground">
                      {item.degree}
                    </h3>
                    <p className="text-sm font-medium text-primary mt-0.5">
                      {item.institution} {item.field && `• ${item.field}`}
                    </p>
                    <span className="text-xs text-muted-foreground block mt-1">
                      {item.startDate} – {item.endDate || 'Present'}
                    </span>
                  </div>
                </div>

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

      {/* Education Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Add Education Record' : 'Edit Education Record'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Institution / University <span className="text-primary">*</span>
            </label>
            <Input
              required
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g. University of California, Berkeley"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Degree / Qualification <span className="text-primary">*</span>
              </label>
              <Input
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. B.S. in Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Field of Study
              </label>
              <Input
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                placeholder="e.g. Software Systems"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Start Date <span className="text-primary">*</span>
              </label>
              <Input
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="e.g. 2016"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                End Date
              </label>
              <Input
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                placeholder="e.g. 2020"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Description / Honors (Optional)
            </label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Honors, relevant coursework, thesis..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {modalMode === 'create' ? 'Add Record' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete this education record?`}
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
