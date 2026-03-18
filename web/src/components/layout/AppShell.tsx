import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { TopHeader } from './TopHeader'

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fff7f0] text-neutral-900">
      <TopHeader />
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}