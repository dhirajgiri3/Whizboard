"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  Send,
  Sparkles,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Calendar,
  Zap,
  Heart,
  Star,
  ChevronDown,
  HelpCircle,
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

// Data
const contactMethods: ContactMethod[] = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our support team within 24 hours",
    info: "support@whizboard.com",
    action: "Send Email",
    href: "mailto:support@whizboard.com",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with us in real-time during business hours",
    info: "Available 9 AM - 6 PM EST",
    action: "Start Chat",
    href: "#",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our enterprise team",
    info: "+1 (555) 123-4567",
    action: "Call Now",
    href: "tel:+15551234567",
    color: "from-purple-500 to-violet-600"
  },
  {
    icon: Calendar,
    title: "Schedule Demo",
    description: "Book a personalized demo for your team",
    info: "15-minute consultation",
    action: "Book Demo",
    href: "#",
    color: "from-orange-500 to-red-600"
  }
];

const officeLocations = [
  {
    city: "San Francisco",
    address: "123 Market Street, Suite 456",
    coordinates: "San Francisco, CA 94102",
    timezone: "PST (UTC-8)"
  },
  {
    city: "New York",
    address: "456 Fifth Avenue, 12th Floor", 
    coordinates: "New York, NY 10018",
    timezone: "EST (UTC-5)"
  },
  {
    city: "London",
    address: "789 Oxford Street, Level 3",
    coordinates: "London, UK W1C 1DX", 
    timezone: "GMT (UTC+0)"
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
    <div className="min-h-screen bg-[#0A0A0B] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] bg-repeat opacity-[0.02] pointer-events-none"></div>
      
      {/* Animated Gradient Orbs */}
      <motion.div 
        className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full" 
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, -50%)'
        }}
        variants={orbAnimation}
        initial="initial"
        animate="animate"
      />
      
      <motion.div 
        className="absolute bottom-20 right-1/4 w-[600px] h-[600px] rounded-full" 
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          transform: 'translate(50%, 50%)'
        }}
        variants={orbAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      />
      
      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Get in Touch</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              Let's Build Something
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Amazing Together
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Whether you have questions, need support, or want to explore partnerships, 
              our team is here to help you succeed with WhizBoard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              const gradientColors = [
                'from-blue-500 to-indigo-600',
                'from-green-500 to-emerald-600', 
                'from-purple-500 to-violet-600',
                'from-orange-500 to-red-600'
              ];
              
              return (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="relative group"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32" style={{
                    background: `conic-gradient(from 0deg, ${gradientColors[index % gradientColors.length].split(' ')[1]}, transparent, ${gradientColors[index % gradientColors.length].split(' ')[3]})`,
                    filter: 'blur(20px)',
                    opacity: 0.3
                  }}></div>
                  
                  <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full hover:border-slate-600/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} mb-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3">{method.title}</h3>
                    <p className="text-slate-300 mb-4 leading-relaxed">{method.description}</p>
                    <p className="text-sm text-slate-400 mb-6">{method.info}</p>
                    
                    <Link 
                      href={method.href}
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      {method.action}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Office Locations */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Send us a Message</h2>
                  <p className="text-slate-300">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>

                {isSubmitted ? (
                  <motion.div 
                    className="text-center py-12"
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Message Sent!</h3>
                    <p className="text-slate-300 mb-8">Thank you for reaching out. We'll get back to you soon.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full bg-slate-800/50 border ${errors.name ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                          placeholder="Your name"
                        />
                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                          placeholder="your@email.com"
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={`w-full bg-slate-800/50 border ${errors.subject ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                        placeholder="What's this about?"
                      />
                      {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows={6}
                        className={`w-full bg-slate-800/50 border ${errors.message ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none`}
                        placeholder="Tell us more about your inquiry..."
                      />
                      {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
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

            {/* Office Locations */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Our Offices</h2>
                  <p className="text-slate-300">Visit us at one of our global locations or connect with us remotely.</p>
                </div>

                <div className="space-y-6">
                  {officeLocations.map((location, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{location.city}</h3>
                          <p className="text-slate-300 mb-2">{location.address}</p>
                          <p className="text-slate-400 text-sm mb-2">{location.coordinates}</p>
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{location.timezone}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                  <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
                  <motion.div 
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-slate-800 mb-3">{faq.question}</h3>
                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
