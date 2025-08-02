"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Crown,
  Rocket,
  Heart,
  Award,
  Play,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Globe,
  MessageSquare,
  Building2,
  CheckCircle2,
  PenTool,
  Square,
  Type,
  FileText,
  Download,
  Layers,
  Palette,
  Share2,
  Image,
  Frame,
  StickyNote
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: "Free",
      description: "Perfect for individuals and small teams getting started",
      price: { monthly: 0, yearly: 0 },
      originalPrice: { monthly: 0, yearly: 0 },
      features: [
        "3 collaborative boards",
        "Real-time drawing and collaboration tools",
        "Basic shapes and text elements",
        "Sticky notes and frames",
        "Export to PNG format",
        "Up to 3 team members",
        "Live cursor tracking",
        "Basic templates",
        "Auto-save functionality",
        "Mobile-responsive design"
      ],
      cta: "Start Free",
      href: "/signup",
      popular: false,
      icon: Heart,
      iconColor: "text-blue-400",
      badge: "Forever Free",
      badgeColor: "bg-white/[0.05] text-white/70",
      savings: null,
      highlight: false
    },
    {
      name: "Pro",
      description: "Most popular for growing teams and professionals",
      price: { monthly: 12, yearly: 10 },
      originalPrice: { monthly: 15, yearly: 12 },
      features: [
        "Unlimited boards and storage",
        "Advanced drawing tools with pressure sensitivity",
        "All frame templates (mobile, desktop, social media)",
        "Enhanced exports (PNG, SVG, JSON)",
        "Team analytics and collaboration insights",
        "Up to 25 team members",
        "Custom branding and themes",
        "Advanced integrations",
        "Version history and recovery",
        "Priority support",
        "Advanced security features",
        "Presentation mode"
      ],
      cta: "Start 14-Day Free Trial",
      href: "/signup",
      popular: true,
      icon: Crown,
      iconColor: "text-blue-400",
      badge: "Most Popular",
      badgeColor: "bg-blue-500/10 text-blue-400",
      savings: { monthly: 3, yearly: 24 },
      highlight: true
    },
    {
      name: "Enterprise",
      description: "For organizations needing advanced controls and compliance",
      price: { monthly: null, yearly: null },
      originalPrice: { monthly: null, yearly: null },
      features: [
        "Everything in Pro, plus:",
        "SSO integration (SAML, OIDC)",
        "Advanced security controls and audit logs",
        "Dedicated customer success manager",
        "Custom integrations and API access",
        "Unlimited team members",
        "Advanced compliance features",
        "Custom contract terms",
        "SLA guarantees",
        "On-premise deployment options",
        "Advanced role-based permissions",
        "Custom training and onboarding"
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
      icon: Building2,
      iconColor: "text-blue-400",
      badge: "Custom Pricing",
      badgeColor: "bg-white/[0.05] text-white/70",
      savings: null,
      highlight: false
    }
  ];

  const enterpriseFeatures = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 Type II compliance, end-to-end encryption, advanced audit logs, and security controls",
      iconColor: "text-blue-400",
      stats: "99.9% uptime SLA"
    },
    {
      icon: Users,
      title: "Unlimited Collaboration",
      description: "Unlimited collaborators, real-time sync, advanced permissions, and team management",
      iconColor: "text-blue-400",
      stats: "Unlimited members"
    },
    {
      icon: Award,
      title: "Premium Support",
      description: "Dedicated success manager, priority support, custom training, and onboarding",
      iconColor: "text-blue-400",
      stats: "24/7 dedicated support"
    },
    {
      icon: Globe,
      title: "Global Infrastructure",
      description: "Worldwide CDN, multi-region deployment, dedicated infrastructure, and compliance",
      iconColor: "text-blue-400",
      stats: "Global deployment"
    }
  ];

  const trustIndicators = [
    { icon: CheckCircle2, text: "30-day money back guarantee", color: "text-emerald-400" },
    { icon: Zap, text: "Instant activation", color: "text-blue-400" },
    { icon: Shield, text: "Bank-level security", color: "text-blue-400" },
    { icon: Users, text: "24/7 support", color: "text-blue-400" },
    { icon: Clock, text: "No setup fees", color: "text-emerald-400" },
    { icon: TrendingUp, text: "Scale as you grow", color: "text-blue-400" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" as const }
    }
  };

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0B 0%, #0F0F10 25%, #141416 50%, #1A1A1C 75%, #0A0A0B 100%)",
      }}
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-gray-600/2"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-30"></div>
        
        {/* Primary Gradient Orb */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Secondary Gradient Orb */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Tertiary Gradient Orb */}
        <motion.div
          className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full blur-[40px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <SectionHeader
            badge={{
              icon: Rocket,
              text: "Simple Pricing"
            }}
            title="Choose Your Perfect Plan"
            description="Start free and scale as you grow. No hidden fees, no surprises. Cancel anytime with our 30-day money-back guarantee."
            stats={[
              { icon: Shield, text: "30-day money back", color: "text-emerald-400" },
              { icon: Zap, text: "Instant activation", color: "text-blue-400" },
              { icon: Users, text: "24/7 support", color: "text-blue-400" }
            ]}
            disableAnimation={true}
          />
        </div>

        {/* Enhanced Billing Toggle Section */}
        <motion.div
          className="flex flex-col items-center space-y-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Enhanced Savings Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-3 backdrop-blur-sm"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-emerald-500/5"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative flex items-center justify-center space-x-2">
              <span className="text-emerald-400 font-medium text-sm">
                Save up to 17% with yearly billing
              </span>
            </div>
          </motion.div>

          {/* Enhanced Toggle */}
          <div className="flex items-center justify-center space-x-6">
            <span className={`text-sm font-medium transition-colors duration-200 ${billingCycle === 'monthly' ? 'text-white' : 'text-white/60'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-white/[0.05] rounded-full border border-white/[0.1] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black hover:bg-white/[0.08] group"
            >
              <motion.div 
                className={`absolute top-0.5 left-0.5 w-7 h-7 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg transition-all duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium transition-colors duration-200 ${billingCycle === 'yearly' ? 'text-white' : 'text-white/60'}`}>
                Yearly
              </span>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                Save 17%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Pricing Cards Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-20"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className={`group relative ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}`}
            >
              {/* Enhanced Gradient Orb Background */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[40px] transition-opacity duration-500 ${plan.popular ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}
                  style={{
                    background: plan.popular
                      ? 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: plan.popular ? [0.4, 0.6, 0.4] : [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              <motion.div
                variants={cardHoverVariants}
                className={`relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 h-full group-hover:scale-[1.01] ${plan.popular ? 'ring-1 ring-blue-400/20 shadow-lg shadow-blue-500/5' : ''}`}
              >
                {/* Fixed Popular badge - moved inside card with proper spacing */}
                {plan.popular && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg border border-blue-500/20 backdrop-blur-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{plan.badge}</span>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Enhanced Header with proper spacing for popular badge */}
                  <div className={`text-center mb-8 ${plan.popular ? 'pt-8' : ''}`}>
                    <motion.div 
                      className="inline-flex p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:scale-105 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <plan.icon className={`h-6 w-6 ${plan.iconColor}`} />
                    </motion.div>

                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      {!plan.popular && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${plan.badgeColor}`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-white/70 mb-8 leading-relaxed text-sm">{plan.description}</p>

                    {/* Enhanced Pricing with better visual hierarchy and fixed calculations */}
                    {plan.price[billingCycle] !== null ? (
                      <div className="mb-8">
                        <div className="flex items-baseline justify-center space-x-2 mb-2">
                          {plan.originalPrice[billingCycle] !== null && plan.originalPrice[billingCycle] > 0 && plan.originalPrice[billingCycle] > plan.price[billingCycle] && (
                            <span className="text-lg text-white/50 line-through">
                              ${plan.originalPrice[billingCycle]}
                            </span>
                          )}
                          <motion.span 
                            className="text-4xl lg:text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-300"
                            whileHover={{ scale: 1.05 }}
                          >
                            {plan.price[billingCycle] === 0 ? 'Free' : `$${plan.price[billingCycle]}`}
                          </motion.span>
                          {plan.price[billingCycle] > 0 && (
                            <span className="text-white/60 text-sm">
                              /user/{billingCycle === 'monthly' ? 'month' : 'year'}
                            </span>
                          )}
                        </div>
                        
                        {plan.savings && plan.savings[billingCycle] && plan.savings[billingCycle] !== null && plan.savings[billingCycle] > 0 && (
                          <motion.div 
                            className="text-sm text-emerald-400 mt-2 bg-emerald-400/10 px-3 py-1 rounded-full inline-block border border-emerald-400/20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                          >
                            Save ${plan.savings[billingCycle]}/user/year
                          </motion.div>
                        )}
                        
                        {billingCycle === 'yearly' && plan.price.monthly && plan.price.monthly > 0 && (
                          <div className="text-sm text-white/60 mt-2">
                            Billed annually (${plan.price.yearly * 12}/user/year)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-8">
                        <span className="text-3xl font-bold text-white">Custom Pricing</span>
                        <div className="text-sm text-white/60 mt-2">Contact sales for details</div>
                      </div>
                    )}

                    {/* Enhanced CTA Button */}
                    <motion.a
                      href={plan.href}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group/btn block w-full text-center py-3 px-6 rounded-lg font-medium transition-all duration-300 mb-8 ${plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'bg-white/[0.04] border border-white/[0.08] text-white/90 hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white backdrop-blur-sm'
                        }`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>{plan.cta}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </span>
                    </motion.a>
                  </div>

                  {/* Enhanced Features with better spacing and animations */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold mb-4 text-sm">Everything in {plan.name}:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: 0.2 + featureIndex * 0.05 }}
                        className="flex items-start space-x-3 group/feature"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 group-hover/feature:scale-110 transition-transform duration-200" />
                        </div>
                        <span className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={indicator.text}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="flex items-center justify-center space-x-2 text-white/60 text-xs group hover:text-white/80 transition-colors duration-200"
              >
                <indicator.icon className={`h-3 w-3 ${indicator.color} group-hover:scale-110 transition-transform duration-200`} />
                <span>{indicator.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Enterprise Grade Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="relative"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2"
              style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 70%)'
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center space-y-4 sm:space-y-6 mb-12"
            >
              {/* Enhanced Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-4 py-2 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
              >
                <Shield className="h-4 w-4 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                  Enterprise Ready
                </span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white leading-tight"
              >
                Enterprise Grade
                <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Security & Compliance
                </span>
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Built for teams that need advanced security, compliance, and dedicated support. 
                Trusted by Fortune 500 companies worldwide.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {enterpriseFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  className="group relative"
                >
                  {/* Gradient Orb Background */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <motion.div
                      className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-[20px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
                      }}
                    />
                  </div>

                  <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 group-hover:scale-105">
                    <motion.div 
                      className="flex items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4 mx-auto group-hover:bg-blue-500/20 transition-all duration-300"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                    >
                      <feature.icon className="h-6 w-6 text-blue-400" />
                    </motion.div>
                    <h4 className="text-lg font-semibold text-white mb-3">{feature.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed mb-3">{feature.description}</p>
                    <div className="text-blue-400 text-xs font-medium">{feature.stats}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="relative"
            >
              {/* Background Elements */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              <div className="relative z-10 text-center px-6 lg:px-12 py-16">
                {/* Enhanced Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="mb-10"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center space-y-6"
                  >
                    {/* Enhanced Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      viewport={{ once: true }}
                      className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-4 py-2 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
                    >
                      <Zap className="h-4 w-4 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                        Get Started Today
                      </span>
                    </motion.div>

                    {/* Enhanced Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="text-3xl md:text-4xl font-bold text-white leading-tight"
                    >
                      Ready to Transform Your
                      <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                        Workflow?
                      </span>
                    </motion.h3>

                    {/* Enhanced Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed"
                    >
                      Join thousands of teams already using Whizboard to create, collaborate, and innovate faster. 
                      Start your free trial today and experience the difference.
                    </motion.p>
                  </motion.div>
                </motion.div>

                {/* Enhanced CTA Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 2.0, duration: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
                >
                  <motion.button
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-10 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/10 text-lg group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center space-x-2">
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </motion.button>

                  <motion.button
                    className="text-white/90 hover:text-white font-semibold px-10 py-4 transition-colors duration-300 border border-white/10 hover:border-white/20 rounded-lg backdrop-blur-sm text-lg group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center space-x-2">
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span>View Demo</span>
                    </span>
                  </motion.button>
                </motion.div>

                {/* Enhanced Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                  className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 text-white/50 text-sm"
                >
                  <div className="flex items-center space-x-2 group hover:text-white/70 transition-colors duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                    <span>30-day money back</span>
                  </div>
                  <div className="flex items-center space-x-2 group hover:text-white/70 transition-colors duration-200">
                    <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                    <span>Instant activation</span>
                  </div>
                  <div className="flex items-center space-x-2 group hover:text-white/70 transition-colors duration-200">
                    <MessageSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                    <span>24/7 support</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;