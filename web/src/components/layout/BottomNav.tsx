import { NavLink } from "react-router-dom";
import { Home, Search, User, Bell, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const sideTabsLeft = [
  { to: "/home", icon: Home },
  { to: "/search", icon: Search },
];

const sideTabsRight = [
  { to: "/notifications", icon: Bell },
  { to: "/profile", icon: User },
];

// Simple Tab Item helper component
// Destructuring 'Icon' with a capital 'I' tells React to treat it as a component
function TabItem({ to, Icon }: { to: string; Icon?: LucideIcon }) {
  if (!Icon) return <li className="flex justify-center" />;

  return (
    <li className="flex justify-center">
      <NavLink to={to}>
        {({ isActive }) => (
          <div
            className={`flex items-center justify-center rounded-full p-2.5 transition-all duration-300 active:scale-95 
            ${
              isActive
                ? "text-orange-600 bg-orange-50 scale-110 shadow-sm"
                : "text-[#451a03] hover:text-orange-600 active:text-orange-600"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </div>
        )}
      </NavLink>
    </li>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 mx-auto w-full max-w-md px-6 pointer-events-none">
      {/* Re-enable pointer events for the bar itself */}
      <div className="relative rounded-[32px] border border-white/40 bg-white/80 px-2 py-2 shadow-[0_20px_50px_rgba(69,26,3,0.15)] backdrop-blur-2xl pointer-events-auto">
        {/* Floating Explore Button - Exact Center */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `absolute -top-7 left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border-[6px] border-white shadow-lg transition-all active:scale-90 ${
              isActive
                ? "bg-[#451a03] text-white shadow-inner"
                : "bg-gradient-to-tr from-[#E87B35] to-[#F19E59] text-white hover:saturate-150"
            }`
          }
        >
          <Compass size={30} strokeWidth={2.5} />
        </NavLink>

        <ul className="grid grid-cols-5 items-center">
          {/* Left Side */}
          <TabItem to={sideTabsLeft[0].to} Icon={sideTabsLeft[0].icon} />
          <TabItem to={sideTabsLeft[1].to} Icon={sideTabsLeft[1].icon} />

          {/* Center Gap for the Floating Button */}
          <div className="flex justify-center items-center">
            <div className="h-10 w-10" />
          </div>

          {/* Right Side */}
          <TabItem to={sideTabsRight[0].to} Icon={sideTabsRight[0].icon} />
          <TabItem to={sideTabsRight[1].to} Icon={sideTabsRight[1].icon} />
        </ul>
      </div>
    </nav>
  );
}
