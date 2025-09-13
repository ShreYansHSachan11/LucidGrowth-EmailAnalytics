'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Send the code to your backend
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const url = base.endsWith('/') ? `${base}auth/google/callback` : `${base}/auth/google/callback`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
          signal: AbortSignal.timeout(15000)
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage('Authentication successful! Setting up your email account...');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          const errorData = await response.text();
          setStatus('error');
          setMessage(`Setup failed: ${errorData}`);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Unable to complete authentication. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="glass-card p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            status === 'processing' 
              ? 'bg-gradient-to-br from-sky-400 to-blue-600' 
              : status === 'success'
              ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
              : 'bg-gradient-to-br from-orange-400 to-red-500'
          }`}>
            {status === 'processing' && (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <div className="w-6 h-6 bg-white rounded-lg"></div>
            )}
            {status === 'error' && (
              <div className="w-6 h-6 bg-white rounded-lg"></div>
            )}
          </div>
          
          <h1 className="heading-primary">
            {status === 'processing' && 'Processing Authentication'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </h1>
          
          <p className="subheading">
            {status === 'processing' && 'Please wait while we set up your account...'}
            {status === 'success' && 'Redirecting you to the dashboard...'}
            {status === 'error' && 'There was an issue with the authentication process'}
          </p>

          {message && (
            <div className={`mt-6 p-4 rounded-xl border-l-4 ${
              status === 'success'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : status === 'error'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-sky-50 border-sky-500 text-sky-700'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 space-y-3">
              <a
                href="/setup"
                className="btn-gradient inline-block"
              >
                Try Again
              </a>
              <br />
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Return to Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}