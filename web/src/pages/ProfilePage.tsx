import React from "react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Settings,
  Mail,
} from "lucide-react";

export function ProfilePage() {
  const { user, signIn, signOut, loading } = useAuth();
  const { locationAllowed, notificationsAllowed } = usePermissions();

  return (
    <div className="max-w-md mx-auto bg-[#fff7f0] min-h-screen pb-24 font-sans text-[#451a03]">
      {/* 1. HERO PROFILE SECTION */}
      <header className="px-6 pt-10 pb-8 bg-white rounded-b-[40px] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            Account
          </h1>
          {/* <button className="p-2 bg-stone-100 rounded-full text-[#451a03]">
            <Settings size={18} />
          </button> */}
          <Link
            to="/setting"
            className="p-3 bg-stone-100 rounded-2xl text-[#451a03] hover:bg-orange-100 hover:text-orange-600 transition-all active:scale-90"
          >
            <Settings size={20} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-[28px] bg-gradient-to-tr from-orange-500 to-orange-300 flex items-center justify-center text-white shadow-lg shadow-orange-200">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="h-full w-full rounded-[28px] object-cover"
                />
              ) : (
                <User size={32} strokeWidth={2.5} />
              )}
            </div>
            {user && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-white h-6 w-6 rounded-full flex items-center justify-center">
                <ShieldCheck size={12} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black leading-none mb-1">
              {loading ? "Checking..." : user?.displayName || "Guest Explorer"}
            </h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
              {user ? (
                <>
                  <Mail size={10} /> {user.email}
                </>
              ) : (
                "Level 01 • Join to earn XP"
              )}
            </p>
          </div>
        </div>
      </header>

      {/* 2. PERMISSIONS (The "On/Off" Sliders) */}
      <section className="px-6 mt-8 space-y-6">
        <div>
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 ml-2">
            App Permissions
          </h3>
          <div className="bg-white rounded-[32px] p-2 border border-stone-100 shadow-sm space-y-1">
            <ToggleRow
              icon={<MapPin size={16} />}
              label="Location Tracking"
              isActive={locationAllowed}
            />
            <ToggleRow
              icon={<Bell size={16} />}
              label="Push Notifications"
              isActive={notificationsAllowed}
            />
          </div>
        </div>

        {/* 3. SETTINGS & CONNECTIVITY */}
        <div>
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 ml-2">
            Security & Auth
          </h3>
          <div className="bg-white rounded-[32px] p-2 border border-stone-100 shadow-sm">
            <ActionRow
              icon={<GlobeIcon />}
              label="Google Connection"
              value={user ? "Linked" : "Disconnected"}
            />

            <div className="mt-2 p-2">
              {!user ? (
                <button
                  onClick={signIn}
                  className="w-full bg-[#451a03] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  Connect Google Account
                </button>
              ) : (
                <button
                  onClick={signOut}
                  className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER LOGO */}
      <div className="text-center mt-12 opacity-20 grayscale">
        <h1 className="text-xl font-black tracking-tighter uppercase">
          Paridhi
        </h1>
        <p className="text-[8px] font-bold">V 1.0.4 • 2026</p>
      </div>
    </div>
  );
}

// COMPONENT: Toggle Switch Row
function ToggleRow({
  icon,
  label,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-stone-50 rounded-2xl transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-black text-[#451a03]">{label}</span>
      </div>

      {/* IOS STYLE SWITCH */}
      <div
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${isActive ? "bg-orange-500" : "bg-stone-200"}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${isActive ? "translate-x-6" : "translate-x-0"}`}
        />
      </div>
    </div>
  );
}

// COMPONENT: Simple Action Row
function ActionRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-stone-100 text-stone-500 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-black text-[#451a03]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
          {value}
        </span>
        <ChevronRight size={14} className="text-stone-300" />
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
