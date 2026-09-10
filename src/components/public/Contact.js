'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function Contact({ settings, socialLinks = [] }) {
  const profile = settings?.profile || {};
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    _hp_field: '' // honeypot field (hidden from legitimate users)
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter your name.';
    if (!formData.email.trim()) {
      errs.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim()) errs.subject = 'Please enter a subject.';
    if (!formData.message.trim()) {
      errs.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await api.submitContact(formData);

      const combined = `${formData.subject} ${formData.message}`.toLowerCase();
      let tailoredNote = 'Thank you! Your message has been received.';
      if (combined.match(/(role|job|hire|recruiter|interview|engineer|full-stack|frontend)/)) {
        tailoredNote = 'Thank you for the opportunity! Chakit prioritizes hiring and career inquiries and typically responds within 12 hours.';
      } else if (combined.match(/(project|freelance|contract|build|quote|proposal|mvp)/)) {
        tailoredNote = 'Thank you! Your project inquiry has been received. Chakit will review your scope and get back to you shortly.';
      }

      toast.success(res.message || tailoredNote, { duration: 7000 });
      setFormData({ name: '', email: '', subject: '', message: '', _hp_field: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to deliver message. Please try again or reach out via email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-secondary/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Get in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Let&apos;s Build Together
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">
                Let&apos;s discuss your next project or opportunity.
              </h3>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Whether you have an upcoming architecture challenge, a contract requirement, or want to collaborate on high-performance web applications, feel free to send a message.
              </p>
            </div>

            {profile.contactVisible !== false && (
              <div className="space-y-4">
                {profile.contactEmailVisible !== false && profile.contactEmail && (
                  <a
                    href={`mailto:${profile.contactEmail}`}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold block">Email</span>
                      <span className="text-sm font-medium text-foreground">{profile.contactEmail}</span>
                    </div>
                  </a>
                )}

                {profile.contactPhoneVisible !== false && profile.contactPhone && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card/60">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold block">Phone</span>
                      <span className="text-sm font-medium text-foreground">{profile.contactPhone}</span>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card/60">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold block">Location</span>
                      <span className="text-sm font-medium text-foreground">{profile.location}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Honeypot field (hidden from view, trap for spam bots) */}
                <input
                  type="text"
                  name="_hp_field"
                  value={formData._hp_field}
                  onChange={(e) => setFormData({ ...formData, _hp_field: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Your Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      placeholder="Jane Doe"
                      value={formData.name}
                      error={errors.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Your Email <span className="text-primary">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="jane@company.com"
                      value={formData.email}
                      error={errors.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Subject <span className="text-primary">*</span>
                  </label>
                  <Input
                    placeholder="Project Inquiry / Full-Stack Role"
                    value={formData.subject}
                    error={errors.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Message <span className="text-primary">*</span>
                  </label>
                  <Textarea
                    rows={5}
                    placeholder="Hello, I'd like to discuss an opportunity..."
                    value={formData.message}
                    error={errors.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full gap-2 shadow-lg shadow-primary/25"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </Button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
