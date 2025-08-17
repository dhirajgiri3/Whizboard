"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, Users, PenTool, Frame, Zap } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function FiveMinSetupPage() {
  const steps = [
    {
      icon: Frame,
      title: "Create Your First Board",
      description: "Start with a blank canvas or choose from our templates",
      details: "Click the 'Create Board' button in the top navigation. Give it a meaningful name and select a template that fits your needs, or start with a blank canvas for maximum flexibility."
    },
    {
      icon: Users,
      title: "Invite Your Team",
      description: "Add collaborators and assign appropriate roles",
      details: "Use the 'Invite' button in the board header to add team members. Choose between Viewer, Editor, or Owner roles based on their needs. You can also generate a shareable link for quick access."
    },
    {
      icon: PenTool,
      title: "Start Creating",
      description: "Use basic tools to outline your ideas",
      details: "Begin with the Pen tool for freehand drawing, add shapes for structure, and use text blocks for labels. Don't worry about perfection - focus on getting your ideas down quickly."
    },
    {
      icon: Frame,
      title: "Organize with Frames",
      description: "Group related content for better organization",
      details: "Select multiple elements and press 'F' or use the Frame tool to group them. Frames help organize your work and can be exported individually. They also make it easier to manage complex boards."
    },
    {
      icon: Zap,
      title: "Share and Collaborate",
      description: "Start real-time collaboration with your team",
      details: "Your team can now join and collaborate in real-time. Use the presence indicators to see who's online, and take advantage of live cursors to understand what others are working on."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-8 sm:pb-12">
        <BackButton label="Back to Help" fallbackHref="/help" variant="minimal" className="mb-6" />

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
              Quick Start
            </span>
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 5 min
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">5-Minute Setup Guide</h1>
          <p className="text-white/70 mb-8 text-lg leading-relaxed">
            Get up and running with WhizBoard in under five minutes. Follow these steps to create your first collaborative board and start working with your team.
          </p>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                        Step {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="text-white/80 mb-2">{step.description}</p>
                    <p className="text-white/60 text-sm leading-relaxed">{step.details}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">?</kbd> to view all keyboard shortcuts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Use the zoom controls to focus on specific areas of your board</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Connect Google Drive or Slack for seamless file sharing and notifications</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/help/shortcuts" 
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-center"
            >
              Learn Keyboard Shortcuts
            </Link>
            <Link 
              href="/help/best-practices" 
              className="flex-1 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-white rounded-xl font-medium transition-colors text-center border border-white/[0.1]"
            >
              View Best Practices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


