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
}
