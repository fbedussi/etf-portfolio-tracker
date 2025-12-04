import { useState, useEffect } from 'react';

/**
 * Custom hook to detect and track browser online/offline status
 * Listens to browser online/offline events and returns current status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with current navigator status
    // SSR-safe: return true if navigator is undefined
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    // Update state when browser goes online
    const handleOnline = () => {
      console.log('Browser is online');
      setIsOnline(true);
    };

    // Update state when browser goes offline
    const handleOffline = () => {
      console.log('Browser is offline');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
