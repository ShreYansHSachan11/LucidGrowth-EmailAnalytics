'use client';

import { useState, useEffect } from 'react';
import RowActions from './RowActions';
import Time from './Time';
import EmailAccounts from './EmailAccounts';
import Folders from './Folders';
import { Suspense } from 'react';

async function fetchEmails() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const url = base.endsWith('/') ? `${base}emails` : `${base}/emails`;
    const res = await fetch(url, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    });
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

export default function EmailList() {
  const [emails, setEmails] = useState<any[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEmails = async () => {
      setIsLoading(true);
      const emailData = await fetchEmails();
      setEmails(emailData);
      setFilteredEmails(emailData);
      setIsLoading(false);
    };

    loadEmails();
  }, []);

  useEffect(() => {
    if (selectedAccount === null) {
      setFilteredEmails(emails);
    } else {
      let debugCount = 0;
      const filtered = emails.filter((email: any) => {
        // Try multiple fields to find the account email - must match EmailAccounts logic
        let accountEmail = email.account || email.to?.[0] || email.envelope?.to?.[0] || email.deliveredTo || 'Unknown Account';
        
        // Clean up email format - extract just the email address
        if (typeof accountEmail === 'string') {
          // Remove angle brackets and extract email from formats like "Name <email@domain.com>"
          const emailMatch = accountEmail.match(/<([^>]+)>/) || accountEmail.match(/([^\s<>]+@[^\s<>]+)/);
          if (emailMatch) {
            accountEmail = emailMatch[1];
          }
          // Remove any remaining angle brackets or quotes
          accountEmail = accountEmail.replace(/[<>"]/g, '').trim();
        }
        
        const matches = accountEmail === selectedAccount;
        
        // Debug: log filtering for first few emails
        if (debugCount < 3) {
          console.log('Filtering email:', {
            selectedAccount,
            accountEmail,
            matches,
            emailId: email._id
          });
          debugCount++;
        }
        
        return matches;
      });
      
      console.log(`Filtered ${filtered.length} emails for account: ${selectedAccount}`);
      setFilteredEmails(filtered);
    }
  }, [selectedAccount, emails]);

  const handleRefresh = async () => {
    const emailData = await fetchEmails();
    setEmails(emailData);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen pt-6">
        <div className="w-full max-w-none px-0">
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="heading-tertiary">Loading Emails</h3>
            <p className="text-gray-600">Please wait while we fetch your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-6 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 w-full">
          {/* Sidebar */}
          <aside className="glass-card p-4 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
            {/* Email Accounts */}
            <div className="mb-6">
              <EmailAccounts 
                emails={emails}
                selectedAccount={selectedAccount}
                onAccountSelect={setSelectedAccount}
              />
            </div>

            {/* Folders */}
            <div className="mb-6">
              <h3 className="section-title">Folders</h3>
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
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-xl border border-sky-100">
                <div className="text-xl font-bold text-sky-700">{filteredEmails.length}</div>
                <div className="text-xs text-sky-600">
                  {selectedAccount ? 'Filtered' : 'Total'} Emails
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                <div className="text-xl font-bold text-emerald-700">
                  {filteredEmails.filter((e: any) => !(e.flags?.seen)).length}
                </div>
                <div className="text-xs text-emerald-600">Unread</div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6 min-w-0">
            {/* Header */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="heading-primary">
                    {selectedAccount ? `${selectedAccount}` : 'Email Dashboard'}
                  </h1>
                  <p className="subheading">
                    {selectedAccount 
                      ? `Showing emails for ${selectedAccount}` 
                      : 'Manage your emails with professional efficiency'
                    }
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={() => {
                      console.log('First email structure:', emails[0]);
                      console.log('All emails count:', emails.length);
                      console.log('Selected account:', selectedAccount);
                      console.log('Filtered emails count:', filteredEmails.length);
                    }}
                    className="px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-xl hover:bg-yellow-200 transition-all duration-200 text-yellow-700 font-medium"
                  >
                    Debug
                  </button>
                  <button className="btn-gradient">
                    Compose
                  </button>
                </div>
              </div>
            </div>

            {/* Emails List */}
            {filteredEmails.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg"></div>
                </div>
                <h3 className="heading-tertiary">
                  {selectedAccount ? 'No Emails for This Account' : 'No Emails Found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedAccount 
                    ? `No messages found for ${selectedAccount}. Try selecting "All Emails" or add more accounts.`
                    : 'Start by syncing your email accounts to see your messages here.'
                  }
                </p>
                {!selectedAccount && (
                  <a href="/setup" className="btn-gradient inline-block">
                    Get Started
                  </a>
                )}
                {selectedAccount && (
                  <button 
                    onClick={() => setSelectedAccount(null)}
                    className="btn-gradient"
                  >
                    View All Emails
                  </button>
                )}
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="heading-secondary">
                    {selectedAccount ? `Messages from ${selectedAccount}` : 'Recent Messages'}
                    <span className="text-sm font-normal text-gray-500 ml-2">({filteredEmails.length})</span>
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {filteredEmails.map((e: any) => {
                    let sender = (e.from || [])[0] || "";
                    
                    // Clean up sender format - extract just the email address or name
                    if (typeof sender === 'string') {
                      // Extract name from formats like "Name <email@domain.com>" or just use email
                      const nameMatch = sender.match(/^([^<]+)<([^>]+)>$/);
                      if (nameMatch) {
                        const name = nameMatch[1].trim().replace(/['"]/g, '');
                        sender = name || nameMatch[2]; // Use name if available, otherwise email
                      } else {
                        // Remove any remaining angle brackets or quotes
                        sender = sender.replace(/[<>"]/g, '').trim();
                      }
                    }
                    
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
                          className="block p-4"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                              unread 
                                ? 'bg-gradient-to-br from-sky-500 to-blue-600' 
                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}>
                              {sender.charAt(0).toUpperCase() || '?'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <h3 className={`font-semibold truncate text-sm ${
                                  unread ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {sender || 'Unknown Sender'}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
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
                              
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {snippet}...
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
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