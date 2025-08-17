"use client";

import React, { useMemo, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { helpCategories } from "../../data/helpData";
import { HelpArticle } from "../../types";
import { ArrowLeft, Clock, Star, ExternalLink, Users, PenTool, Settings, Shield } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

function findArticleById(id: string): { article: HelpArticle; categoryTitle: string } | null {
  for (const category of helpCategories) {
    const article = category.articles.find((a) => a.id === id);
    if (article) return { article, categoryTitle: category.title };
  }
  return null;
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const found = useMemo(() => findArticleById(id), [id]);
  if (!found) return notFound();

  const { article, categoryTitle } = found;

  // Enhanced content registry for detailed articles
  const contentMap: Record<string, React.ReactNode> = {
    "create-first-board": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Creating your first board in WhizBoard is the foundation for all your collaborative work. 
            This guide will walk you through the process step-by-step, from initial setup to your first collaboration.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Getting Started
          </h3>
          <ol className="list-decimal pl-6 space-y-4 text-white/80">
            <li className="leading-relaxed">
              <strong className="text-white">Navigate to Create Board:</strong> Click the "Create Board" button in the top navigation bar. This will open the board creation dialog.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Name Your Board:</strong> Give your board a descriptive name that reflects its purpose. Consider including the project name or topic.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Choose a Template:</strong> Select from our pre-built templates or start with a blank canvas. Templates include:
              <ul className="mt-2 ml-4 space-y-1">
                <li>• Brainstorming templates for ideation sessions</li>
                <li>• Project planning templates with timelines</li>
                <li>• User journey maps for UX design</li>
                <li>• Blank canvas for complete freedom</li>
              </ul>
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Set Initial Settings:</strong> Configure privacy settings and decide if you want to start with a team workspace or personal board.
            </li>
          </ol>

          <h3 className="text-white font-semibold text-xl mb-4 mt-8 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Next Steps: Invite Your Team
          </h3>
          <p className="text-white/80 mb-4">
            Once your board is created, you'll want to invite team members to start collaborating. 
            Use the Invite button in the board header to add collaborators with appropriate permissions.
          </p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-6">
            <h4 className="text-blue-400 font-semibold mb-2">Pro Tips</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Start with a blank canvas to learn the tools organically</li>
              <li>• Use descriptive names for easy board management</li>
              <li>• Consider your team size when choosing privacy settings</li>
            </ul>
          </div>
        </div>
      </>
    ),
    "invite-collaborators": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Inviting collaborators is essential for team collaboration in WhizBoard. 
            This guide covers all the methods available and how to manage permissions effectively.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Invitation Methods
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Email Invitations</h4>
              <p className="text-white/70 text-sm mb-3">Send direct invitations to specific email addresses</p>
              <ol className="text-white/80 text-sm space-y-1">
                <li>1. Click "Invite" in the board header</li>
                <li>2. Enter email addresses</li>
                <li>3. Select role (Viewer/Editor/Owner)</li>
                <li>4. Add optional message</li>
                <li>5. Send invitation</li>
              </ol>
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Share Links</h4>
              <p className="text-white/70 text-sm mb-3">Generate links for quick access</p>
              <ol className="text-white/80 text-sm space-y-1">
                <li>1. Click "Share" in board header</li>
                <li>2. Choose link permissions</li>
                <li>3. Copy generated link</li>
                <li>4. Share via chat/email</li>
                <li>5. Recipients click to join</li>
              </ol>
            </div>
          </div>

          <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Permission Levels
          </h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <div>
                <strong className="text-white">Viewer:</strong> Can view and comment, but cannot edit content
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div>
                <strong className="text-white">Editor:</strong> Can view, edit, and add content to the board
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <div>
                <strong className="text-white">Owner:</strong> Full control including managing permissions and deleting
              </div>
            </div>
          </div>

          <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-400" />
            Troubleshooting Common Issues
          </h3>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Invitation Not Received</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Check spam/junk folders</li>
                <li>• Verify email address is correct</li>
                <li>• Resend invitation if needed</li>
                <li>• Try share link method instead</li>
              </ul>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Cannot Invite Users</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Ensure you have Manage permissions</li>
                <li>• Check board privacy settings</li>
                <li>• Verify your account status</li>
                <li>• Contact support if issues persist</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
    "basic-tools": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Master the essential tools in WhizBoard to create compelling visual content. 
            This guide covers the pen tool, shapes, text, and other fundamental elements.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-purple-400" />
            Pen Tool Mastery
          </h3>
          <p className="text-white/80 mb-4">
            The pen tool is your primary drawing instrument, perfect for freehand sketches, annotations, and creative expression.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Best Practices</h4>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• Use thinner strokes for detailed work</li>
                <li>• Use thicker strokes for emphasis</li>
                <li>• Hold Shift for straight lines</li>
                <li>• Zoom in for precision</li>
                <li>• Use different colors for organization</li>
              </ul>
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Use Cases</h4>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• Brainstorming mind maps</li>
                <li>• UI/UX wireframes</li>
                <li>• Annotating screenshots</li>
                <li>• Creative sketching</li>
                <li>• Flow diagrams</li>
              </ul>
            </div>
          </div>

          <h3 className="text-white font-semibold text-xl mb-4">Shape Tools</h3>
          <p className="text-white/80 mb-4">
            Shapes provide structure and organization to your boards. Use them to create diagrams, flowcharts, and visual frameworks.
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-8 h-6 bg-blue-400 rounded"></div>
              <div>
                <strong className="text-white">Rectangle (R):</strong> Perfect for containers, buttons, and UI elements
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-8 h-8 bg-green-400 rounded-full"></div>
              <div>
                <strong className="text-white">Ellipse (O):</strong> Great for avatars, icons, and circular elements
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-8 h-0.5 bg-red-400"></div>
              <div>
                <strong className="text-white">Line (L):</strong> Connect elements and create flow diagrams
              </div>
            </div>
          </div>

          <h3 className="text-white font-semibold text-xl mb-4">Text Tool</h3>
          <p className="text-white/80 mb-4">
            Add context, labels, and descriptions to your visual content with the text tool.
          </p>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-2">Text Tips</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Use different font sizes for hierarchy</li>
              <li>• Apply colors to categorize information</li>
              <li>• Keep text concise and readable</li>
              <li>• Use bold/italic for emphasis</li>
            </ul>
          </div>
        </div>
      </>
    ),
    "frames-and-layers": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Frames and layers are powerful organizational tools that help you structure complex boards and manage visual hierarchy.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Understanding Frames</h3>
          <p className="text-white/80 mb-4">
            Frames act as containers that group related content together. They can be exported individually and help organize complex boards.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <h4 className="text-blue-400 font-semibold mb-2">Frame Benefits</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Group related content logically</li>
              <li>• Export sections individually</li>
              <li>• Create presentation-ready slides</li>
              <li>• Improve board navigation</li>
            </ul>
          </div>

          <h3 className="text-white font-semibold text-xl mb-4">Layer Management</h3>
          <p className="text-white/80 mb-4">
            Layers control the stacking order of elements and help you manage complex compositions.
          </p>
        </div>
      </>
    ),
    templates: (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Templates help you start faster by providing pre-built structures for common use cases.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Available Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Brainstorming</h4>
              <p className="text-white/70 text-sm">Mind maps and idea organization templates</p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Project Planning</h4>
              <p className="text-white/70 text-sm">Timelines and task management structures</p>
            </div>
          </div>
        </div>
      </>
    ),
    integrations: (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Connect WhizBoard with your favorite tools to streamline your workflow.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Google Drive Integration</h3>
          <p className="text-white/80 mb-4">
            Import and export files directly to Google Drive for seamless file management.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Slack Integration</h3>
          <p className="text-white/80 mb-4">
            Share boards and receive notifications directly in your Slack channels.
          </p>
        </div>
      </>
    ),
    "real-time-sync": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Real-time synchronization keeps everyone on the same page during collaborative sessions.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">How It Works</h3>
          <p className="text-white/80 mb-4">
            Changes are synchronized instantly across all connected users, with presence indicators showing who's online.
          </p>
        </div>
      </>
    ),
    permissions: (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Control access to your boards by assigning appropriate roles to team members.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Role Types</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <div>
                <strong className="text-white">Viewer:</strong> Read-only access with commenting
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div>
                <strong className="text-white">Editor:</strong> Full editing capabilities
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <div>
                <strong className="text-white">Owner:</strong> Complete control including permissions
              </div>
            </div>
          </div>
        </div>
      </>
    ),
    "comments-feedback": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Use comments to provide feedback, ask questions, and track discussions without cluttering your visual space.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Comment Features</h3>
          <ul className="text-white/80 space-y-2">
            <li>• Mention teammates with @username</li>
            <li>• Resolve comments when addressed</li>
            <li>• Thread discussions for complex topics</li>
            <li>• Receive notifications for mentions</li>
          </ul>
        </div>
      </>
    ),
    "connection-issues": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Troubleshoot connectivity problems and get back to collaborating quickly.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Common Solutions</h3>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Network Issues</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Disable VPN if using one</li>
                <li>• Check firewall settings</li>
              </ul>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Browser Issues</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Clear browser cache and cookies</li>
                <li>• Try a different browser</li>
                <li>• Update to latest browser version</li>
                <li>• Disable browser extensions</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
    "performance-optimization": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Optimize WhizBoard performance for smooth collaboration and faster loading times.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Performance Tips</h3>
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-2">Browser Optimization</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Close unnecessary browser tabs</li>
                <li>• Use modern browsers (Chrome, Firefox, Safari)</li>
                <li>• Clear browser cache regularly</li>
                <li>• Disable heavy browser extensions</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Board Management</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Hide unused layers</li>
                <li>• Use vector shapes over large images</li>
                <li>• Archive old frames</li>
                <li>• Limit high-resolution elements</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
    "data-recovery": (
      <>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Recover lost work and restore previous versions of your boards.
          </p>
          
          <h3 className="text-white font-semibold text-xl mb-4">Recovery Options</h3>
          <ul className="text-white/80 space-y-2">
            <li>• Check version history for previous saves</li>
            <li>• Use undo/redo for recent changes</li>
            <li>• Contact support for advanced recovery</li>
            <li>• Enable auto-save for future protection</li>
          </ul>
        </div>
      </>
    ),
  };

  const content = contentMap[id] ?? (
    <div className="prose prose-invert max-w-none">
      <p className="text-white/80">This article will be available soon. Check back later for detailed content.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-8 sm:pb-12">
        <BackButton label="Back to Help" fallbackHref="/help" variant="minimal" className="mb-6" />

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
              {categoryTitle}
            </span>
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.timeToRead}
            </span>
            {article.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{article.title}</h1>
          <p className="text-white/70 mb-8 text-lg leading-relaxed">{article.description}</p>

          {content}

          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <h3 className="text-white font-semibold mb-3">Related Articles</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 5).map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/[0.05] text-white/60 rounded-lg text-sm border border-white/[0.08]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


