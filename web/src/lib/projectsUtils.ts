import { enhancedProjects, type EnhancedProject } from '../data/projectsEnhanced'

// Filter projects by category
export function filterProjectsByCategory(category: string): EnhancedProject[] {
  if (category === 'All' || category === 'All Projects') {
    return enhancedProjects
  }

  const categoryMap: Record<string, string[]> = {
    'Roads': ['ongoing', 'completed', 'handovered'],
    'Buildings': ['Hospitals', 'Universities', 'Colleges', 'Schools'],
    'Healthcare': ['Hospitals'],
    'Smart City': ['Smart city projects'],
    'Transport': ['Metro', 'Transit', 'Public Transport'],
    'Maintenance': ['maintenance', 'repair', 'renovation'],
  }

  const matchTypes = categoryMap[category] || []

  return enhancedProjects.filter(proj => {
    // Match by type or category
    return matchTypes.some(match => 
      proj.type?.toLowerCase().includes(match.toLowerCase()) ||
      proj.category?.toLowerCase().includes(match.toLowerCase()) ||
      proj.name?.toLowerCase().includes(match.toLowerCase())
    )
  })
}

// Search projects by name or location
export function searchProjects(query: string): EnhancedProject[] {
  if (!query.trim()) return enhancedProjects

  const lowerQuery = query.toLowerCase()
  return enhancedProjects.filter(proj =>
    proj.name.toLowerCase().includes(lowerQuery) ||
    proj.location.toLowerCase().includes(lowerQuery) ||
    proj.description.toLowerCase().includes(lowerQuery)
  )
}

// Combined filter and search
export function filterAndSearchProjects(
  query: string,
  category: string
): EnhancedProject[] {
  let results = enhancedProjects

  // Apply category filter
  if (category && category !== 'All' && category !== 'All Projects') {
    results = filterProjectsByCategory(category)
  }

  // Apply search query
  if (query.trim()) {
    const lowerQuery = query.toLowerCase()
    results = results.filter(proj =>
      proj.name.toLowerCase().includes(lowerQuery) ||
      proj.location.toLowerCase().includes(lowerQuery) ||
      proj.description.toLowerCase().includes(lowerQuery)
    )
  }

  return results
}

// Get project by ID
export function getProjectById(id: string): EnhancedProject | undefined {
  return enhancedProjects.find(proj => proj.id === id)
}

// Get category emoji
export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'Hospitals': '🏥',
    'Universities': '🎓',
    'Colleges': '🎓',
    'Schools': '🎓',
    'Metro': '🚇',
    'Transit': '🚌',
    'Public Transport': '🚌',
    'Smart city projects': '💡',
    'Bridges': '🌉',
    'Roads': '🛣️',
    'Building': '🏗️',
    'Infrastructure': '🏗️',
  }

  return emojiMap[category] || '📍'
}

// Get all available categories
export function getAvailableCategories(): string[] {
  const categories = new Set<string>()
  enhancedProjects.forEach(proj => {
    if (proj.category) categories.add(proj.category)
  })
  return Array.from(categories).sort()
}
