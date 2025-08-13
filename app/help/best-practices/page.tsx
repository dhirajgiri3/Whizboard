"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb, Users, Layers, Zap, Shield, Palette, FileText } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

const practices = [
  {
    category: "Board Organization",
    icon: Layers,
    color: "from-blue-500 to-blue-600",
    items: [
      {
        title: "Use Frames for Structure",
        description: "Group related content in frames to create logical sections and enable individual exports.",
        tips: ["Create frames around related elements", "Use descriptive frame names", "Consider frame hierarchy for complex boards"]
      },
      {
        title: "Adopt Naming Conventions",
        description: "Establish consistent naming patterns for frames, boards, and elements.",
        tips: ["Use prefixes like 'Draft-', 'Final-'", "Include dates in board names", "Use descriptive element labels"]
      },
      {
        title: "Manage Layer Complexity",
        description: "Keep your layer panel organized to avoid confusion and improve performance.",
        tips: ["Group related layers", "Hide unused layers", "Use layer naming conventions"]
      }
    ]
  },
  {
    category: "Collaboration",
    icon: Users,
    color: "from-emerald-500 to-emerald-600",
    items: [
      {
        title: "Establish Color Coding",
        description: "Use consistent colors to indicate different types of content or team members.",
        tips: ["Assign colors to team members", "Use colors for priority levels", "Create a color legend"]
      },
      {
        title: "Leverage Comments Effectively",
        description: "Use comments for feedback and discussions without cluttering the visual space.",
        tips: ["Mention teammates with @username", "Use comments for questions and feedback", "Resolve comments when addressed"]
      },
      {
        title: "Coordinate Real-time Sessions",
        description: "Plan collaborative sessions and maintain async documentation.",
        tips: ["Schedule focused collaboration time", "Use presence indicators", "Document decisions in real-time"]
      }
    ]
  },
  {
    category: "Performance Optimization",
    icon: Zap,
    color: "from-amber-500 to-amber-600",
    items: [
      {
        title: "Optimize for Speed",
        description: "Keep boards performant by managing resources and complexity.",
        tips: ["Hide heavy layers when not needed", "Use vector shapes over large images", "Archive old frames"]
      },
      {
        title: "Manage File Sizes",
        description: "Balance quality with performance by optimizing media and elements.",
        tips: ["Compress images before importing", "Use appropriate image resolutions", "Limit high-resolution elements"]
      },
      {
        title: "Browser Considerations",
        description: "Ensure smooth performance across different devices and browsers.",
        tips: ["Close other heavy applications", "Use modern browsers", "Clear browser cache regularly"]
      }
    ]
  },
  {
    category: "Design & Visual",
    icon: Palette,
    color: "from-purple-500 to-purple-600",
    items: [
      {
        title: "Maintain Visual Hierarchy",
        description: "Use size, color, and positioning to guide attention and organize information.",
        tips: ["Use larger elements for main ideas", "Apply consistent spacing", "Create clear visual groups"]
      },
      {
        title: "Choose Appropriate Tools",
        description: "Select the right tool for each task to work efficiently and clearly.",
        tips: ["Use pen for quick sketches", "Use shapes for structure", "Use text for labels and notes"]
      },
      {
        title: "Balance Detail and Clarity",
        description: "Find the right level of detail to communicate effectively without overwhelming.",
        tips: ["Start with high-level concepts", "Add detail progressively", "Use zoom levels appropriately"]
      }
    ]
  },
  {
    category: "Security & Permissions",
    icon: Shield,
    color: "from-red-500 to-red-600",
    items: [
      {
        title: "Manage Access Carefully",
        description: "Control who can view, edit, or manage your boards based on their needs.",
        tips: ["Use Viewer role for stakeholders", "Use Editor role for collaborators", "Limit Owner permissions"]
      },
      {
        title: "Review Permissions Regularly",
        description: "Periodically audit who has access to your boards and adjust as needed.",
        tips: ["Check access monthly", "Remove inactive users", "Update roles as projects evolve"]
      },
      {
        title: "Secure Sensitive Content",
        description: "Protect confidential information by managing sharing and access appropriately.",
        tips: ["Use private boards for sensitive work", "Limit sharing to necessary users", "Monitor board activity"]
      }
    ]
  },
  {
    category: "Documentation",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    items: [
      {
        title: "Document Decisions",
        description: "Capture important decisions and rationale directly on the board.",
        tips: ["Use text boxes for decisions", "Include context and reasoning", "Date important decisions"]
      },
      {
        title: "Create Exportable Content",
        description: "Structure boards for easy sharing and presentation to stakeholders.",
        tips: ["Use frames for exportable sections", "Include clear titles and labels", "Consider presentation flow"]
      },
      {
        title: "Maintain Version History",
        description: "Keep track of changes and iterations for future reference.",
        tips: ["Save important versions", "Document major changes", "Use descriptive version names"]
      }
    ]
  }
];

export default function BestPracticesPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-8 sm:pb-12">
        <BackButton label="Back to Help" fallbackHref="/help" variant="minimal" className="mb-6" />

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
              Guides
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Best Practices</h1>
          <p className="text-white/70 mb-8 text-lg leading-relaxed">
            Learn from the pros with these expert tips and best practices for organizing boards, 
            collaborating effectively, and maximizing productivity in WhizBoard.
          </p>

          <div className="space-y-8">
            {practices.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.category} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-xl">{category.category}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {category.items.map((item, index) => (
                      <div key={index} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 hover:bg-white/[0.04] transition-colors">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          {item.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-3 leading-relaxed">{item.description}</p>
                        <ul className="space-y-1">
                          {item.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2 text-white/60 text-sm">
                              <span className="w-1 h-1 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="text-emerald-400 font-semibold mb-3 text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Pro Tips Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
              <div>
                <h4 className="font-semibold text-white mb-2">For Teams</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Establish clear roles and permissions</li>
                  <li>• Use consistent naming conventions</li>
                  <li>• Document decisions in real-time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">For Performance</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Keep boards organized and clean</li>
                  <li>• Optimize media and file sizes</li>
                  <li>• Use frames for better structure</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/help/quick-start/5-min-setup" 
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-center"
            >
              Get Started Guide
            </Link>
            <Link 
              href="/help/shortcuts" 
              className="flex-1 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-white rounded-xl font-medium transition-colors text-center border border-white/[0.1]"
            >
              Keyboard Shortcuts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


