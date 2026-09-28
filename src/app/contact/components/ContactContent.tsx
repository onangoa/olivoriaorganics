'use client';

import React, { useState, useEffect, useRef } from 'react';

const WHATSAPP_NUMBER = '254708261674';

export default function ContactContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', emailOrPhone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.scroll-reveal').forEach((el) => el.classList.add('revealed'));
          }
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static mock submit — backend integration point
    setSubmitted(true);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello, I would like to get in touch with OlivoriaOrganics. Could you please assist me?');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div ref={ref} className="pt-24 pb-20">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label scroll-reveal">Get In Touch</span>
          <h1 className="text-display font-serif font-light italic text-foreground mt-4 scroll-reveal scroll-reveal-delay-1">
            We'd Love to <span className="text-primary">Hear From You</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed scroll-reveal scroll-reveal-delay-2">
            Whether you have a question about our products, want to request a consultation, or simply want to connect — we're here to help.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Contact Info */}
          <div className="space-y-8">
            {/* WhatsApp Primary CTA */}
            <div className="scroll-reveal bg-green-50 border border-green-200 rounded-2xl p-7">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Contact Us on WhatsApp</h2>
              <p className="text-muted-foreground text-sm mb-5">The fastest way to reach us. We typically respond within a few hours during business hours.</p>
              <button
                onClick={handleWhatsApp}
                className="whatsapp-btn inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Open WhatsApp Chat
              </button>
            </div>

            {/* Contact Details */}
            <div className="scroll-reveal scroll-reveal-delay-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: '📞', label: 'Phone', value: '+254 708 261674', href: 'tel:+254708261674' },
                { icon: '✉️', label: 'Email', value: 'hello@olivoriaorganics.co.ke', href: 'mailto:hello@olivoriaorganics.co.ke' },
                { icon: '📍', label: 'Location', value: 'Matasia, along Kiserian–Matasia Road\nMoran Towers, Matasia', href: undefined },
                { icon: '🕐', label: 'Hours', value: 'Mon–Thu: 9:00 AM – 7:30 PM\nFri: 9:00 AM – 3:00 PM\nSat: Closed\nSun: 9:00 AM – 6:30 PM', href: undefined },
              ].map((item) => (
                <div key={item.label} className="bg-card border border-border rounded-xl p-5">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm font-medium text-foreground whitespace-pre-line">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="scroll-reveal scroll-reveal-delay-2">
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Follow Us</h3>
              <div className="flex gap-3">
                {['Facebook', 'Instagram', 'YouTube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="scroll-reveal scroll-reveal-delay-1">
            <div className="bg-card border border-border rounded-2xl p-7 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-card-foreground mb-6">Send Us a Message</h2>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">Thank you for reaching out. We'll get back to you soon.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-6 text-primary text-sm underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="emailOrPhone" className="block text-sm font-medium text-foreground mb-1.5">Email or Phone *</label>
                    <input
                      id="emailOrPhone"
                      name="emailOrPhone"
                      type="text"
                      required
                      value={formData.emailOrPhone}
                      onChange={handleChange}
                      placeholder="your@email.com or +254 708 261674"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    >
                      <option value="">Select a subject</option>
                      <option value="Product Enquiry">Product Enquiry</option>
                      <option value="Consultation Request">Consultation Request</option>
                      <option value="Health Reform Information">Health Reform Information</option>
                      <option value="General Question">General Question</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your information is kept private and will only be used to respond to your enquiry. We respect your privacy.
                  </p>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-md hover:-translate-y-0.5"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}