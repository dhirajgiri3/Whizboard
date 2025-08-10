"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Folder,
  FileText,
  Image,
  Upload,
  Download,
  Share2,
  Settings,
  Play,
  BookOpen,
  Zap,
  Link,
  Mail,
  Globe,
  Archive,
  Lightbulb
} from 'lucide-react';
import { toast } from '@/lib/ui/useToast';

interface GoogleDriveOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isConnected: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function GoogleDriveOnboarding({ 
  isOpen, 
  onClose, 
  onComplete, 
  isConnected 
}: GoogleDriveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Google Drive Integration',
      description: 'Learn how to use Google Drive with your whiteboards',
      icon: Cloud,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unlock the Power of Google Drive
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Google Drive account to export boards, organize files, and collaborate with your team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Export Boards</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Save your boards directly to Google Drive</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Share2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Share & Collaborate</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Share boards with team members easily</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Folder className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Organize Files</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Keep your boards organized in folders</p>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Get Started',
        onClick: () => nextStep()
      }
    },
    {
      id: 'connection',
      title: 'Connect Your Google Drive',
      description: 'Link your Google Drive account to get started',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            {isConnected ? (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isConnected ? 'Connected Successfully!' : 'Connect Your Account'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isConnected 
                ? 'Your Google Drive account is connected and ready to use.'
                : 'Connect your Google Drive account to start exporting and organizing your boards.'
              }
            </p>
          </div>

          {!isConnected && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Connect:</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
                  <span>Go to Settings → Integrations tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
                  <span>Click "Connect" next to Google Drive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
                  <span>Complete the Google OAuth flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">4</span>
                  <span>Return here and click "Continue"</span>
                </li>
              </ol>
            </div>
          )}

          {isConnected && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Connection Verified</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your Google Drive account is connected and ready to use. You can now export boards and manage files.
              </p>
            </div>
          )}
        </div>
      ),
      action: {
        label: isConnected ? 'Continue' : 'Connect Now',
        onClick: () => {
          if (!isConnected) {
            window.location.href = '/settings?tab=integrations';
          } else {
            nextStep();
          }
        }
      }
    },
    {
      id: 'export',
      title: 'Export Your First Board',
      description: 'Learn how to export boards to Google Drive',
      icon: Upload,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Export Boards to Google Drive
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Export your whiteboards in multiple formats and save them directly to Google Drive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Export Formats:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Image className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">PNG Image</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">High-quality raster image</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">SVG Vector</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Scalable vector graphics</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">JSON Data</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Complete board data</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">How to Export:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Create or open a board</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Add your content and ideas</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Click the export button</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Located in the board toolbar</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Choose "Export to Drive"</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Select format and folder</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Share with your team</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Use Google Drive sharing features</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Try Exporting',
        onClick: () => {
          toast.info(
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <div className="font-semibold">Try Google Drive Export</div>
                <div className="text-white/70 text-sm">Create a board and use Export → Drive</div>
              </div>
            </div>,
            {
              description: (
                <div className="text-white/70 text-sm">
                  Choose PNG, SVG or JSON and pick your Drive folder.
                </div>
              ),
              action: {
                label: 'Create Board',
                onClick: () => {
                  window.location.href = '/my-boards';
                },
              },
              cancel: {
                label: 'Later',
                onClick: () => {},
              },
              duration: 5000,
            }
          );
          nextStep();
        }
      }
    },
    {
      id: 'organization',
      title: 'Organize Your Files',
      description: 'Learn best practices for organizing your boards',
      icon: Folder,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Organize Your Boards
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create folders and organize your boards for better collaboration and easy access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Folder Structure Ideas:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500" /> Projects</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Organize by project name</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-medium text-green-900 dark:text-green-100 flex items-center gap-2"><Users className="w-4 h-4 text-green-500" /> Meetings</div>
                  <div className="text-sm text-green-800 dark:text-green-200">Store meeting notes and diagrams</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" /> Templates</div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">Reusable board templates</div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2"><Archive className="w-4 h-4 text-orange-500" /> Archive</div>
                  <div className="text-sm text-orange-800 dark:text-orange-200">Old but important boards</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Best Practices:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Use descriptive names</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Include project and date in filename</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Create shared folders</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">For team collaboration</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Set appropriate permissions</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Control who can view and edit</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Regular cleanup</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Archive old boards periodically</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Create Folders',
        onClick: () => nextStep()
      }
    },
    {
      id: 'collaboration',
      title: 'Collaborate with Your Team',
      description: 'Share boards and work together effectively',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Team Collaboration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share your boards with team members and collaborate effectively using Google Drive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Sharing Options:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2"><Link className="w-4 h-4 text-blue-500" /> Direct Link</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Share Google Drive link</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-medium text-green-900 dark:text-green-100 flex items-center gap-2"><Users className="w-4 h-4 text-green-500" /> Team Folder</div>
                  <div className="text-sm text-green-800 dark:text-green-200">Add to shared team folder</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2"><Mail className="w-4 h-4 text-purple-500" /> Email Share</div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">Share via email invitation</div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2"><Globe className="w-4 h-4 text-orange-500" /> Public Link</div>
                  <div className="text-sm text-orange-800 dark:text-orange-200">Create public access link</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Collaboration Workflows:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Meeting Documentation</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Export and share meeting notes</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Project Planning</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Share project roadmaps and timelines</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Design Reviews</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Share design concepts and feedback</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Client Presentations</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Share professional deliverables</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Start Collaborating',
        onClick: () => nextStep()
      }
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start using Google Drive with your whiteboards',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Google Drive Integration!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You're now ready to export boards, organize files, and collaborate with your team using Google Drive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">Export Boards</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Save to Google Drive</div>
            </div>
            <div className="text-center p-4">
              <Folder className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">Organize Files</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Create folders</div>
            </div>
            <div className="text-center p-4">
              <Share2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">Share & Collaborate</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Work with team</div>
            </div>
          </div>

          <div className="bg-blue-50 flex flex-col items-center justify-center dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-blue-500" /> Next Steps</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div>Create your first board</div>
              <div>Export it to Google Drive</div>
              <div>Create folders for organization</div>
              <div>Share with your team</div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Get Started',
        onClick: () => {
          onComplete();
          onClose();
        }
      }
    }
  ];

  const nextStep = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData) {
      setCompletedSteps(prev => [...prev, currentStepData.id]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden bg-[#111111] border border-white/[0.08]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Google Drive Setup</h2>
              <p className="text-white/70">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-white/[0.02] border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/[0.06] text-white/60'
                  }`}
                >
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-white/[0.08]'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/[0.08] bg-white/[0.02]">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStepData.action && (
              <button
                onClick={currentStepData.action.onClick}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {currentStepData.action.label}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
