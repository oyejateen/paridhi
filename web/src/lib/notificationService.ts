/**
 * Notification Service
 * Handles storage and delivery of geofence-triggered notifications
 * and admin notifications
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  Firestore 
} from 'firebase/firestore'

export type NotificationType = 'geofence' | 'admin' | 'system'

export interface AppNotification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  projectCategory?: string;
  lat?: number;
  lon?: number;
  adminId?: string;
  read: boolean;
  createdAt: Timestamp;
  triggeredAt?: Timestamp;
}

export class NotificationService {
  private db: Firestore | null = null;

  constructor(firestore: Firestore | null) {
    this.db = firestore;
  }

  /**
   * Send geofence notification
   */
  async sendGeofenceNotification(
    userId: string,
    projectId: string,
    projectName: string,
    projectCategory: string,
    lat: number,
    lon: number
  ): Promise<string | null> {
    if (!this.db) {
      console.error('❌ Firestore not initialized for notifications');
      return null;
    }

    const notification: AppNotification = {
      userId,
      type: 'geofence',
      title: `📍 ${projectName}`,
      message: `You've entered the ${projectName} project area. Updates available.`,
      projectId,
      projectName,
      projectCategory,
      lat,
      lon,
      read: false,
      createdAt: Timestamp.now(),
      triggeredAt: Timestamp.now()
    };

    try {
      const docRef = await addDoc(collection(this.db, 'notifications'), notification);
      console.log('✅ Geofence notification stored:', docRef.id);
      
      // Also send browser push notification
      this.sendBrowserNotification(notification.title, {
        body: notification.message,
        icon: '📍',
        badge: '🔔'
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing geofence notification:', error);
      return null;
    }
  }

  /**
   * Send admin notification (broadcast to user)
   */
  async sendAdminNotification(
    userId: string,
    title: string,
    message: string,
    adminId: string,
    projectId?: string
  ): Promise<string | null> {
    if (!this.db) {
      console.error('❌ Firestore not initialized for notifications');
      return null;
    }

    const notification: AppNotification = {
      userId,
      type: 'admin',
      title,
      message,
      projectId,
      adminId,
      read: false,
      createdAt: Timestamp.now()
    };

    try {
      const docRef = await addDoc(collection(this.db, 'notifications'), notification);
      console.log('✅ Admin notification stored:', docRef.id);

      // Send browser notification
      this.sendBrowserNotification(title, { body: message });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing admin notification:', error);
      return null;
    }
  }

  /**
   * Get geofence notifications for user
   */
  async getGeofenceNotifications(userId: string): Promise<AppNotification[]> {
    if (!this.db) {
      console.error('❌ Firestore not initialized for notifications');
      return [];
    }

    try {
      const q = query(
        collection(this.db, 'notifications'),
        where('userId', '==', userId),
        where('type', '==', 'geofence'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const notifications: AppNotification[] = [];

      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        } as AppNotification);
      });

      return notifications;
    } catch (error) {
      console.error('❌ Error fetching geofence notifications:', error);
      return [];
    }
  }

  /**
   * Get admin notifications for user
   */
  async getAdminNotifications(userId: string): Promise<AppNotification[]> {
    if (!this.db) {
      console.error('❌ Firestore not initialized for notifications');
      return [];
    }

    try {
      const q = query(
        collection(this.db, 'notifications'),
        where('userId', '==', userId),
        where('type', 'in', ['admin', 'system']),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const notifications: AppNotification[] = [];

      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        } as AppNotification);
      });

      return notifications;
    } catch (error) {
      console.error('❌ Error fetching admin notifications:', error);
      return [];
    }
  }

  /**
   * Get all notifications (geofence + admin) for user
   */
  async getAllNotifications(userId: string): Promise<AppNotification[]> {
    if (!this.db) {
      console.error('❌ Firestore not initialized for notifications');
      return [];
    }

    try {
      const q = query(
        collection(this.db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const notifications: AppNotification[] = [];

      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        } as AppNotification);
      });

      return notifications;
    } catch (error) {
      console.error('❌ Error fetching all notifications:', error);
      return [];
    }
  }

  /**
   * Send browser push notification
   */
  private sendBrowserNotification(
    title: string,
    options: NotificationOptions = {}
  ): void {
    if (!('Notification' in window)) {
      console.log('ℹ️ Browser notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        badge: '🔔',
        ...options
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            badge: '🔔',
            ...options
          });
        }
      });
    }
  }
}
