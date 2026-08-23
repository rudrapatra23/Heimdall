import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, CheckCircle2, Mail } from 'lucide-react';
import { HeimdallLogo } from '@/components/HeimdallLogo';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCategory('general');
    setMessage('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 md:p-8 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-slate-900 font-normal">
              Message Received
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed font-light">
              Thank you for reaching out to Heimdall. Our team will review your inquiry and get back to you shortly.
            </p>
            <div className="pt-4">
              <Button
                onClick={handleReset}
                className="rounded-full bg-[#0F172A] hover:bg-black text-white px-6 cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-1.5 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Get in Touch</span>
              </div>
              <h2 className="font-serif text-3xl text-slate-900 font-normal tracking-tight">
                Contact Heimdall
              </h2>
              <p className="text-sm text-slate-500 font-light">
                Have questions about nutrition coaching, integration, enterprise plans, or feedback?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name" className="text-xs font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Chen"
                    className="rounded-lg border-slate-200 focus:border-slate-400 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-xs font-medium text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="rounded-lg border-slate-200 focus:border-slate-400 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-category" className="text-xs font-medium text-slate-700">
                  Topic of Interest
                </Label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="general">General Inquiries</option>
                  <option value="nutrition">Nutrition &amp; Macro Coaching</option>
                  <option value="telegram">Telegram &amp; iMessage Integrations</option>
                  <option value="enterprise">Corporate &amp; Enterprise Wellness</option>
                  <option value="feedback">Product Feedback &amp; Ideas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message" className="text-xs font-medium text-slate-700">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help you..."
                  className="rounded-lg border-slate-200 focus:border-slate-400 text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-full text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#0F172A] hover:bg-black text-white px-6 inline-flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
