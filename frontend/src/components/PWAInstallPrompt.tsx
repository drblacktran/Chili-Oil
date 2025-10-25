/**
 * PWA Install Prompt Component
 * Shows install prompt for Progressive Web App
 */

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('PWA installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted install');
    } else {
      console.log('User dismissed install');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or dismissed recently
  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-2xl border border-red-500 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                🌶️
              </div>
              <div>
                <h3 className="font-bold text-lg">Install Benjamin's Chili</h3>
                <p className="text-sm text-red-100">Quick access from your home screen</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white text-2xl leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <ul className="space-y-2 text-sm text-red-50 mb-4">
            <li className="flex items-center space-x-2">
              <span>✓</span>
              <span>Works offline - view inventory anytime</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>✓</span>
              <span>Instant notifications for low stock</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>✓</span>
              <span>Faster loading - data cached locally</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>✓</span>
              <span>No app store needed</span>
            </li>
          </ul>

          <div className="flex space-x-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 px-4 py-3 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-md"
            >
              📲 Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
