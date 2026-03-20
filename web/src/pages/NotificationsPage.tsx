import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Heart, 
  MessageSquare, 
  Zap, 
  Bell, 
  CheckCheck,
  MoreHorizontal,
  Info
} from 'lucide-react';

// Mock Data - In a real app, this comes from a database/context
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    user: 'Aryan Sharma',
    content: 'liked your post "Modern Architecture in Delhi"',
    time: '2m ago',
    isUnread: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan'
  },
  {
    id: 2,
    type: 'update',
    user: 'Paridhi Team',
    content: 'New Feature: You can now export your exploration maps to PDF!',
    time: '1h ago',
    isUnread: true,
    icon: <Zap size={14} className="text-amber-500" />
  },
  {
    id: 3,
    type: 'comment',
    user: 'Sneha Rao',
    content: 'commented: "This looks amazing! Where is this located?"',
    time: '3h ago',
    isUnread: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha'
  },
  {
    id: 4,
    type: 'system',
    user: 'App Update',
    content: 'Version 1.0.4 is now live. Check out the new Settings UI.',
    time: '1d ago',
    isUnread: false,
    icon: <Info size={14} className="text-blue-500" />
  }
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
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
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Activity</h1>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1">
              {notifications.filter(n => n.isUnread).length} New Notifications
            </p>
          </div>
        </div>
        
        <button 
          onClick={markAllRead}
          className="p-2 text-stone-400 hover:text-orange-600 transition-colors"
          title="Mark all as read"
        >
          <CheckCheck size={20} />
        </button>
      </header>

      {/* TABS (Optional but professional) */}
      <div className="flex gap-4 px-6 py-4 overflow-x-auto no-scrollbar">
        {['All', 'Likes', 'Comments', 'System'].map((tab) => (
          <button 
            key={tab}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              tab === 'All' ? 'bg-[#451a03] text-white border-[#451a03]' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* NOTIFICATION LIST */}
      <div className="px-4 space-y-1">
        {notifications.map((notif) => (
          <NotificationItem key={notif.id} data={notif} />
        ))}
      </div>

      {/* EMPTY STATE (Shown if no notifications) */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-20 px-10 text-center">
          <div className="h-20 w-20 bg-stone-50 rounded-[30px] flex items-center justify-center text-stone-200 mb-4">
            <Bell size={40} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight">All caught up!</h3>
          <p className="text-xs text-stone-400 mt-1 uppercase font-bold tracking-tighter">No new updates for you right now.</p>
        </div>
      )}
    </div>
  );
}

// SUB-COMPONENT: Single Notification Row
function NotificationItem({ data }: { data: any }) {
  const getIcon = () => {
    switch(data.type) {
      case 'like': return <Heart size={12} fill="currentColor" className="text-rose-500" />;
      case 'comment': return <MessageSquare size={12} fill="currentColor" className="text-sky-500" />;
      default: return data.icon;
    }
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-[24px] transition-all active:scale-[0.98] cursor-pointer ${data.isUnread ? 'bg-orange-50/50' : 'hover:bg-stone-50'}`}>
      
      {/* AVATAR / ICON BOX */}
      <div className="relative shrink-0">
        <div className="h-12 w-12 rounded-2xl bg-stone-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
          {data.avatar ? (
            <img src={data.avatar} alt="User" className="h-full w-full object-cover" />
          ) : (
            <div className="text-orange-600 font-black text-lg">P</div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-50">
          {getIcon()}
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="flex-1 pt-1">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs text-stone-800 leading-snug">
            <span className="font-black uppercase tracking-tighter mr-1">{data.user}</span>
            <span className="font-medium text-stone-500">{data.content}</span>
          </p>
          {data.isUnread && <div className="h-2 w-2 rounded-full bg-orange-500 shrink-0 mt-1" />}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{data.time}</span>
          <button className="text-[9px] font-black text-orange-600 uppercase tracking-widest hover:underline">Reply</button>
        </div>
      </div>

      <button className="p-1 text-stone-300">
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}