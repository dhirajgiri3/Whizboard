"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import {
  Zap,
  Shield,
  Users,
  ArrowRight,
  Crown,
  Rocket,
  Heart,
  Award,
  Play,
  TrendingUp,
  Clock,
  Globe,
  MessageSquare,
  Building2,
  CheckCircle2,
  Star,
  ArrowLeft,
} from "lucide-react";
import SectionHeader from "@/components/ui/header/SectionHeader";
import { useDemoModal } from "@/components/ui/modal/DemoModalProvider";
import CTAButton from "@/components/ui/buttons/CTAButton";
import TrustIndicators from "@/components/ui/TrustIndicators";
import { LANDING_CONTENT } from "@/lib/landing-content";

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const { openDemo } = useDemoModal();

  const plans = [
    {
      name: "Free",
      description: "Create and collaborate on up to 5 whiteboards. Limited-time offer.",
      price: { monthly: 0, yearly: 0 },
      originalPrice: { monthly: 0, yearly: 0 },
      features: LANDING_CONTENT.pricingFeatures.free,
      cta: "Get Started",
      href: "/login",
      popular: false,
      icon: Heart,
      iconColor: "text-blue-400",
      badge: "No Credit Card",
      badgeColor: "bg-emerald-500/10 text-emerald-400",
      savings: null,
      highlight: false,
    },
    {
      name: "Pro",
      description: "Advanced features for teams — launching soon",
      price: { monthly: null, yearly: null },
      originalPrice: { monthly: null, yearly: null },
      features: LANDING_CONTENT.pricingFeatures.pro,
      cta: "Join Waitlist",
      href: "/waitlist",
      popular: false,
      icon: Crown,
      iconColor: "text-blue-400",
      badge: "Coming Soon",
      badgeColor: "bg-orange-500/10 text-orange-400",
      savings: null,
      highlight: false,
      comingSoon: true,
    },
    {
      name: "Enterprise",
      description: "For organizations needing advanced controls and compliance",
      price: { monthly: null, yearly: null },
      originalPrice: { monthly: null, yearly: null },
      features: LANDING_CONTENT.pricingFeatures.enterprise,
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
      icon: Building2,
      iconColor: "text-blue-400",
      badge: "Custom Pricing",
      badgeColor: "bg-white/[0.05] text-white/70",
      savings: null,
      highlight: false,
    },
  ];

  const enterpriseFeatures = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "SOC 2 Type II compliance, end-to-end encryption, advanced audit logs, and security controls",
      iconColor: "text-blue-400",
      stats: "99.9% uptime SLA",
    },
    {
      icon: Users,
      title: "Unlimited Collaboration",
      description:
        "Unlimited collaborators, real-time sync, advanced permissions, and team management",
      iconColor: "text-blue-400",
      stats: "Unlimited members",
    },
    {
      icon: Award,
      title: "Premium Support",
      description:
        "Dedicated success manager, priority support, custom training, and onboarding",
      iconColor: "text-blue-400",
      stats: "24/7 dedicated support",
    },
    {
      icon: Globe,
      title: "Global Infrastructure",
      description:
        "Worldwide CDN, multi-region deployment, dedicated infrastructure, and compliance",
      iconColor: "text-blue-400",
      stats: "Global deployment",
    },
  ];

  const revealEase = [0.4, 0, 0.2, 1] as [number, number, number, number];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.02,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: revealEase,
      },
    },
  } as const;

  const cardHoverVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0A0A0B 0%, #0F0F10 25%, #141416 50%, #1A1A1C 75%, #0A0A0B 100%)",
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-gray-600/2"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-30"></div>

        {/* Primary Gradient Orb */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary Gradient Orb */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[60px]"
          style={{
            background:
              "radial-gradient(circle, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Tertiary Gradient Orb */}
        <motion.div
          className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full blur-[40px]"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Main Content Container */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-16"
        >
          <SectionHeader
            badge={{
              icon: Rocket,
              text: "Pricing",
            }}
            title="Subscriptions Coming Soon"
            description="For now, create and collaborate on up to 5 whiteboards for free — limited offer."
            stats={[
              {
                icon: Shield,
                text: "No credit card required",
                color: "text-emerald-400",
              },
              { icon: Zap, text: "Instant activation", color: "text-blue-400" },
              { icon: Users, text: "24/7 support", color: "text-blue-400" },
            ]}
            disableAnimation={true}
          />
        </motion.div>

        {/* Billing Toggle Section */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.12, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="flex flex-col items-center gap-6 mb-16"
        >
          {/* Informational Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 border border-white/10 rounded-xl px-6 py-4 backdrop-blur-sm"
          >
            <div className="relative flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-white/80 text-sm">
                Subscriptions are coming soon. For now, create and work with up to 5 whiteboards for free — limited offer.
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Pricing Cards Section */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className={`group relative ${
                plan.popular ? "lg:scale-105 lg:-mt-4" : ""
              }`}
            >
              {/* Card Background */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[40px] transition-opacity duration-500 ${
                    plan.popular
                      ? "opacity-40"
                      : "opacity-0 group-hover:opacity-30"
                  }`}
                  style={{
                    background: plan.popular
                      ? "radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)"
                      : "radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: plan.popular ? [0.4, 0.6, 0.4] : [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Card Content */}
              <motion.div
                variants={cardHoverVariants}
                className={`relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 h-full group-hover:scale-[1.01] ${
                  plan.popular
                    ? "ring-1 ring-blue-400/20 shadow-lg shadow-blue-500/5"
                    : ""
                }`}
              >
                <div className="relative z-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="inline-flex p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:scale-105 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <plan.icon
                        className={`h-6 w-6 ${plan.iconColor}`}
                      />
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <h3 className="text-2xl font-bold text-white">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${plan.badgeColor}`}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-white/70 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  {plan.comingSoon ? (
                    <div className="text-center mb-8">
                      <span className="text-sm text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full inline-block border border-orange-400/20">
                        Coming Soon
                      </span>
                    </div>
                  ) : plan.price[billingCycle] !== null ? (
                    <div className="text-center mb-8">
                      <div className="flex items-baseline justify-center gap-2 mb-3">
                        {plan.originalPrice[billingCycle] !== null &&
                          plan.originalPrice[billingCycle] > 0 &&
                          plan.originalPrice[billingCycle] >
                            plan.price[billingCycle] &&
                          plan.price[billingCycle] > 0 && (
                            <span className="text-lg text-white/50 line-through">
                              ${plan.originalPrice[billingCycle]}
                            </span>
                          )}
                        <motion.span
                          className="text-4xl lg:text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-300"
                          whileHover={{ scale: 1.05 }}
                        >
                          {plan.price[billingCycle] === 0
                            ? "$0"
                            : `$${plan.price[billingCycle]}`}
                        </motion.span>
                        {plan.price[billingCycle] > 0 && (
                          <span className="text-white/60 text-sm">
                            /user/
                            {billingCycle === "monthly" ? "month" : "year"}
                          </span>
                        )}
                      </div>

                      {plan.savings &&
                        plan.savings[billingCycle] &&
                        plan.savings[billingCycle] !== null &&
                        plan.savings[billingCycle] > 0 && (
                          <motion.div
                            className="text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full inline-block border border-emerald-400/20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                          >
                            Save ${plan.savings[billingCycle]}/user/year
                          </motion.div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center mb-8">
                      <span className="text-3xl font-bold text-white">
                        Custom Pricing
                      </span>
                      <div className="text-sm text-white/60 mt-2">
                        Contact sales for details
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <motion.a
                    href={plan.comingSoon ? "#" : plan.href}
                    aria-disabled={plan.comingSoon}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group/btn block w-full text-center py-3 px-6 rounded-lg font-medium transition-all duration-300 mb-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10 focus:ring-blue-500/50"
                        : "bg-white/[0.04] border border-white/[0.08] text-white/90 hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white backdrop-blur-sm focus:ring-white/20"
                    } ${plan.comingSoon ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>
                        {plan.comingSoon
                          ? "Coming Soon"
                          : plan.name === "Free"
                          ? "Get Started Free"
                          : plan.name === "Pro"
                          ? "Join Waitlist"
                          : "Contact Sales"}
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </motion.a>

                  {/* Features */}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-4 text-sm">
                      Everything in {plan.name}:
                    </h4>
                    <motion.div className="space-y-3" variants={containerVariants}>
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          variants={itemVariants}
                          className="flex items-start gap-3 group/feature"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 group-hover/feature:scale-110 transition-transform duration-200" />
                          </div>
                          <span className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Section */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.24, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="relative"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="relative z-10 text-center">
            {/* Enterprise Header */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.32, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="mb-12"
            >
              <SectionHeader
                badge={{
                  icon: Shield,
                  text: "Enterprise Ready",
                }}
             title="Enterprise Security & Compliance"
             description="Built for teams that need advanced security, compliance, and dedicated support."
                disableAnimation={true}
              />
            </motion.div>

            {/* Enterprise Features Grid */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
              {enterpriseFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: 0.5 + index * 0.08 }}
                  className="group relative"
                >
                  {/* Gradient Orb Background */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <motion.div
                      className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-[20px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)",
                      }}
                    />
                  </div>

                  <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 group-hover:scale-105">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4 mx-auto group-hover:bg-blue-500/20 transition-all duration-300"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                    >
                      <feature.icon className="h-6 w-6 text-blue-400" />
                    </motion.div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-white/60 text-sm leading-relaxed mb-3">
                      {feature.description}
                    </p>
                    <div className="text-blue-400 text-xs font-medium">
                      {feature.stats}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Final CTA Section */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.56, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="relative"
            >
              {/* Background Elements */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 70%)",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <div className="relative z-10 text-center px-6 lg:px-12 py-12">
                {/* CTA Header */}
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: 0.64, duration: prefersReducedMotion ? 0 : 0.5 }}
                  className="mb-8"
                >
                  <SectionHeader
                    badge={{
                      icon: Zap,
                      text: "Get Started Today",
                    }}
                    title="Ready to Transform Your Workflow?"
                    description="Join thousands of teams already using Whizboard to create, collaborate, and innovate faster. Start your free trial today and experience the difference."
                    disableAnimation={true}
                  />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: 0.72, duration: prefersReducedMotion ? 0 : 0.45 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10"
                >
                  <CTAButton
                    href="/login"
                    variant="primary"
                    size="lg"
                    theme="pricing"
                    className="w-full sm:w-auto px-10 py-4 rounded-lg"
                  >
                    {LANDING_CONTENT.ctaButtons.free}
                  </CTAButton>

                  <CTAButton
                    variant="secondary"
                    size="lg"
                    icon="play"
                    onClick={openDemo}
                    theme="pricing"
                    className="w-full sm:w-auto px-10 py-4 rounded-lg"
                  >
                    {LANDING_CONTENT.ctaButtons.secondary}
                  </CTAButton>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial="hidden"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.4 } } }}
                  animate={isInView ? "visible" : "hidden"}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap items-center justify-center gap-8"
                >
                  <TrustIndicators 
                    indicators={[
                      {
                        icon: CheckCircle2,
                        text: "No credit card required",
                        color: "text-emerald-400",
                      },
                      {
                        icon: Shield,
                        text: "Instant activation",
                        color: "text-blue-400",
                      },
                      {
                        icon: MessageSquare,
                        text: "24/7 support",
                        color: "text-blue-400",
                      },
                    ]}
                    size="sm"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Pricing;
