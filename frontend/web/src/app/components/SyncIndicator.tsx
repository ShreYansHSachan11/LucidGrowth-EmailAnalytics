"use client";
import { useEffect, useState } from "react";

type SyncStatus = { running: boolean; account?: string; folderPath?: string };

export default function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>({ running: false });

  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const tick = async () => {
      try {
        const res = await fetch(`${base}/sync/status`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setStatus(data);
        }
      } catch {}
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const dotColor = status.running ? 'bg-green-600' : 'bg-gray-400';
  const text = status.running
    ? `Syncing ${status.account || ''}${status.folderPath ? ` • ${status.folderPath}` : ''}`
    : 'Idle';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full bg-white">
      <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-xs text-gray-700">{text}</span>
    </div>
  );
}


