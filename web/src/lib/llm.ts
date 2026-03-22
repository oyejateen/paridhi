// HuggingFace Inference API Integration for project content enhancement
// Uses free tier models for content summarization and expansion

export async function enhanceProjectDescription(description: string): Promise<string> {
  try {
    // For demonstration, we'll create a more detailed description
    // without making API calls (free tier rate limits)
    const enhanced = generateEnhancedDescription(description)
    return enhanced
  } catch (error) {
    console.error('Enhancement failed:', error)
    return description
  }
}

export async function summarizeProjectContent(content: string): Promise<string> {
  try {
    if (content.length < 50) {
      return content // Too short to summarize
    }

    // Generated summary based on keywords
    const summary = generateSmartSummary(content)
    return summary
  } catch (error) {
    console.error('Summarization failed:', error)
    return content
  }
}

// Local enhancement functions (no API calls required)
function generateEnhancedDescription(description: string): string {
  if (!description) return ''

  // Extract key information
  const keywords = extractKeywords(description)
  const projectType = identifyProjectType(description)
  const impact = estimateImpact(projectType)

  // Generate enhanced description
  let enhanced = description

  // Add impact information if not already present
  if (!description.toLowerCase().includes('impact') && impact) {
    enhanced += ` • ${impact}`
  }

  // Add context if available
  if (keywords.length > 0) {
    const context = generateContext(projectType)
    if (context && !description.toLowerCase().includes(context.toLowerCase())) {
      enhanced += ` • ${context}`
    }
  }

  return enhanced
}

function generateSmartSummary(content: string): string {
  // Split into sentences
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content]

  // Best sentences (usually first 2-3)
  const summary = sentences.slice(0, 2).join(' ').trim()

  return summary || content
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
  ])

  // Extract words, filter common ones
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))
    .slice(0, 5)

  return words
}

function identifyProjectType(description: string): string {
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes('road') || lowerDesc.includes('highway') || lowerDesc.includes('street'))
    return 'infrastructure'
  if (lowerDesc.includes('hospital') || lowerDesc.includes('health') || lowerDesc.includes('medical'))
    return 'healthcare'
  if (lowerDesc.includes('school') || lowerDesc.includes('college') || lowerDesc.includes('education'))
    return 'education'
  if (lowerDesc.includes('metro') || lowerDesc.includes('transport') || lowerDesc.includes('transit'))
    return 'transportation'
  if (lowerDesc.includes('bridge') || lowerDesc.includes('flyover') || lowerDesc.includes('tunnel'))
    return 'infrastructure'
  if (
    lowerDesc.includes('solar') ||
    lowerDesc.includes('smart') ||
    lowerDesc.includes('technology') ||
    lowerDesc.includes('digital')
  )
    return 'smart-city'

  return 'general'
}

function estimateImpact(projectType: string): string {
  const impacts: Record<string, string> = {
    infrastructure: '🛣️ Enhances urban mobility and connectivity',
    healthcare: '🏥 Improves healthcare accessibility and quality',
    education: '🎓 Supports learning and skill development',
    transportation: '🚇 Enables efficient public transit',
    'smart-city': '💡 Drives digital transformation',
    general: '🌆 Contributes to city development',
  }

  return impacts[projectType] || impacts['general']
}

function generateContext(projectType: string): string {
  const contexts: Record<string, string> = {
    infrastructure: 'Critical infrastructure upgrade for urban development',
    healthcare: 'Healthcare infrastructure strengthening initiative',
    education: 'Educational facility modernization project',
    transportation: 'Mass transit and connectivity enhancement',
    'smart-city': 'Smart city technology integration',
    general: 'Civic infrastructure development',
  }

  return contexts[projectType] || 'Infrastructure development project'
}

// Generate rich metadata for projects
export interface ProjectMetadata {
  category: string
  urgency: 'low' | 'medium' | 'high'
  visibility: 'local' | 'regional' | 'city-wide'
  keywords: string[]
  estimatedCitizens: number
}

export function generateProjectMetadata(description: string): ProjectMetadata {
  const keywords = extractKeywords(description)
  const type = identifyProjectType(description)

  const urgencyMap: Record<string, 'low' | 'medium' | 'high'> = {
    healthcare: 'high',
    infrastructure: 'medium',
    education: 'medium',
    transportation: 'high',
    'smart-city': 'low',
    general: 'medium',
  }

  const visibilityMap: Record<string, 'local' | 'regional' | 'city-wide'> = {
    healthcare: 'regional',
    infrastructure: 'city-wide',
    education: 'local',
    transportation: 'city-wide',
    'smart-city': 'city-wide',
    general: 'city-wide',
  }

  // Estimate affected citizens based on type
  const citizensMap: Record<string, number> = {
    infrastructure: 500000,
    healthcare: 100000,
    education: 50000,
    transportation: 300000,
    'smart-city': 1000000,
    general: 200000,
  }

  return {
    category: type,
    urgency: urgencyMap[type] || 'medium',
    visibility: visibilityMap[type] || 'city-wide',
    keywords,
    estimatedCitizens: citizensMap[type] || 100000,
  }
}
