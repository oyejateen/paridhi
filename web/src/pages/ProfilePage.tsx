import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../context/PermissionsContext'

export function ProfilePage() {
  const { user, signIn, signOut, loading } = useAuth()
  const { locationAllowed, notificationsAllowed } = usePermissions()

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-lg shadow-orange-200">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-orange-100">Manage your account, permissions and preferences.</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Account</h3>
        <div className="mt-3 space-y-2 text-sm text-neutral-700">
          <PreferenceRow label="Status" value={loading ? 'Checking...' : user ? 'Signed In' : 'Signed Out'} />
          <PreferenceRow label="Name" value={user?.displayName || 'Guest Explorer'} />
          <PreferenceRow label="Email" value={user?.email || 'Not connected'} />
        </div>

        <div className="mt-4 flex gap-2">
          {!user ? (
            <button onClick={signIn} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
              Continue with Google
            </button>
          ) : (
            <button onClick={signOut} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Permissions</h3>
        <div className="mt-3 space-y-2 text-sm text-neutral-700">
          <PreferenceRow label="Location Access" value={locationAllowed ? 'Enabled' : 'Disabled'} />
          <PreferenceRow label="Push Notifications" value={notificationsAllowed ? 'Enabled' : 'Disabled'} />
          <PreferenceRow label="Google Account" value={user ? 'Connected' : 'Not Connected'} />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Achievements Snapshot</h3>
        <p className="mt-2 text-sm text-neutral-600">You explored 12 sites and earned 3 badges.</p>
      </div>
    </section>
  )
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2">
      <span>{label}</span>
      <span className="text-xs font-semibold text-neutral-500">{value}</span>
    </div>
  )
}