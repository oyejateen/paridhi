export type ProjectCategory =
  | 'Hospitals'
  | 'Colleges'
  | 'Bridges'
  | 'Metro stations'
  | 'Road projects'
  | 'Flyovers'
  | 'Smart city projects'

export interface CityProject {
  id: string
  name: string
  category: ProjectCategory
  lat: number
  lng: number
  description: string
  longDescription?: string
  status?: 'ongoing' | 'completed' | 'handovered'
  type?: string
  location?: string
  department?: string
  division?: string
  priority?: 'high_value' | 'normal'
  completionPercentage?: number
  enhancedContent?: string
}
