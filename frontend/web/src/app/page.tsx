export const dynamic = "force-dynamic";

import Folders from "./components/Folders";
import { Suspense } from "react";
import RowActions from "./components/RowActions";
import Time from "./components/Time";

async function fetchEmails() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${base}/emails`, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error("Failed to fetch emails:", res.status, res.statusText);
      return [] as any[];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [] as any[];
  }
}

export default async function Home() {
  const emails = await fetchEmails();

  return (
    <div className="w-full min-h-screen pt-6">
      <div className="w-full max-w-none px-0">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 w-full">
          {/* Sidebar */}
          <aside className="glass-card p-6 h-fit">
            <div className="mb-6">
              <h3 className="section-title">
                Folders
              </h3>
              <Suspense fallback={
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading folders...
                </div>
              }>
                <Folders />
              </Suspense>
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-100">
                <div className="text-2xl font-bold text-sky-700">{emails.length}</div>
                <div className="text-sm text-sky-600">Total Emails</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700">
                  {emails.filter((e: any) => !(e.flags?.seen)).length}
                </div>
                <div className="text-sm text-emerald-600">Unread</div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="heading-primary">
                    Email Dashboard
                  </h1>
                  <p className="subheading">Manage your emails with professional efficiency</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium">
                    Refresh
                  </button>
                  <button className="btn-gradient">
                    Compose
                  </button>
                </div>
              </div>
            </div>

            {/* Emails List */}
            {emails.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg"></div>
                </div>
                <h3 className="heading-tertiary">No Emails Found</h3>
                <p className="text-gray-600 mb-6">Start by syncing your email accounts to see your messages here.</p>
                <a href="/setup" className="btn-gradient inline-block">
                  Get Started
                </a>
                <p className="text-xs text-gray-400 mt-4">
                  Backend API: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
                </p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="heading-secondary">
                    Recent Messages
                    <span className="text-sm font-normal text-gray-500 ml-2">({emails.length})</span>
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {emails.map((e: any) => {
                    const sender = (e.from || [])[0] || "";
                    const subject = e.subject || "(no subject)";
                    const snippet = (e.text || e.html || "")
                      .toString()
                      .replace(/<[^>]+>/g, "")
                      .slice(0, 120);
                    const unread = !(e.flags?.seen);

                    return (
                      <div key={e._id} className="group hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 transition-all duration-200">
                        <a
                          href={`/emails/${e._id}`}
                          className="block p-6"
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              unread 
                                ? 'bg-gradient-to-br from-sky-500 to-blue-600' 
                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}>
                              {sender.charAt(0).toUpperCase() || '?'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-semibold truncate ${
                                  unread ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {sender || 'Unknown Sender'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Time value={e.date} />
                                  {unread && (
                                    <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              
                              <h4 className={`text-sm mb-2 truncate ${
                                unread ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'
                              }`}>
                                {subject}
                              </h4>
                              
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {snippet}...
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <RowActions
                                id={e._id}
                                seen={e.flags?.seen}
                                flagged={e.flags?.flagged}
                              />
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
