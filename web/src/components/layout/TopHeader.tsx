import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Bell } from "lucide-react";

export function TopHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 
                       bg-gradient-to-br from-[#D35400] to-[#E67E22] 
                       px-5 pt-4 pb-8 rounded-b-[40px] 
                       shadow-xl shadow-orange-900/20
                       backdrop-blur-xl border-b border-white/10">
      
      {/* Top Row: Logo & Notifications */}
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="transition-transform active:scale-95">
          <img 
            src="/paridhi.svg" 
            alt="Paridhi Logo" 
            className="h-7 w-auto object-contain drop-shadow-md"
          />
        </Link>
   
        <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-90">
        <Link to="/notification">
 <Bell size={20} className="text-white" />
        </Link>
         
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-yellow-400 rounded-full border border-orange-600"></span>
        </button>
      </div>
      
      {/* Bottom Row: User Info */}
      <div className="flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-3.5 active:opacity-80 transition-opacity">
          {/* Profile Image Container */}
          <div className="h-14 w-14 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden shadow-inner flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-white/80" />
            )}
          </div>

          {/* Greeting Text */}
          <div className="text-white">
            <p className="text-[11px] font-medium text-orange-50/80 uppercase tracking-widest leading-none mb-1">
              Welcome back,
            </p>
            <p className="text-2xl font-black tracking-tight leading-none">
              {user?.displayName || "Citizen"}
            </p>
          </div>
        </Link>

        {/* Live Status Badge */}
        <div className="bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm">
           <div className="flex items-center gap-1.5">
             <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-white font-bold tracking-wide">LIVE</span>
           </div>
        </div>
      </div>
    </header>
  );
}