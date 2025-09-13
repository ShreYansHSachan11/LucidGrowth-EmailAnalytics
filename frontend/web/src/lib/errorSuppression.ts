// Suppress common browser extension errors that don't affect our app
export function suppressExtensionErrors() {
  if (typeof window === 'undefined') return;

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // List of error patterns to suppress
  const suppressPatterns = [
    /ZodError/,
    /Error parsing profile/,
    /content.js/,
    /extension/i,
    /chrome-extension/,
    /moz-extension/,
  ];

  // Override console.error
  console.error = (...args) => {
    const message = args.join(' ');
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = (...args) => {
    const message = args.join(' ');
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Global error handler
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
    
    if (shouldSuppress) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason || '';
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(String(message)));
    
    if (shouldSuppress) {
      event.preventDefault();
      return false;
    }
  });
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  suppressExtensionErrors();
}