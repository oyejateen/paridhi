import { NavLink } from 'react-router-dom'

const sideTabs = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/progress', label: 'Progress', icon: '🎮' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-2 left-0 right-0 z-30 mx-auto w-full max-w-md px-4">
      <div className="relative rounded-[28px] border border-neutral-200 bg-white px-4 pb-3 pt-5 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            [
              'absolute -top-7 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border-4 border-[#fff7f0] text-2xl text-white shadow-lg transition',
              isActive ? 'bg-black' : 'bg-orange-500',
            ].join(' ')
          }
        >
          🧭
        </NavLink>

        <ul className="grid grid-cols-3 gap-2">
          {sideTabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center justify-center rounded-xl py-1.5 text-[11px] font-medium transition',
                    isActive ? 'text-orange-600' : 'text-neutral-500 hover:text-neutral-900',
                  ].join(' ')
                }
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
