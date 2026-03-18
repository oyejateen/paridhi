import { Link } from 'react-router-dom'
import { cityProjects } from '../data/projects'
import { useExploration } from '../context/ExplorationContext'
import { usePermissions } from '../context/PermissionsContext'

const badgeByCount = [
  { threshold: 1, name: 'City Scout' },
  { threshold: 3, name: 'Transit Tracker' },
  { threshold: 5, name: 'Bridge Watcher' },
  { threshold: 7, name: 'Civic Champion' },
]

export function ProgressPage() {
  const { allExplorePermissionsGranted } = usePermissions()
  const { exploredProjectIds } = useExploration()

  if (!allExplorePermissionsGranted) {
    return (
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-lg shadow-orange-200">
          <h2 className="text-lg font-semibold">Your Progress</h2>
          <p className="mt-1 text-sm text-orange-100">Progress unlocks once Explore permissions are enabled.</p>
        </div>

        <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-4 text-sm text-neutral-700 shadow-sm">
          Enable both location and notification permissions on Explore page to see project and XP progress.
        </div>

        <Link to="/explore" className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
          Go to Explore
        </Link>
      </section>
    )
  }

  const exploredCount = exploredProjectIds.length
  const totalProjects = cityProjects.length
  const completionPercent = Math.round((exploredCount / totalProjects) * 100)
  const xp = exploredCount * 40
  const level = Math.max(1, Math.ceil(xp / 120))

  const unlockedBadges = badgeByCount
    .filter((badge) => exploredCount >= badge.threshold)
    .map((badge) => badge.name)

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-lg shadow-orange-200">
        <h2 className="text-lg font-semibold">Your Progress</h2>
        <p className="mt-1 text-sm text-orange-100">Track discoveries, XP and achievements.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Sites" value={String(exploredCount)} />
        <StatCard label="XP" value={String(xp)} />
        <StatCard label="Level" value={String(level)} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Completion</h3>
          <p className="text-sm font-semibold text-neutral-900">{completionPercent}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full rounded-full bg-orange-500" style={{ width: `${completionPercent}%` }} />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          {exploredCount} of {totalProjects} projects explored.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Badges</h3>
        {unlockedBadges.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">No badges yet. Explore your first project to unlock one.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {unlockedBadges.map((badge) => (
              <li key={badge} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm">
                🏅 {badge}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </article>
  )
}
