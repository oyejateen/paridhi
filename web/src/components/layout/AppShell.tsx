import { Outlet, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { BottomNav } from './BottomNav';
import { TopHeader } from './TopHeader';
import { SecondaryHeader } from '../SecondaryHeader';
import { useGeofence } from '../../hooks/useGeofence';
import type { GeofenceEvent } from '../../lib/geofenceService';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../lib/firebase';
import { NotificationService } from '../../lib/notificationService';

export function AppShell() {
  const location = useLocation();
  const { user } = useAuth();
  const { locationAllowed } = usePermissions();
  const { isCreatePostOpen, isARModalOpen } = useModal();

  // Create notification service reference (memoized)
  const notificationServiceRef = useCallback(() => {
    if (db) return new NotificationService(db);
    return null;
  }, []);

  // Handle geofence events (memoized callback)
  const handleGeofenceEvent = useCallback(async (event: GeofenceEvent) => {
    console.log('🚨 Geofence Event:', event);
    
    if (!user || event.type !== 'ENTER') return;

    const notificationService = notificationServiceRef();
    if (!notificationService) return;

    // Send ENTER notification
    await notificationService.sendGeofenceNotification(
      user.uid,
      event.projectId,
      event.projectName,
      '', // Will be set in service
      event.location.lat,
      event.location.lon
    );
  }, [user, notificationServiceRef]);

  // Initialize geofence monitoring (at top level - not inside useEffect)
  // Only enable when user is logged in and location permission is granted
  useGeofence({
    enabled: !!(user && locationAllowed && db),
    updateIntervalMs: 5000, // Check every 5 seconds
    onGeofenceEvent: handleGeofenceEvent
  });

  // Define which path counts as the "Home" experience
  // Usually this is "/" or "/home"
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fff7f0] text-neutral-900">
      
      {/* Dynamic Header Logic */}
      {isHomePage ? <TopHeader /> : <SecondaryHeader/>}

      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <Outlet />
      </main>

      {/* Hide BottomNav when modals (create post or AR) are open */}
      {!isCreatePostOpen && !isARModalOpen && <BottomNav />}
    </div>
  );
}