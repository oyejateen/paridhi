import { useEffect, useCallback, useRef } from 'react'
import { 
  GeofenceEventDetector, 
  checkAllGeofences, 
  type GeofenceEvent,
  type GeofenceStatus 
} from '../lib/geofenceService'

interface GeofenceHookConfig {
  enabled?: boolean;
  updateIntervalMs?: number;
  onGeofenceEvent?: (event: GeofenceEvent) => void;
  onStatusChange?: (statuses: GeofenceStatus[]) => void;
}

/**
 * Hook to monitor user location and detect geofence entry/exit events
 * 
 * Usage:
 * const { isMonitoring, currentGeofences } = useGeofence({
 *   enabled: true,
 *   updateIntervalMs: 5000, // Check every 5 seconds
 *   onGeofenceEvent: (event) => {
 *     if (event.type === 'ENTER') {
 *       console.log(`User entered ${event.projectName}`);
 *       // Send notification
 *     }
 *   }
 * });
 */
export function useGeofence(config: GeofenceHookConfig = {}) {
  const {
    enabled = true,
    onGeofenceEvent,
    onStatusChange
  } = config;

  const detectorRef = useRef(new GeofenceEventDetector());
  const watchIdRef = useRef<number | null>(null);

  const handleLocationUpdate = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;

    // Check for geofence events
    const events = detectorRef.current.detectEvents(latitude, longitude);

    // Emit events
    events.forEach(event => {
      console.log(`🚨 Geofence ${event.type}:`, event.projectName);
      onGeofenceEvent?.(event);
    });

    // Check current geofence statuses
    const statuses = checkAllGeofences(latitude, longitude);
    const activeGeofences = statuses.filter(s => s.isInside);

    if (activeGeofences.length > 0) {
      console.log('📍 Currently in geofences:', activeGeofences.map(g => g.projectName));
    }

    onStatusChange?.(statuses);
  }, [onGeofenceEvent, onStatusChange]);

  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    console.error('❌ Geolocation error:', error.message);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Check if geolocation is available
    if (!('geolocation' in navigator)) {
      console.error('❌ Geolocation not available in this browser');
      return;
    }

    // Watch user location
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      {
        enableHighAccuracy: true,
        maximumAge: 0, // Don't use cached location
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('🔍 Started geofence monitoring');

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log('🔍 Stopped geofence monitoring');
      }
    };
  }, [enabled, handleLocationUpdate, handleLocationError]);

  return {
    isMonitoring: enabled && watchIdRef.current !== null,
    reset: () => detectorRef.current.reset()
  };
}
