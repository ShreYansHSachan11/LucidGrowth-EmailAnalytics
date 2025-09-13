'use client';

import { useState } from 'react';

export default function SyncControl() {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePause = async () => {
    setIsLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = base.endsWith('/') ? `${base}sync/pause` : `${base}/sync/pause`;
      const res = await fetch(url, { 
        method: 'POST',
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        setIsPaused(true);
        setMessage('Sync paused successfully');
      } else {
        setMessage('Failed to pause sync - endpoint may not be available');
      }
    } catch (err) {
      setMessage('Unable to connect to backend service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = base.endsWith('/') ? `${base}sync/resume` : `${base}/sync/resume`;
      const res = await fetch(url, { 
        method: 'POST',
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        setIsPaused(false);
        setMessage('Sync resumed successfully');
      } else {
        setMessage('Failed to resume sync - endpoint may not be available');
      }
    } catch (err) {
      setMessage('Unable to connect to backend service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center float">
            <div className="w-6 h-6 bg-white rounded-lg"></div>
          </div>
          <h1 className="heading-primary">
            Sync Control
          </h1>
          <p className="subheading">Manage your email synchronization process</p>
        </div>

        {/* Status Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPaused 
                ? 'bg-gradient-to-br from-orange-400 to-red-500' 
                : 'bg-gradient-to-br from-emerald-400 to-teal-500'
            }`}>
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div>
              <h3 className="heading-quaternary">
                Sync Status: {isPaused ? 'Paused' : 'Active'}
              </h3>
              <p className="text-sm text-gray-600">
                {isPaused 
                  ? 'Email synchronization is currently paused' 
                  : 'Emails are being synchronized automatically'
                }
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handlePause}
              disabled={isLoading || isPaused}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                isPaused || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                'Pause Sync'
              )}
            </button>

            <button
              onClick={handleResume}
              disabled={isLoading || !isPaused}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                !isPaused || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                'Resume Sync'
              )}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-xl border-l-4 ${
              message.includes('✅')
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${
                  message.includes('✅') ? 'bg-emerald-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded"></div>
              </div>
              <h3 className="heading-quaternary">How it Works</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                <span>Automatic email synchronization runs in the background</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                <span>Pause to temporarily stop syncing new emails</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                <span>Resume to continue automatic synchronization</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded"></div>
              </div>
              <h3 className="heading-quaternary">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <a
                href="/setup"
                className="block w-full py-2 px-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 text-center font-medium"
              >
                Add Email Account
              </a>
              <a
                href="/analytics"
                className="block w-full py-2 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-center font-medium"
              >
                View Analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}