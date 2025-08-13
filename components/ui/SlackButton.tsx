import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickActionButton from './button/QuickActionButton';
import SlackComposer from './SlackComposer';
import api from '@/lib/http/axios';
import { toast } from 'sonner';

interface SlackButtonProps {
  boardId?: string;
  boardName?: string;
  className?: string;
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md';
  showQuickActions?: boolean;
  mode?: 'light' | 'dark';
}

export default function SlackButton({
  boardId,
  boardName = 'Board',
  className = '',
  variant = 'default',
  size = 'md',
  showQuickActions = true,
  mode = 'light'
}: SlackButtonProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<'connected' | 'disconnected' | 'loading' | 'error'>('loading');
  const [isSharingLink, setIsSharingLink] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Check integration status on mount
  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    setIntegrationStatus('loading');
    try {
      const response = await api.get('/api/settings/integrations', { 
        headers: { 'Cache-Control': 'no-store' } 
      });
      const slackEnabled = Boolean(response.data?.slack);
      setIntegrationStatus(slackEnabled ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Failed to check Slack integration status:', error);
      setIntegrationStatus('error');
    }
  };

  const handleOpenComposer = () => {
    if (integrationStatus !== 'connected') {
      toast.error('Please connect Slack in Settings first');
      return;
    }
    setIsComposerOpen(true);
    setShowQuickMenu(false);
  };

  const handleShareLinkDirect = async () => {
    if (integrationStatus !== 'connected') {
      toast.error('Please connect Slack in Settings first');
      return;
    }
    
    if (!boardId) {
      toast.error('Board ID is required');
      return;
    }

    setIsSharingLink(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const boardUrl = `${origin}/board/${boardId}`;
      const res = await api.post('/api/integrations/slack/share-board', {
        boardId,
        boardName,
        boardUrl,
      });
      
      if (res.data?.success) {
        toast.success('Board shared to Slack!');
      } else {
        throw new Error(res.data?.error || 'Failed to share');
      }
    } catch (error) {
      console.error('Failed to share board link to Slack:', error);
      toast.error('Failed to share board to Slack');
    } finally {
      setIsSharingLink(false);
      setShowQuickMenu(false);
    }
  };

  const handleOpenSettings = () => {
    window.open('/settings?tab=integrations', '_blank');
    setShowQuickMenu(false);
  };

  const buildDefaultMessage = () => {
    if (!boardId) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `Check out this board: ${boardName}\n\nView it here: ${origin}/board/${boardId}`;
  };

  const getButtonVariant = () => {
    // Keep base behavior but styling will primarily come from className below
    if (variant === 'primary') return 'primary';
    if (integrationStatus === 'error') return 'danger';
    if (integrationStatus === 'connected') return 'default';
    return 'default';
  };

  const getButtonLabel = () => {
    switch (integrationStatus) {
      case 'connected':
        return 'Message on Slack';
      case 'disconnected':
        return 'Connect Slack';
      case 'loading':
        return 'Checking...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Slack';
    }
  };

  const getButtonClassName = () => {
    // Match header pill buttons: subtle, rounded, no wrap, theme-aware
    const common = 'text-sm rounded-full whitespace-nowrap';
    if (mode === 'dark') {
      // Header dark: text-white/70 hover:text-white, hover:bg-white/5, border-white/10
      return `${common} bg-transparent text-white/70 hover:text-white border border-white/10 hover:bg-white/5`;
    }
    // Header light: text-gray-600 hover:text-gray-900, hover:bg-gray-100, border-gray-200
    return `${common} bg-transparent text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-100`;
  };

  const handleButtonClick = () => {
    if (integrationStatus === 'connected' && showQuickActions) {
      setShowQuickMenu(!showQuickMenu);
    } else if (integrationStatus === 'disconnected') {
      handleOpenSettings();
    } else if (integrationStatus === 'connected') {
      handleOpenComposer();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Slack Button */}
      <QuickActionButton
        icon={MessageSquare}
        onClick={handleButtonClick}
        label={getButtonLabel()}
        variant={getButtonVariant()}
        size={size}
        status={integrationStatus}
        showStatusIndicator={true}
        disabled={integrationStatus === 'loading'}
        loading={integrationStatus === 'loading'}
        className={`${getButtonClassName()} whitespace-nowrap`}
      />

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showQuickMenu && integrationStatus === 'connected' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-2xl z-50 ${
              mode === 'dark' ? 'bg-[#0A0A0B]/95 border border-white/10 backdrop-blur-md' : 'bg-white border border-gray-200 backdrop-blur-md'
            }`}
          >
            <div className="p-2 space-y-1">
              {/* Share Link Option */}
              {Boolean(boardId) && (
                <button
                  onClick={handleShareLinkDirect}
                  disabled={isSharingLink}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
                    mode === 'dark' ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {isSharingLink ? (
                    <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${mode === 'dark' ? 'border-white/30' : 'border-gray-400'}`} />
                  ) : (
                    <CheckCircle className={`w-4 h-4 ${mode === 'dark' ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  )}
                  <span className="whitespace-nowrap">{isSharingLink ? 'Sharing...' : 'Share board link'}</span>
                </button>
              )}

              {/* Custom Message Option */}
              <button
                onClick={handleOpenComposer}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  mode === 'dark' ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className={`w-4 h-4 ${mode === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className="whitespace-nowrap">Write custom message</span>
              </button>

              {/* Schedule Message Option */}
              {Boolean(boardId) && (
                <button
                  onClick={() => {
                    setIsComposerOpen(true);
                    setShowQuickMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                    mode === 'dark' ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${mode === 'dark' ? 'text-purple-300' : 'text-purple-500'}`} />
                  <span className="whitespace-nowrap">Schedule message</span>
                </button>
              )}

              {/* Settings Option */}
              <button
                onClick={handleOpenSettings}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  mode === 'dark' ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Settings className={`w-4 h-4 ${mode === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />
                <span className="whitespace-nowrap">Slack settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slack Composer Modal */}
      <SlackComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        defaultMessage={buildDefaultMessage()}
        title={`Share "${boardName}" to Slack`}
        showSchedule={true}
      />

      {/* Click outside to close quick menu */}
      {showQuickMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowQuickMenu(false)}
        />
      )}
    </div>
  );
}
