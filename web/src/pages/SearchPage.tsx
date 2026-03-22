import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Globe, ChevronRight, X } from 'lucide-react'
import { enhancedProjects } from '../data/projectsEnhanced'
import { filterAndSearchProjects, getCategoryEmoji } from '../lib/projectsUtils'

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('filter') || 'All'
  )

  // Available categories from our project data
  const categories = [
    'All',
    'Roads',
    'Healthcare',
    'Smart City',
    'Transport',
    'Maintenance',
    'Buildings',
  ]

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return filterAndSearchProjects(query, selectedCategory)
  }, [query, selectedCategory])

  const handleProjectClick = (projectId: string) => {
    navigate('/explore', { state: { projectId } })
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
      {/* 1. HEADER */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-[#451a03]">
            Explore
          </h1>
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mt-2">
            {filteredProjects.length} Projects Found
          </p>
        </div>
        <div className="h-12 w-12 bg-[#451a03] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
          <Globe size={20} className="text-white" />
        </div>
      </header>

      {/* 2. SEARCH INPUT */}
      <section className="px-6 pb-6 space-y-4">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#451a03] group-focus-within:text-orange-500 transition-colors"
            size={22}
            strokeWidth={3}
          />
          <input
            type="text"
            placeholder="Search by project name..."
            className="w-full bg-white border-2 border-[#451a03]/10 rounded-2xl py-5 pl-14 pr-12 text-sm font-black placeholder:text-stone-400 outline-none focus:border-[#451a03] transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-orange-600 transition-colors"
            >
              <X size={18} strokeWidth={3} />
            </button>
          )}
        </div>
      </section>

      {/* 3. CATEGORY FILTER BUTTONS */}
      <section className="px-6 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-xs font-black transition-all active:scale-90 ${
                selectedCategory === cat
                  ? 'bg-[#451a03] text-white shadow-xl shadow-orange-900/20'
                  : 'bg-white text-[#451a03] border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 4. PROJECTS LIST */}
      <section className="px-4">
        <div className="space-y-3">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="w-full text-left bg-white p-5 rounded-[32px] border-2 border-stone-100 shadow-sm flex items-center justify-between hover:border-[#451a03]/20 transition-all active:scale-95 hover:shadow-md"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 bg-[#451a03] rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[#451a03] uppercase tracking-tight line-clamp-2">
                      {project.name}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-stone-400 uppercase mt-1">
                      <MapPin size={10} className="text-orange-600 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    {project.status && (
                      <div className="text-[8px] font-bold text-orange-600 uppercase mt-1 capitalize">
                        {project.status}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300 shrink-0 ml-2" />
              </button>
            ))
          ) : (
            <div className="py-20 text-center bg-stone-50 rounded-[40px] border-2 border-dashed border-stone-200">
              <p className="text-xs font-black text-stone-300 uppercase tracking-widest">
                No Projects Found
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setSelectedCategory('All')
                }}
                className="mt-4 text-[10px] font-black text-orange-600 uppercase border-b-2 border-orange-600 hover:text-orange-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

