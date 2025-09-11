"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Folder = { folderPath: string; count: number };

export default function Folders({ account, selected }: { account?: string; selected?: string }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const run = async () => {
      setLoading(true);
      try {
        const u = new URL(`${base}/emails/folders`);
        if (account) u.searchParams.set('account', account);
        const res = await fetch(u.toString(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setFolders(data);
        }
      } catch {}
      if (mounted) setLoading(false);
    };
    run();
    return () => { mounted = false; };
  }, [account]);

  return (
    <div className="border-r border-gray-200 pr-3 min-w-[220px]">
      <div className="font-semibold mb-2 text-gray-900">Folders</div>
      {loading ? <div className="text-gray-500 text-xs">Loading…</div> : (
        <ul className="list-none p-0 m-0">
          {folders.map(f => {
            const active = selected === f.folderPath;
            const name = f.folderPath;
            const icon = /inbox/i.test(name)? '📥' : /sent/i.test(name)? '✉️' : /spam|junk/i.test(name)? '🚫' : /trash|bin/i.test(name)? '🗑️' : /draft/i.test(name)? '📝' : '📁';
            return (
              <li key={f.folderPath}>
                <button onClick={() => router.push(`/folder?path=${encodeURIComponent(f.folderPath)}`)} className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${active? 'bg-indigo-50':'hover:bg-gray-50'}`}>
                  <span className="truncate" title={f.folderPath}>{icon} {f.folderPath}</span>
                  <span className="text-xs text-gray-500">{f.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


