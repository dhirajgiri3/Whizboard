"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Eye,
  Lock,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Users,
  Database,
  Globe,
  Cookie,
  Settings,
  Download,
  ExternalLink,
} from "lucide-react";

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

// Privacy policy sections
const privacySections = [
  {
    id: "overview",
    title: "Overview",
    icon: Eye,
    content: `
      <p>At WhizBoard, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our collaborative whiteboard platform.</p>
      
      <p>This policy applies to all users of WhizBoard, including visitors to our website, users of our web application, and customers of our services. By using WhizBoard, you agree to the collection and use of information in accordance with this policy.</p>
      
      <p><strong>Last updated:</strong> January 15, 2024</p>
    `
  },
  {
    id: "information-collection",
    title: "Information We Collect",
    icon: Database,
    content: `
      <h3>Personal Information</h3>
      <p>We collect information you provide directly to us, such as when you:</p>
      <ul>
        <li>Create an account or profile</li>
        <li>Subscribe to our services</li>
        <li>Contact our support team</li>
        <li>Participate in surveys or promotions</li>
      </ul>
      
      <p>This may include:</p>
      <ul>
        <li>Name and email address</li>
        <li>Company or organization information</li>
        <li>Payment and billing information</li>
        <li>Communication preferences</li>
      </ul>
      
      <h3>Usage Information</h3>
      <p>We automatically collect certain information about your use of WhizBoard, including:</p>
      <ul>
        <li>Device and browser information</li>
        <li>IP address and location data</li>
        <li>Usage patterns and preferences</li>
        <li>Performance and error data</li>
      </ul>
      
      <h3>Content and Collaboration Data</h3>
      <p>We store the content you create and collaborate on, including:</p>
      <ul>
        <li>Whiteboard content and drawings</li>
        <li>Text, shapes, and other elements</li>
        <li>Collaboration history and comments</li>
        <li>Board templates and settings</li>
      </ul>
    `
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    icon: Settings,
    content: `
      <p>We use the information we collect to:</p>
      
      <h3>Provide and Improve Our Services</h3>
      <ul>
        <li>Deliver the WhizBoard platform and features</li>
        <li>Enable real-time collaboration</li>
        <li>Maintain and improve service performance</li>
        <li>Develop new features and functionality</li>
      </ul>
      
      <h3>Communication and Support</h3>
      <ul>
        <li>Respond to your inquiries and support requests</li>
        <li>Send important service updates and notifications</li>
        <li>Provide customer support and technical assistance</li>
        <li>Send marketing communications (with your consent)</li>
      </ul>
      
      <h3>Security and Compliance</h3>
      <ul>
        <li>Protect against fraud and abuse</li>
        <li>Ensure compliance with legal obligations</li>
        <li>Maintain the security of our platform</li>
        <li>Enforce our terms of service</li>
      </ul>
      
      <h3>Research and Development</h3>
      <ul>
        <li>Analyze usage patterns to improve our services</li>
        <li>Conduct research and development</li>
        <li>Generate anonymous usage statistics</li>
      </ul>
    `
  },
  {
    id: "information-sharing",
    title: "Information Sharing and Disclosure",
    icon: Users,
    content: `
      <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:</p>
      
      <h3>With Your Consent</h3>
      <p>We may share your information when you explicitly consent to such sharing.</p>
      
      <h3>Service Providers</h3>
      <p>We work with trusted third-party service providers who assist us in:</p>
      <ul>
        <li>Hosting and infrastructure services</li>
        <li>Payment processing and billing</li>
        <li>Customer support and communication</li>
        <li>Performance monitoring</li>
      </ul>
      
      <h3>Legal Requirements</h3>
      <p>We may disclose your information if required by law or in response to:</p>
      <ul>
        <li>Valid legal requests from law enforcement</li>
        <li>Court orders or subpoenas</li>
        <li>Government investigations</li>
        <li>Protection of our rights and safety</li>
      </ul>
      
      <h3>Business Transfers</h3>
      <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.</p>
    `
  },
  {
    id: "data-security",
    title: "Data Security",
    icon: Lock,
    content: `
      <p>We implement comprehensive security measures to protect your information:</p>
      
      <h3>Technical Safeguards</h3>
      <ul>
        <li>End-to-end encryption for data in transit</li>
        <li>Strong encryption for data at rest</li>
        <li>Regular security audits and penetration testing</li>
        <li>Multi-factor authentication for account access</li>
        <li>Secure data centers with physical security</li>
      </ul>
      
      <h3>Access Controls</h3>
      <ul>
        <li>Role-based access controls for our team</li>
        <li>Regular access reviews and audits</li>
        <li>Background checks for employees with data access</li>
        <li>Secure development practices and code reviews</li>
      </ul>
      
      <h3>Incident Response</h3>
      <ul>
        <li>24/7 security monitoring and alerting</li>
        <li>Incident response procedures and team</li>
        <li>Regular security training for employees</li>
        <li>Compliance with industry security standards</li>
      </ul>
      
      <p><strong>Note:</strong> While we implement strong security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
    `
  },
  {
    id: "data-retention",
    title: "Data Retention",
    icon: Calendar,
    content: `
      <p>We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:</p>
      
      <h3>Account Information</h3>
      <ul>
        <li>Active accounts: Retained while your account is active</li>
        <li>Inactive accounts: Deleted after 12 months of inactivity</li>
        <li>Billing information: Retained for 7 years for tax purposes</li>
      </ul>
      
      <h3>Content and Collaboration Data</h3>
      <ul>
        <li>Active boards: Retained while boards are active</li>
        <li>Deleted boards: Permanently deleted after 30 days</li>
        <li>Backup copies: Retained for up to 90 days for recovery</li>
      </ul>
      
              <h3>Usage Data</h3>
      <ul>
        <li>Performance data: Retained for 2 years</li>
        <li>Usage data: Anonymized after 1 year</li>
        <li>Error logs: Retained for 90 days</li>
      </ul>
      
      <h3>Legal Requirements</h3>
      <p>We may retain certain information longer if required by law or to resolve disputes.</p>
    `
  },
  {
    id: "your-rights",
    title: "Your Rights and Choices",
    icon: CheckCircle,
    content: `
      <p>You have certain rights regarding your personal information:</p>
      
      <h3>Access and Portability</h3>
      <ul>
        <li>Access your personal information</li>
        <li>Download your data in a portable format</li>
        <li>Request information about how we process your data</li>
      </ul>
      
      <h3>Correction and Updates</h3>
      <ul>
        <li>Update your account information</li>
        <li>Correct inaccurate personal data</li>
        <li>Modify your communication preferences</li>
      </ul>
      
      <h3>Deletion and Restriction</h3>
      <ul>
        <li>Delete your account and associated data</li>
        <li>Request deletion of specific content</li>
        <li>Restrict processing of your data</li>
      </ul>
      
      <h3>Marketing Communications</h3>
      <ul>
        <li>Opt-out of marketing emails</li>
        <li>Manage your communication preferences</li>
        <li>Unsubscribe from specific communications</li>
      </ul>
      
      <h3>Cookies and Tracking</h3>
      <ul>
        <li>Manage cookie preferences</li>
        <li>Opt-out of usage tracking</li>
        <li>Control browser tracking settings</li>
      </ul>
    `
  },
  {
    id: "cookies",
    title: "Cookies and Tracking Technologies",
    icon: Cookie,
    content: `
      <p>We use cookies and similar technologies to enhance your experience:</p>
      
      <h3>Essential Cookies</h3>
      <ul>
        <li>Authentication and session management</li>
        <li>Security and fraud prevention</li>
        <li>Basic functionality and preferences</li>
      </ul>
      
              <h3>Performance Cookies</h3>
        <ul>
          <li>Usage monitoring and performance tracking</li>
        <li>Feature usage and user behavior</li>
        <li>Service improvement and optimization</li>
      </ul>
      
      <h3>Marketing Cookies</h3>
      <ul>
        <li>Personalized content and recommendations</li>
        <li>Advertising and retargeting</li>
        <li>Social media integration</li>
      </ul>
      
      <h3>Managing Cookies</h3>
      <p>You can control cookies through:</p>
      <ul>
        <li>Your browser settings</li>
        <li>Our cookie consent banner</li>
        <li>Account privacy settings</li>
        <li>Third-party opt-out tools</li>
      </ul>
    `
  },
  {
    id: "international",
    title: "International Data Transfers",
    icon: Globe,
    content: `
      <p>WhizBoard operates globally and may transfer your information internationally:</p>
      
      <h3>Data Transfer Locations</h3>
      <ul>
        <li>Primary data centers: United States and European Union</li>
        <li>Backup locations: Multiple global locations</li>
        <li>Service providers: Various international locations</li>
      </ul>
      
      <h3>Transfer Safeguards</h3>
      <ul>
        <li>Standard Contractual Clauses (SCCs)</li>
        <li>Adequacy decisions by relevant authorities</li>
        <li>Certification schemes and codes of conduct</li>
        <li>Binding corporate rules where applicable</li>
      </ul>
      
      <h3>Compliance</h3>
      <ul>
        <li>GDPR compliance for EU data subjects</li>
        <li>CCPA compliance for California residents</li>
        <li>Other applicable privacy laws</li>
        <li>Regular compliance audits and assessments</li>
      </ul>
    `
  },
  {
    id: "children",
    title: "Children's Privacy",
    icon: Shield,
    content: `
      <p>WhizBoard is not intended for children under 13 years of age:</p>
      
      <h3>Age Restrictions</h3>
      <ul>
        <li>We do not knowingly collect personal information from children under 13</li>
        <li>Users must be at least 13 years old to create an account</li>
        <li>Parental consent required for users under 16 in certain jurisdictions</li>
      </ul>
      
      <h3>If We Discover Child Data</h3>
      <ul>
        <li>We will promptly delete any personal information of children under 13</li>
        <li>We will notify parents or guardians if required by law</li>
        <li>We will take appropriate action to prevent future collection</li>
      </ul>
      
      <h3>Educational Use</h3>
      <p>For educational institutions using WhizBoard with students:</p>
      <ul>
        <li>Schools must obtain appropriate parental consent</li>
        <li>Educational accounts may have additional privacy controls</li>
        <li>We comply with applicable educational privacy laws</li>
      </ul>
    `
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    icon: FileText,
    content: `
      <p>We may update this Privacy Policy from time to time:</p>
      
      <h3>Notification of Changes</h3>
      <ul>
        <li>We will notify you of material changes via email</li>
        <li>We will post updates on our website</li>
        <li>We will update the "Last updated" date</li>
        <li>We will provide advance notice for significant changes</li>
      </ul>
      
      <h3>Your Continued Use</h3>
      <ul>
        <li>Continued use after changes constitutes acceptance</li>
        <li>You can opt-out of changes by discontinuing use</li>
        <li>We will honor previous consent for existing data</li>
      </ul>
      
      <h3>Version History</h3>
      <p>Previous versions of this policy are available upon request.</p>
    `
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: Mail,
    content: `
      <p>If you have questions about this Privacy Policy or our data practices:</p>
      
      <h3>Privacy Team</h3>
      <ul>
        <li>Email: privacy@whizboard.com</li>
        <li>Phone: +1 (555) 123-4567</li>
        <li>Address: 123 Market Street, Suite 456, San Francisco, CA 94102</li>
      </ul>
      
      <h3>Data Protection Officer</h3>
      <ul>
        <li>Email: dpo@whizboard.com</li>
        <li>For EU data subjects and GDPR inquiries</li>
      </ul>
      
      <h3>Support Team</h3>
      <ul>
        <li>Email: support@whizboard.com</li>
        <li>For general account and technical support</li>
      </ul>
      
      <h3>Response Times</h3>
      <ul>
        <li>General inquiries: Within 48 hours</li>
        <li>Data subject requests: Within 30 days</li>
        <li>Urgent privacy concerns: Within 24 hours</li>
      </ul>
    `
  }
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
              <Shield className="w-4 h-4" />
              Privacy & Security
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Privacy{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              We're committed to protecting your privacy and being transparent about how we collect, 
              use, and safeguard your information when you use WhizBoard.
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
                <span className="text-sm">GDPR & CCPA Compliant</span>
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
              {privacySections.map((section, index) => {
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

      {/* Privacy Policy Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-16"
          >
            {privacySections.map((section, index) => {
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

      {/* Download and Contact */}
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
              Questions About Privacy?
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              We're here to help with any privacy-related questions or concerns.
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
                <h3 className="font-bold text-slate-800 mb-2">Contact Privacy Team</h3>
                <p className="text-slate-600 text-sm mb-4">Get in touch with our privacy experts</p>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  Send Message →
                </span>
              </Link>

              <button className="group bg-white rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Download className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Download Policy</h3>
                <p className="text-slate-600 text-sm mb-4">Get a PDF copy of this privacy policy</p>
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