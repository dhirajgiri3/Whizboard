"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home, Mail } from 'lucide-react';

export default function InvitationDeclinedPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error === 'invalid-decline-link' && 'The decline link is invalid or has expired.'}
            {error === 'invalid-invitation' && 'This invitation is no longer valid.'}
            {error === 'server-error' && 'An unexpected error occurred. Please try again later.'}
            {!['invalid-decline-link', 'invalid-invitation', 'server-error'].includes(error) && 'An unexpected error occurred.'}
          </p>
          
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Invitation Declined
        </h1>
        
        <p className="text-gray-600 mb-6">
          You have successfully declined the collaboration invitation. 
          The board owner has been notified of your decision.
        </p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-800">
            <strong>Changed your mind?</strong> Contact the person who invited you 
            to request a new invitation.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Explore CyperBoard
          </Link>
          
          <Link
            href="/login"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          © 2025 CyperBoard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
