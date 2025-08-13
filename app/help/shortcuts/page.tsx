"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Keyboard, MousePointer, ZoomIn, Layers, FileText } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

const shortcuts = [
  {
    group: "Navigation",
    icon: MousePointer,
    color: "from-blue-500 to-blue-600",
    items: [
      { keys: "+ / -", action: "Zoom in / out" },
      { keys: "Space", action: "Pan (hold and drag)" },
      { keys: "1", action: "Fit to screen" },
      { keys: "0", action: "Reset zoom to 100%" },
      { keys: "Home", action: "Center view" },
    ],
  },
  {
    group: "Selection & Editing",
    icon: Layers,
    color: "from-emerald-500 to-emerald-600",
    items: [
      { keys: "V", action: "Select/Move tool" },
      { keys: "Cmd/Ctrl + D", action: "Duplicate selection" },
      { keys: "Delete", action: "Delete selection" },
      { keys: "Cmd/Ctrl + Z", action: "Undo" },
      { keys: "Cmd/Ctrl + Shift + Z", action: "Redo" },
      { keys: "Cmd/Ctrl + A", action: "Select all" },
      { keys: "Escape", action: "Clear selection" },
    ],
  },
  {
    group: "Drawing Tools",
    icon: Keyboard,
    color: "from-purple-500 to-purple-600",
    items: [
      { keys: "P", action: "Pen tool" },
      { keys: "T", action: "Text tool" },
      { keys: "R", action: "Rectangle" },
      { keys: "O", action: "Ellipse" },
      { keys: "L", action: "Line" },
      { keys: "F", action: "Frame" },
      { keys: "S", action: "Sticky note" },
    ],
  },
  {
    group: "Text & Typography",
    icon: FileText,
    color: "from-amber-500 to-amber-600",
    items: [
      { keys: "Cmd/Ctrl + B", action: "Bold text" },
      { keys: "Cmd/Ctrl + I", action: "Italic text" },
      { keys: "Cmd/Ctrl + U", action: "Underline text" },
      { keys: "Tab", action: "Next text field" },
      { keys: "Shift + Tab", action: "Previous text field" },
    ],
  },
  {
    group: "View & Display",
    icon: ZoomIn,
    color: "from-red-500 to-red-600",
    items: [
      { keys: "Cmd/Ctrl + 0", action: "Toggle fullscreen" },
      { keys: "Cmd/Ctrl + Shift + F", action: "Toggle frame view" },
      { keys: "Cmd/Ctrl + Shift + L", action: "Toggle layer panel" },
      { keys: "Cmd/Ctrl + Shift + T", action: "Toggle toolbar" },
    ],
  },
  {
    group: "File Operations",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    items: [
      { keys: "Cmd/Ctrl + S", action: "Save board" },
      { keys: "Cmd/Ctrl + Shift + S", action: "Save as" },
      { keys: "Cmd/Ctrl + O", action: "Open board" },
      { keys: "Cmd/Ctrl + N", action: "New board" },
      { keys: "Cmd/Ctrl + E", action: "Export board" },
    ],
  },
];

export default function ShortcutsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-8 sm:pb-12">
        <BackButton label="Back to Help" fallbackHref="/help" variant="minimal" className="mb-6" />

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
              Productivity
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Keyboard Shortcuts</h1>
          <p className="text-white/70 mb-8 text-lg leading-relaxed">
            Master these keyboard shortcuts to work faster and more efficiently in WhizBoard. 
            Most shortcuts work across all platforms, with Cmd on Mac and Ctrl on Windows/Linux.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {shortcuts.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.group} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-white font-semibold text-lg">{section.group}</h2>
                  </div>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.action} className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                        <span className="text-white/80 text-sm">{item.action}</span>
                        <kbd className="text-white/90 font-mono bg-white/10 px-3 py-1.5 rounded border border-white/20 text-xs font-medium">
                          {item.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="text-blue-400 font-semibold mb-3 text-lg">Tips for Using Shortcuts</h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">?</kbd> anytime to see this shortcuts panel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Most shortcuts can be customized in your settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Use modifier keys (Shift, Alt/Option) to access additional functions</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/help/quick-start/5-min-setup" 
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-center"
            >
              Get Started Guide
            </Link>
            <Link 
              href="/help/best-practices" 
              className="flex-1 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-white rounded-xl font-medium transition-colors text-center border border-white/[0.1]"
            >
              Best Practices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


