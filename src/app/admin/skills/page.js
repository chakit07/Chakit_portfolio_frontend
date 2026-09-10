'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import Dialog from '@/components/ui/Dialog';
import Badge from '@/components/ui/Badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { PencilLoader } from '@/components/ui/BookLoader';

export default function AdminSkillsPage() {
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Skill Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiency: 'Proficient',
    visible: true
  });

  // Category Manager Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Delete Confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);



  const loadData = async () => {
    setLoading(true);
    try {
      const [skillsRes, catRes] = await Promise.all([
        api.getSkills(),
        api.getSkillCategories()
      ]);
      if (skillsRes?.data) setSkills(skillsRes.data);
      if (catRes?.data) setCategories(catRes.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load skills.');
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
      category: categories[0]?._id || '',
      proficiency: 'Proficient',
      visible: true
    });
    setModalOpen(true);
  };

  const openEditModal = (skill) => {
    setModalMode('edit');
    setCurrentId(skill._id);
    setFormData({
      name: skill.name || '',
      category: skill.category?._id || skill.category || categories[0]?._id || '',
      proficiency: skill.proficiency || 'Proficient',
      visible: skill.visible !== false
    });
    setModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await api.createSkill(formData);
        if (res?.data) {
          setSkills([...skills, res.data]);
          toast.success('Skill created successfully!');
        }
      } else {
        const res = await api.updateSkill(currentId, formData);
        if (res?.data) {
          setSkills(skills.map((s) => (s._id === currentId ? res.data : s)));
          toast.success('Skill updated successfully!');
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Error saving skill.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteSkill(itemToDelete._id);
      setSkills(skills.filter((s) => s._id !== itemToDelete._id));
      toast.success(`Deleted "${itemToDelete.name}".`);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete skill.');
    }
  };

  // Reorder skills within the list
  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= skills.length) return;

    const updated = [...skills];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const itemsPayload = updated.map((item, idx) => ({
      id: item._id,
      order: idx + 1
    }));

    setSkills(updated);
    try {
      await api.reorderSkills(itemsPayload);
    } catch (err) {
      console.error('Reordering skills error:', err);
    }
  };

  // Category Manager
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.createSkillCategory({ name: newCategoryName.trim() });
      if (res?.data) {
        setCategories([...categories, res.data]);
        setNewCategoryName('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create skill category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await api.deleteSkillCategory(catId);
      setCategories(categories.filter((c) => c._id !== catId));
    } catch (err) {
      toast.error(err.message || 'Cannot delete category.');
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Skills & Competencies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage technical proficiencies, custom order, and category groupings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setCategoryModalOpen(true)} className="gap-2">
            <Layers className="h-4 w-4" />
            <span>Manage Categories</span>
          </Button>

          <Button onClick={openCreateModal} size="sm" className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Add Skill</span>
          </Button>
        </div>
      </div>



      {/* Skills Table / List */}
      <div className="rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-sm">
        {loading ? (
          <PencilLoader label="Loading skills..." />
        ) : skills.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No skills found. Click Add Skill to get started.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {skills.map((skill, idx) => (
              <div
                key={skill._id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
              >
                {/* Left: Reorder & Name */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      aria-label="Move skill up"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === skills.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      aria-label="Move skill down"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{skill.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        {skill.proficiency || 'Proficient'}
                      </Badge>
                      {!skill.visible && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {skill.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(skill)}
                    className="gap-1.5 text-xs"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete(skill);
                      setDeleteConfirmOpen(true);
                    }}
                    aria-label={`Delete ${skill.name}`}
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

      {/* Skill Create/Edit Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Skill' : 'Edit Skill'}
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Skill Name <span className="text-primary">*</span>
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Next.js"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Category <span className="text-primary">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Proficiency Label
              </label>
              <Input
                value={formData.proficiency}
                onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                placeholder="Expert / Advanced / Proficient"
              />
            </div>
          </div>

          <div className="pt-2">
            <Switch
              checked={formData.visible}
              onChange={(val) => setFormData({ ...formData, visible: val })}
              label="Visible on Public Portfolio"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {modalMode === 'create' ? 'Add Skill' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Category Manager Modal */}
      <Dialog
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Manage Skill Categories"
        description="Organize your technical competencies into groups."
      >
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
          <Input
            placeholder="New Category Name (e.g. Cloud & AI)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button type="submit" className="gap-1 flex-shrink-0">
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </form>

        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border"
            >
              <span className="font-semibold text-sm text-foreground">{cat.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat._id)}
                className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Skill Deletion"
        description={`Are you sure you want to remove "${itemToDelete?.name}"?`}
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            Delete Skill
          </Button>
        </div>
      </Dialog>

    </div>
  );
}
