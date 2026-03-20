import { NavLink } from "react-router-dom";
import { Home, Search, User, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Professional Progress Icon Component
 * Matches Lucide's 24x24 viewport and stroke aesthetics.
 */
function ProgressIcon({
  progress,
  isActive,
}: {
  progress: number;
  isActive: boolean;
}) {
  const size = 22;
  const strokeWidth = isActive ? 2.5 : 2;
  const radius = 9; // Optimized for a 24x24 viewbox
  const center = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="transform -rotate-90 transition-all duration-500 ease-out"
      >
        {/* Track (Background) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-15" // Subtle track
        />
        {/* Progress (Foreground) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="transition-all duration-700 ease-in-out"
        />
      </svg>

      {/* Optional: Tiny dot in the center for a 'Premium' feel */}
      <div
        className={`absolute h-1 w-1 rounded-full bg-current transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export function BottomNav() {
  const currentProgress = 70; // Connect this to your global state/context

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 mx-auto w-full max-w-md px-6 pointer-events-none">
      <div className="relative flex items-center rounded-[32px] border border-white/40 bg-white/80 px-2 py-2 shadow-[0_20px_50px_rgba(69,26,3,0.15)] backdrop-blur-2xl pointer-events-auto">
        {/* Floating Explore Button */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `absolute -top-7 left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border-[6px] border-white shadow-lg transition-all active:scale-95 ${
              isActive
                ? "bg-[#451a03] text-white"
                : "bg-gradient-to-tr from-[#E87B35] to-[#F19E59] text-white hover:brightness-110 shadow-orange-200"
            }`
          }
        >
          <Compass size={30} strokeWidth={2.2} />
        </NavLink>

        <ul className="grid w-full grid-cols-5 items-center">
          {/* Left Side */}
          <TabItem to="/home" Icon={Home} />
          <TabItem to="/search" Icon={Search} />

          {/* Spacer for Floating Button */}
          <div
            className="flex justify-center h-10 w-10 mx-auto"
            aria-hidden="true"
          />

          {/* Progress Tab (Replaced Bell) */}
          <li className="flex justify-center">
            <NavLink to="/progress">
              {({ isActive }) => (
                <div
                  className={`flex items-center justify-center rounded-full p-2.5 transition-all duration-300 active:scale-90 
                  ${isActive ? "text-orange-600 bg-orange-50 scale-110 shadow-sm" : "text-[#451a03] hover:text-orange-600"}`}
                >
                  <ProgressIcon
                    progress={currentProgress}
                    isActive={isActive}
                  />
                </div>
              )}
            </NavLink>
          </li>

          {/* Profile Tab */}
          <TabItem to="/profile" Icon={User} />
        </ul>
      </div>
    </nav>
  );
}

function TabItem({ to, Icon }: { to: string; Icon: LucideIcon }) {
  return (
    <li className="flex justify-center">
      <NavLink to={to}>
        {({ isActive }) => (
          <div
            className={`flex items-center justify-center rounded-full p-2.5 transition-all duration-300 active:scale-90 
            ${isActive ? "text-orange-600 bg-orange-50 scale-110 shadow-sm" : "text-[#451a03] hover:text-orange-600"}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </div>
        )}
      </NavLink>
    </li>
  );
}
