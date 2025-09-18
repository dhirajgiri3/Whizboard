"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvitationData {
  workspaceName: string;
  role: string;
  inviterName: string;
  expiresAt: string;
}

export default function WorkspaceInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!token || !email) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    fetchInvitation();
  }, [token, email, status]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/workspace/invite?token=${token}&email=${encodeURIComponent(email!)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitation');
      }

      setInvitation(data.invitation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!session) {
      toast.error('Please sign in to accept the invitation');
      return;
    }

    if (session.user?.email !== email) {
      toast.error('Email mismatch. Please sign in with the invited email address.');
      return;
    }

    setAccepting(true);
    try {
      const response = await fetch('/api/workspace/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      toast.success('Successfully joined workspace!');
      router.push('/team-workspace');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white/70">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Invitation</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-white/70 mb-6">
            Please sign in with <strong>{email}</strong> to accept this workspace invitation.
          </p>
          <button
            onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Workspace Invitation</h1>
            <p className="text-white/70">
              You've been invited to join <strong>{invitation?.workspaceName}</strong>
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">Workspace</span>
                <span className="text-white font-medium">{invitation?.workspaceName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">Role</span>
                <span className="text-white font-medium capitalize">{invitation?.role}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">Invited by</span>
                <span className="text-white font-medium">{invitation?.inviterName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Expires</span>
                <span className="text-white font-medium">
                  {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={acceptInvitation}
              disabled={accepting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Accept Invitation
                </>
              )}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}