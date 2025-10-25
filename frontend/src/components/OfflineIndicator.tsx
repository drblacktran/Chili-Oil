/**
 * Offline Indicator Component
 * Shows connection status and queued actions
 */

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Update on connection change
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show if online and not recently changed
  if (isOnline && !showIndicator) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${showIndicator ? 'opacity-100' : 'opacity-0'}`}>
      {isOnline ? (
        // Back Online
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg border border-green-500 flex items-center space-x-3 animate-slide-down">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <p className="font-bold text-sm">Back Online</p>
            <p className="text-xs text-green-100">Connection restored</p>
          </div>
        </div>
      ) : (
        // Offline
        <div className="bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg border border-yellow-500 flex items-center space-x-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div>
            <p className="font-bold text-sm">Offline Mode</p>
            <p className="text-xs text-yellow-100">
              Viewing cached data • Updates will sync when online
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
