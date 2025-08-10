"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Scale,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Mail,
  Download,
  ExternalLink,
  ArrowRight,
  Lock,
  Globe,
  Settings,
  CreditCard,
  Zap,
  Eye,
  Handshake,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";

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

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Terms of service sections
const termsSections = [
  {
    id: "overview",
    title: "Overview",
    icon: FileText,
    content: `
      <p>These Terms of Service ("Terms") govern your use of WhizBoard, a collaborative whiteboard platform operated by WhizBoard Inc. ("we," "us," or "our"). By accessing or using WhizBoard, you agree to be bound by these Terms.</p>
      
      <p>If you do not agree to these Terms, you must not use our services. We may update these Terms from time to time, and your continued use of WhizBoard after any changes constitutes acceptance of the updated Terms.</p>
      
      <p><strong>Last updated:</strong> January 15, 2024</p>
      
      <h3>Definitions</h3>
      <ul>
        <li><strong>"Service"</strong> refers to the WhizBoard platform and all related features</li>
        <li><strong>"User"</strong> refers to any individual or entity using our Service</li>
        <li><strong>"Content"</strong> refers to any data, text, graphics, or other materials created or shared through our Service</li>
        <li><strong>"Account"</strong> refers to your registered user profile and associated data</li>
      </ul>
    `
  },
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: CheckCircle,
    content: `
      <p>By using WhizBoard, you acknowledge that you have read, understood, and agree to be bound by these Terms. You also agree to comply with all applicable laws and regulations.</p>
      
      <h3>Eligibility</h3>
      <ul>
        <li>You must be at least 13 years old to use WhizBoard</li>
        <li>If you are under 18, you must have parental or guardian consent</li>
        <li>You must have the legal capacity to enter into these Terms</li>
        <li>You must provide accurate and complete information when creating an account</li>
      </ul>
      
      <h3>Account Responsibility</h3>
      <ul>
        <li>You are responsible for maintaining the security of your account</li>
        <li>You must not share your login credentials with others</li>
        <li>You are responsible for all activities that occur under your account</li>
        <li>You must notify us immediately of any unauthorized use</li>
      </ul>
    `
  },
  {
    id: "service-description",
    title: "Service Description",
    icon: Zap,
    content: `
      <p>WhizBoard provides a collaborative whiteboard platform that enables users to:</p>
      
      <h3>Core Features</h3>
      <ul>
        <li>Create and edit digital whiteboards</li>
        <li>Collaborate in real-time with team members</li>
        <li>Use drawing tools, shapes, and text elements</li>
        <li>Share boards with specific users or publicly</li>
        <li>Export boards in various formats</li>
        <li>Access templates and pre-built content</li>
      </ul>
      
      <h3>Service Availability</h3>
      <ul>
        <li>We strive to maintain 99.9% uptime</li>
        <li>Service may be temporarily unavailable for maintenance</li>
        <li>We will provide advance notice for scheduled maintenance</li>
        <li>We are not liable for temporary service interruptions</li>
      </ul>
      
      <h3>Updates and Changes</h3>
      <ul>
        <li>We may update or modify the Service at any time</li>
        <li>New features may be added or removed</li>
        <li>We will notify users of significant changes</li>
        <li>Continued use constitutes acceptance of changes</li>
      </ul>
    `
  },
  {
    id: "user-conduct",
    title: "User Conduct",
    icon: Users,
    content: `
      <p>You agree to use WhizBoard responsibly and in accordance with these Terms:</p>
      
      <h3>Prohibited Activities</h3>
      <p>You must not:</p>
      <ul>
        <li>Use the Service for any illegal or unauthorized purpose</li>
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe on intellectual property rights</li>
        <li>Share inappropriate, offensive, or harmful content</li>
        <li>Attempt to gain unauthorized access to our systems</li>
        <li>Interfere with or disrupt the Service</li>
        <li>Use automated tools to access the Service</li>
        <li>Share your account credentials with others</li>
        <li>Create multiple accounts to circumvent restrictions</li>
      </ul>
      
      <h3>Content Guidelines</h3>
      <p>When creating or sharing content, you must:</p>
      <ul>
        <li>Respect intellectual property rights</li>
        <li>Not share confidential or sensitive information</li>
        <li>Not create content that is harmful, offensive, or inappropriate</li>
        <li>Not impersonate others or misrepresent yourself</li>
        <li>Not use the Service for spam or unsolicited communications</li>
      </ul>
      
      <h3>Consequences</h3>
      <ul>
        <li>We may suspend or terminate accounts that violate these Terms</li>
        <li>We may remove content that violates our policies</li>
        <li>We may report violations to appropriate authorities</li>
        <li>We reserve the right to take legal action when necessary</li>
      </ul>
    `
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    icon: Shield,
    content: `
      <p>Intellectual property rights are important to both you and us:</p>
      
      <h3>Your Content</h3>
      <ul>
        <li>You retain ownership of content you create</li>
        <li>You grant us a license to host and display your content</li>
        <li>You are responsible for ensuring you have rights to share content</li>
        <li>You can delete your content at any time</li>
      </ul>
      
      <h3>Our Rights</h3>
      <ul>
        <li>WhizBoard and its features are protected by copyright and trademarks</li>
        <li>You may not copy, modify, or distribute our software</li>
        <li>You may not reverse engineer or attempt to extract source code</li>
        <li>Our trade secrets and proprietary information are protected</li>
      </ul>
      
      <h3>License to Use</h3>
      <ul>
        <li>We grant you a limited, non-exclusive license to use WhizBoard</li>
        <li>This license is for personal or business use only</li>
        <li>The license is non-transferable and revocable</li>
        <li>You may not sublicense or resell our services</li>
      </ul>
      
      <h3>Feedback and Suggestions</h3>
      <ul>
        <li>We welcome feedback and suggestions</li>
        <li>By providing feedback, you grant us rights to use it</li>
        <li>We are not obligated to implement your suggestions</li>
        <li>You will not receive compensation for feedback</li>
      </ul>
    `
  },
  {
    id: "privacy",
    title: "Privacy and Data",
    icon: Eye,
    content: `
      <p>Your privacy is important to us. Our data practices are governed by our Privacy Policy:</p>
      
      <h3>Data Collection</h3>
      <ul>
        <li>We collect information necessary to provide our services</li>
        <li>We may collect usage data to improve our platform</li>
        <li>We do not sell your personal information</li>
        <li>We implement security measures to protect your data</li>
      </ul>
      
      <h3>Data Usage</h3>
      <ul>
        <li>We use your data to provide and improve our services</li>
        <li>We may use anonymized data for research</li>
        <li>We will not share your data without your consent</li>
        <li>We comply with applicable data protection laws</li>
      </ul>
      
      <h3>Your Rights</h3>
      <ul>
        <li>You can access, update, or delete your personal data</li>
        <li>You can export your data in a portable format</li>
        <li>You can request information about how we use your data</li>
        <li>You can opt-out of certain data processing activities</li>
      </ul>
      
      <p>For more information, please review our <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>.</p>
    `
  },
  {
    id: "subscriptions",
    title: "Subscriptions and Payments",
    icon: CreditCard,
    content: `
      <p>WhizBoard offers both free and paid subscription plans:</p>
      
      <h3>Free Plan</h3>
      <ul>
        <li>Basic features available at no cost</li>
        <li>Limited storage and collaboration features</li>
        <li>No credit card required</li>
        <li>Can be upgraded to paid plans at any time</li>
      </ul>
      
      <h3>Paid Plans</h3>
      <ul>
        <li>Enhanced features and increased limits</li>
        <li>Priority support and advanced collaboration tools</li>
        <li>Billed monthly or annually</li>
        <li>Prices may change with notice</li>
      </ul>
      
      <h3>Payment Terms</h3>
      <ul>
        <li>Payments are processed securely through third-party providers</li>
        <li>Subscriptions automatically renew unless cancelled</li>
        <li>You can cancel at any time through your account settings</li>
        <li>Refunds are provided according to our refund policy</li>
      </ul>
      
      <h3>Billing and Cancellation</h3>
      <ul>
        <li>We will notify you of any price changes</li>
        <li>Failed payments may result in service suspension</li>
        <li>Cancellation takes effect at the end of the billing period</li>
        <li>No refunds for partial months of service</li>
      </ul>
    `
  },
  {
    id: "limitations",
    title: "Limitations of Liability",
    icon: AlertTriangle,
    content: `
      <p>We strive to provide excellent service, but there are limitations to our liability:</p>
      
      <h3>Service Availability</h3>
      <ul>
        <li>We do not guarantee uninterrupted service</li>
        <li>We are not liable for temporary outages or maintenance</li>
        <li>We do not guarantee specific performance levels</li>
        <li>We are not responsible for third-party service interruptions</li>
      </ul>
      
      <h3>Data Loss</h3>
      <ul>
        <li>We implement backup and recovery procedures</li>
        <li>We are not liable for accidental data loss</li>
        <li>You are responsible for backing up important content</li>
        <li>We recommend regular exports of critical data</li>
      </ul>
      
      <h3>Limitation of Damages</h3>
      <ul>
        <li>Our total liability is limited to the amount you paid us</li>
        <li>We are not liable for indirect or consequential damages</li>
        <li>We are not liable for lost profits or business interruption</li>
        <li>Some jurisdictions do not allow liability limitations</li>
      </ul>
      
      <h3>Indemnification</h3>
      <ul>
        <li>You agree to indemnify us against claims arising from your use</li>
        <li>You are responsible for your content and actions</li>
        <li>You must defend us against third-party claims</li>
        <li>This includes claims from other users or third parties</li>
      </ul>
    `
  },
  {
    id: "termination",
    title: "Termination",
    icon: Lock,
    content: `
      <p>Either party may terminate this agreement under certain circumstances:</p>
      
      <h3>Your Right to Terminate</h3>
      <ul>
        <li>You can cancel your account at any time</li>
        <li>You can delete your content and data</li>
        <li>Termination takes effect immediately</li>
        <li>You may lose access to paid features upon cancellation</li>
      </ul>
      
      <h3>Our Right to Terminate</h3>
      <ul>
        <li>We may terminate accounts that violate these Terms</li>
        <li>We may terminate for non-payment of fees</li>
        <li>We may terminate for extended periods of inactivity</li>
        <li>We will provide notice when possible</li>
      </ul>
      
      <h3>Effect of Termination</h3>
      <ul>
        <li>Your access to the Service will be revoked</li>
        <li>Your content may be permanently deleted</li>
        <li>We may retain certain data for legal compliance</li>
        <li>You may lose access to shared content</li>
      </ul>
      
      <h3>Survival</h3>
      <ul>
        <li>Some terms survive termination</li>
        <li>Intellectual property rights continue</li>
        <li>Liability limitations remain in effect</li>
        <li>Dispute resolution procedures continue</li>
      </ul>
    `
  },
  {
    id: "disputes",
    title: "Disputes and Governing Law",
    icon: Scale,
    content: `
      <p>We aim to resolve disputes amicably, but have established procedures for when that's not possible:</p>
      
      <h3>Governing Law</h3>
      <ul>
        <li>These Terms are governed by California law</li>
        <li>Disputes are subject to California jurisdiction</li>
        <li>International users are subject to these laws</li>
        <li>Local laws may provide additional protections</li>
      </ul>
      
      <h3>Dispute Resolution</h3>
      <ul>
        <li>We encourage informal resolution first</li>
        <li>Contact our support team with concerns</li>
        <li>We will respond to complaints within 30 days</li>
        <li>Mediation may be required before legal action</li>
      </ul>
      
      <h3>Arbitration</h3>
      <ul>
        <li>Disputes may be resolved through binding arbitration</li>
        <li>Arbitration will be conducted in San Francisco, CA</li>
        <li>Arbitration is more efficient than court proceedings</li>
        <li>You waive your right to a jury trial</li>
      </ul>
      
      <h3>Class Action Waiver</h3>
      <ul>
        <li>You agree to resolve disputes individually</li>
        <li>You waive any right to class action lawsuits</li>
        <li>This applies to both arbitration and court proceedings</li>
        <li>Some jurisdictions may not allow this waiver</li>
      </ul>
    `
  },
  {
    id: "miscellaneous",
    title: "Miscellaneous",
    icon: Settings,
    content: `
      <p>Additional terms and conditions that apply to these Terms:</p>
      
      <h3>Entire Agreement</h3>
      <ul>
        <li>These Terms constitute the entire agreement</li>
        <li>They supersede any previous agreements</li>
        <li>They apply to all users of our Service</li>
        <li>They may be updated from time to time</li>
      </ul>
      
      <h3>Severability</h3>
      <ul>
        <li>If any provision is found invalid, the rest remain in effect</li>
        <li>Invalid provisions will be modified to be enforceable</li>
        <li>This ensures the agreement remains valid</li>
        <li>Courts will interpret terms reasonably</li>
      </ul>
      
      <h3>Force Majeure</h3>
      <ul>
        <li>We are not liable for events beyond our control</li>
        <li>This includes natural disasters and government actions</li>
        <li>We will notify you of any significant delays</li>
        <li>We will resume service as soon as possible</li>
      </ul>
      
      <h3>Assignment</h3>
      <ul>
        <li>You may not assign your rights under these Terms</li>
        <li>We may assign our rights to affiliates or successors</li>
        <li>Assignment does not affect your rights</li>
        <li>We will notify you of any material changes</li>
      </ul>
    `
  },
  {
    id: "contact",
    title: "Contact Information",
    icon: Mail,
    content: `
      <p>If you have questions about these Terms of Service:</p>
      
      <h3>Legal Department</h3>
      <ul>
        <li>Email: legal@whizboard.com</li>
        <li>Phone: +1 (555) 123-4567</li>
        <li>Address: 123 Market Street, Suite 456, San Francisco, CA 94102</li>
      </ul>
      
      <h3>Support Team</h3>
      <ul>
        <li>Email: support@whizboard.com</li>
        <li>For general questions about our services</li>
        <li>Available during business hours</li>
      </ul>
      
      <h3>Response Times</h3>
      <ul>
        <li>General inquiries: Within 48 hours</li>
        <li>Legal matters: Within 5 business days</li>
        <li>Urgent issues: Within 24 hours</li>
      </ul>
      
      <h3>Updates to Terms</h3>
      <ul>
        <li>We will notify you of material changes</li>
        <li>Updates will be posted on our website</li>
        <li>Continued use constitutes acceptance</li>
        <li>You can opt-out by discontinuing use</li>
      </ul>
    `
  }
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string>("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 max-w-6xl pt-6">
        <BackButton 
          variant="light"
          position="relative"
          size="md"
          label="Back to Home"
        />
      </div>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
            >
              <Scale className="w-4 h-4" />
              Legal & Terms
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Terms of{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              These terms govern your use of WhizBoard. By using our service, you agree to these terms 
              and our commitment to providing a safe, collaborative environment.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Last updated: January 15, 2024</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Legally Binding Agreement</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-slate-50 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Table of Contents</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {termsSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`text-left p-4 rounded-xl transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-slate-800">{section.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-16"
          >
            {termsSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  variants={fadeInUp}
                  id={section.id}
                  className="scroll-mt-20"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">{section.title}</h2>
                  </div>
                  
                  <div 
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact and Download */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Questions About Terms?
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              We're here to help clarify any questions about our terms of service.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Link
                href="/contact"
                className="group bg-white rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <Mail className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Contact Legal Team</h3>
                <p className="text-slate-600 text-sm mb-4">Get in touch with our legal experts</p>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  Send Message →
                </span>
              </Link>

              <button className="group bg-white rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Download className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Download Terms</h3>
                <p className="text-slate-600 text-sm mb-4">Get a PDF copy of these terms</p>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  Download PDF →
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 