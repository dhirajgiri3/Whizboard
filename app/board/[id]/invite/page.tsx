"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { CheckCircle, XCircle, Mail, Users, Clock, ArrowRight, AlertCircle, Palette, Shield, Zap } from 'lucide-react';
import Loading from '@/components/ui/loading/Loading';
import { toast } from 'sonner';
import api from '@/lib/http/axios';

interface InvitationData {
  boardId: string;
  boardName: string;
  inviterName: string;
  inviterEmail: string;
  message?: string;
  expiresAt: string;
}

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  const normalizeEmail = (val?: string | null) => (val || '').trim().toLowerCase();

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/board/invite/validate?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load invitation');

        const inv = data.invitation;
        setInvitationData({
          boardId: inv.boardId,
          boardName: inv.boardName,
          inviterName: inv.inviterName,
          inviterEmail: inv.inviterEmail,
          message: inv.message,
          expiresAt: typeof inv.expiresAt === 'string' ? inv.expiresAt : new Date(inv.expiresAt).toISOString(),
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, email]);

  const handleAcceptInvitation = async () => {
    if (processing) return;

    if (!token || !email) {
      toast.error('Invalid invitation link');
      return;
    }

    if (!session?.user) {
      await signIn('google', { callbackUrl: window.location.href });
      return;
    }

    if (normalizeEmail(session.user.email) !== normalizeEmail(email)) {
      toast.error('This invitation is for a different email address');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await api.post('/api/board/invite/accept', { token, email });

      if (data?.success) {
        toast.success(data.message || 'Joined board');
        const redirectBoardId = data.boardId || invitationData?.boardId;
        if (redirectBoardId) {
          router.push(`/board/${redirectBoardId}`);
        } else {
          router.push('/my-boards');
        }
      } else {
        throw new Error(data?.error || 'Failed to accept invitation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept invitation';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (processing) return;

    if (!token || !email) {
      toast.error('Invalid invitation link');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await api.post('/api/board/invite/decline', { token, email });
      if (data?.success) {
        toast.success('Invitation declined');
        router.push('/invitation-declined');
      } else {
        throw new Error(data?.error || 'Failed to decline invitation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decline invitation';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Less than 1 hour';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loading size="lg" text="Loading invitation..." />
        </div>
      </div>
    );
  }

  if (error || !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm text-center">
            {/* Error Icon */}
            <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-semibold text-white mb-3">Invalid Invitation</h1>
            <p className="text-white/70 mb-8 leading-relaxed">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
            
            <button
              onClick={() => router.push('/')}
              className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Go to WhizBoard
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 gradient-orb-blue"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 gradient-orb-neutral"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20 mb-6">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="display-xl text-white mb-4">
              You&apos;re Invited to <br />
              <span className="text-blue-400">Collaborate!</span>
            </h1>
            <p className="body-base text-white/70 max-w-lg mx-auto">
              Join a collaborative whiteboard and start creating together with real-time tools
            </p>
          </div>

          {/* Invitation Card */}
          <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm mb-8 group hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{
                   background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
                   pointerEvents: 'none'
                 }}></div>
            
            <div className="relative z-10">
              {/* Board Info */}
              <div className="border-b border-white/[0.08] pb-6 mb-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 flex-shrink-0">
                    <Palette className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="title-md text-white mb-2">
                      {invitationData.boardName}
                    </h2>
                    <div className="flex items-center text-white/60 text-sm mb-3">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>Invited by {invitationData.inviterName}</span>
                      <span className="mx-2">•</span>
                      <span>{invitationData.inviterEmail}</span>
                    </div>
                  </div>
                </div>
                
                {invitationData.message && (
                  <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] relative">
                    <div className="absolute top-3 left-3 text-2xl text-white/20">"</div>
                    <p className="text-white/80 italic pl-6 leading-relaxed">
                      {invitationData.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Expiry Info */}
              <div className="flex items-center justify-center text-sm text-white/50 mb-6">
                <Clock className="w-4 h-4 mr-2" />
                <span>Expires in {formatTimeLeft(invitationData.expiresAt)}</span>
              </div>

              {/* Authentication Status */}
              {status === 'loading' ? (
                <div className="text-center py-6">
                  <Loading size="sm" text="Checking authentication..." />
                </div>
              ) : !session ? (
                <div className="text-center mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="w-5 h-5 text-blue-400 mr-2" />
                      <p className="text-blue-300 font-medium">Sign in required</p>
                    </div>
                    <p className="text-blue-200/80 text-sm">
                      You need to sign in with <strong className="text-white">{email}</strong> to accept this invitation
                    </p>
                  </div>
                </div>
              ) : normalizeEmail(session.user.email) !== normalizeEmail(email) ? (
                <div className="text-center mb-6">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
                      <p className="text-orange-300 font-medium">Wrong account</p>
                    </div>
                    <p className="text-orange-200/80 text-sm">
                      This invitation is for <strong className="text-white">{email}</strong>, but you&apos;re signed in as <strong className="text-white">{session.user.email}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center mb-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                      <p className="text-emerald-300 font-medium">Ready to join!</p>
                    </div>
                    <p className="text-emerald-200/80 text-sm">
                      Signed in as {session.user.name} ({session.user.email})
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!session || normalizeEmail(session.user.email) !== normalizeEmail(email) ? (
                  <button
                    onClick={handleAcceptInvitation}
                    disabled={processing}
                    className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {processing ? (
                        <Loading size="sm" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Sign in & Join Board
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAcceptInvitation}
                      disabled={processing}
                      className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {processing ? (
                          <Loading size="sm" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Accept & Join Board
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                    <button
                      onClick={handleDeclineInvitation}
                      disabled={processing}
                      className="text-white/70 hover:text-white hover:bg-white/5 focus:bg-white/10 active:bg-white/15 font-medium px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 focus:border-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm text-center">
              <div className="inline-flex p-2 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors mb-3">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Real-time</h3>
              <p className="text-white/60 text-xs">Collaborate live with team members</p>
            </div>
            <div className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm text-center">
              <div className="inline-flex p-2 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors mb-3">
                <Palette className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Creative Tools</h3>
              <p className="text-white/60 text-xs">Draw, sketch, and brainstorm together</p>
            </div>
            <div className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm text-center">
              <div className="inline-flex p-2 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors mb-3">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Auto-save</h3>
              <p className="text-white/60 text-xs">Never lose your work</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/50 text-sm">
              &copy; 2025 WhizBoard. Real-time collaborative whiteboard for teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
