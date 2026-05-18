import type { WizardData, GeneratedItinerary, FlightInfo } from '../types'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_KEY
const SESSION_KEY = 'decifrando_roteiros_sessao_id'

const headers = {
  'Content-Type': 'application/json',
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  Prefer: 'return=representation',
}

async function post(table: string, body: object) {
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  })
  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

async function patch(table: string, id: string, body: object) {
  await fetch(`${URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(body),
  })
}

async function get(table: string, query: string) {
  const res = await fetch(`${URL}/rest/v1/${table}?${query}`, { headers })
  return res.json()
}

// ─── Sessão ───────────────────────────────────────────────
export async function criarSessao(): Promise<string> {
  const row = await post('sessoes', { status: 'em_andamento' })
  const id = row?.id
  if (id) localStorage.setItem(SESSION_KEY, id)
  return id
}

export function getSessaoId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function clearSessaoId() {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Salvar voos ──────────────────────────────────────────
async function salvarVoos(sessaoId: string, legs: FlightInfo[], tipo: 'ida' | 'retorno') {
  // Remove voos anteriores desse tipo
  await fetch(`${URL}/rest/v1/voos?sessao_id=eq.${sessaoId}&tipo=eq.${tipo}`, {
    method: 'DELETE', headers,
  })
  // Insere novos
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]
    await post('voos', {
      sessao_id: sessaoId,
      tipo,
      ordem: i + 1,
      numero: leg.flightNumber,
      data: leg.date,
      companhia: leg.airline,
      origem_codigo: leg.originCode,
      origem_cidade: leg.origin,
      destino_codigo: leg.destinationCode,
      destino_cidade: leg.destination,
      partida: leg.departure,
      chegada: leg.arrival,
      duracao: leg.duration,
    })
  }
}

// ─── Salvar estado completo ───────────────────────────────
export async function salvarEstado(data: WizardData): Promise<string> {
  try {
    let sessaoId = getSessaoId()
    if (!sessaoId) sessaoId = await criarSessao()

    // Salva voos de ida
    if (data.outboundLegs?.length) {
      await salvarVoos(sessaoId, data.outboundLegs, 'ida')
    }

    // Salva voos de retorno
    if (data.returnLegs?.length) {
      await salvarVoos(sessaoId, data.returnLegs, 'retorno')
    }

    // Salva preferências (upsert)
    await fetch(`${URL}/rest/v1/preferencias?sessao_id=eq.${sessaoId}`, {
      method: 'DELETE', headers,
    })
    await post('preferencias', {
      sessao_id: sessaoId,
      cidades_count: data.citiesCount,
      cidades: (data as any).cities || [],
      perfil: data.travelProfile,
      estilos: data.travelStyles,
      transporte: data.transport,
      viajantes: data.travelersCount,
      observacoes: data.notes,
    })

    return sessaoId
  } catch (e) {
    console.error('Erro ao salvar estado:', e)
    return getSessaoId() || ''
  }
}

// ─── Salvar roteiro gerado ────────────────────────────────
export async function salvarRoteiro(sessaoId: string, itinerary: GeneratedItinerary) {
  try {
    // Salva roteiro principal
    const roteiro = await post('roteiros', {
      sessao_id: sessaoId,
      destino: itinerary.destination,
      resumo: itinerary.summary,
      custo_estimado: itinerary.totalEstimatedCost,
      dados_completos: itinerary,
    })

    if (!roteiro?.id) return

    // Salva dias e atividades
    for (let d = 0; d < itinerary.days.length; d++) {
      const day = itinerary.days[d]
      const dia = await post('roteiro_dias', {
        roteiro_id: roteiro.id,
        data: day.date,
        label: day.dayLabel,
        ordem: d + 1,
      })
      if (!dia?.id) continue
      for (let a = 0; a < day.activities.length; a++) {
        const act = day.activities[a]
        await post('roteiro_atividades', {
          dia_id: dia.id,
          horario: act.time,
          duracao: act.duration,
          titulo: act.title,
          descricao: act.description,
          tipo: act.type,
          custo_estimado: act.estimatedCost,
          dica: act.tips,
          link: act.link,
          ordem: a + 1,
        })
      }
    }

    // Salva hotéis
    for (let h = 0; h < itinerary.hotels.length; h++) {
      const hotel = itinerary.hotels[h]
      await post('roteiro_hoteis', {
        roteiro_id: roteiro.id,
        nome: hotel.name,
        categoria: hotel.category,
        localizacao: hotel.location,
        faixa_preco: hotel.priceRange,
        destaques: hotel.highlights,
        ordem: h + 1,
      })
    }

    // Atualiza status da sessão
    await patch('sessoes', sessaoId, { status: 'gerado' })
  } catch (e) {
    console.error('Erro ao salvar roteiro:', e)
  }
}

// ─── Recuperar sessão ─────────────────────────────────────
export async function recuperarSessao(sessaoId: string): Promise<Partial<WizardData> | null> {
  try {
    const voos = await get('voos', `sessao_id=eq.${sessaoId}&order=ordem.asc`)
    const prefs = await get('preferencias', `sessao_id=eq.${sessaoId}`)
    const pref = prefs?.[0]

    const toFlight = (v: any): FlightInfo => ({
      flightNumber: v.numero || '',
      date: v.data || '',
      airline: v.companhia || '',
      origin: v.origem_cidade || '',
      originCode: v.origem_codigo || '',
      destination: v.destino_cidade || '',
      destinationCode: v.destino_codigo || '',
      departure: v.partida || '',
      arrival: v.chegada || '',
      duration: v.duracao || '',
      stops: [],
    })

    const outLegs = voos.filter((v: any) => v.tipo === 'ida').map(toFlight)
    const retLegs = voos.filter((v: any) => v.tipo === 'retorno').map(toFlight)

    return {
      outboundFlight: outLegs[0] || null,
      outboundLegs: outLegs,
      returnFlight: retLegs[0] || null,
      returnLegs: retLegs,
      hasReturn: retLegs.length > 0,
      citiesCount: pref?.cidades_count || 1,
      cities: pref?.cidades || [],
      travelProfile: pref?.perfil || null,
      travelStyles: pref?.estilos || [],
      transport: pref?.transporte || null,
      travelersCount: pref?.viajantes || 2,
      notes: pref?.observacoes || '',
    } as any
  } catch (e) {
    console.error('Erro ao recuperar sessão:', e)
    return null
  }
}
