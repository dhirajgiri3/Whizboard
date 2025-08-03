"use client";

import React from "react";
import AboutHero from "./components/AboutHero";
import AboutStats from "./components/AboutStats";
import AboutMission from "./components/AboutMission";
import AboutTeam from "./components/AboutTeam";
import AboutTimeline from "./components/AboutTimeline";
import AboutCTA from "./components/AboutCTA";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      {/* Enhanced Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96" style={{
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)',
        filter: 'blur(60px)'
      }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80" style={{
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
        filter: 'blur(80px)'
      }}></div>
      
      {/* Additional subtle orbs */}
      <div className="absolute top-3/4 left-1/3 w-64 h-64" style={{
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
        filter: 'blur(40px)'
      }}></div>

      {/* Page Content */}
      <main className="relative z-10">
        <AboutHero />
        <AboutStats />
        <AboutMission />
        <AboutTeam />
        <AboutTimeline />
        <AboutCTA />
      </main>
    </div>
  );
}
