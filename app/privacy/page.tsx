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
  ArrowRight,
  CheckCircle,
  Users,
  Database,
  Globe,
  Cookie,
  Settings,
  Download,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { downloadPDF, createContentFromSections } from "@/lib/utils/pdfGenerator";
import { LEGAL_DOCUMENTS } from "@/lib/constants/legalDocuments";

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
        <li>Email: Hello@cyperstudio.in</li>
        <li>Phone: +919569691483</li>
        <li>Address: Delhi, India</li>
      </ul>
      
      <h3>Data Protection Officer</h3>
      <ul>
        <li>Email: Hello@cyperstudio.in</li>
        <li>For EU data subjects and GDPR inquiries</li>
      </ul>
      
      <h3>Support Team</h3>
      <ul>
        <li>Email: Hello@cyperstudio.in</li>
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
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleTocClick = (id: string) => {
    setActiveSection(id);
    if (typeof window !== "undefined") {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      const { PRIVACY_POLICY } = LEGAL_DOCUMENTS;
      const fullContent = createContentFromSections(privacySections);
      const privacyContent = `# ${PRIVACY_POLICY.title}

${fullContent}

Last updated: ${PRIVACY_POLICY.lastUpdated}
Version: ${PRIVACY_POLICY.version}
Effective Date: ${PRIVACY_POLICY.effectiveDate}`;

      downloadPDF({
        title: PRIVACY_POLICY.title,
        content: privacyContent,
        filename: "whizboard-privacy-policy.pdf",
        version: PRIVACY_POLICY.version,
        effectiveDate: PRIVACY_POLICY.effectiveDate
      });
    } catch (error) {
      console.error('PDF download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white overflow-hidden">

      {/* Gradient orbs (blue + neutral only) */}
      <motion.div
        className="absolute -top-16 -left-10 w-72 h-72 md:w-96 md:h-96"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.38) 0%, rgba(37,99,235,0.12) 50%, transparent 70%)",
          filter: "blur(38px)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-24 right-0 w-64 h-64 md:w-80 md:h-80"
        style={{
          background:
            "radial-gradient(circle, rgba(115,115,115,0.20) 0%, rgba(115,115,115,0.06) 50%, transparent 70%)",
          filter: "blur(48px)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Top bar with Back */}
      <div className="container mx-auto px-4 max-w-6xl pt-20 md:pt-24 relative z-10">
        <BackButton variant="dark" position="relative" size="md" label="Back to Home" />
      </div>

      {/* Hero */}
      <section className="relative pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="text-center mb-8 md:mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-sm font-medium mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              Privacy & Security
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">Privacy Policy</h1>

            <p className="text-white/70 max-w-3xl mx-auto mt-3">
              We're committed to protecting your privacy and being transparent about how we collect and use your information.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center items-center text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Last updated: 15/01/2024</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">GDPR & CCPA Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.08]"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {privacySections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleTocClick(section.id)}
                    className={`text-left p-4 rounded-xl transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isActive
                        ? "bg-blue-600/15 border-blue-500/30"
                        : "bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-white/90">{section.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-10 md:space-y-12"
          >
            {privacySections.map((section) => {
              const Icon = section.icon;
              return (
                <motion.div key={section.id} variants={fadeInUp} id={section.id} className="scroll-mt-24">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-300" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                  </div>

                  <div
                    className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white prose-li:marker:text-white/50"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-12 md:pb-16">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-3">Questions About Privacy?</h2>
            <p className="text-white/70 mb-8">We're here to help with any privacy-related questions or concerns.</p>

            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/contact"
                className="group text-left rounded-xl p-6 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300"
              >
                <Mail className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">Contact Privacy Team</h3>
                <p className="text-white/70 text-sm mb-4">Get in touch with our privacy experts</p>
                <span className="text-blue-400 font-medium text-sm group-hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                  Send Message <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="group rounded-xl p-6 text-left bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">Download Policy</h3>
                <p className="text-white/70 text-sm mb-4">Get a PDF copy of this privacy policy</p>
                <span className="text-blue-400 font-medium text-sm group-hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                  {isDownloading ? "Generating..." : "Download PDF"} <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 