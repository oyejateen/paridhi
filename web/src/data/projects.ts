import type { CityProject, ProjectCategory } from '../types/projects'

export const categoryEmoji: Record<ProjectCategory, string> = {
  Hospitals: '🏥',
  Colleges: '🎓',
  Bridges: '🌉',
  'Metro stations': '🚇',
  'Road projects': '🛣️',
  Flyovers: '🚧',
  'Smart city projects': '💡',
}

export const cityProjects: CityProject[] = [
  {
    id: 'hosp-1',
    name: 'City Care Super Hospital Upgrade',
    category: 'Hospitals',
    lat: 28.6139,
    lng: 77.209,
    description: 'Critical care expansion and smart patient flow system.',
  },
  {
    id: 'college-1',
    name: 'North Urban College Redevelopment',
    category: 'Colleges',
    lat: 28.6218,
    lng: 77.2272,
    description: 'New innovation labs and green campus mobility.',
  },
  {
    id: 'bridge-1',
    name: 'Riverlink Smart Bridge',
    category: 'Bridges',
    lat: 28.6351,
    lng: 77.241,
    description: 'Bridge reinforcement with night safety lighting.',
  },
  {
    id: 'metro-1',
    name: 'Central Exchange Metro Station Phase 2',
    category: 'Metro stations',
    lat: 28.6315,
    lng: 77.2167,
    description: 'Accessibility expansion and digital wayfinding.',
  },
  {
    id: 'road-1',
    name: 'East Corridor Road Widening',
    category: 'Road projects',
    lat: 28.6077,
    lng: 77.246,
    description: 'Adaptive traffic lane optimization and resurfacing.',
  },
  {
    id: 'flyover-1',
    name: 'Sector 18 Flyover Link',
    category: 'Flyovers',
    lat: 28.5719,
    lng: 77.321,
    description: 'Congestion relief corridor joining two growth hubs.',
  },
  {
    id: 'smart-1',
    name: 'Smart Lighting and Sensor Grid',
    category: 'Smart city projects',
    lat: 28.6439,
    lng: 77.1652,
    description: 'IoT sensor deployment for civic quality metrics.',
  },
]
