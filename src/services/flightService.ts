import type { FlightInfo } from '../types'

const API_KEY = import.meta.env.VITE_AVIATIONSTACK_KEY

export async function fetchFlight(
  flightNumber: string,
  date: string
): Promise<FlightInfo> {
  const iata = flightNumber.replace(/\s/g, '').toUpperCase()

  try {
    const res = await fetch(
      `https://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${iata}&flight_date=${date}`
    )
    const data = await res.json()

    if (!data.data || data.data.length === 0) {
      throw new Error('Voo não encontrado')
    }

    const flight = data.data[0]
    const dep = flight.departure
    const arr = flight.arrival

    const depTime = dep.estimated || dep.scheduled
    const arrTime = arr.estimated || arr.scheduled

    const durationMs =
      new Date(arrTime).getTime() - new Date(depTime).getTime()
    const durationH = Math.floor(durationMs / 3600000)
    const durationM = Math.floor((durationMs % 3600000) / 60000)

    return {
      flightNumber: flight.flight.iata,
      date,
      airline: flight.airline.name,
      origin: dep.airport,
      originCode: dep.iata,
      destination: arr.airport,
      destinationCode: arr.iata,
      departure: formatTime(depTime),
      arrival: formatTime(arrTime),
      duration: `${durationH}h${durationM > 0 ? ` ${durationM}min` : ''}`,
      stops: [],
    }
  } catch {
    // Fallback: retorna dados básicos para o usuário confirmar
    throw new Error(
      `Não foi possível buscar o voo ${flightNumber}. Verifique o número e a data.`
    )
  }
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
