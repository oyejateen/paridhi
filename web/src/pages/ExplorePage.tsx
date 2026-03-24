import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform , type PanInfo, AnimatePresence } from 'framer-motion';
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
import { MapPin, CheckCircle, Bell, MapPinIcon, Users, Lightbulb, Plus,  Camera,ChevronUp,X } from 'lucide-react'
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


  



// ============ CREATE POST MODAL FOR PROJECT ============


// --- Sub-components for better organization ---
export function ExplorePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCreatePost, openARModal } = useModal();

  // New state to control if the card is visible or if the button is visible
  const [showDescription, setShowDescription] = useState(true);

  const locationState = location.state as { projectId?: string } | null;
  const selectedProjectId = locationState?.projectId;
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;
  const isFromSearchNav = !!selectedProjectId;

  const [userPosition] = useState<[number, number]>([28.6139, 77.209]);

  // When a new project is selected, make sure the card shows up
  useEffect(() => {
    if (selectedProjectId) {
      setShowDescription(true);
    }
  }, [selectedProjectId]);

  const closeCard = () => {
    setShowDescription(false);
    // Note: We don't navigate away, so the project stays "selected" 
    // but the card is hidden until they click the button.
  };

  const handleCreatePost = () => {
    user ? openCreatePost() : navigate('/profile');
  };

  const handleARCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      openARModal();
    } catch (error) {
      console.error('Camera access denied', error);
    }
  };

  return (
    <section className="relative w-full h-screen bg-stone-50 overflow-hidden">
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <h1 className="text-xl font-black text-[#451a03] uppercase tracking-tighter">
          Explore
        </h1>
      </header>

      {/* FULL SCREEN MAP */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={selectedProject ? [selectedProject.lat, selectedProject.lng] : userPosition}
          zoom={13}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>

      {/* 1. VIEW DESCRIPTION BUTTON (Pops up when card is closed) */}
      <AnimatePresence>
        {selectedProject && !showDescription && (
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

      {/* 2. INSTAGRAM STYLE BOTTOM SHEET */}
      <AnimatePresence>
        {selectedProject && isFromSearchNav && showDescription && (
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
                    closeCard();
                  }
                }}
                className="w-full max-w-md bg-white rounded-t-[40px] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] border-t border-stone-200 pointer-events-auto touch-none flex flex-col max-h-[85vh]"
              >
                {/* DRAG HANDLE */}
                <div className="flex justify-center pt-4 pb-6">
                  <div className="w-12 h-1.5 bg-stone-300 rounded-full opacity-50" />
                </div>

                <div className="px-6 pb-12 overflow-y-auto custom-scrollbar">
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

                  <div className="flex gap-2 mb-6">
                    <span className="text-[10px] font-black bg-orange-50 text-orange-700 px-4 py-2 rounded-xl border border-orange-100 uppercase">
                      ● {selectedProject.status}
                    </span>
                  </div>

                  <div className="bg-stone-50/80 rounded-[32px] p-6 border border-stone-100 mb-8">
                    <p className="text-sm leading-relaxed text-stone-700 font-medium">
                      {selectedProject.longDescription || selectedProject.description}
                    </p>
                  </div>

                  {/* QUICK STATS */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      { icon: <MapPinIcon size={18}/>, label: 'URBAN', color: 'text-orange-600' },
                      { icon: <Users size={18}/>, label: '100K+', color: 'text-blue-600' },
                      { icon: <Lightbulb size={18}/>, label: 'KEY', color: 'text-yellow-600' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white border border-stone-100 p-4 rounded-3xl text-center">
                        <div className={`${stat.color} flex justify-center mb-2`}>{stat.icon}</div>
                        <p className="text-[9px] font-black text-stone-800 uppercase tracking-tighter">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* PRIMARY ACTIONS */}
                  <div className="flex gap-3 sticky bottom-0 bg-white pt-2">
                    <button 
                      onClick={handleARCamera}
                      className="flex-[1.4] bg-[#451a03] text-white font-bold py-5 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-900/20"
                    >
                      <Camera size={20} /> AR Experience
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

      {/* FLOATING NAVIGATION BAR */}
      <div className="fixed bottom-6 inset-x-0 z-[110] flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md">
           {/* Your <BottomNav /> goes here */}
        </div>
      </div>
    </section>
  );
}



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
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 500], [0.5, 0]);

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
