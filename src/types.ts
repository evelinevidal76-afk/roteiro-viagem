export interface FlightInfo {
  flightNumber: string
  date: string
  airline: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departure: string
  arrival: string
  duration: string
  stops: StopInfo[]
}

export interface StopInfo {
  airport: string
  airportCode: string
  arrival: string
  departure: string
  duration: string
}

export interface ReturnFlight {
  flightNumber: string
  date: string
}

export type TravelProfile = 'economico' | 'intermediario' | 'luxo' | 'misto'

export type TravelStyle =
  | 'gastronomico'
  | 'cultural'
  | 'aventura'
  | 'relax'
  | 'compras'
  | 'natureza'
  | 'historico'
  | 'praias'
  | 'vida_noturna'
  | 'familia'

export type Transport = 'carro' | 'transporte_publico' | 'misto' | 'tour_guiado'

export type MealPlan =
  | 'sem_refeicoes'
  | 'cafe_da_manha'
  | 'meia_pensao'
  | 'pensao_completa'
  | 'all_inclusive'

export interface SelectedHotel {
  city: string
  name: string
  confirmed: boolean
  mealPlan: MealPlan | null
  imageUrl: string
  roomImageUrl: string
}

export interface CityPlan {
  city: string
  days: number
  selectedAttractions: string[]
}

export interface WizardData {
  // Step 1 — Voo
  outboundFlight: FlightInfo | null
  outboundLegs: FlightInfo[]
  returnFlight: FlightInfo | null
  returnLegs: FlightInfo[]
  hasReturn: boolean
  // Step 2 — Destino
  citiesCount: number
  cities: string[]
  // Step 3 — Perfil
  travelProfile: TravelProfile | null
  // Step 4 — Estilo
  travelStyles: TravelStyle[]
  // Step 5 — Transporte
  transport: Transport | null
  // Step 6 — Hotel
  selectedHotels: SelectedHotel[]
  // Step 7 — Carro (any para campos extras gerados dinamicamente)
  // Step 8 — Detalhes
  travelersCount: number
  notes: string
  // Step 9 — Plano por cidade
  cityPlans: CityPlan[]
}

export interface ItineraryDay {
  date: string
  dayLabel: string
  activities: Activity[]
}

export interface Activity {
  time: string
  duration: string
  title: string
  description: string
  type: 'hotel' | 'restaurante' | 'passeio' | 'transporte' | 'voo' | 'livre'
  estimatedCost?: string
  tips?: string
  link?: string
}

export interface GeneratedItinerary {
  destination: string
  summary: string
  days: ItineraryDay[]
  hotels: HotelSuggestion[]
  totalEstimatedCost: string
}

export interface HotelSuggestion {
  name: string
  category: string
  location: string
  priceRange: string
  highlights: string[]
}
