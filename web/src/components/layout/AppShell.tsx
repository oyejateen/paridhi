import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopHeader } from './TopHeader';
import { SecondaryHeader } from '../SecondaryHeader';

export function AppShell() {
  const location = useLocation();

  // Define which path counts as the "Home" experience
  // Usually this is "/" or "/home"
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fff7f0] text-neutral-900">
      
      {/* Dynamic Header Logic */}
      {isHomePage ? <TopHeader /> : <SecondaryHeader/>}

      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}