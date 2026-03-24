import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MapPin, 
  AlertCircle, 
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { NotificationService, type AppNotification } from '../lib/notificationService';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'geofence' | 'admin'>('all');

  useEffect(() => {
    loadNotifications();
  }, [user, filter]);

  const loadNotifications = async () => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const notificationService = new NotificationService(db);

    let notifs: AppNotification[] = [];

    try {
      if (filter === 'geofence') {
        notifs = await notificationService.getGeofenceNotifications(user.uid);
      } else if (filter === 'admin') {
        notifs = await notificationService.getAdminNotifications(user.uid);
      } else {
        notifs = await notificationService.getAllNotifications(user.uid);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }

    setNotifications(notifs);
    setLoading(false);
  };

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications);

  const handleGeofenceNotificationClick = (notif: AppNotification) => {
    if (notif.projectId) {
      // Navigate like SearchPage does - with state object
      // This triggers ExplorePage to show ProjectDetailCard
      navigate('/explore', { 
        state: { projectId: notif.projectId }
      });
      console.log('📲 Opening project from notification:', notif.projectId, notif.projectName);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 font-sans text-[#451a03]">
      
      {/* HEADER */}
      <header className="px-6 pt-10 pb-6 border-b border-stone-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 bg-stone-50 rounded-xl text-[#451a03] active:scale-90 transition-all border border-stone-100"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Notifications</h1>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1">
              {notifications.length} Updates
            </p>
          </div>
        </div>
      </header>

      {/* FILTER TABS */}
      <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar border-b border-stone-50">
        {[
          { id: 'all', label: 'All' },
          { id: 'geofence', label: '📍 Projects' },
          { id: 'admin', label: '⚙️ Admin' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
              filter === tab.id 
                ? 'bg-[#451a03] text-white border-[#451a03]' 
                : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATION LIST */}
      <div className="px-4 space-y-6 py-4">
        {loading ? (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm font-bold">Loading...</p>
          </div>
        ) : Object.keys(groupedNotifications).length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 px-10 text-center">
            <div className="h-20 w-20 bg-stone-50 rounded-[30px] flex items-center justify-center text-stone-200 mb-4">
              <Bell size={40} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight">All caught up!</h3>
            <p className="text-xs text-stone-400 mt-1 uppercase font-bold tracking-tighter">
              No {filter === 'geofence' ? 'project' : filter === 'admin' ? 'admin' : ''} notifications yet.
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([dateKey, notifs]) => (
            <div key={dateKey}>
              {/* DATE HEADER */}
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3 px-2">
                {dateKey}
              </h3>

              {/* NOTIFICATIONS FOR THIS DATE */}
              <div className="space-y-2">
                {notifs.map((notif) => (
                  <NotificationRow 
                    key={notif.id}
                    notification={notif}
                    onGeofenceClick={() => handleGeofenceNotificationClick(notif)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface NotificationRowProps {
  notification: AppNotification;
  onGeofenceClick?: () => void;
}

function NotificationRow({ notification, onGeofenceClick }: NotificationRowProps) {
  const createdAt = notification.createdAt?.toDate() || new Date();
  const timeString = formatTime(createdAt);

  const isGeofence = notification.type === 'geofence';
  const icon = isGeofence ? <MapPin size={16} className="text-blue-500" /> : <AlertCircle size={16} className="text-amber-500" />;

  return (
    <button
      onClick={isGeofence ? onGeofenceClick : undefined}
      className="w-full text-left p-4 rounded-[24px] border border-stone-100 bg-white hover:bg-stone-50 transition-all active:scale-[0.98] cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* ICON */}
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-sm tracking-tight leading-tight mb-1 truncate">
            {notification.title}
          </h4>
          <p className="text-xs text-stone-600 leading-snug line-clamp-2 mb-2">
            {notification.message}
          </p>

          {/* PROJECT INFO (For geofence) */}
          {isGeofence && notification.projectName && (
            <div className="flex items-center gap-2 py-2 px-2 bg-blue-50 rounded-lg mt-2">
              <MapPin size={12} className="text-blue-600 shrink-0" />
              <div className="text-[10px]">
                <p className="font-black text-blue-700 truncate">{notification.projectName}</p>
                {notification.projectCategory && (
                  <p className="text-blue-600 uppercase tracking-tighter">{notification.projectCategory}</p>
                )}
              </div>
            </div>
          )}

          {/* TIMESTAMP */}
          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-2">
            {timeString}
          </p>
        </div>

        {/* RIGHT ARROW FOR GEOFENCE */}
        {isGeofence && (
          <div className="text-orange-400 shrink-0 mt-1">→</div>
        )}
      </div>
    </button>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupNotificationsByDate(notifications: AppNotification[]): Record<string, AppNotification[]> {
  const groups: Record<string, AppNotification[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Earlier': []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  notifications.forEach(notif => {
    const date = notif.createdAt?.toDate() || new Date();
    const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (notifDate.getTime() === today.getTime()) {
      groups['Today'].push(notif);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(notif);
    } else if (notifDate.getTime() > weekAgo.getTime()) {
      groups['This Week'].push(notif);
    } else {
      groups['Earlier'].push(notif);
    }
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([, notifs]) => notifs.length > 0)
  );
}
