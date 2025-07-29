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
  Sparkles
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
      color: "from-gray-400 to-gray-600"
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
      color: "from-blue-400 to-purple-500"
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
      color: "from-purple-400 to-pink-500"
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
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            All plans include unlimited collaborators and 99.9% uptime guarantee
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
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
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-xl'
                  : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.color} mb-4`}>
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                {plan.price[billingCycle] !== null ? (
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /user/{billingCycle === 'monthly' ? 'month' : 'month'}
                    </span>
                    {billingCycle === 'yearly' && plan.price.monthly && (
                      <div className="text-sm text-gray-500 mt-1">
                        Billed annually (${plan.price.yearly * 12}/user/year)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-gray-900">Custom Pricing</span>
                    <div className="text-sm text-gray-500 mt-1">Contact sales for details</div>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.3 + featureIndex * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.a
                href={plan.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Enterprise-Grade Features
            </h3>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-blue-100 mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Security</h4>
                <p className="text-gray-600">SOC 2 compliance, end-to-end encryption</p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-green-100 mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Collaboration</h4>
                <p className="text-gray-600">Unlimited collaborators, real-time sync</p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-purple-100 mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Global</h4>
                <p className="text-gray-600">99.9% uptime, worldwide CDN</p>
              </div>
            </div>
            <motion.a
              href="#demo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>Book Enterprise Demo</span>
              <ArrowRight className="h-5 w-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 