/**
 * Geofence Detection Service
 * Monitors user location against project geofences
 * Triggers notifications when user enters/exits geofence boundaries
 */

// Haversine formula to calculate distance between two coordinates
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Convert km to meters
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return calculateHaversineDistance(lat1, lon1, lat2, lon2) * 1000;
}

// Project geofence definitions (lat, lon, radius in meters)
export const PROJECT_GEOFENCES = {
  "project-1": {
    name: "NH-44 Flyover Expansion",
    category: "Roads",
    latitude: 28.6139,
    longitude: 77.209,
    radiusMeters: 150, // 150 meters geofence
    description: "Major infrastructure upgrade on NH-44"
  },
  "project-2": {
    name: "Metro Line Extension",
    category: "Transport",
    latitude: 28.6262,
    longitude: 77.211,
    radiusMeters: 150,
    description: "New metro line connecting suburbs"
  },
  "project-3": {
    name: "Smart City Infrastructure",
    category: "Smart City",
    latitude: 28.6208,
    longitude: 77.2099,
    radiusMeters: 150,
    description: "Smart sensors and IoT deployment"
  },
  "project-4": {
    name: "Public Health Facility",
    category: "Healthcare",
    latitude: 28.6329,
    longitude: 77.2197,
    radiusMeters: 120,
    description: "New health center facility"
  },
  "project-5": {
    name: "Water Supply Project",
    category: "Infrastructure",
    latitude: 28.6104,
    longitude: 77.2166,
    radiusMeters: 200,
    description: "Water treatment and supply upgrade"
  },
  "project-6": {
    name: "Green Park Development",
    category: "Urban Development",
    latitude: 28.6275,
    longitude: 77.2053,
    radiusMeters: 180,
    description: "Public park and green space development"
  }
};

export interface GeofenceStatus {
  projectId: string;
  projectName: string;
  isInside: boolean;
  distanceMeters: number;
  radius: number;
}

/**
 * Check if user is inside a project's geofence
 */
export function checkGeofenceStatus(
  userLat: number,
  userLon: number,
  projectId: string
): GeofenceStatus | null {
  const geofence = PROJECT_GEOFENCES[projectId as keyof typeof PROJECT_GEOFENCES];

  if (!geofence) return null;

  const distanceMeters = getDistanceInMeters(
    userLat,
    userLon,
    geofence.latitude,
    geofence.longitude
  );

  return {
    projectId,
    projectName: geofence.name,
    isInside: distanceMeters <= geofence.radiusMeters,
    distanceMeters,
    radius: geofence.radiusMeters
  };
}

/**
 * Check all geofences and return which ones user is inside
 */
export function checkAllGeofences(
  userLat: number,
  userLon: number
): GeofenceStatus[] {
  return Object.keys(PROJECT_GEOFENCES)
    .map(projectId => checkGeofenceStatus(userLat, userLon, projectId))
    .filter(Boolean) as GeofenceStatus[];
}

/**
 * Detect geofence entry/exit events
 */
export interface GeofenceEvent {
  type: 'ENTER' | 'EXIT';
  projectId: string;
  projectName: string;
  timestamp: Date;
  location: { lat: number; lon: number };
}

export class GeofenceEventDetector {
  private previousStatus: Map<string, boolean> = new Map();

  /**
   * Check for entry/exit events
   * Returns array of events that occurred
   */
  detectEvents(userLat: number, userLon: number): GeofenceEvent[] {
    const events: GeofenceEvent[] = [];
    const currentStatuses = checkAllGeofences(userLat, userLon);

    for (const status of currentStatuses) {
      const wasInside = this.previousStatus.get(status.projectId) || false;
      const isInside = status.isInside;

      // ENTRY event: was outside, now inside
      if (!wasInside && isInside) {
        events.push({
          type: 'ENTER',
          projectId: status.projectId,
          projectName: status.projectName,
          timestamp: new Date(),
          location: { lat: userLat, lon: userLon }
        });
      }

      // EXIT event: was inside, now outside
      if (wasInside && !isInside) {
        events.push({
          type: 'EXIT',
          projectId: status.projectId,
          projectName: status.projectName,
          timestamp: new Date(),
          location: { lat: userLat, lon: userLon }
        });
      }

      // Update status
      this.previousStatus.set(status.projectId, isInside);
    }

    return events;
  }

  /**
   * Reset detector (useful when user signs in/out)
   */
  reset(): void {
    this.previousStatus.clear();
  }
}
