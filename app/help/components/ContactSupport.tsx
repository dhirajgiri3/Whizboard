"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Clock, BookOpen, HelpCircle } from "lucide-react";
import Link from "next/link";
import { supportOptions } from "../data/helpData";

const ContactSupport = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const orbStyle = {
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
    filter: 'blur(40px)',
    willChange: 'transform'
  };

  const email = supportOptions[0];
  const EmailIcon = email.icon;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial="initial"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm mb-4 sm:mb-6"
          >
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span className="text-white/70 text-xs sm:text-sm font-medium">Email Support</span>
          </motion.div>

          {/* Header */}
          <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-2">
              Need more help?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 sm:px-6">
              Email our support team and we will get back to you shortly. For fastest help, include your board URL and a short description.
            </p>
          </div>
        </motion.div>

        {/* Single, premium email card */}
        <div className="max-w-3xl mx-auto">
          <Link href={email.href} className="block">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors duration-300">
              {/* Subtle orb */}
              <div className="absolute -top-16 -right-16 w-32 h-32 opacity-30">
                <div className="w-full h-full rounded-full" style={orbStyle} />
              </div>

              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className={`inline-flex p-3 rounded-xl bg-blue-400/20 border border-white/20`}>
                    <EmailIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">  
                    <h3 className="text-xl font-semibold text-white mb-2">{email.title}</h3>
                    <p className="text-white/70 leading-relaxed mb-4 text-sm sm:text-base">{email.description}</p>
                    <div className="flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors self-start">
                      <span className="text-sm">{email.cta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Helpful pointers */}
        <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/help/article/invite-collaborators" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-white/80 text-sm">How to invite collaborators</span>
            </div>
          </Link>
          <Link href="/help/article/permissions" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="text-white/80 text-sm">Managing permissions</span>
            </div>
          </Link>
          <Link href="/help/article/connection-issues" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white/80 text-sm">Fix connection issues</span>
            </div>
          </Link>
        </div>

        {/* SLA / response info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span className="text-white/70 text-sm font-medium">Average response time: 2 hours</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSupport; 