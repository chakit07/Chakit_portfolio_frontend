'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const SUGGESTED_QUESTIONS = [
  'What are your top projects?',
  'What is your experience with Next.js and MongoDB?',
  'Why should we hire Chakit?'
];

export default function AIChatbot() {
  const toast = useToast();
  const pathname = usePathname();
  // Do not display on admin pages
  const isAdmin = pathname?.startsWith('/admin');

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24, alignRight: true, alignBottom: true });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 });

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm **Chakit's AI Twin**, trained directly on his portfolio, projects, and engineering experience. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Restore saved position from localStorage
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem('ai_chatbot_position');
      if (savedPos) {
        setPosition(JSON.parse(savedPos));
      }
    } catch (e) {
      console.error('Failed to parse saved position', e);
    }
  }, []);

  // Close chatbot when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  if (isAdmin) return null;

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query || !query.trim() || loading) return;

    const trimmed = query.trim();
    const userMsg = { role: 'user', content: trimmed };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history (exclude system intro)
      const chatHistory = newHistory.slice(1).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.aiChat(trimmed, chatHistory);
      const replyText = res?.data?.reply || "Thanks for asking! Feel free to reach out to Chakit directly via the Contact section.";

      setMessages((prev) => [...prev, { role: 'assistant', content: replyText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having a brief connection delay, but you can explore Chakit's skills and projects directly below or send an inquiry through the Contact form!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Conversation reset! What else would you like to know about Chakit's work or background?"
      }
    ]);
    toast.info('Chat conversation reset.');
  };

  // Dragging logic
  const handleMouseDown = (e) => {
    // Only drag on main click
    if (e.button !== 0) return;
    setIsDragging(true);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialPosX: position.x,
      initialPosY: position.y,
      moved: false
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragRef.current.moved = true;
      }

      let newX = dragRef.current.initialPosX;
      let newY = dragRef.current.initialPosY;

      if (position.alignRight) {
        newX = Math.max(12, dragRef.current.initialPosX - deltaX);
      } else {
        newX = Math.max(12, dragRef.current.initialPosX + deltaX);
      }

      if (position.alignBottom) {
        newY = Math.max(12, dragRef.current.initialPosY - deltaY);
      } else {
        newY = Math.max(12, dragRef.current.initialPosY + deltaY);
      }

      setPosition((prev) => ({
        ...prev,
        x: newX,
        y: newY
      }));
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          localStorage.setItem('ai_chatbot_position', JSON.stringify(position));
        } catch (e) {}
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, position]);

  const toggleCorner = () => {
    const nextAlignRight = !position.alignRight;
    const newPos = {
      x: 24,
      y: 24,
      alignRight: nextAlignRight,
      alignBottom: true
    };
    setPosition(newPos);
    try {
      localStorage.setItem('ai_chatbot_position', JSON.stringify(newPos));
    } catch (e) {}
  };

  const renderFormattedContent = (content) => {
    // Simple markdown renderer for bold text, bullet points, and newlines
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
      if (isBullet) {
        trimmed = trimmed.replace(/^([•\-\*]\s*)/, '');
      }

      // Convert **text** to <strong>
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-sm leading-relaxed">
            <span className="text-primary font-bold mt-0.5">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-sm leading-relaxed mb-1.5 last:mb-0">
          {formattedParts}
        </p>
      );
    });
  };

  const dynamicStyle = {
    position: 'fixed',
    zIndex: 50,
    ...(position.alignRight ? { right: `${position.x}px` } : { left: `${position.x}px` }),
    ...(position.alignBottom ? { bottom: `${position.y}px` } : { top: `${position.y}px` })
  };

  return (
    <div ref={containerRef} style={dynamicStyle} className="flex flex-col items-end selection:bg-primary/20">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="relative group flex items-center gap-1">
          {/* Clickable Card to open Chat (Icon by default, expands text on hover, directly draggable) */}
          <button
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onClick={() => {
              if (!dragRef.current.moved) {
                setIsOpen(true);
              }
            }}
            className="group relative flex items-center gap-0 group-hover:gap-3 p-2.5 group-hover:px-4 group-hover:py-2.5 rounded-full bg-card/95 backdrop-blur-md border border-primary/40 shadow-xl shadow-primary/10 hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 text-left overflow-hidden cursor-grab active:cursor-grabbing"
            aria-label="Open AI Assistant"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background"></span>
              </span>
            </div>

            <div className="max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                Ask AI Assistant
              </div>
              <div className="text-sm font-medium text-foreground">Chat with Chakit&apos;s AI</div>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className="p-4 bg-secondary/50 border-b border-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">Chakit&apos;s AI Twin</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    Gemini
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Drag header to reposition</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleCorner}
                title={`Switch alignment to ${position.alignRight ? 'Left' : 'Right'}`}
                className="px-2 py-1 text-[11px] rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition font-mono"
              >
                {position.alignRight ? '📍 Right' : '📍 Left'}
              </button>
              <button
                onClick={handleReset}
                title="Restart Conversation"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isAssistant
                      ? 'bg-muted/80 text-foreground border border-border/60 rounded-tl-sm'
                      : 'bg-primary text-primary-foreground font-medium rounded-tr-sm'
                      }`}
                  >
                    {isAssistant ? renderFormattedContent(msg.content) : msg.content}
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Loader */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted/80 border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 py-2 bg-background/50 border-t border-border/40 flex gap-1.5 overflow-x-auto no-scrollbar">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap text-xs px-2.5 py-1.5 rounded-full bg-secondary/80 hover:bg-primary/10 hover:text-primary border border-border/60 transition text-muted-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-card border-t border-border flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about projects, stack, or experience..."
              className="flex-1 bg-muted/60 border border-border/80 focus:border-primary rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Micro Footer */}
          <div className="px-4 py-1.5 bg-secondary/30 text-center border-t border-border/20 text-[10px] text-muted-foreground">
            Answers grounded in real MongoDB portfolio records
          </div>
        </div>
      )}
    </div>
  );
}

