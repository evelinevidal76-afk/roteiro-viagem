const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

async function query(table: string, column: string, value: string): Promise<string> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?codigo=eq.${value.toUpperCase()}&select=*`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const data = await res.json()
    return data?.[0] || null
  } catch {
    return null as any
  }
}

export async function getAirportCity(code: string): Promise<string> {
  if (!code || code.length < 3) return ''
  const row = await query('aeroportos', 'codigo', code)
  return (row as any)?.cidade || ''
}

export async function getAirlineName(flightNumber: string): Promise<string> {
  if (!flightNumber || flightNumber.length < 2) return ''
  const code2 = flightNumber.slice(0, 2).toUpperCase()
  const row = await query('companhias', 'codigo', code2)
  if ((row as any)?.nome) return (row as any).nome
  const code3 = flightNumber.slice(0, 3).toUpperCase()
  const row3 = await query('companhias', 'codigo', code3)
  return (row3 as any)?.nome || ''
}
