'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dialog from '@/components/ui/Dialog';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Search,
  ExternalLink,
  Reply,
  CheckCircle2,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminMessagesPage() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read' | 'archived'
  const [search, setSearch] = useState('');

  const [activeMessage, setActiveMessage] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // AI Smart Reply State
  const [replyTone, setReplyTone] = useState('professional');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateReply = async () => {
    if (!activeMessage) return;
    setGeneratingReply(true);
    try {
      const res = await api.aiGenerateReply({
        messageId: activeMessage._id,
        name: activeMessage.name,
        email: activeMessage.email,
        subject: activeMessage.subject,
        message: activeMessage.message,
        tone: replyTone
      });
      if (res?.data) {
        setAiDraft(res.data);
      }
    } catch (err) {
      console.error('Failed to generate reply draft:', err);
    } finally {
      setGeneratingReply(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getMessages(`status=${filter}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      if (res?.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadMessages();
  };

  const handleOpenMessage = async (msg) => {
    setActiveMessage(msg);
    if (!msg.isRead) {
      try {
        await api.markMessageRead(msg._id, true);
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
        setActiveMessage({ ...msg, isRead: true });
      } catch (err) {
        console.error('Could not mark read:', err);
      }
    }
  };

  const toggleReadStatus = async (msg, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    try {
      const nextRead = !msg.isRead;
      await api.markMessageRead(msg._id, nextRead);
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: nextRead } : m)));
      if (activeMessage && activeMessage._id === msg._id) {
        setActiveMessage((prev) => (prev ? { ...prev, isRead: nextRead } : null));
      }
      toast.success(nextRead ? 'Marked as read' : 'Marked as unread');
    } catch (err) {
      toast.error('Failed to update read status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllMessagesRead();
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      if (activeMessage) {
        setActiveMessage((prev) => (prev ? { ...prev, isRead: true } : null));
      }
      toast.success('All messages marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleToggleArchive = async (msg, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    try {
      await api.toggleArchiveMessage(msg._id);
      setMessages((prev) => prev.filter((m) => m._id !== msg._id));
      if (activeMessage && activeMessage._id === msg._id) {
        setActiveMessage(null);
      }
    } catch (err) {
      toast.error('Failed to update archive status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteMessage(itemToDelete._id);
      setMessages((prev) => prev.filter((m) => m._id !== itemToDelete._id));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      if (activeMessage && activeMessage._id === itemToDelete._id) {
        setActiveMessage(null);
      }
    } catch (err) {
      toast.error('Failed to delete message.');
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Contact Inbox
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review inbound messages, inquiries from the portfolio contact form, and reply by email.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto gap-2 text-xs hover:bg-secondary"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border/50 w-full sm:w-auto">
          {['all', 'unread', 'read', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" size="sm" variant="outline" className="flex-shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Messages List */}
      <div className="rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-muted-foreground animate-pulse">
            Checking inbox...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No messages found in this category.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  !msg.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/30'
                }`}
              >
                {/* Left: Indicator, Sender Name, Subject */}
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => toggleReadStatus(msg, e)}
                    className="p-1 text-muted-foreground hover:text-primary rounded"
                    title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {msg.isRead ? (
                      <MailOpen className="h-4 w-4 opacity-50" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary fill-primary/20" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold text-foreground ${!msg.isRead ? 'text-primary' : ''}`}>
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        &lt;{msg.email}&gt;
                      </span>
                      {!msg.isRead && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-xl">
                      <span className="font-semibold text-foreground">{msg.subject}</span> — {msg.message}
                    </p>
                  </div>
                </div>

                {/* Right: Date & Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDate(msg.createdAt)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => toggleReadStatus(msg, e)}
                    className={`p-2 rounded-lg transition-colors ${
                      msg.isRead
                        ? 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        : 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                    title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {msg.isRead ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </button>

                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Reply via Email"
                  >
                    <Reply className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={(e) => handleToggleArchive(msg, e)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title={msg.isArchived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(msg);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Reader Dialog */}
      <Dialog
        isOpen={Boolean(activeMessage)}
        onClose={() => setActiveMessage(null)}
        title={activeMessage?.subject}
        maxWidth="max-w-2xl"
      >
        {activeMessage && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-foreground">{activeMessage.name}</p>
                <a
                  href={`mailto:${activeMessage.email}`}
                  className="text-xs text-primary hover:underline"
                >
                  {activeMessage.email}
                </a>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {formatDate(activeMessage.createdAt)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Message Body
              </label>
              <div className="p-4 rounded-2xl bg-card border border-border/80 text-sm leading-relaxed text-foreground whitespace-pre-wrap min-h-[120px]">
                {activeMessage.message}
              </div>
            </div>

            {/* AI Smart Reply Assistant */}
            <div className="p-4 rounded-2xl bg-secondary/40 border border-primary/25 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">AI Smart Email Draft</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={replyTone}
                    onChange={(e) => setReplyTone(e.target.value)}
                    className="text-xs bg-card border border-border rounded-lg px-2 py-1 text-foreground outline-none"
                  >
                    <option value="professional">Tone: Professional</option>
                    <option value="enthusiastic">Tone: Enthusiastic</option>
                    <option value="brief">Tone: Brief</option>
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateReply}
                    disabled={generatingReply}
                    className="text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    {generatingReply ? (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        Drafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {aiDraft && (
                <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2.5 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Intent:</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {aiDraft.detectedIntent}
                      </Badge>
                      <span className="text-muted-foreground font-medium">Priority:</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${aiDraft.leadPriority === 'High' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                        {aiDraft.leadPriority}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(aiDraft.replyBody);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy Draft'}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 text-xs text-foreground font-sans leading-relaxed whitespace-pre-line border border-border/40">
                    {aiDraft.replyBody}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleReadStatus(activeMessage, { stopPropagation: () => {} })}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {activeMessage.isRead ? (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      <span>Mark as Unread</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Mark as Read</span>
                    </>
                  )}
                </button>

                <span className="text-border/60 select-none">·</span>

                <button
                  type="button"
                  onClick={() => handleToggleArchive(activeMessage)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>{activeMessage.isArchived ? 'Unarchive' : 'Archive'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemToDelete(activeMessage);
                    setDeleteConfirmOpen(true);
                  }}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Delete
                </Button>

                <a
                  href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(aiDraft?.suggestedSubject || `Re: ${activeMessage.subject}`)}&body=${encodeURIComponent(aiDraft?.replyBody || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2 shadow-sm">
                    <Reply className="h-4 w-4" />
                    <span>Reply by Email</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Deletion"
        description="Permanently delete this message from the database?"
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            Delete Message
          </Button>
        </div>
      </Dialog>

    </div>
  );
}
