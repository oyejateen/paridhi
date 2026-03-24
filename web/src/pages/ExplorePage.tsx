import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { requestPushToken } from '../lib/firebase'
import { enhancedProjects, calculateDistance, getProjectById } from '../data/projectsEnhanced'
import { usePermissions } from '../context/PermissionsContext'
import { useExploration } from '../context/ExplorationContext'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import type { EnhancedProject } from '../data/projectsEnhanced'
import { MapPin, CheckCircle, Bell, MapPinIcon, Users, Lightbulb, Plus, X, Camera } from 'lucide-react'
import { enhanceProjectDescription } from '../lib/llm'

const GEOFENCE_RADIUS_KM = 0.5
const LOCATION_CHECK_INTERVAL = 5000

function markerIconForProject(_project: EnhancedProject, isExplored: boolean) {
  const bgColor = isExplored ? '#10b981' : '#f97316'
  return L.divIcon({
    className: 'emoji-marker',
    html: `<div style="background-color: ${bgColor}; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

export function ExplorePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isCreatePostOpen, openCreatePost, closeCreatePost, isARModalOpen, openARModal, closeARModal } = useModal()
  const locationState = location.state as { projectId?: string } | null
  const selectedProjectId = locationState?.projectId
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null
  const isFromSearchNav = !!selectedProjectId // Track if came from search vs map tap

  const {
    locationAllowed,
    notificationsAllowed,
    allExplorePermissionsGranted,
    setLocationAllowed,
    setNotificationsAllowed,
  } = usePermissions()
  const { isExplored, markExplored } = useExploration()

  const [statusMessage, setStatusMessage] = useState('')
  const [userPosition, setUserPosition] = useState<[number, number]>([
    Number(import.meta.env.VITE_DEFAULT_LAT || 28.6139),
    Number(import.meta.env.VITE_DEFAULT_LNG || 77.209),
  ])
  const [watchId, setWatchId] = useState<number | null>(null)
  const [showPermissions, setShowPermissions] = useState(!allExplorePermissionsGranted)
  const [enhancedContent, setEnhancedContent] = useState<string>('')

  // Auto-hide permission section when both enabled
  useEffect(() => {
    if (locationAllowed && notificationsAllowed) {
      setShowPermissions(false)
    }
  }, [locationAllowed, notificationsAllowed])

  // Auto-mark projects in geofence
  useEffect(() => {
    if (!locationAllowed || !selectedProject) return

    enhancedProjects.forEach((project) => {
      const distance = calculateDistance(userPosition[0], userPosition[1], project.lat, project.lng)
      if (distance <= GEOFENCE_RADIUS_KM && !isExplored(project.id)) {
        markExplored(project.id)
        setStatusMessage(`🎉 Explored: ${project.name}`)
      }
    })
  }, [userPosition, locationAllowed, markExplored, isExplored, selectedProject])

  // Enhance selected project content
  useEffect(() => {
    if (!selectedProject) return

    const enhance = async () => {
      const enhanced = await enhanceProjectDescription(selectedProject.description)
      setEnhancedContent(enhanced)
    }
    enhance()
  }, [selectedProject])

  const handleCreatePost = () => {
    if (!user) {
      navigate('/profile')
    } else {
      openCreatePost()
    }
  }

  const handleARCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      openARModal()
      // Stream will be shown in ARCameraModal
    } catch (error) {
      console.error('❌ Camera access denied:', error)
      setStatusMessage('Camera permission denied')
    }
  }

  async function enableLocation() {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAllowed(true)
        setUserPosition([position.coords.latitude, position.coords.longitude])
        setStatusMessage('Location enabled ✓')

        const id = navigator.geolocation.watchPosition(
          (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
          (error) => setStatusMessage(`Location error: ${error.message}`),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: LOCATION_CHECK_INTERVAL }
        )
        setWatchId(id)
      },
      (error) => setStatusMessage(`Location denied: ${error.message}`),
      { enableHighAccuracy: true }
    )
  }

  function disableLocation() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setLocationAllowed(false)
    setStatusMessage('Location disabled')
  }

  async function enableNotifications() {
    if (!('Notification' in window)) {
      setStatusMessage('Notifications not supported')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatusMessage('Notification permission denied')
      return
    }

    try {
      await requestPushToken().catch(() => null)
      setNotificationsAllowed(true)
      setStatusMessage('Notifications enabled ✓')
    } catch (error) {
      setStatusMessage('Unable to enable notifications')
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  return (
    <section className="space-y-0 pb-32 bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-100 px-6 py-4">
        <h1 className="text-xl font-black text-[#451a03] uppercase tracking-tighter">
          Explore
        </h1>
      </header>

      {/* PERMISSION TOGGLES - Only shown if not both enabled */}
      {showPermissions && !allExplorePermissionsGranted && (
        <div className="px-6 pt-4 pb-4 bg-gradient-to-b from-orange-50 to-white border-b border-orange-100 space-y-3">
          <p className="text-sm font-bold text-[#451a03]">Enable Permissions</p>

          {/* Location Toggle */}
          <button
            onClick={locationAllowed ? disableLocation : enableLocation}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all"
            style={{
              backgroundColor: locationAllowed ? '#dbeafe' : '#fff',
              borderColor: locationAllowed ? '#0ea5e9' : '#e5e7eb',
            }}
          >
            <MapPin size={20} className={locationAllowed ? 'text-blue-600' : 'text-gray-400'} />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-gray-900">Location</p>
              <p className="text-[11px] text-gray-500">{locationAllowed ? '✓ Enabled' : 'Tap to enable'}</p>
            </div>
            {locationAllowed && <CheckCircle size={18} className="text-green-600" />}
          </button>

          {/* Notification Toggle */}
          <button
            onClick={enableNotifications}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all"
            style={{
              backgroundColor: notificationsAllowed ? '#dbeafe' : '#fff',
              borderColor: notificationsAllowed ? '#0ea5e9' : '#e5e7eb',
            }}
          >
            <Bell size={20} className={notificationsAllowed ? 'text-blue-600' : 'text-gray-400'} />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-gray-900">Notifications</p>
              <p className="text-[11px] text-gray-500">{notificationsAllowed ? '✓ Enabled' : 'Tap to enable'}</p>
            </div>
            {notificationsAllowed && <CheckCircle size={18} className="text-green-600" />}
          </button>

          {statusMessage && (
            <div className="text-xs font-semibold text-orange-700 bg-orange-100 rounded-xl px-3 py-2">
              {statusMessage}
            </div>
          )}
        </div>
      )}

      {/* MAP SECTION - visible when permissions granted */}
      {allExplorePermissionsGranted && (
        <div className="mt-4 rounded-3xl overflow-hidden border-2 border-stone-200 shadow-sm mx-4" style={{ height: '70vh' }}>
          <MapContainer
            center={selectedProject ? [selectedProject.lat, selectedProject.lng] : userPosition}
            zoom={selectedProject ? 14 : 13}
            className="w-full h-full z-10"
            key={`${userPosition[0]}-${userPosition[1]}`}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Position */}
            <Marker
              position={userPosition}
              icon={L.divIcon({
                className: 'user-marker',
                html: '<div style="background-color: #3b82f6; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 40px; height: 40px; color: white; font-size: 18px;">📍</div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              })}
            >
              <Popup>Your location</Popup>
            </Marker>

            {/* Project Markers */}
            {enhancedProjects.map((project) => (
              <Marker
                key={project.id}
                position={[project.lat, project.lng]}
                icon={markerIconForProject(project, isExplored(project.id))}
              >
                <Popup>
                  <div className="space-y-2 text-sm max-w-xs">
                    <p className="font-bold">{project.name}</p>
                    <p className="text-xs text-gray-600">{project.location}</p>
                    <p className="text-xs capitalize font-semibold text-orange-600">{project.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* SELECTED PROJECT DETAIL CARD - Only shown when coming from search */}
      {selectedProject && allExplorePermissionsGranted && isFromSearchNav && (
        <div className="px-6 py-8">
          <div className="rounded-3xl border-2 border-stone-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📍</div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-[#451a03] tracking-tighter uppercase">{selectedProject.name}</h2>
                <p className="text-xs text-gray-600 font-semibold">{selectedProject.location}</p>
              </div>
              {isExplored(selectedProject.id) && <CheckCircle size={24} className="text-green-600 flex-shrink-0" />}
            </div>

            {/* Status & Progress */}
            <div className="flex gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                selectedProject.status === 'completed' ? 'bg-green-100 text-green-700' :
                selectedProject.status === 'ongoing' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {selectedProject.status}
              </span>
              {selectedProject.completionPercentage && (
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {selectedProject.completionPercentage}% Complete
                </span>
              )}
            </div>

            {/* Description with Enhancement */}
            <div className="space-y-2">
              <p className="text-sm text-gray-800">{selectedProject.longDescription || selectedProject.description}</p>
              {enhancedContent && enhancedContent !== selectedProject.description && (
                <p className="text-sm text-gray-700 italic border-l-4 border-orange-400 pl-3 bg-orange-50 py-2 rounded">
                  💡 {enhancedContent}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200">
              <div className="text-center">
                <MapPinIcon size={16} className="text-orange-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-700">{selectedProject.type || 'Project'}</p>
              </div>
              <div className="text-center">
                <Users size={16} className="text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-700">{selectedProject.impact || '~100k impact'}</p>
              </div>
              <div className="text-center">
                <Lightbulb size={16} className="text-yellow-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-700">Key Project</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={handleARCamera}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-sm transition-colors active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera size={16} strokeWidth={2.5} />
                AR View
              </button>
              <button
                onClick={handleCreatePost}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-sm transition-colors active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR CAMERA MODAL */}
      {isARModalOpen && selectedProject && (
        <ARCameraModal
          project={selectedProject}
          onClose={closeARModal}
        />
      )}

      {/* CREATE POST MODAL */}
      {isCreatePostOpen && user && selectedProject && (
        <CreatePostModalForProject
          project={selectedProject}
          onClose={closeCreatePost}
          userId={user.uid}
          userName={user.displayName || 'Citizen'}
        />
      )}
    </section>
  )
}

// ============ CREATE POST MODAL FOR PROJECT ============
function CreatePostModalForProject({ 
  project, 
  onClose,
  userName 
}: { 
  project: EnhancedProject
  onClose: () => void
  userId: string
  userName: string
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('Please write some feedback')
      return
    }

    setSubmitting(true)
    try {
      console.log('📝 Creating post for project...', { 
        projectName: project.name,
        projectId: project.id,
        content, 
        userName 
      })
      // TODO: Save to Firestore with project pre-selected
      onClose()
    } catch (error) {
      console.error('❌ Error creating post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={handleBackdropClick}>
      <div className="w-full bg-white rounded-t-[32px] p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header with Close Button */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h2 className="text-2xl font-black text-[#451a03]">Create a Post</h2>
            <p className="text-sm text-orange-700 font-semibold">About: {project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            aria-label="Close modal"
          >
            <X size={24} className="text-[#451a03]" />
          </button>
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-black text-[#451a03] uppercase">Your Post</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience with this project, what you've observed, suggestions for improvement... (like Reddit)"
            maxLength={500}
            className="w-full p-4 border-2 border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
            rows={6}
          />
          <p className="text-[10px] text-stone-400">{content.length}/500</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl border-2 border-black/5 text-[#451a03] font-black text-sm hover:bg-stone-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black text-sm transition-all active:scale-95"
          >
            {submitting ? '...' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ AR CAMERA MODAL ============
function ARCameraModal({ 
  project, 
  onClose 
}: { 
  project: EnhancedProject
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError('Camera access denied or not available')
        console.error('Camera error:', err)
      }
    }

    startCamera()

    return () => {
      // Auto-close camera stream when modal closes
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" onClick={handleBackdropClick}>
      {/* AR Camera View */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {error ? (
          <div className="text-white text-center space-y-4">
            <div className="text-4xl">📷</div>
            <p className="text-lg font-bold">{error}</p>
            <p className="text-sm text-gray-400">Grant camera permission to view AR</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Project Info Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4 text-white text-center max-w-xs">
            <p className="text-sm font-black uppercase tracking-widest text-orange-300">AR View</p>
            <p className="text-lg font-bold mt-2">{project.name}</p>
            <p className="text-xs text-gray-300 mt-1">{project.location}</p>
            <div className="text-3xl mt-3">📍</div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full transition-all active:scale-95"
          aria-label="Close AR camera"
        >
          <X size={24} className="text-white" />
        </button>
      </div>

      {/* Info Bar */}
      <div className="bg-gradient-to-b from-black/50 to-black px-6 py-4 text-white text-center">
        <p className="text-xs text-gray-300">Point camera at the project location</p>
        <p className="text-sm font-bold mt-2">{project.description.substring(0, 60)}...</p>
      </div>
    </div>
  )
}
