'use client';

import { useEffect, useState, useRef } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dialog from '@/components/ui/Dialog';
import { formatBytes } from '@/lib/utils';
import {
  UploadCloud,
  FileText,
  Trash2,
  Copy,
  Check,
  Search,
  AlertTriangle,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminMediaPage() {
  const toast = useToast();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [copiedId, setCopiedId] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  // Deletion state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletionBlockedMessage, setDeletionBlockedMessage] = useState(null);


  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMedia();
      if (res?.data) setMediaList(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load media files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit client-side before sending (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds 10MB limit.');
      return;
    }

    setUploading(true);

    try {
      const res = await api.uploadMedia(file);
      if (res?.data) {
        setMediaList([res.data, ...mediaList]);
        toast.success(`Uploaded "${res.data.originalName}" successfully!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload media.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyUrl = (url, id) => {
    const fullUrl = getMediaUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAttempt = (media) => {
    setItemToDelete(media);
    setDeletionBlockedMessage(null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteMedia(itemToDelete._id);
      setMediaList(mediaList.filter((m) => m._id !== itemToDelete._id));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      toast.success('Media deleted from storage and database.');
    } catch (err) {
      if (err.data?.usedIn) {
        setDeletionBlockedMessage({
          message: err.message,
          usedIn: err.data.usedIn
        });
      } else {
        toast.error(err.message || 'Failed to delete media.');
        setDeleteConfirmOpen(false);
      }
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch = !search || m.originalName.toLowerCase().includes(search.toLowerCase());
    const isImage = m.mimeType.startsWith('image/');
    const isPdf = m.mimeType === 'application/pdf';

    if (typeFilter === 'images') return matchesSearch && isImage;
    if (typeFilter === 'documents') return matchesSearch && isPdf;
    return matchesSearch;
  });

  return (
    <div className="space-y-8">

      {/* Header & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Media Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload images and resume PDFs via Multer with validation and safe deletion protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            className="gap-2 shadow-sm"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload File</span>
          </Button>
        </div>
      </div>



      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/60 p-4 rounded-2xl border border-border/60">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media files by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All File Types</option>
          <option value="images">Images Only</option>
          <option value="documents">PDFs / Documents</option>
        </select>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-muted-foreground animate-pulse">
          Scanning media library...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <UploadCloud className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-sm">No media files found</p>
          <p className="text-xs mt-1">Upload images or PDF resumes to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((m) => {
            const isImage = m.mimeType.startsWith('image/');
            const fullUrl = getMediaUrl(m.url);

            return (
              <div
                key={m._id}
                className="group relative rounded-2xl border border-border/70 bg-card/70 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-primary/40 transition-all"
              >
                {/* Visual Area */}
                <div
                  onClick={() => setPreviewMedia(m)}
                  className="relative aspect-square w-full bg-muted/60 flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fullUrl}
                      alt={m.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-primary">
                      <FileText className="h-10 w-10" />
                      <span className="text-[10px] font-bold uppercase font-mono">PDF</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                      <Eye className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* Info & Copy */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground truncate" title={m.originalName}>
                    {m.originalName}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatBytes(m.size)}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => copyUrl(m.url, m._id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      {copiedId === m._id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAttempt(m)}
                      aria-label="Delete media"
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.originalName}
        maxWidth="max-w-2xl"
      >
        {previewMedia && (
          <div className="space-y-4">
            <div className="max-h-[60vh] overflow-hidden rounded-xl border border-border flex items-center justify-center bg-black/5">
              {previewMedia.mimeType.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getMediaUrl(previewMedia.url)}
                  alt={previewMedia.originalName}
                  className="max-h-[55vh] w-auto object-contain"
                />
              ) : (
                <div className="p-12 text-center">
                  <FileText className="h-16 w-16 text-primary mx-auto mb-3" />
                  <p className="font-semibold text-sm">{previewMedia.originalName}</p>
                  <a
                    href={getMediaUrl(previewMedia.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span className="font-mono">URL: {getMediaUrl(previewMedia.url)}</span>
              <Button size="sm" onClick={() => copyUrl(previewMedia.url, previewMedia._id)}>
                Copy Relative URL
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation & Deletion Blocker Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={deletionBlockedMessage ? 'Deletion Blocked: File is in Use' : 'Confirm Media Deletion'}
      >
        {deletionBlockedMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-600 dark:text-amber-400 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{deletionBlockedMessage.message}</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  This file cannot be deleted because it is still referenced in the following published content:
                </p>
              </div>
            </div>

            <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground font-medium">
              {deletionBlockedMessage.usedIn.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              To delete this media asset, first remove or replace it in the items listed above.
            </p>

            <div className="flex justify-end pt-3">
              <Button onClick={() => setDeleteConfirmOpen(false)}>
                Understood
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{itemToDelete?.originalName}&quot;</span>? This will permanently remove the physical file from disk.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete File
              </Button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
