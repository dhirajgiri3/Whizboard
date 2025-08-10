"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Users, AlertCircle, CheckCircle, Copy, Clock, UserCheck, UserX, Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useBoardContext } from '@/lib/context/BoardContext';
import api from '@/lib/http/axios';

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
        const { data } = await api.get(`/api/board/invite?boardId=${boardId}`);
        setPendingInvitations(data.invitations || []);
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
      const { data } = await api.get(`/api/board/invite?boardId=${boardId}`);
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
      const { data } = await api.post('/api/board/invite', {
        boardId,
        inviteeEmail: email.trim(),
        message: message.trim(),
      });

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
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'declined':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      default:
        return 'bg-white/5 text-white/70 border-white/10';
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

          const revokePromise = api.delete('/api/board/invite', {
            data: { invitationId: invitationId.trim(), boardId: boardId.trim() }
          }).then(async (response) => {
            const data = response.data as any;
            console.log('Revoke invitation response:', { status: response.status, data });
            if (response.status >= 200 && response.status < 300 && data.success) {
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1050] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}
        onClick={onCloseAction}
      />

      {/* Modal container */}
      <div className={`fixed inset-0 z-[1060] flex items-center justify-center ${isSmallScreen ? 'p-2' : 'p-4'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <div
          className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl transform transition-all duration-300 ${
            isSmallScreen ? 'max-w-sm max-h-[95vh]' : 'max-w-2xl max-h-[90vh]'
          } ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-5 ${isSmallScreen ? 'py-4' : 'py-5'} border-b border-white/10`}> 
            <div className="flex items-center gap-3">
              <div className="inline-flex p-2 rounded-xl bg-white/10 border border-white/15" aria-hidden="true">
                <Users className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h2 id="invite-modal-title" className={`text-white font-semibold ${isSmallScreen ? 'text-base' : 'text-lg'}`}>Invite Collaborators</h2>
                <p className={`text-white/50 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>{boardName}</p>
              </div>
            </div>
            <button
              onClick={onCloseAction}
              className={`w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center transition-colors ${isMobile ? 'touch-manipulation' : ''}`}
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>

          <div className={`overflow-y-auto custom-scrollbar ${isSmallScreen ? 'px-4 py-4 max-h-[calc(95vh-120px)]' : 'px-6 py-6 max-h-[calc(90vh-160px)]'}`}>
            {showSuccess ? (
              // Success State (dark)
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Invitation Sent</h3>
                <p className="text-white/70 mb-6">We sent an invite to <span className="text-white">{lastInvitedEmail}</span></p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={onCloseAction}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm border border-white/10 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Invitation Form */}
                <form onSubmit={handleInvite} className="space-y-6 mb-8">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white/90">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors duration-200 ${
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
                        className={`w-full pr-4 rounded-xl bg-white/[0.05] text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 ${
                          isSmallScreen ? 'pl-10 py-3 text-sm' : 'pl-12 py-4'
                        } ${isMobile ? 'touch-manipulation' : ''}`}
                        disabled={isInviting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-white/90">
                      Personal Message <span className="text-white/40 font-normal">(Optional)</span>
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
                      className={`w-full rounded-xl bg-white/[0.05] text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 hover:bg-white/[0.08] transition-all duration-200 resize-none ${
                        isSmallScreen ? 'px-3 py-3 text-sm' : 'px-4 py-4'
                      } ${isMobile ? 'touch-manipulation' : ''}`}
                      disabled={isInviting}
                      maxLength={500}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isInviting || !email.trim()}
                    className={`w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSmallScreen ? 'py-3 px-4' : 'py-4 px-6'
                    } ${isMobile ? 'touch-manipulation' : ''}`}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        Sending invitation…
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </form>

                {/* Share Link */}
                <div className="border-t border-white/10 pt-6 mb-8">
                  <div className="flex items-center gap-2 mb-3 text-white">
                    <Link className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-medium text-white/90">Or share board link</h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/board/${boardId}`}
                      readOnly
                      className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] text-white/80 ring-1 ring-white/10 text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyBoardLink}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="w-4 h-4 text-amber-300 mr-2 flex-shrink-0" />
                    <p className="text-xs text-amber-200">Anyone with this link can view the board</p>
                  </div>
                </div>

                {/* Pending Invitations */}
                {(pendingInvitations.length > 0 || isLoading) && (
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/90 text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        Recent Invitations
                        {pendingInvitations.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs">
                            {pendingInvitations.length}
                          </span>
                        )}
                      </h3>
                      <button
                        onClick={fetchPendingInvitations}
                        disabled={isLoading}
                        className="text-sm text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
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
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                              <div className="w-8 h-8 bg-white/[0.08] rounded-full" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-white/[0.08] rounded w-1/3" />
                                <div className="h-3 bg-white/[0.08] rounded w-1/2" />
                              </div>
                              <div className="h-6 bg-white/[0.08] rounded w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {pendingInvitations.map((invitation, index) => (
                          <div
                            key={`invitation-${invitation.id || index}-${invitation.inviteeEmail}`}
                            className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {getStatusIcon(invitation.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {invitation.inviteeEmail}
                                </p>
                                <p className="text-xs text-white/60 flex items-center gap-2">
                                  <span>Sent {formatRelativeTime(invitation.createdAt)}</span>
                                  {invitation.status === 'pending' && (
                                    <>
                                      <span className="text-white/30">•</span>
                                      <span>Expires {formatExpiry(invitation.expiresAt)}</span>
                                    </>
                                  )}
                                </p>
                                {invitation.message && (
                                  <p className="text-xs text-white/50 italic truncate mt-1 bg-white/[0.04] px-2 py-1 rounded">
                                    &ldquo;{invitation.message}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(invitation.status)}`}>
                                {getStatusText(invitation.status)}
                              </span>
                              {invitation.status === 'pending' && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${window.location.origin}/board/${boardId}/invite?token=${invitation.invitationToken}&email=${encodeURIComponent(invitation.inviteeEmail)}`
                                      );
                                      toast.success('Invitation link copied');
                                    }}
                                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                                      className="p-2 text-white/60 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
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
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.16);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.22);
        }
      `}</style>
    </>
  );
}