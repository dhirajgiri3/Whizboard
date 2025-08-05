"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Users, AlertCircle, CheckCircle, Copy, Clock, UserCheck, UserX, Sparkles, Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useBoardContext } from '@/lib/context/BoardContext';

interface InviteCollaboratorsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  boardId: string;
  boardName: string;
  isMobile?: boolean;
  isTablet?: boolean;
}

interface PendingInvitation {
  id: string;
  inviteeEmail: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  inviterName?: string;
  invitationToken: string;
}

export default function InviteCollaboratorsModal({
  isOpen,
  onCloseAction,
  boardId,
  boardName,
  isMobile,
  isTablet,
}: InviteCollaboratorsModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { data: session } = useSession();
  const { boardMetadata } = useBoardContext();
  const isOwner = session?.user?.id && boardMetadata?.createdBy === session.user.id;

  // Responsive settings
  const isSmallScreen = isMobile || isTablet;

  // Trigger entrance animation
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPendingInvitations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/board/invite?boardId=${boardId}`);
        if (response.ok) {
          const data = await response.json();
          setPendingInvitations(data.invitations || []);
        }
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCloseAction();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      fetchPendingInvitations();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCloseAction, boardId]);

  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch(`/api/board/invite?boardId=${boardId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched invitations:', data.invitations);
        
        const validInvitations = (data.invitations || []).filter((invitation: Partial<PendingInvitation>) => {
          const isValid = invitation.id && invitation.inviteeEmail && invitation.invitationToken;
          if (!isValid) {
            console.warn('Invalid invitation found:', invitation);
          }
          return isValid;
        });
        
        console.log('Valid invitations after filtering:', validInvitations);
        setPendingInvitations(validInvitations as PendingInvitation[]);
      } else {
        console.error('Failed to fetch invitations:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);

    try {
      const response = await fetch('/api/board/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId,
          inviteeEmail: email.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastInvitedEmail(email);
        setShowSuccess(true);
        setEmail('');
        setMessage('');
        toast.success(`Invitation sent to ${email}`);
        fetchPendingInvitations();
      } else {
        throw new Error(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyBoardLink = async () => {
    try {
      const boardUrl = `${window.location.origin}/board/${boardId}`;
      await navigator.clipboard.writeText(boardUrl);
      toast.success('Board link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'accepted':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      case 'declined':
        return <UserX className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
      case 'declined':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-100';
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleRevokeInvitation = async (invitationId: string, inviteeEmail: string) => {
    console.log('Revoke invitation called with:', { invitationId, inviteeEmail, boardId });
    
    if (!invitationId || !boardId) {
      console.error('Missing required data for revoke:', { invitationId, boardId });
      toast.error('Missing invitation or board information');
      return;
    }

    if (typeof invitationId !== 'string' || invitationId.trim() === '') {
      console.error('Invalid invitation ID:', invitationId);
      toast.error('Invalid invitation ID');
      return;
    }

    toast('Revoke Invitation?', {
      description: `Are you sure you want to revoke the invitation for ${inviteeEmail}? This action cannot be undone.`,
      action: {
        label: 'Revoke',
        onClick: async () => {
          console.log('Attempting to revoke invitation:', { invitationId, boardId });

          const revokePromise = fetch('/api/board/invite', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invitationId: invitationId.trim(), boardId: boardId.trim() }),
          }).then(async (response) => {
            const data = await response.json();
            
            console.log('Revoke invitation response:', { 
              status: response.status, 
              ok: response.ok, 
              data 
            });
            
            if (response.ok && data.success) {
              await fetchPendingInvitations();
              return data;
            } else {
              console.error('Revoke invitation error:', data);
              throw new Error(data.error || 'Failed to revoke invitation');
            }
          });

          toast.promise(revokePromise, {
            loading: `Revoking invitation for ${inviteeEmail}...`,
            success: `Invitation for ${inviteeEmail} has been revoked successfully`,
            error: (error) => `Failed to revoke invitation: ${error.message}`,
          });
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          toast.dismiss();
        },
      },
      duration: 10000,
    });
  };

  const formatExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    if (expiry < now) return 'Expired';
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Less than 1 hour';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          showAnimation ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onCloseAction}
      />
      
      {/* Modal container */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isSmallScreen ? 'p-2' : 'p-4'}`}>
        <div 
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full overflow-hidden transform transition-all duration-300 ${
            // Responsive sizing
            isSmallScreen ? 'max-w-sm max-h-[95vh]' : 'max-w-2xl max-h-[90vh]'
          } ${
            showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient header */}
          <div className={`relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white ${isSmallScreen ? 'px-4 py-4' : 'px-8 py-6'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-indigo-700/90" />
            <div className="relative flex items-center justify-between">
              <div className={`flex items-center ${isSmallScreen ? 'space-x-2' : 'space-x-4'}`}>
                <div className={`bg-white/20 rounded-2xl backdrop-blur-sm ${isSmallScreen ? 'p-2' : 'p-3'}`}>
                  <Users className={`text-white ${isSmallScreen ? 'w-5 h-5' : 'w-7 h-7'}`} />
                </div>
                <div>
                  <h2 className={`font-bold text-white ${isSmallScreen ? 'text-lg' : 'text-2xl'}`}>
                    {isSmallScreen ? 'Invite' : 'Invite Collaborators'}
                  </h2>
                  <p className={`text-blue-100 font-medium mt-1 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
                    {isSmallScreen && boardName.length > 20 ? `${boardName.substring(0, 20)}...` : boardName}
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseAction}
                className={`hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 ${isSmallScreen ? 'p-1.5' : 'p-2'} ${isMobile ? 'touch-manipulation' : ''}`}
              >
                <X className={`text-white ${isSmallScreen ? 'w-5 h-5' : 'w-6 h-6'}`} />
              </button>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          </div>

          <div className={`overflow-y-auto custom-scrollbar ${isSmallScreen ? 'px-4 py-4 max-h-[calc(95vh-120px)]' : 'px-8 py-6 max-h-[calc(90vh-160px)]'}`}>
            {showSuccess ? (
              // Enhanced Success State
              <div className="text-center py-12">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-emerald-100 rounded-full opacity-30 animate-ping" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Invitation Sent!</h3>
                <p className="text-slate-600 mb-8 text-lg">
                  We&apos;ve sent an invitation to <span className="font-semibold text-blue-700">{lastInvitedEmail}</span>
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Send Another</span>
                  </button>
                  <button
                    onClick={onCloseAction}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Invitation Form */}
                <form onSubmit={handleInvite} className="space-y-6 mb-8">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200 ${
                        isSmallScreen ? 'left-3 w-4 h-4' : 'left-4 w-5 h-5'
                      }`} />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          // Prevent event propagation to allow normal text input
                          e.stopPropagation();
                        }}
                        onKeyUp={(e) => {
                          // Prevent event propagation for key up events as well
                          e.stopPropagation();
                        }}
                        placeholder="Enter collaborator's email"
                        className={`w-full pr-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-500 ${
                          isSmallScreen ? 'pl-10 py-3 text-sm' : 'pl-12 py-4'
                        } ${isMobile ? 'touch-manipulation' : ''}`}
                        disabled={isInviting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700">
                      Personal Message <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        // Prevent event propagation for space key and other keys to allow normal text input
                        e.stopPropagation();
                      }}
                      onKeyUp={(e) => {
                        // Prevent event propagation for key up events as well
                        e.stopPropagation();
                      }}
                      placeholder="Add a personal message to your invitation..."
                      rows={isSmallScreen ? 2 : 3}
                      className={`w-full border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-500 ${
                        isSmallScreen ? 'px-3 py-3 text-sm' : 'px-4 py-4'
                      } ${isMobile ? 'touch-manipulation' : ''}`}
                      disabled={isInviting}
                      maxLength={500}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isInviting || !email.trim()}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none ${
                      isSmallScreen ? 'py-3 px-4' : 'py-4 px-6'
                    } ${isMobile ? 'touch-manipulation' : ''}`}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </form>

                {/* Enhanced Share Link Section */}
                <div className="border-t-2 border-slate-100 pt-8 mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <Link className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Or share board link</h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={`${window.location.origin}/board/${boardId}`}
                      readOnly
                      className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600 font-mono"
                    />
                    <button
                      onClick={handleCopyBoardLink}
                      className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 flex items-center space-x-2 font-medium hover:scale-105"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                  </div>
                  <div className="flex items-center mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Anyone with this link can view the board
                    </p>
                  </div>
                </div>

                {/* Enhanced Pending Invitations */}
                {(pendingInvitations.length > 0 || isLoading) && (
                  <div className="border-t-2 border-slate-100 pt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>Recent Invitations</span>
                        {pendingInvitations.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {pendingInvitations.length}
                          </span>
                        )}
                      </h3>
                      <button
                        onClick={fetchPendingInvitations}
                        disabled={isLoading}
                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium flex items-center space-x-1"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>Refresh</span>
                        )}
                      </button>
                    </div>
                    
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                              <div className="w-8 h-8 bg-slate-200 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-1/3" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                              </div>
                              <div className="h-6 bg-slate-200 rounded w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {pendingInvitations.map((invitation, index) => (
                          <div
                            key={`invitation-${invitation.id || index}-${invitation.inviteeEmail}`}
                            className="group flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {getStatusIcon(invitation.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {invitation.inviteeEmail}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center space-x-2">
                                  <span>Sent {formatRelativeTime(invitation.createdAt)}</span>
                                  {invitation.status === 'pending' && (
                                    <>
                                      <span>•</span>
                                      <span>Expires {formatExpiry(invitation.expiresAt)}</span>
                                    </>
                                  )}
                                </p>
                                {invitation.message && (
                                  <p className="text-xs text-slate-400 italic truncate mt-1 bg-slate-50 px-2 py-1 rounded">
                                    &ldquo;{invitation.message}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(invitation.status)}`}>
                                {getStatusText(invitation.status)}
                              </span>
                              {invitation.status === 'pending' && (
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${window.location.origin}/board/${boardId}/invite?token=${invitation.invitationToken}&email=${encodeURIComponent(invitation.inviteeEmail)}`
                                      );
                                      toast.success('Invitation link copied');
                                    }}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                    title="Copy invitation link"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  {isOwner && (
                                    <button
                                      onClick={() => {
                                        console.log('Revoke button clicked for invitation:', { 
                                          id: invitation.id, 
                                          email: invitation.inviteeEmail,
                                          fullInvitation: invitation 
                                        });
                                        handleRevokeInvitation(invitation.id, invitation.inviteeEmail);
                                      }}
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                                      title="Revoke invitation"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}