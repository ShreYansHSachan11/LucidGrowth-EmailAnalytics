'use client';

import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    // Check browser online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check backend status using an endpoint that likely exists
    const checkBackend = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const url = base.endsWith('/') ? `${base}emails` : `${base}/emails`;
        const res = await fetch(url, { 
          signal: AbortSignal.timeout(5000),
          cache: 'no-store'
        });
        // Any response (even 404) means backend is running
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && backendStatus === 'online') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass-card p-3 border-l-4 border-orange-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-professional">
            {!isOnline ? 'No internet connection' : 'Backend service unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
}