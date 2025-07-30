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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.02) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-8"
          >
            <Rocket className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Choose Your Plan</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-4xl mx-auto mb-12 leading-relaxed">
            All plans include unlimited collaborators, 99.9% uptime guarantee, and world-class support
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white/[0.05] border border-white/[0.1] rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-white/[0.1] text-white border border-white/[0.2]'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white/[0.1] text-white border border-white/[0.2]'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span>Yearly</span>
              <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded-full border border-green-400/20">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 mb-24"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className={`relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden h-full ${
                plan.popular ? 'ring-2 ring-blue-400/20' : ''
              }`}>
                {/* Background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
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
                    
                    <p className="text-white/70 mb-8 leading-relaxed">{plan.description}</p>
                    
                    {/* Pricing */}
                    {plan.price[billingCycle] !== null ? (
                      <div className="mb-8">
                        <div className="flex items-baseline justify-center space-x-2">
                          <span className="text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                            ${plan.price[billingCycle]}
                          </span>
                          <span className="text-white/60">
                            /user/{billingCycle === 'monthly' ? 'month' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && plan.price.monthly && (
                          <div className="text-sm text-white/50 mt-2">
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
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: 0.3 + featureIndex * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 group-hover:text-white/90 transition-colors">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.a
                    href={plan.href}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                        : 'bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.2]'
                    }`}
                  >
                    {plan.cta}
                  </motion.a>
                </div>

                {/* Hover effect border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${plan.gradient.replace('/20', '/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <div className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-white/[0.08] rounded-3xl p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="inline-flex items-center space-x-2 bg-white/[0.05] border border-white/[0.1] rounded-full px-4 py-2 backdrop-blur-sm mb-8"
              >
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-white/70 text-sm font-medium">Enterprise Grade</span>
              </motion.div>

              <h3 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Built for Enterprise Scale
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {enterpriseFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="group text-center"
                  >
                    <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      <div className="relative z-10">
                        <div className="inline-flex p-4 rounded-xl bg-white/[0.05] border border-white/[0.1] mb-6 group-hover:scale-110 transition-transform duration-300">
                          <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                        </div>
                        <h4 className="text-xl font-semibold text-white mb-4">
                          {feature.title}
                        </h4>
                        <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="#demo"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span className="relative z-10">Book Enterprise Demo</span>
                  <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 hover:border-white/30 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Heart className="h-5 w-5" />
                  <span>Contact Sales</span>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;