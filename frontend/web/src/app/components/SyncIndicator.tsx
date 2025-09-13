"use client";
import { useEffect, useState } from "react";

type SyncStatus = { running: boolean; account?: string; folderPath?: string };

export default function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>({ running: false });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Check if sync indicator is disabled
    const isDisabled = process.env.NEXT_PUBLIC_ENABLE_SYNC_INDICATOR === 'false';
    
    // Only try to connect if enabled and in development or if the API URL is explicitly set
    const shouldConnect = !isDisabled && (
      process.env.NODE_ENV === 'development' || 
      process.env.NEXT_PUBLIC_API_URL !== undefined
    );
    
    if (!shouldConnect) {
      setIsOnline(false);
      return;
    }
    
    const tick = async () => {
      try {
        // Fix double slash issue by ensuring proper URL construction
        const url = base.endsWith('/') ? `${base}sync/status` : `${base}/sync/status`;
        const res = await fetch(url, { 
          cache: 'no-store',
          signal: AbortSignal.timeout(3000) // Reduced to 3 seconds
        });
        
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setStatus(data);
            setIsOnline(true);
          }
        } else {
          // Backend is running but endpoint doesn't exist
          if (mounted) {
            setStatus({ running: false });
            setIsOnline(true);
          }
        }
      } catch (error) {
        // Backend is not available - fail silently
        if (mounted) {
          setStatus({ running: false });
          setIsOnline(false);
        }
      }
    };

    // Initial check after a short delay
    const initialTimeout = setTimeout(tick, 1000);
    const id = setInterval(tick, 15000); // Reduced frequency to 15 seconds
    
    return () => {
      mounted = false;
      clearTimeout(initialTimeout);
      clearInterval(id);
    };
  }, []);

  const dotColor = !isOnline 
    ? 'bg-red-500' 
    : status.running 
    ? 'bg-green-500' 
    : 'bg-gray-400';
    
  const text = !isOnline 
    ? 'Offline' 
    : status.running
    ? `Syncing ${status.account || ''}${status.folderPath ? ` • ${status.folderPath}` : ''}`
    : 'Ready';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full bg-white/80 backdrop-blur-sm">
      <span className={`inline-block w-2 h-2 rounded-full ${dotColor} ${status.running ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-gray-700 text-professional">{text}</span>
    </div>
  );
}


