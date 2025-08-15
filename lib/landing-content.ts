// Centralized landing page content configuration
// This eliminates repetitive messaging and ensures consistency across components

export const LANDING_CONTENT = {
  // Main value propositions
  valuePropositions: {
    primary: "Transform Brainstorms into Action, Together.",
    secondary: "Create, collaborate, and bring your ideas to life with the most intuitive whiteboard experience. From concept to completion, all in real-time.",
    hero: "Transform chaotic brainstorms into organized action plans with professional-grade collaborative tools.",
  },

  // Trust indicators - consolidated to eliminate repetition
  trustIndicators: [
    {
      icon: "CheckCircle",
      text: "No credit card required",
      color: "text-emerald-400",
    },
    {
      icon: "Shield", 
      text: "Enterprise security",
      color: "text-blue-400",
    },
    {
      icon: "Zap",
      text: "Start in 30 seconds", 
      color: "text-blue-400",
    },
  ],

  // Demo modal configuration
  demoModal: {
    videoUrl: "https://res.cloudinary.com/dgak25skk/video/upload/v1755180328/whizboard-3_qyofjn.mp4",
    title: "Watch 3‑Min Demo",
    description: "See how Whizboard enables fluid realtime collaboration.",
  },

  // CTA button text variations - consolidated to reduce redundancy
  ctaButtons: {
    // Primary strategic CTAs (3 locations only)
    hero: "Start Creating Free",
    benefits: "Get Started - No Credit Card", 
    footer: "Begin Free Trial",
    
    // Secondary CTAs
    demo: "Watch 3-Min Demo",
    sales: "Contact Sales",
    
    // Context-specific CTAs (use sparingly)
    features: "Try Drawing Tools",
    integrations: "Connect Your Tools",
    
    // Legacy CTAs (deprecated - remove from components)
    primary: "Get Started",
    secondary: "Watch 3-Min Demo", 
    free: "Start Building Free",
    claim: "Claim 5 Free Whiteboards",
    collaboration: "Start Collaborating",
    pricing: "Begin Free Trial",
    social: "Join Early Access",
    about: "Explore Whizboard",
    valueProp: "Transform Your Workflow",
    explore: "Explore Features",
    learn: "Learn More",
    seeDemo: "See It in Action",
    tryFree: "Try for Free",
    getAccess: "Get Early Access",
    startTrial: "Start Free Trial",
    contactSales: "Talk to Sales",
    viewPricing: "View Pricing",
    forTeams: "For Teams",
    forDesigners: "For Designers",
    forDevelopers: "For Developers",
    forProduct: "For Product Teams",
    enterprise: "Enterprise",
    createBoard: "Create Your First Board",
    inviteTeam: "Invite Your Team",
    uploadDesign: "Upload Your Design",
    exportWork: "Export Your Work",
    limitedTime: "Limited Time Offer",
    earlyBird: "Early Bird Access",
    betaAccess: "Join Beta",
  },

  // Feature descriptions - unique for each context
  features: {
    collaboration: {
      title: "Real-Time Collaboration",
      description: "See exactly where teammates are working with live cursor tracking and instant sync.",
      details: [
        "Live cursor tracking for all participants",
        "Real-time sync across all devices", 
        "Conflict-free editing with operational transformation",
        "Real-time notifications and presence indicators",
        "Basic permissions and access control",
      ],
    },
    drawing: {
      title: "Drawing & Design",
      description: "Express ideas naturally with customizable tools and professional-grade drawing capabilities.",
      details: [
        "Professional pen tools with pressure sensitivity",
        "Highlighter and marker options",
        "Customizable brush sizes and styles",
        "Eraser with precision control",
        "Undo/redo with unlimited history",
      ],
    },
    canvas: {
      title: "Advanced Canvas",
      description: "Navigate and organize large, complex boards with infinite zoom and layer management.",
      details: [
        "Infinite zoom and pan capabilities",
        "Layer management and organization",
        "Presentation mode for client meetings",
        "Auto-save with version history",
        "Grid and snap-to-grid functionality",
      ],
    },
    crossPlatform: {
      title: "Cross-Platform",
      description: "Work seamlessly across all devices with browser-based access and mobile optimization.",
      details: [
        "Browser-based with no downloads required",
        "Mobile-optimized touch interface",
        "Keyboard shortcuts for power users",
        "Touch gestures for tablets and phones",
        "Cross-platform compatibility",
      ],
    },
    security: {
      title: "Security & Compliance",
      description: "Enterprise-grade security with SOC 2 compliance and end-to-end encryption.",
      details: [
        "Secure authentication",
        "Data handling best practices",
        "Google OAuth integration",
        "Basic access control",
        "Activity tracking",
      ],
    },
  },

  // Pricing features - consolidated to eliminate repetition
  pricingFeatures: {
    free: [
      "Up to 5 whiteboards",
      "Real-time drawing and collaboration tools",
      "Basic shapes and text elements",
      "Sticky notes and frames",
      "Export to PNG format",
      "Up to 3 team members",
      "Live cursor tracking",
      "Basic templates",
      "Auto-save functionality",
      "Mobile-responsive design",
    ],
    pro: [
      "Advanced drawing tools with pressure sensitivity",
      "All premium frame templates (mobile, desktop, social media)",
      "Enhanced exports (PNG, SVG, JSON, PDF)",
      "Team collaboration insights",
      "Up to 25 team members & roles",
      "Custom branding & themes",
      "Advanced integrations & API access",
      "Version history & recovery",
      "Priority customer support",
      "Advanced security & compliance",
      "Presentation & whiteboarding mode",
    ],
    enterprise: [
      "SSO & SAML integration",
      "Advanced audit logs & security controls",
      "Dedicated customer success manager",
      "Custom integrations & API access",
      "Unlimited team members & boards",
      "Compliance features (SOC2, GDPR)",
      "Custom contract terms & SLA guarantees",
      "On-premise deployment options",
      "Advanced role-based permissions",
      "Custom training & onboarding",
    ],
  },

  // Social proof content - consolidated to eliminate redundancy
  socialProof: {
    testimonials: [
      {
        name: "Sarah Mitchell",
        role: "Product Designer",
        company: "TechFlow Solutions",
        content: "The real-time collaboration is smooth and intuitive. Our design reviews are now 40% faster.",
        rating: 5,
      },
      {
        name: "David Chen",
        role: "Engineering Lead",
        company: "StartupX",
        content: "Clean interface and fast performance. Perfect for our remote team's daily standups.",
        rating: 5,
      },
      {
        name: "Maria Rodriguez",
        role: "UX Researcher",
        company: "Design Collective",
        content: "Exactly what we needed for remote brainstorming. Looking forward to more features.",
        rating: 5,
      },
      {
        name: "Alex Thompson",
        role: "Product Manager",
        company: "InnovateCorp",
        content: "Makes user research sessions much more collaborative and engaging.",
        rating: 5,
      },
      {
        name: "James Wilson",
        role: "Software Engineer",
        company: "DevTeam Pro",
        content: "Streamlines our planning process. The integrations are a nice touch.",
        rating: 5,
      },
      {
        name: "Lisa Park",
        role: "Design Director",
        company: "Creative Studio",
        content: "Simple yet powerful. The mobile experience is particularly impressive.",
        rating: 5,
      },
    ],
    metrics: [
      {
        value: "Fast",
        label: "Real-time collaboration",
        icon: "Users",
        iconColor: "text-blue-400",
      },
      {
        value: "Secure",
        label: "Privacy-first",
        icon: "TrendingUp",
        iconColor: "text-emerald-400",
      },
      {
        value: "Simple",
        label: "Intuitive UI",
        icon: "Star",
        iconColor: "text-yellow-400",
      },
      {
        value: "No install",
        label: "Start in browser",
        icon: "Clock",
        iconColor: "text-blue-400",
      },
    ],
  },

  // FAQ content - consolidated
  faqs: [
    {
      question: "Can multiple people edit simultaneously without conflicts?",
      answer: "Yes. Real-time sync and presence help teams collaborate smoothly with live cursors and updates.",
      category: "collaboration",
      icon: "Users",
      iconColor: "text-blue-400",
      highlight: "Real-time collaboration",
    },
    {
      question: "Any software to install?",
      answer: "No downloads required. Runs entirely in your browser with full functionality across Chrome, Safari, Firefox, and Edge. Just open the website and start collaborating immediately.",
      category: "setup",
      icon: "Globe",
      iconColor: "text-blue-400",
      highlight: "Zero installation",
    },
    {
      question: "How secure is our project data?",
      answer: "We follow security best practices, use trusted authentication, and handle data carefully. More compliance options are on our roadmap.",
      category: "security",
      icon: "Shield",
      iconColor: "text-blue-400",
      highlight: "Bank-level security",
    },
    {
      question: "Integration with existing tools?",
      answer: "Native integrations with Slack and Google Workspace are available. More integrations and APIs are on our roadmap.",
      category: "integrations",
      icon: "Globe",
      iconColor: "text-blue-400",
      highlight: "Seamless integrations",
    },
    {
      question: "What's the performance like with large teams?",
      answer: "Optimized for smooth real-time collaboration. Performance may vary based on network and board complexity.",
      category: "performance",
      icon: "Zap",
      iconColor: "text-blue-400",
      highlight: "Sub-50ms latency",
    },
    {
      question: "Can I export my work to other formats?",
      answer: "Yes! Export to PNG, SVG, PDF, and more. Pro plans include advanced export options and custom branding capabilities.",
      category: "export",
      icon: "Globe",
      iconColor: "text-blue-400",
      highlight: "Multiple formats",
    },
    {
      question: "Is there a mobile app?",
      answer: "No app needed! Whizboard works perfectly on mobile browsers with touch-optimized interface. Full functionality across all devices without downloads.",
      category: "mobile",
      icon: "Globe",
      iconColor: "text-blue-400",
      highlight: "Mobile optimized",
    },
    {
      question: "What happens if I lose my internet connection?",
      answer: "Work requires an internet connection. Offline support is planned for a future release.",
      category: "offline",
      icon: "Zap",
      iconColor: "text-blue-400",
      highlight: "Online required",
    },
    {
      question: "Can I use my own domain and branding?",
      answer: "Enterprise plans will include custom domain support and white-label branding options. Make Whizboard your own with your company's look and feel.",
      category: "branding",
      icon: "Shield",
      iconColor: "text-blue-400",
      highlight: "Custom branding",
    },
    {
      question: "How do I get support?",
      answer: "Email support during business hours for free plans. Priority and dedicated support will be available with paid plans as they launch.",
      category: "support",
      icon: "HelpCircle",
      iconColor: "text-blue-400",
      highlight: "Email support",
    },
  ],
};
