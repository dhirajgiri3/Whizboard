"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  Send, 
  Globe, 
  Twitter, 
  Linkedin, 
  Github, 
  Calendar, 
  Zap, 
  Heart, 
  Star, 
  HelpCircle,
  Shield,
  Users,
  Target,
  Rocket
} from "lucide-react";
import Link from "next/link";

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
  gradient: string[];
}

export default function ContactPage() {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -30]);
  
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
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

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

  // Handle FAQ toggle
  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  const faqVariants = {
    closed: { 
      height: 0,
      opacity: 0
    },
    open: { 
      height: "auto",
      opacity: 1
    }
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
      color: "blue",
      gradient: ["#3B82F6", "#8B5CF6", "#EC4899"]
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time during business hours",
      info: "Available 9 AM - 6 PM EST",
      action: "Start Chat",
      href: "#",
      color: "emerald",
      gradient: ["#10B981", "#8B5CF6", "#F59E0B"]
    },
    {
      icon: Calendar,
      title: "Schedule Demo",
      description: "Book a personalized demo for your team",
      info: "15-minute consultation",
      action: "Book Demo",
      href: "#",
      color: "orange",
      gradient: ["#F59E0B", "#EC4899", "#8B5CF6"]
    },
    {
      icon: Phone,
      title: "Enterprise Support",
      description: "Speak directly with our enterprise team",
      info: "Priority response under 4 hours",
      action: "Contact Sales",
      href: "#",
      color: "purple",
      gradient: ["#8B5CF6", "#EC4899", "#3B82F6"]
    }
  ];

  const officeLocations = [
    {
      city: "Delhi",
      address: "New Delhi, India",
      coordinates: "Delhi, India",
      timezone: "IST (UTC+5:30)"
    }
  ];

  const faqs = [
    {
      id: "faq-1",
      question: "How quickly do you respond to support requests?",
      answer: "We respond to all support requests within 24 hours. For enterprise customers, we offer priority support with response times under 4 hours."
    },
    {
      id: "faq-2",
      question: "Do you offer phone support?",
      answer: "Yes! Phone support is available for Pro and Enterprise customers. We're available during business hours across all major time zones."
    },
    {
      id: "faq-3",
      question: "Can I schedule a demo of WhizBoard?",
      answer: "Absolutely! We offer personalized 15-minute demos where we'll show you exactly how WhizBoard works for your specific use case."
    },
    {
      id: "faq-4",
      question: "Do you have partnerships or integration opportunities?",
      answer: "We're always interested in strategic partnerships and integrations. Please reach out to our partnerships team for more information."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Primary Background */}
        <div className="absolute inset-0 bg-gray-950" />
        
        {/* Enhanced Grid Pattern with Edge Fading */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main Grid */}
          <motion.div
            className="w-full h-full opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "20px 20px"],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Edge Fading Masks */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-gray-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-950" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-gray-950" />
          
          {/* Subtle Radial Fade from Center */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-gray-950/80" />
        </motion.div>

        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)',
            filter: 'blur(40px)',
            willChange: 'transform'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            transition: {
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
          style={{
            background: 'radial-gradient(circle, rgba(115, 115, 115, 0.15) 0%, rgba(115, 115, 115, 0.03) 50%, transparent 70%)',
            filter: 'blur(50px)',
            willChange: 'transform'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          animate={{
            y: [0, 25, 0],
            x: [0, -20, 0],
            transition: {
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={headerVariants}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: parallaxY }}
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-8"
            >
              <span className="text-white/70 text-sm font-medium">Get in Touch</span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl mx-auto text-5xl md:text-6xl font-bold mb-4 tracking-tight"
            >
              Let's Build Something{" "}
              <span className="text-blue-400">
                Amazing Together
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p
              variants={itemVariants}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-white/70 leading-relaxed mb-16 max-w-xl mx-auto font-light"
            >
              Whether you have questions, need support, or want to explore partnerships, 
              our team is here to help you succeed with WhizBoard.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              const isHovered = hoveredMethod === method.title;
              
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                  }}
                  onHoverStart={() => setHoveredMethod(method.title)}
                  onHoverEnd={() => setHoveredMethod(null)}
                  className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
                >
                  {/* Enhanced Gradient Background */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${method.gradient.join(', ')})`,
                      backgroundSize: '200% 200%',
                      filter: 'blur(80px)',
                      opacity: 0.4
                    }}
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                      transition: {
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 1.5
                      }
                    }}
                  />
                  
                  {/* Additional Glow Layer */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `radial-gradient(circle at 30% 20%, ${method.gradient[0]}40, transparent 50%), radial-gradient(circle at 70% 80%, ${method.gradient[1]}30, transparent 50%)`,
                      filter: 'blur(30px)',
                      opacity: 0.2
                    }}
                    animate={{
                      opacity: isHovered ? [0.2, 0.4, 0.2] : 0.2,
                      transition: {
                        duration: 8,
                        repeat: Infinity,
                        ease: [0.22, 1, 0.36, 1],
                        delay: index * 0.3
                      }
                    }}
                  />
                  
                  {/* Moving Particles Effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at ${20 + index * 20}% ${30 + index * 15}%, ${method.gradient[2]}20, transparent 30%)`,
                      filter: 'blur(20px)',
                      opacity: 0.3
                    }}
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -15, 0],
                      transition: {
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.8
                      }
                    }}
                  />

                  {/* Card Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div className="inline-flex p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 self-start mb-6 group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20">
                      <Icon className="h-7 w-7 text-white/90" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3 mb-6">
                      <h3 className="text-xl font-semibold text-white">{method.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed">{method.description}</p>
                    </div>
                    
                    {/* Info */}
                    <p className="text-white/60 text-sm mb-6">{method.info}</p>
                    
                    {/* CTA */}
                    <Link 
                      href={method.href}
                      className="inline-flex items-center space-x-2 text-blue-400 font-medium hover:text-blue-300 transition-colors group/link self-start mt-auto"
                    >
                      <span>{method.action}</span>
                      <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Office Locations */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Subtle Background Orb */}
              <motion.div 
                className="absolute -top-20 -left-20 w-40 h-40"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                  filter: 'blur(50px)'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
              
              <div className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Send us a Message</h2>
                  <p className="text-white/70">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>

                {isSubmitted ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Message Sent!</h3>
                    <p className="text-white/70 mb-8">Thank you for reaching out. We'll get back to you soon.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full bg-white/[0.05] border ${errors.name ? 'border-red-500/50' : 'border-white/[0.1]'} rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all duration-200`}
                          placeholder="Your name"
                        />
                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full bg-white/[0.05] border ${errors.email ? 'border-red-500/50' : 'border-white/[0.1]'} rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all duration-200`}
                          placeholder="your@email.com"
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all duration-200"
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={`w-full bg-white/[0.05] border ${errors.subject ? 'border-red-500/50' : 'border-white/[0.1]'} rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all duration-200`}
                        placeholder="What's this about?"
                      />
                      {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows={6}
                        className={`w-full bg-white/[0.05] border ${errors.message ? 'border-red-500/50' : 'border-white/[0.1]'} rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all duration-200 resize-none`}
                        placeholder="Tell us more about your inquiry..."
                      />
                      {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Subtle Background Orb */}
              <motion.div 
                className="absolute -top-20 -right-20 w-40 h-40"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
                  filter: 'blur(50px)'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              
              <div className="relative">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Our Offices</h2>
                  <p className="text-white/70">Visit us at one of our global locations or connect with us remotely.</p>
                </div>

                <div className="space-y-6">
                  {officeLocations.map((location, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{location.city}</h3>
                          <p className="text-white/70 mb-2">{location.address}</p>
                          <p className="text-white/60 text-sm mb-2">{location.coordinates}</p>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
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
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariants}
                    transition={{ staggerChildren: 0.1, delayChildren: 0.4 }}
                  >
                    {faqs.map((faq, index) => {
                      const isOpen = openFaq === faq.id;
                      return (
                        <motion.div
                          key={faq.id}
                          variants={itemVariants}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="group overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
                        >
                          {/* FAQ Header */}
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors duration-200"
                          >
                            <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors pr-4">
                              {faq.question}
                            </h4>
                            <motion.div
                              className="flex-shrink-0 w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center"
                              animate={{ rotate: isOpen ? 45 : 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <motion.div
                                className="w-3 h-3 bg-white/60"
                                animate={{ 
                                  rotate: isOpen ? 90 : 0,
                                  scale: isOpen ? 0.8 : 1
                                }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </motion.div>
                          </button>
                          
                          {/* FAQ Content */}
                          <motion.div
                            initial="closed"
                            animate={isOpen ? "open" : "closed"}
                            variants={faqVariants}
                            transition={{ 
                              duration: 0.4, 
                              ease: [0.22, 1, 0.36, 1] 
                            }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6">
                              <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            transition={{ staggerChildren: 0.1, delayChildren: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 lg:gap-12"
          >
            {[
              { icon: Zap, text: "24h Response", color: "text-blue-400", bgColor: "bg-blue-500/10" },
              { icon: Shield, text: "Enterprise Secure", color: "text-green-400", bgColor: "bg-green-500/10" },
              { icon: Users, text: "Global Support", color: "text-purple-400", bgColor: "bg-purple-500/10" },
              { icon: Star, text: "4.9/5 Rating", color: "text-yellow-400", bgColor: "bg-yellow-500/10" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl ${item.bgColor} border border-white/[0.08] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-200`}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="font-semibold text-white/90 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
