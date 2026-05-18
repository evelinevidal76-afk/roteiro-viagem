import type { WizardData, GeneratedItinerary } from '../types'

const PROFILE_LABELS = {
  economico: 'Econômico (hostels, restaurantes locais, transporte público)',
  intermediario: 'Intermediário (hotéis 3-4 estrelas, restaurantes variados)',
  luxo: 'Luxo (hotéis 5 estrelas, restaurantes finos, experiências exclusivas)',
  misto: 'Misto (combina categorias conforme a atividade)',
}

const STYLE_LABELS: Record<string, string> = {
  gastronomico: 'Gastronômico',
  cultural: 'Cultural',
  aventura: 'Aventura',
  relax: 'Relax/Descanso',
  compras: 'Compras',
  natureza: 'Natureza',
  historico: 'Histórico/Arqueológico',
  praias: 'Praias',
  vida_noturna: 'Vida Noturna',
  familia: 'Família com crianças',
}

const TRANSPORT_LABELS = {
  carro: 'Aluguel de carro',
  transporte_publico: 'Transporte público (ônibus, metrô, trem)',
  misto: 'Misto (carro + transporte público)',
  tour_guiado: 'Tours guiados contratados',
}

export async function generateItinerary(
  data: WizardData
): Promise<GeneratedItinerary> {
  const flight = data.outboundFlight!
  const returnFlight = data.returnFlight

  const prompt = `Você é um especialista em roteiros de viagem para brasileiros que viajam usando milhas aéreas.

Crie um roteiro de viagem COMPLETO e DETALHADO com base nas informações abaixo:

VOOS:
- Ida: ${flight.flightNumber} | ${flight.origin} (${flight.originCode}) → ${flight.destination} (${flight.destinationCode})
  Data: ${flight.date} | Partida: ${flight.departure} | Chegada: ${flight.arrival}
${returnFlight ? `- Retorno: ${returnFlight.flightNumber} | Data: ${returnFlight.date}` : '- Sem voo de retorno definido'}

DESTINO:
- Cidade(s) base: ${data.citiesCount} cidade(s)
- Destino principal: ${flight.destination}

PERFIL DO VIAJANTE:
- Estilo de viagem: ${PROFILE_LABELS[data.travelProfile!]}
- Interesses: ${data.travelStyles.map(s => STYLE_LABELS[s]).join(', ')}
- Transporte local: ${TRANSPORT_LABELS[data.transport!]}
- Número de viajantes: ${data.travelersCount}
${data.notes ? `- Observações especiais: ${data.notes}` : ''}

INSTRUÇÕES PARA O ROTEIRO:
1. Organize por dia, com horários específicos para cada atividade
2. Inclua sugestões de restaurantes alinhados ao perfil
3. Sugira hotéis compatíveis com o perfil (mínimo 2 opções)
4. Para cada atividade inclua: horário, duração estimada, custo aproximado em USD/local, dicas práticas
5. Considere tempo de deslocamento entre atividades
6. Primeiro e último dia: considere horários de chegada/partida dos voos
7. Inclua dicas culturais e práticas específicas do destino
8. Sugira o melhor momento para cada atração (clima, filas, luz para fotos)

Responda APENAS com JSON válido no seguinte formato (sem markdown, sem explicações):
{
  "destination": "nome da cidade/destino",
  "summary": "resumo de 2-3 linhas do roteiro",
  "days": [
    {
      "date": "DD/MM/AAAA",
      "dayLabel": "Dia 1 — Nome do tema do dia",
      "activities": [
        {
          "time": "HH:MM",
          "duration": "Xh",
          "title": "Nome da atividade",
          "description": "Descrição detalhada com dicas práticas",
          "type": "hotel|restaurante|passeio|transporte|voo|livre",
          "estimatedCost": "USD XX por pessoa",
          "tips": "Dica prática importante",
          "link": "https://site-oficial.com (opcional)"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Nome do Hotel",
      "category": "3 estrelas|4 estrelas|5 estrelas|Hostel|Resort",
      "location": "Bairro/região",
      "priceRange": "USD XX-XX por noite",
      "highlights": ["diferencial 1", "diferencial 2", "diferencial 3"]
    }
  ],
  "totalEstimatedCost": "USD XX-XX por pessoa (exceto voos)"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const result = await response.json()
  const text = result.content?.[0]?.text || ''

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as GeneratedItinerary
  } catch {
    throw new Error('Erro ao processar o roteiro gerado. Tente novamente.')
  }
}
