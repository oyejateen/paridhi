import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, type PanInfo, AnimatePresence } from 'framer-motion'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { requestPushToken, db } from '../lib/firebase'
import { enhancedProjects, calculateDistance, getProjectById } from '../data/projectsEnhanced'
import { usePermissions } from '../context/PermissionsContext'
import { useExploration } from '../context/ExplorationContext'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import type { EnhancedProject } from '../data/projectsEnhanced'
import { MapPin, CheckCircle, Bell, MapPinIcon, Users, Lightbulb, Plus, X, Camera, ChevronUp } from 'lucide-react'
import { enhanceProjectDescription } from '../lib/llm'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

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
  const [showDescription, setShowDescription] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    Number(import.meta.env.VITE_DEFAULT_LAT || 28.6139),
    Number(import.meta.env.VITE_DEFAULT_LNG || 77.209),
  ])
  const mapRef = useRef<any>(null)
  const firstLoadRef = useRef(true)

  // Auto-hide permission section when both enabled
  useEffect(() => {
    if (locationAllowed && notificationsAllowed) {
      setShowPermissions(false)
    }
  }, [locationAllowed, notificationsAllowed])

  // Show description when new project is selected
  useEffect(() => {
    if (selectedProjectId) {
      setShowDescription(true)
    }
  }, [selectedProjectId])

  // Auto-hide description card and button when AR or Post modals open (like navbar behavior)
  useEffect(() => {
    if (isARModalOpen || isCreatePostOpen) {
      setShowDescription(false)
    }
  }, [isARModalOpen, isCreatePostOpen])

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

  const autoEnabledRef = useRef(false)

  // Auto-enable location tracking when page loads if location permission already granted
  useEffect(() => {
    if (!autoEnabledRef.current && locationAllowed) {
      autoEnabledRef.current = true
      enableLocation()
    }
  }, [locationAllowed])

  // Center map on user location only on first load
  useEffect(() => {
    if (firstLoadRef.current && locationAllowed) {
      firstLoadRef.current = false
      setMapCenter(userPosition)
    }
  }, [locationAllowed])

  const handleCreatePost = () => {
    if (!user) {
      navigate('/profile')
    } else {
      openCreatePost()
    }
  }

  const closeCard = () => {
    setShowDescription(false)
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

  function handleLocateMe() {
    if (userPosition && mapRef.current) {
      setMapCenter(userPosition)
      mapRef.current.setView(userPosition, 16, { animate: true })
    }
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
    <section className="relative w-full h-screen bg-stone-50 overflow-hidden">
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <h1 className="text-xl font-black text-[#451a03] uppercase tracking-tighter">
          Explore
        </h1>
      </header>

      {/* FULL SCREEN MAP - Curved boundaries, 75% height */}
      <div className="absolute top-16 left-4 right-4 z-0 rounded-3xl overflow-hidden shadow-lg" style={{ height: '75vh' }}>
        <MapContainer
          center={mapCenter}
          zoom={selectedProject ? 14 : 13}
          className="w-full h-full"
          zoomControl={true}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Position - Always visible with pulsing effect */}
          <Marker
            position={userPosition}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="
                background-color: #3b82f6;
                border: 3px solid white;
                box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                color: white;
                font-size: 18px;
                animation: pulse 2s infinite;
              ">
                📍
              </div>
              <style>
                @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                }
              </style>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -20],
            })}
          >
            <Popup className="font-bold">📍 Your Current Location</Popup>
          </Marker>

          {/* Project Markers */}
          {enhancedProjects.map((project) => (
            <Marker
              key={project.id}
              position={[project.lat, project.lng]}
              icon={markerIconForProject(project, isExplored(project.id))}
              eventHandlers={{
                click: () => {
                  navigate('/explore', { state: { projectId: project.id } })
                },
              }}
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

        {/* Locate Me Button - positioned like zoom controls */}
        <button
          onClick={handleLocateMe}
          className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg hover:bg-stone-50 active:scale-95 transition-all z-[999] border border-stone-200 flex items-center justify-center"
          title="Center map on your location"
        >
          <MapPin size={20} className="text-blue-600" />
        </button>
      </div>

      {/* PERMISSIONS OVERLAY - shown over map if needed */}
      {showPermissions && !allExplorePermissionsGranted && (
        <div className="absolute inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#451a03]">Enable Permissions</h2>
              <p className="text-xs text-gray-500 mt-1">To explore projects and get notifications</p>
            </div>

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
        </div>
      )}

      {/* VIEW DESCRIPTION BUTTON - when card is closed (hidden when AR/Post modals open) */}
      <AnimatePresence>
        {selectedProject && !showDescription && !isARModalOpen && !isCreatePostOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-28 inset-x-0 z-[70] flex justify-center px-4"
          >
            <button
              onClick={() => setShowDescription(true)}
              className="bg-[#451a03] text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_15px_35px_rgba(69,26,3,0.4)] border-2 border-white/20 active:scale-95 transition-transform"
            >
              <ChevronUp size={18} className="animate-bounce" />
              View Description
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESCRIPTION BOTTOM SHEET MODAL - Instagram style (hidden when AR/Post modals open) */}
      <AnimatePresence>
        {selectedProject && allExplorePermissionsGranted && isFromSearchNav && showDescription && !isARModalOpen && !isCreatePostOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCard}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[80]"
            />

            <div className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pointer-events-none">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.1}
                onDragEnd={(_: any, info: PanInfo) => {
                  if (info.offset.y > 150 || info.velocity.y > 500) {
                    closeCard()
                  }
                }}
                className="w-full max-w-md bg-white rounded-t-[40px] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] border-t border-stone-200 pointer-events-auto touch-none flex flex-col max-h-[85vh]"
              >
                {/* DRAG HANDLE */}
                <div className="flex justify-center pt-4 pb-6">
                  <div className="w-12 h-1.5 bg-stone-300 rounded-full opacity-50" />
                </div>

                <div className="px-6 pb-12 overflow-y-auto custom-scrollbar">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100">
                        <MapPinIcon size={24} className="text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#451a03] leading-none tracking-tight uppercase">
                          {selectedProject.name}
                        </h2>
                        <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest mt-1.5">
                          {selectedProject.location}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={closeCard}
                      className="p-2 bg-stone-100 rounded-full text-stone-400"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className="flex gap-2 mb-6">
                    <span className={`text-[10px] font-black px-4 py-2 rounded-xl border uppercase ${
                      selectedProject.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                      selectedProject.status === 'ongoing' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      ● {selectedProject.status}
                    </span>
                    {selectedProject.completionPercentage && (
                      <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 uppercase">
                        {selectedProject.completionPercentage}% Complete
                      </span>
                    )}
                  </div>

                  {/* Description with enhancement */}
                  <div className="bg-stone-50/80 rounded-[32px] p-6 border border-stone-100 mb-8">
                    <p className="text-sm leading-relaxed text-stone-700 font-medium">
                      {selectedProject.longDescription || selectedProject.description}
                    </p>
                    {enhancedContent && enhancedContent !== selectedProject.description && (
                      <p className="text-sm text-stone-600 italic border-l-4 border-orange-400 pl-3 bg-orange-50 py-2 rounded mt-4">
                        💡 {enhancedContent}
                      </p>
                    )}
                  </div>

                  {/* QUICK STATS */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-white border border-stone-100 p-4 rounded-3xl text-center">
                      <MapPinIcon size={18} className="text-orange-600 flex justify-center mx-auto mb-2" />
                      <p className="text-[9px] font-black text-stone-800 uppercase tracking-tighter">{selectedProject.type || 'Project'}</p>
                    </div>
                    <div className="bg-white border border-stone-100 p-4 rounded-3xl text-center">
                      <Users size={18} className="text-blue-600 flex justify-center mx-auto mb-2" />
                      <p className="text-[9px] font-black text-stone-800 uppercase tracking-tighter">{selectedProject.impact || '100K+'}</p>
                    </div>
                    <div className="bg-white border border-stone-100 p-4 rounded-3xl text-center">
                      <Lightbulb size={18} className="text-yellow-600 flex justify-center mx-auto mb-2" />
                      <p className="text-[9px] font-black text-stone-800 uppercase tracking-tighter">KEY</p>
                    </div>
                  </div>

                  {/* PRIMARY ACTIONS */}
                  <div className="flex gap-3 sticky bottom-0 bg-white pt-2">
                    <button 
                      onClick={handleARCamera}
                      className="flex-[1.4] bg-[#451a03] text-white font-bold py-5 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-900/20"
                    >
                      <Camera size={20} /> AR View
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      className="flex-1 bg-white border-2 border-stone-200 text-stone-800 font-bold py-5 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Plus size={20} /> Post
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

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
  userId,
  userName 
}: { 
  project: EnhancedProject
  onClose: () => void
  userId: string
  userName: string
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB')
        return
      }
      
      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      console.log('📸 Image captured:', file.name)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    console.log('❌ Image removed')
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('Please write some feedback')
      return
    }

    if (content.trim().length < 4) {
      alert('Feedback must be at least 4 characters')
      return
    }

    setSubmitting(true)
    try {
      if (!db) {
        throw new Error('Firestore not initialized')
      }

      // Map project category to post category
      let postCategory = 'General'
      switch (project.category) {
        case 'Hospitals':
          postCategory = 'Healthcare'
          break
        case 'Colleges':
          postCategory = 'Smart City'
          break
        case 'Bridges':
        case 'Flyovers':
          postCategory = 'Transport'
          break
        case 'Metro stations':
          postCategory = 'Transport'
          break
        case 'Road projects':
          postCategory = 'Roads'
          break
        case 'Smart city projects':
          postCategory = 'Smart City'
          break
        default:
          postCategory = 'Roads'
      }

      console.log('📝 Creating post for project...', { 
        projectName: project.name,
        projectId: project.id,
        content, 
        userName,
        postCategory,
        hasImage: !!imagePreview
      })
      
      // Save post to Firestore with optional base64 image data
      await addDoc(collection(db, 'posts'), {
        authorId: userId,
        authorName: userName,
        content: content.trim(),
        projectId: project.id,
        category: postCategory,
        imageData: imagePreview || null,
        upvotes: 0,
        downvotes: 0,
        status: 'active',
        createdAt: serverTimestamp()
      })
      
      console.log('✅ Post created successfully')
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      onClose()
    } catch (error) {
      console.error('❌ Error creating post:', error)
      if (error instanceof Error) {
        alert(`Failed to create post: ${error.message}`)
      } else {
        alert('Failed to create post. Please try again.')
      }
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
          <label className="text-xs font-black text-[#451a03] uppercase">Your Feedback</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience with this project, what you've observed, suggestions for improvement... (like Reddit)"
            maxLength={500}
            className="w-full p-4 border-2 border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
            rows={5}
          />
          <p className="text-[10px] text-stone-400">{content.length}/500</p>
        </div>

        {/* Image Capture (Optional) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-[#451a03] uppercase">📸 Capture Image (Optional)</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              disabled={submitting}
              className="hidden"
              id="imageInput"
            />
            <label 
              htmlFor="imageInput"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 text-orange-700 font-black text-xs uppercase cursor-pointer hover:bg-orange-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <Camera size={16} strokeWidth={3} />
              {imageFile ? imageFile.name.substring(0, 20) : 'Capture / Upload'}
            </label>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden bg-stone-100 border-2 border-orange-200">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-48 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all active:scale-90"
                type="button"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
          )}
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

        {/* Project Info Overlay - Enhanced with full details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
          <div className="bg-black/80 backdrop-blur-md rounded-3xl p-6 text-white text-center max-w-sm space-y-3 border border-white/20">
            <p className="text-xs font-black uppercase tracking-widest text-orange-400">📍 AR View</p>
            <div>
              <p className="text-2xl font-black uppercase tracking-tight">{project.name}</p>
              <p className="text-xs text-gray-300 mt-2">{project.location}</p>
            </div>
            
            {/* Status badge */}
            <div className="flex justify-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                project.status === 'completed' ? 'bg-green-500/30 text-green-200' :
                project.status === 'ongoing' ? 'bg-orange-500/30 text-orange-200' :
                'bg-blue-500/30 text-blue-200'
              }`}>
                ● {project.status}
              </span>
              {project.completionPercentage && (
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 uppercase">
                  {project.completionPercentage}%
                </span>
              )}
            </div>

            {/* Full description */}
            <p className="text-sm leading-snug text-gray-200 bg-black/40 rounded-xl p-3">
              {project.longDescription || project.description}
            </p>

            {/* Quick impact info */}
            {project.impact && (
              <div className="text-xs text-gray-300 italic border-l-2 border-orange-400 pl-2">
                ✨ {project.impact}
              </div>
            )}
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

      {/* Info Bar - Show category and full description snippet */}
      <div className="bg-gradient-to-b from-black/50 to-black px-6 py-4 text-white text-center border-t border-white/10">
        <p className="text-[11px] text-orange-300 font-black uppercase tracking-widest">{project.category}</p>
        <p className="text-xs text-gray-300 mt-2 line-clamp-2">
          {project.longDescription || project.description}
        </p>
      </div>
    </div>
  )
}
