'use client';

import { useState } from 'react';

export default function Setup() {
  const [formData, setFormData] = useState({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    authMethod: 'OAUTH2',
    user: '',
    pass: '',
    accessToken: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = base.endsWith('/') ? `${base}sync/start` : `${base}/sync/start`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: formData }),
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        setMessage('Email sync started successfully! Redirecting...');
        setTimeout(() => (window.location.href = '/'), 1500);
      } else {
        const error = await response.text();
        setMessage(`Setup failed: ${error}`);
      }
    } catch (error) {
      setMessage('Unable to connect to backend service. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number'
      ? parseInt(value)
      : type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-set OAuth2 for Gmail
      if (name === 'host' && value === 'imap.gmail.com') {
        updated.authMethod = 'OAUTH2';
      }
      
      return updated;
    });
  };

  const handleGoogleAuth = async () => {
    setIsGoogleAuth(true);
    setMessage('');

    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = base.endsWith('/') ? `${base}auth/google` : `${base}/auth/google`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000)
      });
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setMessage(`${data.error || 'Failed to get Google auth URL'}`);
        setIsGoogleAuth(false);
      }
    } catch (error) {
      setMessage('Unable to connect to authentication service');
      setIsGoogleAuth(false);
    }
  };

  const providers = [
    { value: 'imap.gmail.com', label: 'Gmail' },
    { value: 'outlook.office365.com', label: 'Outlook/Office365' },
    { value: 'custom', label: 'Other Email Provider' },
  ];

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center float">
            <div className="w-6 h-6 bg-white rounded-lg"></div>
          </div>
          <h1 className="heading-primary">
            Connect Email Account
          </h1>
          <p className="subheading">Add your IMAP email account to start syncing and analyzing emails</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="section-title">
                Email Provider
              </label>
              <div className="relative">
                <select
                  name="host"
                  value={formData.host}
                  onChange={handleInputChange}
                  className="w-full h-12 pl-4 pr-10 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:bg-white/90 transition-all duration-200 appearance-none cursor-pointer"
                >
                  {providers.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  ▼
                </div>
              </div>
            </div>

            {/* Custom Server Settings */}
            {formData.host === 'custom' && (
              <div className="space-y-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                <h4 className="heading-quaternary text-sky-800">
                  Custom Server Settings
                </h4>
                <input
                  type="text"
                  name="host"
                  placeholder="imap.example.com"
                  value={formData.host}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:bg-white/90 transition-all duration-200"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="port"
                    placeholder="Port (993)"
                    value={formData.port}
                    onChange={handleInputChange}
                    className="h-12 px-4 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:bg-white/90 transition-all duration-200"
                  />
                  <label className="flex items-center gap-3 p-3 bg-white/70 rounded-xl cursor-pointer hover:bg-white/90 transition-all duration-200">
                    <input
                      type="checkbox"
                      name="secure"
                      checked={formData.secure}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">SSL/TLS</span>
                  </label>
                </div>
              </div>
            )}

            {/* Authentication Method - Only show for non-Gmail */}
            {formData.host !== 'imap.gmail.com' && (
              <div>
                <label className="section-title">
                  Authentication Method
                </label>
                <div className="relative">
                  <select
                    name="authMethod"
                    value={formData.authMethod}
                    onChange={handleInputChange}
                    className="w-full h-12 pl-4 pr-10 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:bg-white/90 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="PLAIN">Username & Password</option>
                    <option value="LOGIN">LOGIN</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    ▼
                  </div>
                </div>
              </div>
            )}

            {/* Gmail OAuth Info */}
            {formData.host === 'imap.gmail.com' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="heading-quaternary text-blue-800">Gmail OAuth2 Authentication</h4>
                <p className="text-sm text-blue-700">
                  Gmail requires secure OAuth2 authentication. Click "Sign in with Google" below to connect your account.
                </p>
              </div>
            )}

            {/* Email Address - Only for non-Gmail OAuth */}
            {!(formData.host === 'imap.gmail.com' && formData.authMethod === 'OAUTH2') && (
              <div>
                <label className="section-title">
                  Email Address
                </label>
                <input
                  type="email"
                  name="user"
                  placeholder="your.email@example.com"
                  value={formData.user}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-4 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:bg-white/90 transition-all duration-200"
                />
              </div>
            )}

            {/* Password - Only for non-OAuth2 */}
            {formData.authMethod !== 'OAUTH2' && (
              <div>
                <label className="section-title">
                  Password
                </label>
                <input
                  type="password"
                  name="pass"
                  placeholder="Your email password or app password"
                  value={formData.pass}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-4 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:bg-white/90 transition-all duration-200"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              {formData.host === 'imap.gmail.com' && formData.authMethod === 'OAUTH2' ? (
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleAuth}
                  className={`w-full h-14 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isGoogleAuth
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isGoogleAuth ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Redirecting to Google...
                    </div>
                  ) : (
                    'Sign in with Google'
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-14 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isLoading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Connecting...
                    </div>
                  ) : (
                    'Connect & Start Sync'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl border-l-4 ${
              message.includes('✅')
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {message.includes('✅') ? '✅' : '❌'}
                </span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}