import React, { useState } from 'react';
import { Share2, MessageSquare, Link as LinkIcon, Edit3 } from 'lucide-react';
import SlackComposer from './SlackComposer';
import api from '@/lib/http/axios';
import { toast } from 'sonner';

interface ShareToSlackButtonProps {
  boardId: string;
  boardName: string;
  className?: string;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export default function ShareToSlackButton({
  boardId,
  boardName,
  className = '',
  variant = 'button',
  size = 'md',
}: ShareToSlackButtonProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [computedDefaultMessage, setComputedDefaultMessage] = useState('');
  const [isSharingLink, setIsSharingLink] = useState(false);

  // Build a safe default message only when needed (avoids SSR window access)
  const buildDefaultMessage = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `Check out this board: ${boardName}\n\nView it here: ${origin}/board/${boardId}`;
  };

  const handleOpenComposer = () => {
    setComputedDefaultMessage(buildDefaultMessage());
    setIsComposerOpen(true);
  };

  const handleShareLinkDirect = async () => {
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
        toast.success('Board link shared to Slack');
      } else {
        throw new Error(res.data?.error || 'Failed to share');
      }
    } catch (e) {
      toast.error('Failed to share board link to Slack');
    } finally {
      setIsSharingLink(false);
    }
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'icon':
        return <Share2 className="h-4 w-4" />;
      case 'text':
        return 'Share to Slack';
      default:
        return (
          <>
            <Share2 className="h-4 w-4" />
            <span>Share to Slack</span>
          </>
        );
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const variantClasses = {
      button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-lg',
      icon: 'p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg',
      text: 'text-blue-600 hover:text-blue-700 underline',
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Direct Share Link to Slack */}
      <button
        onClick={handleShareLinkDirect}
        className={getButtonClasses()}
        aria-label="Share board link to Slack"
        title="Share board link to Slack"
        disabled={isSharingLink}
      >
        {variant === 'button' && <LinkIcon className="h-4 w-4" />}
        {variant === 'text' ? 'Share link to Slack' : variant === 'icon' ? null : <span>Share link</span>}
        {isSharingLink && (
          <span className="ml-2 text-xs opacity-80">Sending…</span>
        )}
      </button>

      {/* Open Composer to write a custom message */}
      <button
        onClick={handleOpenComposer}
        className={getButtonClasses()}
        aria-label="Message on Slack"
        title="Message on Slack"
      >
        {variant === 'button' && <Edit3 className="h-4 w-4" />}
        {variant === 'text' ? 'Message on Slack' : variant === 'icon' ? null : <span>Message</span>}
      </button>

      <SlackComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        defaultMessage={computedDefaultMessage || buildDefaultMessage()}
        title={`Message on Slack`}
        showSchedule={true}
      />
    </div>
  );
}
