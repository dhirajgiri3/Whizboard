"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { CheckCircle, XCircle, Mail, Users, Clock, ArrowRight } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    // For demo purposes, we'll simulate fetching invitation data
    // In a real app, you might want to validate the token server-side
    setInvitationData({
      boardId: 'sample-board-id',
      boardName: 'Product Strategy 2024',
      inviterName: 'John Doe',
      inviterEmail: 'john@company.com',
      message: 'Hey! Let\'s collaborate on our product strategy board. Looking forward to your input!',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    setLoading(false);
  }, [token, email]);

  const handleAcceptInvitation = async () => {
    if (!session?.user) {
      // Redirect to sign in
      await signIn('google', {
        callbackUrl: window.location.href
      });
      return;
    }

    if (session.user.email !== email) {
      toast.error('This invitation is for a different email address');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/board/invite/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        router.push(`/board/${data.boardId}`);
      } else {
        throw new Error(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    setProcessing(true);

    try {
      const response = await fetch('/api/board/invite/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Invitation declined');
        router.push('/');
      } else {
        throw new Error(data.error || 'Failed to decline invitation');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Loading size="lg" text="Loading invitation..." />
      </div>
    );
  }

  if (error || !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to CyperBoard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You&apos;re Invited to Collaborate!
            </h1>
            <p className="text-gray-600">
              Join a collaborative whiteboard and start creating together
            </p>
          </div>

          {/* Invitation Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {/* Board Info */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {invitationData.boardName}
              </h2>
              <div className="flex items-center text-gray-600 mb-4">
                <Mail className="w-4 h-4 mr-2" />
                <span>Invited by {invitationData.inviterName}</span>
                <span className="mx-2">•</span>
                <span className="text-sm">{invitationData.inviterEmail}</span>
              </div>
              
              {invitationData.message && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-700 italic">&ldquo;{invitationData.message}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Expiry Info */}
            <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
              <Clock className="w-4 h-4 mr-2" />
              <span>Expires in {formatTimeLeft(invitationData.expiresAt)}</span>
            </div>

            {/* Authentication Status */}
            {status === 'loading' ? (
              <div className="text-center py-4">
                <Loading size="sm" text="Checking authentication..." />
              </div>
            ) : !session ? (
              <div className="text-center mb-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-medium mb-2">Sign in required</p>
                  <p className="text-blue-600 text-sm">
                    You need to sign in with <strong>{email}</strong> to accept this invitation
                  </p>
                </div>
              </div>
            ) : session.user.email !== email ? (
              <div className="text-center mb-6">
                <div className="bg-orange-50 rounded-lg p-4 mb-4">
                  <p className="text-orange-800 font-medium mb-2">Wrong account</p>
                  <p className="text-orange-600 text-sm">
                    This invitation is for <strong>{email}</strong>, but you&apos;re signed in as <strong>{session.user.email}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-medium">Ready to join!</p>
                  </div>
                  <p className="text-green-600 text-sm">
                    Signed in as {session.user.name} ({session.user.email})
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!session || session.user.email !== email ? (
                <button
                  onClick={handleAcceptInvitation}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <Loading size="sm" />
                  ) : (
                    <>
                      Sign in & Join Board
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAcceptInvitation}
                    disabled={processing}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <Loading size="sm" />
                    ) : (
                      <>
                        Accept & Join Board
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDeclineInvitation}
                    disabled={processing}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Decline
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 CyperBoard. Real-time collaborative whiteboard for teams.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
