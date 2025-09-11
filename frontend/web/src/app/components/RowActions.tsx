"use client";
import { useState } from "react";

export default function RowActions({ id, seen, flagged }: { id: string; seen?: boolean; flagged?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [isSeen, setIsSeen] = useState(Boolean(seen));
  const [isFlagged, setIsFlagged] = useState(Boolean(flagged));
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const update = async (body: any) => {
    setBusy(true);
    try {
      await fetch(`${base}/emails/${id}/flags`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{display:'inline-flex', gap:8, opacity: busy? 0.6: 1}}>
      <button aria-label="Mark as read" onClick={async (e)=>{ e.preventDefault(); const next = !isSeen; setIsSeen(next); await update({ seen: next }); }}
        title={isSeen? 'Mark as unread':'Mark as read'}
        style={{border:'none', background:'transparent', cursor:'pointer', color:'#374151', fontSize:12}}>
        {isSeen? 'Read':'Unread'}
      </button>
      <button aria-label="Star" onClick={async (e)=>{ e.preventDefault(); const next = !isFlagged; setIsFlagged(next); await update({ flagged: next }); }}
        title={isFlagged? 'Unstar':'Star'}
        style={{border:'none', background:'transparent', cursor:'pointer', color: isFlagged? '#f59e0b':'#374151', fontSize:12}}>
        ★
      </button>
    </div>
  );
}


