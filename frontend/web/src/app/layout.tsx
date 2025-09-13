import "./globals.css";
import "../lib/errorSuppression";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SyncIndicator from "./components/SyncIndicator";
import ErrorBoundary from "../components/ErrorBoundary";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LucidGrowth - Email Analytics",
  description: "Professional email management and analytics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} animated-bg w-full`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress ZodError from browser extensions
              window.addEventListener('error', function(e) {
                if (e.error && e.error.message && e.error.message.includes('ZodError')) {
                  e.preventDefault();
                  return false;
                }
              });
              
              // Suppress unhandled promise rejections from extensions
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && e.reason.message.includes('ZodError')) {
                  e.preventDefault();
                  return false;
                }
              });
            `,
          }}
        />
        <div className="w-full">
          <header className="sticky top-0 z-50 w-full">
            <div className="glass-card mx-4 mt-4 rounded-2xl">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">L</span>
                    </div>
                    <strong className="text-xl font-bold text-professional bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                      LucidGrowth
                    </strong>
                  </div>
                  
                  <nav className="hidden md:flex items-center gap-1">
                    <a href="/" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-all duration-200 text-professional">
                      Emails
                    </a>
                    <a href="/search" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-all duration-200 text-professional">
                      Search
                    </a>
                    <a href="/analytics" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-all duration-200 text-professional">
                      Analytics
                    </a>
                    <a href="/sync" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-all duration-200 text-professional">
                      Sync
                    </a>
                  </nav>
                </div>

                <div className="flex items-center gap-4">
                  <SyncIndicator />
                  <a href="/setup" className="btn-gradient text-sm">
                    Add Account
                  </a>
                </div>
              </div>
            </div>
          </header>
          
          <main className="w-full px-4 pb-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </body>
    </html>
  );
}
