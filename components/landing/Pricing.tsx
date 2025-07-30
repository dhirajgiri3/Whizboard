"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Download, 
  Globe, 
  ArrowRight,
  Crown,
  Sparkles,
  Rocket,
  Heart,
  Award
} from "lucide-react";

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: "Free Forever",
      description: "Perfect for small teams getting started",
      price: { monthly: 0, yearly: 0 },
      features: [
        "3 collaborative boards",
        "All drawing and collaboration tools",
        "Basic export options (PNG, PDF)",
        "Email support",
        "Up to 5 team members"
      ],
      cta: "Start Free",
      href: "/signup",
      popular: false,
      icon: Sparkles,
      gradient: "from-gray-400/20 to-gray-600/20",
      iconColor: "text-gray-400",
      badge: "Forever Free",
      badgeColor: "bg-gray-400/10 text-gray-400"
    },
    {
      name: "Pro",
      description: "Most popular for growing teams",
      price: { monthly: 12, yearly: 10 },
      features: [
        "Unlimited boards and storage",
        "Advanced templates and frames",
        "Priority support and training",
        "Enhanced exports (SVG, JSON)",
        "Team analytics dashboard",
        "Up to 50 team members",
        "Custom branding",
        "Advanced integrations"
      ],
      cta: "Start 14-Day Free Trial",
      href: "/signup",
      popular: true,
      icon: Crown,
      gradient: "from-blue-400/20 to-purple-500/20",
      iconColor: "text-blue-400",
      badge: "Most Popular",
      badgeColor: "bg-blue-400/10 text-blue-400"
    },
    {
      name: "Enterprise",
      description: "For organizations needing advanced controls",
      price: { monthly: null, yearly: null },
      features: [
        "Everything in Pro, plus:",
        "SSO integration (SAML, OIDC)",
        "Advanced security controls",
        "Dedicated customer success manager",
        "Custom integrations and API access",
        "Unlimited team members",
        "Advanced compliance features",
        "Custom contract terms"
      ],
      cta: "Book Demo",
      href: "#demo",
      popular: false,
      icon: Shield,
      gradient: "from-purple-400/20 to-pink-500/20",
      iconColor: "text-purple-400",
      badge: "Custom",
      badgeColor: "bg-purple-400/10 text-purple-400"
    }
  ];

  const enterpriseFeatures = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliance, end-to-end encryption, advanced audit logs",
      gradient: "from-green-400/20 to-emerald-500/20",
      iconColor: "text-green-400"
    },
    {
      icon: Users,
      title: "Unlimited Collaboration",
      description: "Unlimited collaborators, real-time sync, advanced permissions",
      gradient: "from-blue-400/20 to-cyan-500/20",
      iconColor: "text-blue-400"
    },
    {
      icon: Globe,
      title: "Global Infrastructure",
      description: "99.9% uptime SLA, worldwide CDN, dedicated support",
      gradient: "from-purple-400/20 to-pink-500/20",
      iconColor: "text-purple-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  return (
    <section 
      ref={ref} 
      className="relative py-32 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0B 0%, #0F0F10 25%, #141416 50%, #1A1A1C 75%, #0A0A0B 100%)",
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-gray-600/2"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-30"></div>
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full blur-[40px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16 lg:pb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Rocket className="h-4 w-4 text-blue-400" />
            </motion.div>
            <span className="text-white/70 text-sm font-medium">Simple Pricing</span>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight text-center">
              Choose Your
              <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h2>
            <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
              Start free and scale as you grow. No hidden fees, no surprises. 
              Cancel anytime with our 30-day money-back guarantee.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 text-sm">
            <div className="flex items-center space-x-2 text-white/60">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>30-day money back</span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>Instant activation</span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <Users className="h-4 w-4 text-amber-400" />
              <span>24/7 support</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium transition-colors ${
              billingCycle === 'monthly' ? 'text-white' : 'text-white/60'
            }`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-white/[0.05] rounded-full border border-white/[0.1] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black hover:bg-white/[0.08]"
            >
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-blue-500 rounded-full transition-all duration-300 shadow-lg ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${
              billingCycle === 'yearly' ? 'text-white' : 'text-white/60'
            }`}>
              Yearly
              <span className="ml-1 text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">(Save 20%)</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-24"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`group relative ${
                plan.popular ? 'lg:scale-105 lg:-mt-4' : ''
              }`}
            >
              {/* Gradient Orb Background */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div 
                  className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] transition-opacity duration-500 ${
                    plan.popular ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'
                  }`}
                  style={{
                    background: plan.popular 
                      ? 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(107, 114, 128, 0.3) 0%, rgba(107, 114, 128, 0.1) 50%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: plan.popular ? [0.6, 0.8, 0.6] : [0, 0.4, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              <div className={`relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden h-full group-hover:scale-[1.02] ${
                plan.popular ? 'ring-2 ring-blue-400/20 shadow-2xl shadow-blue-500/10' : ''
              }`}>
                {/* Background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg border border-blue-400/20">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-xl bg-white/[0.05] border border-white/[0.1] mb-6 group-hover:scale-110 transition-transform duration-300">
                      <plan.icon className={`h-8 w-8 ${plan.iconColor}`} />
                    </div>
                    
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      {!plan.popular && (
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${plan.badgeColor}`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-white/70 mb-8 leading-relaxed text-sm">{plan.description}</p>
                    
                    {/* Pricing */}
                    {plan.price[billingCycle] !== null ? (
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center space-x-2">
                          <span className="text-4xl lg:text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                            ${plan.price[billingCycle]}
                          </span>
                          <span className="text-white/60 text-sm">
                            /user/{billingCycle === 'monthly' ? 'month' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && plan.price.monthly && (
                          <div className="text-sm text-emerald-400 mt-2 bg-emerald-400/10 px-3 py-1 rounded-full inline-block">
                            Billed annually (${plan.price.yearly * 12}/user/year)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-white">Custom Pricing</span>
                        <div className="text-sm text-white/60 mt-2">Contact sales for details</div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <motion.a
                      href={plan.href}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group/btn block w-full text-center py-3 px-6 rounded-lg font-medium transition-all duration-300 mb-8 ${
                        plan.popular
                          ? 'bg-white/[0.08] border border-white/[0.12] text-white hover:bg-white/[0.12] hover:border-white/[0.16] backdrop-blur-sm'
                          : 'bg-white/[0.04] border border-white/[0.08] text-white/90 hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white backdrop-blur-sm'
                      }`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>{plan.cta}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </span>
                    </motion.a>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold mb-4 text-sm">Everything in {plan.name}:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: 0.3 + featureIndex * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Hover effect border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${plan.gradient.replace('/20', '/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Grade Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <motion.div 
              className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
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
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">Enterprise Ready</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Enterprise Grade
              <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Security & Compliance
              </span>
            </h3>
            <p className="text-base text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Built for teams that need advanced security, compliance, and dedicated support.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {enterpriseFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="group relative"
                >
                  {/* Gradient Orb Background */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <motion.div 
                      className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[30px] opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
                      }}
                    />
                  </div>

                  <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4 mx-auto group-hover:bg-blue-500/20 transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <button className="group bg-white/[0.08] border border-white/[0.12] text-white px-6 py-3 rounded-lg font-medium hover:bg-white/[0.12] hover:border-white/[0.16] transition-all duration-300 backdrop-blur-sm">
                <span className="flex items-center space-x-2">
                  <span>Contact Sales</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              <button className="group bg-white/[0.04] border border-white/[0.08] text-white/90 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 flex items-center space-x-2 px-6 py-3 rounded-lg font-medium backdrop-blur-sm">
                <span>Schedule a Demo</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;