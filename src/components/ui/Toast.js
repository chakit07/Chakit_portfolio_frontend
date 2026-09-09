'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

/* ─── Context ─── */
const ToastContext = createContext(null);

/* ─── Hook ─── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ─── Icon map ─── */
const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/* ─── Color map ─── */
const STYLES = {
  success: { bar: '#22c55e', iconColor: '#22c55e' },
  error:   { bar: '#ef4444', iconColor: '#ef4444' },
  warning: { bar: '#f59e0b', iconColor: '#f59e0b' },
  info:    { bar: 'var(--primary,#3b82f6)', iconColor: 'var(--primary,#3b82f6)' },
};

/* ─── Single Toast Item ─── */
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);
  const s = STYLES[toast.type] || STYLES.info;
  const Icon = ICONS[toast.type] || Info;
  const dur = toast.duration ?? 4200;

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 320);
  }, [onRemove, toast.id]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    timerRef.current = setTimeout(dismiss, dur);
    return () => { clearTimeout(t); clearTimeout(timerRef.current); };
  }, [dismiss, dur]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px 14px 20px',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'var(--card,rgba(18,18,24,0.96))',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '280px',
        maxWidth: 'min(420px, calc(100vw - 32px))',
        overflow: 'hidden',
        transition: 'opacity 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.96)',
      }}
    >
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'4px', borderRadius:'14px 0 0 14px', background: s.bar }} />
      <div style={{ flexShrink:0, marginTop:'1px' }}>
        <Icon size={18} style={{ color: s.iconColor }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        {toast.title && (
          <p style={{ margin:0, fontWeight:700, fontSize:'13px', color:'var(--foreground)', lineHeight:1.4, marginBottom:'2px' }}>
            {toast.title}
          </p>
        )}
        <p style={{ margin:0, fontSize:'13px', color: toast.title ? 'var(--muted-foreground)' : 'var(--foreground)', lineHeight:1.5, wordBreak:'break-word' }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        style={{ flexShrink:0, marginTop:'-2px', background:'none', border:'none', cursor:'pointer', color:'var(--muted-foreground)', padding:'2px', borderRadius:'6px', display:'flex', alignItems:'center', transition:'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
      >
        <X size={14} />
      </button>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background: s.bar, opacity:0.6, transformOrigin:'left', animation:`toast-progress ${dur}ms linear forwards` }} />
    </div>
  );
}

/* ─── Provider ─── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(({ type = 'info', title, message, duration }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const success = useCallback((message, opts) => show({ type:'success', message, ...opts }), [show]);
  const error   = useCallback((message, opts) => show({ type:'error',   message, ...opts }), [show]);
  const warning = useCallback((message, opts) => show({ type:'warning', message, ...opts }), [show]);
  const info    = useCallback((message, opts) => show({ type:'info',    message, ...opts }), [show]);
  const remove  = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
      <style>{`@keyframes toast-progress{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
    </ToastContext.Provider>
  );
}
