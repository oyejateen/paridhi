import { useState, useEffect } from 'react'
import { Users, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { EnhancedProject } from '../data/projectsEnhanced'
import { enhanceProjectDescription, generateProjectMetadata } from '../lib/llm'

interface ProjectDetailProps {
  project: EnhancedProject
  distance?: number
  isExplored: boolean
  onExplore?: () => void
  onPostClick?: (projectId: string) => void
}

export function ProjectDetailCard({
  project,
  distance,
  isExplored,
  onExplore,
  onPostClick,
}: ProjectDetailProps) {
  const { user } = useAuth()
  const [showFull, setShowFull] = useState(false)
  const [enhancedDesc, setEnhancedDesc] = useState(project.description)

  useEffect(() => {
    const getEnhanced = async () => {
      const enhanced = await enhanceProjectDescription(project.description)
      setEnhancedDesc(enhanced)
    }
    getEnhanced()
  }, [project.description])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'ongoing':
        return 'bg-amber-100 text-amber-700'
      case 'handovered':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'ongoing':
        return <Zap className="w-4 h-4" />
      case 'handovered':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const metadata = generateProjectMetadata(project.description)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-base text-neutral-900">{project.name}</h3>
            <p className="text-sm text-neutral-600">{project.location}</p>
          </div>
          <span className="text-2xl">{project.category === 'Hospitals' ? '🏥' : '🏗️'}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
            project.status || 'ongoing',
          )}`}
        >
          {getStatusIcon(project.status || 'ongoing')}
          {project.status || 'ongoing'}
        </span>
        {project.completionPercentage && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {project.completionPercentage}% done
          </span>
        )}
        {distance !== undefined && (
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            {distance > 1 ? `${distance.toFixed(1)} km away` : `${(distance * 1000).toFixed(0)} m away`}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-sm text-neutral-700">{project.longDescription || project.description}</p>
        {showFull && enhancedDesc !== project.description && (
          <p className="text-sm text-neutral-600 italic border-l-2 border-orange-300 pl-3">
            💡 {enhancedDesc}
          </p>
        )}
      </div>

      {/* Project Metadata */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
        {metadata.keywords.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-neutral-500 mb-1">FOCUS</p>
            <div className="flex flex-wrap gap-1">
              {metadata.keywords.slice(0, 2).map((keyword) => (
                <span key={keyword} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-neutral-500 mb-1">IMPACT</p>
          <div className="flex items-center gap-1 text-xs text-neutral-700">
            <Users className="w-3 h-3" />
            ~{(metadata.estimatedCitizens / 1000).toFixed(0)}K people
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        {onPostClick && user && (
          <button
            onClick={() => onPostClick(project.id)}
            className="flex-1 rounded-lg bg-orange-500 text-white py-2 px-3 text-sm font-semibold active:scale-95 transition-transform"
          >
            💬 Post Update
          </button>
        )}
        {onExplore && !isExplored && (
          <button
            onClick={onExplore}
            className="flex-1 rounded-lg bg-green-500 text-white py-2 px-3 text-sm font-semibold active:scale-95 transition-transform"
          >
            ✓ Mark Explored
          </button>
        )}
        {isExplored && (
          <div className="flex-1 rounded-lg bg-green-50 border border-green-200 text-green-700 py-2 px-3 text-sm font-semibold flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4" /> Explored
          </div>
        )}
      </div>

      {/* More Details Toggle */}
      {enhancedDesc !== project.description && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="w-full text-sm text-orange-600 font-semibold hover:text-orange-700 transition-colors"
        >
          {showFull ? '▼ Show less' : '▲ Learn more'}
        </button>
      )}
    </div>
  )
}
