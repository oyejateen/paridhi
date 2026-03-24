import React from "react";
import {
  UserPlus,
  Mail,
  Phone,
  KeyRound,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

function Settingpages() {
  // Handlers for your backend integration
  const handleAction = (action: string) => {
    console.log(`Triggering: ${action}`);
    // Example: if(action === 'logout') auth.signOut()
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 font-sans text-[#451a03]">
      {/* 1. HEADER */}
      <header className="px-6 pt-10 pb-6 border-b border-stone-50">
        <h1 className="text-3xl font-black tracking-tighter uppercase">
          Settings
        </h1>
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1">
          Account & Security Protocol
        </p>
      </header>

      <div className="px-6 py-8 space-y-9">
        {/* SECTION: PERSONAL INFO */}
        <section>
          <div className="flex items-center gap-2 mb-4 ml-1">
            <div className="h-1 w-4 bg-orange-500 rounded-full" />
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Personal Info
            </h3>
          </div>
          <div className="space-y-1">
            <SettingItem
              icon={<Mail size={18} />}
              label="Change Email"
              sub="Update your primary login email"
              onClick={() => handleAction("email")}
            />
            <SettingItem
              icon={<Phone size={18} />}
              label="Change Number"
              sub="Update verified mobile for OTP"
              onClick={() => handleAction("phone")}
            />
          </div>
        </section>

        {/* SECTION: SECURITY */}
        <section>
          <div className="flex items-center gap-2 mb-4 ml-1">
            <div className="h-1 w-4 bg-[#451a03] rounded-full" />
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Security
            </h3>
          </div>
          <div className="space-y-1">
            <SettingItem
              icon={<KeyRound size={18} />}
              label="Change Password"
              sub="Update your security credentials"
              onClick={() => handleAction("password")}
            />
            <SettingItem
              icon={<Smartphone size={18} />}
              label="Linked Devices"
              sub="Manage active login sessions"
              onClick={() => handleAction("devices")}
            />
            <SettingItem
              icon={<UserPlus size={18} />}
              label="Add Account"
              sub="Login to a secondary profile"
              onClick={() => handleAction("add_account")}
            />
          </div>
        </section>

        {/* SECTION: DANGER ZONE */}
        <section>
          <div className="flex items-center gap-2 mb-4 ml-1">
            <div className="h-1 w-4 bg-red-500 rounded-full" />
            <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest">
              Danger Zone
            </h3>
          </div>
          <div className="bg-red-50/30 rounded-[32px] p-2 border border-red-100/50">
            {/* Logout Button */}
            <button
              onClick={() => handleAction("logout")}
              className="w-full flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white text-[#451a03] rounded-xl flex items-center justify-center shadow-sm border border-stone-100">
                  <LogOut size={18} />
                </div>
                <span className="text-sm font-black uppercase tracking-tight">
                  Logout Session
                </span>
              </div>
              <ChevronRight size={16} className="text-stone-300" />
            </button>

            {/* Delete Account Button */}
            <button
              onClick={() => handleAction("delete")}
              className="w-full flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white text-red-500 rounded-xl flex items-center justify-center shadow-sm border border-red-50/50">
                  <Trash2 size={18} />
                </div>
                <span className="text-sm font-black uppercase tracking-tight text-red-500">
                  Delete Account
                </span>
              </div>
              <ChevronRight size={16} className="text-stone-300" />
            </button>
          </div>
        </section>
      </div>

      {/* VERSION INFO */}
      <footer className="text-center pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-full border border-stone-100">
          <ShieldCheck size={12} className="text-emerald-500" />
          <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">
            Secure Encryption Active • V1.0.4
          </p>
        </div>
      </footer>
    </div>
  );
}

// Reusable Row Component
interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}

function SettingItem({ icon, label, sub, onClick }: SettingItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-stone-50 rounded-[24px] cursor-pointer transition-all group active:scale-[0.97]"
    >
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 bg-stone-100 text-[#451a03] rounded-2xl flex items-center justify-center group-hover:bg-[#451a03] group-hover:text-white transition-all duration-300">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase tracking-tight group-hover:text-orange-600 transition-colors">
            {label}
          </span>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
            {sub}
          </span>
        </div>
      </div>
      <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-white transition-all">
        <ChevronRight
          size={16}
          className="text-stone-300 group-hover:text-[#451a03]"
        />
      </div>
    </div>
  );
}

export default Settingpages;
