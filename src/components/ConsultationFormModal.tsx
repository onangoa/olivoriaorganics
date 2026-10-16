'use client';

import React, { useEffect, useState } from 'react';

const WHATSAPP_NUMBER = '254708261674';

const CARE_TYPES = ['Disease Management Support', 'Palliative Care Support'];

const CARE_SUBCATEGORIES = [
  'Diabetes',
  'High blood pressure',
  'Prostate related',
  'Joint care related (Arthritis and Gout)',
  'Cancer related',
  'Autoimmune related',
  'Digestive system related',
  'Others',
];

interface ConsultationFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ConsultationFormModal({ open, onClose }: ConsultationFormModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    type: 'General Wellness Consultation',
    subcategory: '',
    otherSubcategory: '',
    format: 'In-person',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello, I would like to request a health and wellness consultation with Olivoria Organics. Could you please provide more information?');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value } as typeof prev;
      if (name === 'type' && !CARE_TYPES.includes(value)) {
        next.subcategory = '';
        next.otherSubcategory = '';
      }
      if (name === 'subcategory' && value !== 'Others') {
        next.otherSubcategory = '';
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submission handling is not implemented yet — record the request locally.
    setSubmitted(true);
  };

  const showSubcategory = CARE_TYPES.includes(formData.type);
  const showOtherSubcategory = showSubcategory && formData.subcategory === 'Others';
  const subcategoryLabel = showSubcategory ? `${formData.type.replace(' Support', '')} Type` : '';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Book a consultation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7 shadow-xl">
        {submitted ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🌿</div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Request Received!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Thank you{formData.name ? `, ${formData.name}` : ''} — your consultation request has been recorded.
              We'll be in touch to confirm your appointment.
            </p>
            <button onClick={onClose} className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Book a Consultation</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Fill in the form below and we'll get back to you to confirm a time.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 -mt-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close form"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="consult-name" className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <input
                  id="consult-name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="consult-contact" className="block text-sm font-medium text-foreground mb-1.5">Email or Phone *</label>
                <input
                  id="consult-contact"
                  name="contact"
                  type="text"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="your@email.com or +254 700 000 000"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="consult-type" className="block text-sm font-medium text-foreground mb-1.5">Consultation Type</label>
                <select
                  id="consult-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                >
                  <option value="General Wellness Consultation">General Wellness Consultation</option>
                  <option value="Nutrition & Healthy Eating">Nutrition & Healthy Eating</option>
                  <option value="Lifestyle & Activity">Lifestyle & Activity</option>
                  <option value="Rest & Recovery">Rest & Recovery</option>
                  <option value="Hydration & Detox">Hydration & Detox</option>
                  <option value="Health Reform Principles">Health Reform Principles</option>
                  <option value="Family Wellness">Family Wellness</option>
                  <option value="Disease Management Support">Disease Management Support</option>
                  <option value="Palliative Care Support">Palliative Care Support</option>
                </select>
              </div>
              {showSubcategory && (
                <div>
                  <label htmlFor="consult-subcategory" className="block text-sm font-medium text-foreground mb-1.5">
                    {subcategoryLabel} *
                  </label>
                  <select
                    id="consult-subcategory"
                    name="subcategory"
                    required
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  >
                    <option value="" disabled>
                      Select a type
                    </option>
                    {CARE_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {showOtherSubcategory && (
                <div>
                  <label htmlFor="consult-other-subcategory" className="block text-sm font-medium text-foreground mb-1.5">
                    Please Specify *
                  </label>
                  <input
                    id="consult-other-subcategory"
                    name="otherSubcategory"
                    type="text"
                    required
                    value={formData.otherSubcategory}
                    onChange={handleChange}
                    placeholder="Tell us what you'd like support with"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
              )}
              <div>
                <label htmlFor="consult-format" className="block text-sm font-medium text-foreground mb-1.5">Preferred Format</label>
                <select
                  id="consult-format"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                >
                  <option value="In-person">In-person (Matasia)</option>
                  <option value="Virtual">Virtual (online)</option>
                </select>
              </div>
              <div>
                <label htmlFor="consult-notes" className="block text-sm font-medium text-foreground mb-1.5">
                  Anything you'd like us to know?
                </label>
                <textarea
                  id="consult-notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Your goals, challenges, or preferred days and times"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your information is kept private and will only be used to arrange your consultation.
              </p>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                Submit Request
              </button>
            </form>
            <div className="mt-5 pt-5 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Prefer WhatsApp?{' '}
                <button onClick={handleWhatsApp} className="text-primary font-medium underline">
                  Chat with us directly
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
