'use client';

import { useEffect, useState } from 'react';

interface EmailAccount {
  email: string;
  count: number;
  unreadCount: number;
}

interface EmailAccountsProps {
  emails: any[];
  selectedAccount: string | null;
  onAccountSelect: (account: string | null) => void;
}

export default function EmailAccounts({ emails, selectedAccount, onAccountSelect }: EmailAccountsProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);

  useEffect(() => {
    // Extract unique email accounts from the emails
    const accountMap = new Map<string, { count: number; unreadCount: number }>();
    
    emails.forEach((email: any) => {
      // Try multiple fields to find the account email - could be in different places
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
      
      // Debug: log the first few emails to see the structure
      if (accountMap.size < 3) {
        console.log('Email structure:', {
          account: email.account,
          to: email.to,
          envelope: email.envelope,
          deliveredTo: email.deliveredTo,
          extractedAccount: accountEmail
        });
      }
      
      if (!accountMap.has(accountEmail)) {
        accountMap.set(accountEmail, { count: 0, unreadCount: 0 });
      }
      
      const account = accountMap.get(accountEmail)!;
      account.count++;
      
      if (!(email.flags?.seen)) {
        account.unreadCount++;
      }
    });

    const accountsList = Array.from(accountMap.entries()).map(([email, stats]) => ({
      email,
      count: stats.count,
      unreadCount: stats.unreadCount,
    }));

    setAccounts(accountsList);
  }, [emails]);

  const totalEmails = emails.length;
  const totalUnread = emails.filter((e: any) => !(e.flags?.seen)).length;

  return (
    <div className="space-y-4">
      <h3 className="section-title">Email Accounts</h3>
      
      {/* All Emails Option */}
      <button
        onClick={() => onAccountSelect(null)}
        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
          selectedAccount === null
            ? 'bg-gradient-to-r from-sky-100 to-blue-100 border border-sky-200'
            : 'bg-white/50 hover:bg-white/80 border border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              selectedAccount === null
                ? 'bg-gradient-to-br from-sky-500 to-blue-600'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              <span className="text-white text-xs font-bold">ALL</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">All Emails</div>
              <div className="text-xs text-gray-500">{totalEmails} messages</div>
            </div>
          </div>
          {totalUnread > 0 && (
            <div className="bg-sky-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {totalUnread}
            </div>
          )}
        </div>
      </button>

      {/* Individual Email Accounts */}
      {accounts.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <div className="text-sm">No email accounts found</div>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <button
              key={account.email}
              onClick={() => onAccountSelect(account.email)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                selectedAccount === account.email
                  ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200'
                  : 'bg-white/50 hover:bg-white/80 border border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedAccount === account.email
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    <span className="text-white text-xs font-bold">
                      {account.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 truncate text-sm">
                      {account.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {account.count} messages
                    </div>
                  </div>
                </div>
                {account.unreadCount > 0 && (
                  <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
                    {account.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}