"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import SmoothScrollProvider from "@/components/landing/SmoothScrollProvider";
import {
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Send,
  Calendar, 
  ChevronDown,
  Users,
  Star,
} from "lucide-react";

// Types
interface ContactForm {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'sales' | 'partnership';
}

interface ContactMethod {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  info: string;
  action: string;
  href: string;
  color: string;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const orbAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse" as const }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Match About page background/section motion patterns
const backgroundVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

// Data
const contactMethods: ContactMethod[] = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our support team within 24 hours",
    info: "Hello@cyperstudio.in",
    action: "Send Email",
    href: "mailto:Hello@cyperstudio.in",
    color: "from-blue-600 to-blue-500"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our enterprise team",
    info: "+919569691483",
    action: "Call Now",
    href: "tel:+919569691483",
    color: "from-blue-700 to-blue-600"
  },
  {
    icon: MessageCircle,
    title: "Talk to our team",
    description: "Fill the form and we'll contact you soon",
    info: "Avg. response < 24h",
    action: "Open form",
    href: "#contact-form",
    color: "from-blue-500 to-blue-400"
  }
];

const officeLocations = [
  {
    city: "Delhi",
    address: "Delhi, India",
    coordinates: "Delhi, India",
    timezone: "IST (UTC+5:30)"
  }
];

const faqs = [
  {
    question: "How quickly do you respond to support requests?",
    answer: "We respond to all support requests within 24 hours. For enterprise customers, we offer priority support with response times under 4 hours."
  },
  {
    question: "Do you offer phone support?",
    answer: "Yes! Phone support is available for Pro and Enterprise customers. We're available during business hours across all major time zones."
  },
  {
    question: "Can I schedule a demo of WhizBoard?",
    answer: "Absolutely! We offer personalized 15-minute demos where we'll show you exactly how WhizBoard works for your specific use case."
  },
  {
    question: "Do you have partnerships or integration opportunities?",
    answer: "We're always interested in strategic partnerships and integrations. Please reach out to our partnerships team for more information."
  }
];

export default function ContactPage() {
  // Form state
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const inquiryTypes: ContactForm['type'][] = ['general', 'support', 'sales', 'partnership'];

  // Smooth scroll to form
  const handleScrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('contact-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SmoothScrollProvider>
    <div className="min-h-screen bg-[#0A0A0B] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <BackButton variant="dark" />
      </div>
      {/* Background Elements */}
      {/* Hero Section with local grid + orbs */}
      <section className="relative z-10 pt-32 pb-24 sm:pb-28 lg:pb-32">
        {/* Hero grid overlay (subtle, hero-only) */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </motion.div>
        {/* Hero orbs (blue + neutral) */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)',
            filter: 'blur(40px)'
          }} />
        </motion.div>
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: 'radial-gradient(circle, rgba(115, 115, 115, 0.15) 0%, rgba(115, 115, 115, 0.03) 50%, transparent 70%)',
            filter: 'blur(50px)'
          }} />
        </motion.div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <span className="text-sm text-white/70">Get in Touch</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Let's Build Something</span>
              <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Amazing Together
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-3xl mx-auto">
              Whether you have questions, need support, or want to explore partnerships, 
              our team is here to help you succeed with WhizBoard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="mailto:Hello@cyperstudio.in"
                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email us
                </span>
              </Link>
              <Link
                href="#contact-form"
                onClick={handleScrollToForm}
                className="text-white hover:text-blue-300 hover:bg-white/5 font-medium px-6 py-3 rounded-xl border border-white/10 hover:border-blue-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Open form
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 sm:p-8 h-full hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, transparent 50%)' }} />
                    <div className={`relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} mb-6 shadow-glow`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="relative z-10 text-lg font-semibold text-white mb-2">{method.title}</h3>
                    <p className="relative z-10 text-white/70 mb-4 leading-relaxed">{method.description}</p>
                    <p className="relative z-10 text-sm text-white/60 mb-6">{method.info}</p>
                    <Link 
                      href={method.href}
                      onClick={method.href === '#contact-form' ? handleScrollToForm : undefined}
                      className="relative z-10 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      title={method.action}
                    >
                      {method.action}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Office Locations */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16"
          >
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Send us a message</h2>
                  <p className="text-white/70 leading-relaxed">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>

                {isSubmitted ? (
                  <motion.div 
                    className="text-center py-12"
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-6">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Message Sent!</h3>
                    <p className="text-white/70 mb-8">Thank you for reaching out. We'll get back to you soon.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                      Send Another Message
                    </button>
                    <div aria-live="polite" className="sr-only">Your message has been sent successfully.</div>
                  </motion.div>
                ) : (
                  <form id="contact-form" onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* Inquiry type segmented control */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white/90">Inquiry type</label>
                      <div role="radiogroup" aria-label="Inquiry type" className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {inquiryTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            role="radio"
                            aria-checked={formData.type === type}
                            onClick={() => handleInputChange('type', type)}
                            className={`rounded-xl px-3 py-2 text-sm font-medium border transition-all ${formData.type === type ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/[0.04] text-white/80 border-white/[0.08] hover:bg-white/[0.06]'}`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium text-white/90 mb-2">Name *</label>
                        <input
                          type="text"
                          id="contact-name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'contact-name-error' : undefined}
                          required
                          autoComplete="name"
                          className={`block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 ${errors.name ? 'ring-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Your name"
                        />
                        {errors.name && <p id="contact-name-error" className="text-red-400 text-sm mt-1">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-white/90 mb-2">Email *</label>
                        <input
                          type="email"
                          id="contact-email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'contact-email-error' : undefined}
                          required
                          autoComplete="email"
                          inputMode="email"
                          className={`block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 ${errors.email ? 'ring-red-500 focus:ring-red-500' : ''}`}
                          placeholder="your@email.com"
                        />
                        {errors.email && <p id="contact-email-error" className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="contact-company" className="block text-sm font-medium text-white/90 mb-2">Company</label>
                      <input
                        type="text"
                        id="contact-company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        autoComplete="organization"
                        className="block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200"
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-medium text-white/90 mb-2">Subject *</label>
                      <input
                        type="text"
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                        required
                        autoComplete="off"
                        className={`block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 ${errors.subject ? 'ring-red-500 focus:ring-red-500' : ''}`}
                        placeholder="What's this about?"
                      />
                      {errors.subject && <p id="contact-subject-error" className="text-red-400 text-sm mt-1">{errors.subject}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-white/90 mb-2">Message *</label>
                      <textarea
                        id="contact-message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows={6}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'contact-message-error' : undefined}
                        required
                        className={`block w-full rounded-xl border-0 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 resize-none ${errors.message ? 'ring-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Tell us more about your inquiry..."
                      />
                      {errors.message && <p id="contact-message-error" className="text-red-400 text-sm mt-1">{errors.message}</p>}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      aria-disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">FAQs</h2>
                  <p className="text-white/70 leading-relaxed">Answers to common questions</p>
                </div>
                <div className="divide-y divide-white/10">
                  {faqs.map((faq, index) => (
                    <div key={index} className="py-4">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full flex items-center justify-between text-left"
                        aria-expanded={openFaqIndex === index}
                        aria-controls={`faq-panel-${index}`}
                      >
                        <span className="text-white font-medium">{faq.question}</span>
                        <ChevronDown className={`h-5 w-5 text-white/60 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === index && (
                        <motion.p
                          id={`faq-panel-${index}`}
                          role="region"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-white/70 mt-2"
                        >
                          {faq.answer}
                        </motion.p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
    </SmoothScrollProvider>
  );
}
