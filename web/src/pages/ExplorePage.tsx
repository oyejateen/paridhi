import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { requestPushToken } from '../lib/firebase'
import { cityProjects, categoryEmoji } from '../data/projects'
import { usePermissions } from '../context/PermissionsContext'
import { useExploration } from '../context/ExplorationContext'
import type { CityProject } from '../types/projects'

function markerIconForProject(project: CityProject) {
  const emoji = categoryEmoji[project.category] ?? '📍'
  return L.divIcon({
    className: 'emoji-marker',
    html: `<div class="emoji-marker__chip">${emoji}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20],
  })
}

export function ExplorePage() {
  const {
    locationAllowed,
    notificationsAllowed,
    allExplorePermissionsGranted,
    setLocationAllowed,
    setNotificationsAllowed,
  } = usePermissions()
  const { isExplored, markExplored, totalExplored } = useExploration()

  const [statusMessage, setStatusMessage] = useState('')
  const [userPosition, setUserPosition] = useState<[number, number]>([
    Number(import.meta.env.VITE_DEFAULT_LAT || 28.6139),
    Number(import.meta.env.VITE_DEFAULT_LNG || 77.209),
  ])

  const exploredNow = useMemo(
    () => cityProjects.filter((project) => isExplored(project.id)).length,
    [isExplored],
  )

  async function enableLocation() {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAllowed(true)
        setUserPosition([position.coords.latitude, position.coords.longitude])
        setStatusMessage('Location permission granted.')
      },
      (error) => {
        setStatusMessage(error.message || 'Location permission denied.')
      },
      { enableHighAccuracy: true },
    )
  }

  async function enableNotifications() {
    if (!('Notification' in window)) {
      setStatusMessage('Notifications are not supported on this device.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatusMessage('Notification permission denied.')
      return
    }

    try {
      await requestPushToken().catch(() => null)
      setNotificationsAllowed(true)
      setStatusMessage('Notification permission granted.')
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Unable to complete push token setup: ${error.message}`
          : 'Unable to enable notifications.',
      )
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-lg shadow-orange-200">
        <h2 className="text-lg font-semibold">Explore Nearby Infrastructure</h2>
        <p className="mt-1 text-sm text-orange-100">
          Location and notification permissions are required to unlock map exploration and project progress.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={enableLocation}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <p className="text-sm font-semibold text-neutral-900">Location Permission</p>
          <p className="text-xs text-neutral-500">{locationAllowed ? 'Enabled' : 'Tap to enable'}</p>
        </button>

        <button
          onClick={enableNotifications}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <p className="text-sm font-semibold text-neutral-900">Notification Permission</p>
          <p className="text-xs text-neutral-500">{notificationsAllowed ? 'Enabled' : 'Tap to enable'}</p>
        </button>
      </div>

      {statusMessage ? (
        <p className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-orange-900">{statusMessage}</p>
      ) : null}

      {!allExplorePermissionsGranted ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-4 text-sm text-neutral-700 shadow-sm">
          Enable both permissions to view the live map, project markers, and exploration progress.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2 shadow-sm">
            <MapContainer center={userPosition} zoom={12} className="h-[360px] w-full rounded-2xl">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={userPosition}
                icon={L.divIcon({
                  className: 'emoji-marker',
                  html: '<div class="emoji-marker__chip emoji-marker__chip--user">📍</div>',
                  iconSize: [42, 42],
                  iconAnchor: [21, 21],
                })}
              >
                <Popup>You are here</Popup>
              </Marker>

              {cityProjects.map((project) => (
                <Marker key={project.id} position={[project.lat, project.lng]} icon={markerIconForProject(project)}>
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{project.name}</p>
                      <p>{project.category}</p>
                      <p className="text-xs text-neutral-600">{project.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">Project Progress</h3>
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                {exploredNow}/{cityProjects.length} explored
              </span>
            </div>
            <ul className="space-y-2">
              {cityProjects.map((project) => {
                const explored = isExplored(project.id)
                return (
                  <li
                    key={project.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {categoryEmoji[project.category]} {project.name}
                      </p>
                      <p className="text-xs text-neutral-500">{project.category}</p>
                    </div>
                    <button
                      disabled={explored}
                      onClick={() => markExplored(project.id)}
                      className="rounded-xl bg-black px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                    >
                      {explored ? 'Explored' : 'Mark Explored'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="text-xs text-neutral-500">Total explored this session: {totalExplored}</p>
        </>
      )}
    </section>
  )
}
