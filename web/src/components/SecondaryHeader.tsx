import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export function SecondaryHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-50 
                       bg-gradient-to-r from-[#D35400] to-[#E67E22] 
                       px-4 py-3 rounded-b-[24px] 
                       shadow-lg shadow-orange-900/10 
                       border-b border-white/10 backdrop-blur-md"
    >
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Left: Back Navigation & App Brand */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>

          <div className="ml-1">
            <h1 className="text-lg font-black text-white tracking-tight leading-none">
              Paridhi
            </h1>
            {/* <p className="text-[9px] font-bold text-orange-100/70 uppercase tracking-widest">
              Sub Page
            </p> */}
          </div>
        </div>

        {/* Right: User Mini-Profile & Notification */}
        <div className="flex items-center gap-3">
          {/* Compact User Name */}
          <div className="hidden xs:block text-right">
            <p className="text-sm font-bold text-white leading-none">
              {user?.displayName?.split(" ")[0] || "Citizen"}
            </p>
          </div>

          {/* Compact Notification Icon */}
          <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all active:scale-90">
            <Link to="/notification">
 <Bell size={18} className="text-white" strokeWidth={2.5} />
        </Link>
           
            <span className="absolute top-2 right-2 h-2 w-2 bg-yellow-400 rounded-full border border-orange-700"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
