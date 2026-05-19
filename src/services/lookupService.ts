import { AIRPORTS, AIRLINES } from '../data/airports'
import { AIRPORT_OFFSETS } from '../data/timezones'

export async function getAirportCity(code: string): Promise<string> {
  if (!code || code.length < 3) return ''
  return AIRPORTS[code.toUpperCase()] || ''
}

export function getAirportOffset(code: string): number | null {
  const val = AIRPORT_OFFSETS[code.toUpperCase()]
  return val !== undefined ? val : null
}

export async function getAirlineName(flightNumber: string): Promise<string> {
  if (!flightNumber || flightNumber.length < 2) return ''
  const code2 = flightNumber.slice(0, 2).toUpperCase()
  if (AIRLINES[code2]) return AIRLINES[code2]
  const code3 = flightNumber.slice(0, 3).toUpperCase()
  return AIRLINES[code3] || ''
}
