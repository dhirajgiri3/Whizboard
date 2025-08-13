import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, Hash, MessageSquare, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/http/axios';

interface SlackChannel {
  id: string;
  name: string;
}

interface SlackComposerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMessage?: string;
  defaultChannelId?: string;
  title?: string;
  showSchedule?: boolean;
}

export default function SlackComposer({
  isOpen,
  onClose,
  defaultMessage = '',
  defaultChannelId = '',
  title = 'Send to Slack',
  showSchedule = true,
}: SlackComposerProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannelId);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelQuery, setChannelQuery] = useState('');
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [integrationActive, setIntegrationActive] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const filteredChannels = useMemo(() => {
    if (!channelQuery.trim()) return channels;
    const q = channelQuery.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(q));
  }, [channels, channelQuery]);

  // Ensure portal target exists (client-only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load channels on open
  useEffect(() => {
    if (isOpen) {
      loadIntegrationStatus();
      loadChannels();
      loadDefaultChannel();
      setTimeout(() => { textareaRef.current?.focus(); }, 50);
    }
  }, [isOpen]);

  const loadChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const response = await api.get('/api/integrations/slack/channels');
      const channelData = response.data.channels || [];
      setChannels(channelData);
      
      // Set default channel if not already set
      if (!selectedChannelId && channelData.length > 0) {
        setSelectedChannelId(channelData[0].id);
      }
    } catch (error) {
      console.error('Failed to load Slack channels:', error);
      toast.error('Failed to load Slack channels');
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const loadDefaultChannel = async () => {
    try {
      const response = await api.get('/api/settings/integrations/slack-default-channel');
      const defaultChannelId = response.data?.defaultChannel?.id as string | undefined;
      if (defaultChannelId && !selectedChannelId) {
        setSelectedChannelId(defaultChannelId);
      }
    } catch {
      // silently ignore
    }
  };

  const loadIntegrationStatus = async () => {
    try {
      const response = await api.get('/api/settings/integrations', { headers: { 'Cache-Control': 'no-store' } });
      // API returns shape: { googleDrive: boolean, slack: boolean }
      const slackEnabled = Boolean(response.data?.slack);
      setIntegrationActive(slackEnabled);
    } catch (error) {
      setIntegrationActive(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedChannelId) {
      toast.error('Please select a channel');
      return;
    }

    setIsSending(true);
    try {
      const response = await api.post('/api/integrations/slack/post', {
        channelId: selectedChannelId,
        text: message.trim(),
      });

      if (response.data.success) {
        toast.success('Message sent to Slack!', {
          description: 'Your message has been delivered successfully.',
          duration: 4000,
        });
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      toast.error('Failed to send message to Slack');
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedChannelId) {
      toast.error('Please select a channel');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    setIsScheduling(true);
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const postAt = Math.floor(scheduledDateTime.getTime() / 1000);

      const response = await api.post('/api/integrations/slack/schedule', {
        channelId: selectedChannelId,
        text: message.trim(),
        postAt,
      });

      if (response.data.success) {
        toast.success('Message scheduled for Slack!', {
          description: `Your message will be sent at ${new Date(scheduledDateTime).toLocaleString()}`,
          duration: 5000,
        });
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to schedule message');
      }
    } catch (error) {
      console.error('Failed to schedule Slack message:', error);
      toast.error('Failed to schedule message');
    } finally {
      setIsScheduling(false);
    }
  };

  const getChannelName = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel ? `#${channel.name}` : 'Select channel';
  };

  // Remember last used channel per user
  useEffect(() => {
    if (isOpen) {
      try {
        const last = localStorage.getItem('slack:lastChannelId');
        if (last && !selectedChannelId) {
          setSelectedChannelId(last);
        }
      } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedChannelId) {
      try {
        localStorage.setItem('slack:lastChannelId', selectedChannelId);
      } catch {}
    }
  }, [selectedChannelId]);

  // Keyboard shortcuts: Cmd/Ctrl+Enter to send, Esc to close
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (showSchedule && showScheduleOptions) {
        handleSchedule();
      } else {
        handleSend();
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [isOpen, showSchedule, showScheduleOptions, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (!isMounted) return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMounted, isOpen]);

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[10050] overflow-y-auto pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="slack-composer-title"
          onKeyDownCapture={(e) => {
            const ke = e as unknown as KeyboardEvent;
            // Ensure space inserts and doesn't trigger canvas shortcuts
            if (ke.key === ' ' || ke.code === 'Space') {
              e.stopPropagation();
              return;
            }
            // Handle Ctrl/Cmd+Enter locally to prevent bubbling
            if ((ke.metaKey || ke.ctrlKey) && ke.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              if (showSchedule && showScheduleOptions) {
                handleSchedule();
              } else {
                handleSend();
              }
            }
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 id="slack-composer-title" className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-slate-700">Send a message to your Slack workspace</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-slate-700" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {integrationActive === false && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-800 mb-1">Slack Integration Required</h4>
                        <p className="text-yellow-700 mb-3">Connect your Slack workspace to share boards and collaborate with your team.</p>
                        <div className="flex gap-2">
                          <a
                            href="/settings?tab=integrations"
                            className="px-4 py-2 text-sm rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors font-medium"
                          >
                            Connect Slack
                          </a>
                          <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Channel Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">Channel</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={channelQuery}
                      onChange={(e) => setChannelQuery(e.target.value)}
                      placeholder="Search channels"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 placeholder:text-slate-500"
                      disabled={isLoadingChannels || integrationActive === false}
                      aria-label="Search channels"
                    />
                    <button
                      type="button"
                      onClick={loadChannels}
                      title="Reload channels"
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-300 disabled:opacity-50"
                      disabled={isLoadingChannels || integrationActive === false}
                      aria-label="Reload channels"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedChannelId}
                      onChange={(e) => setSelectedChannelId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                      disabled={isLoadingChannels || integrationActive === false}
                      aria-label="Slack channel"
                    >
                      {isLoadingChannels ? (
                        <option>Loading channels...</option>
                      ) : channels.filter(c => c.name.toLowerCase().includes(channelQuery.toLowerCase())).length === 0 ? (
                        <option>No channels match your search</option>
                      ) : (
                        channels
                          .filter(c => c.name.toLowerCase().includes(channelQuery.toLowerCase()))
                          .map((channel) => (
                            <option key={channel.id} value={channel.id}>
                              #{channel.name}
                            </option>
                          ))
                      )}
                    </select>
                    <Hash className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white text-slate-800 placeholder:text-slate-500"
                    rows={4}
                    maxLength={3000}
                    aria-label="Message"
                    ref={textareaRef}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Ctrl/Cmd+Enter to {showSchedule && showScheduleOptions ? 'schedule' : 'send'}</span>
                    <span className={`text-xs ${3000 - message.length <= 0 ? 'text-red-600' : 3000 - message.length < 200 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {message.length}/3000
                    </span>
                  </div>
                  {showSchedule && (
                    <button
                      onClick={() => {
                        const next = !showScheduleOptions;
                        setShowScheduleOptions(next);
                        if (next && (!scheduledDate || !scheduledTime)) {
                          const now = new Date();
                          const in30 = new Date(now.getTime() + 30 * 60 * 1000);
                          const yyyyMmDd = in30.toISOString().split('T')[0];
                          const hh = String(in30.getHours()).padStart(2, '0');
                          const mm = String(in30.getMinutes()).padStart(2, '0');
                          setScheduledDate(yyyyMmDd);
                          setScheduledTime(`${hh}:${mm}`);
                        }
                      }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                    >
                      <Clock className="h-3 w-3" />
                      Schedule
                    </button>
                  )}
                </div>

                {/* Schedule Options */}
                {showSchedule && showScheduleOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Schedule Message</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-blue-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 [color-scheme:light]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-700 mb-1">Time</label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 [color-scheme:light]"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-blue-700">
                      <AlertCircle className="h-3 w-3" />
                      <span>Message will be sent at the specified time</span>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Cancel
                </button>
                <div className="flex items-center space-x-3">
                  {showSchedule && showScheduleOptions ? (
                    <button
                      onClick={handleSchedule}
                        disabled={isScheduling || !message.trim() || !selectedChannelId || integrationActive === false}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {isScheduling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Schedule</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={isSending || !message.trim() || !selectedChannelId || integrationActive === false}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
  
  // Render via portal to escape stacking contexts created by ancestors (e.g., transforms, filters)
  if (!isMounted) return null;
  const target = typeof document !== 'undefined' ? document.body : null;
  if (!target) return null;
  return createPortal(modal, target);
}
