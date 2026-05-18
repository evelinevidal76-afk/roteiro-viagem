import type { WizardData, GeneratedItinerary } from '../types'

export async function generateItinerary(data: WizardData): Promise<GeneratedItinerary> {
  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const retLegs = (data as any).returnLegs || (data.returnFlight ? [data.returnFlight] : [])
  const cities = (data as any).cities || []

  const voosIda = outLegs.map((v: any, i: number) =>
    `  Voo ${i+1}: ${v.flightNumber} · ${v.originCode}→${v.destinationCode} · ${v.date} · ${v.departure}→${v.arrival}${v.duration ? ` · ${v.duration}` : ''}`
  ).join('\n')

  const voosRetorno = retLegs.map((v: any, i: number) =>
    `  Voo ${i+1}: ${v.flightNumber} · ${v.originCode}→${v.destinationCode} · ${v.date} · ${v.departure}→${v.arrival}${v.duration ? ` · ${v.duration}` : ''}`
  ).join('\n')

  const destino = outLegs.length > 0 ? outLegs[outLegs.length - 1].destinationCode : '?'
  const cidadesTexto = cities.length > 0 ? cities.join(', ') : destino

  const prompt = `Você é um especialista em viagens de luxo e milhas aéreas. Crie um roteiro de viagem detalhado em JSON.

DADOS DA VIAGEM:
- Destino final: ${destino}
- Cidades a visitar: ${cidadesTexto}
- Perfil: ${data.travelProfile}
- Estilos: ${data.travelStyles?.join(', ')}
- Transporte local: ${data.transport}
- Viajantes: ${data.travelersCount}
- Observações: ${data.notes || 'nenhuma'}

VOOS DE IDA:
${voosIda || '  Não informado'}

VOOS DE RETORNO:
${voosRetorno || '  Não informado'}

Responda APENAS com JSON válido, sem markdown, sem explicações, neste formato exato:
{
  "destination": "Nome do destino principal",
  "summary": "Resumo da viagem em 2 frases",
  "totalEstimatedCost": "R$ X.XXX - R$ X.XXX por pessoa",
  "days": [
    {
      "date": "2026-10-20",
      "dayLabel": "Dia 1 — Chegada em Cancún",
      "activities": [
        {
          "time": "15:35",
          "duration": "30min",
          "title": "Chegada ao aeroporto de Cancún",
          "description": "Desembarque e retirada de bagagens",
          "type": "voo",
          "estimatedCost": "incluso",
          "tips": "Dica útil aqui",
          "link": ""
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Nome do hotel",
      "category": "5 estrelas",
      "location": "Zona Hoteleira, Cancún",
      "priceRange": "R$ 800 - R$ 1.500/noite",
      "highlights": ["piscina infinity", "vista para o mar"]
    }
  ]
}`

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) throw new Error('Erro ao conectar com o servidor')

  const { text, error } = await res.json()
  if (error) throw new Error(error)
  if (!text) throw new Error('Resposta vazia do servidor')

  console.log('RESPOSTA BRUTA:', text)

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('JSON não encontrado na resposta')
    return JSON.parse(match[0])
  } catch {
    throw new Error('Erro ao processar o roteiro gerado')
  }
}
