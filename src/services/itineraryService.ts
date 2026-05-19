import type { WizardData } from '../types'

export async function generateItineraryStream(
  data: WizardData,
  onChunk: (html: string) => void,
  onDone: () => void,
  onError: (msg: string) => void
) {
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

  const hoteis = (data.selectedHotels || []).filter(h => h.confirmed && h.name.trim())
  const hoteisTexto = hoteis.length > 0
    ? hoteis.map(h => `  ${h.city}: ${h.name}`).join('\n')
    : '  Não informado (use sugestões genéricas)'

  const prompt = `Você é um especialista em viagens de luxo e milhas aéreas. Crie um roteiro de viagem completo em HTML bonito e bem estruturado.

DADOS DA VIAGEM:
- Destino final: ${destino}
- Cidades a visitar: ${cidadesTexto}
- Perfil: ${data.travelProfile}
- Estilos: ${data.travelStyles?.join(', ')}
- Transporte local: ${data.transport}
- Viajantes: ${data.travelersCount}
- Observações: ${data.notes || 'nenhuma'}

HOTÉIS ESCOLHIDOS (mencione-os nas atividades de check-in/check-out):
${hoteisTexto}

VOOS DE IDA:
${voosIda || '  Não informado'}

VOOS DE RETORNO:
${voosRetorno || '  Não informado'}

Gere HTML completo com estas seções:
- Cabeçalho com destino, resumo e custo estimado total
- Um bloco por dia com título do dia, data e lista de atividades (horário, título, descrição, dica, custo estimado)
- Seção de hospedagem confirmada com os hotéis escolhidos (ou sugestões genéricas se não informado)

Use estas classes CSS inline para estilo dark/dourado:
- Fundo dos cards: background:#1a2235; border:1px solid #2d3a52; border-radius:12px; padding:20px; margin-bottom:16px
- Títulos dos dias: color:#c9973c; font-size:20px; font-weight:700; margin-bottom:4px
- Horários: color:#c9973c; font-weight:600; font-size:13px
- Títulos de atividade: color:#f0e6d3; font-weight:600; font-size:15px
- Descrições: color:#8892a4; font-size:13px; line-height:1.6
- Dicas: background:rgba(201,151,60,0.08); border:1px solid #2d3a52; border-radius:8px; padding:8px 12px; color:#c9973c; font-size:12px; margin-top:8px
- Hotéis: background:#1a2235; border:1px solid #2d3a52; border-radius:12px; padding:20px; margin-bottom:12px
- Tags de destaque: background:rgba(255,255,255,0.05); border:1px solid #2d3a52; border-radius:20px; padding:4px 10px; font-size:11px; color:#8892a4; display:inline-block; margin:3px

IMPORTANTE: qualquer link do Booking.com deve conter obrigatoriamente o parâmetro &aid=7962462 na URL.

Responda APENAS com o HTML, sem markdown, sem explicações.`

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) throw new Error('Erro ao conectar com o servidor')

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6)
        if (raw === '[DONE]') { onDone(); return }
        try {
          const { text } = JSON.parse(raw)
          if (text) onChunk(text)
        } catch {}
      }
    }
    onDone()
  } catch (e: any) {
    onError(e.message || 'Erro desconhecido')
  }
}

export async function generateDay(
  data: WizardData,
  dayIndex: number,
  totalDays: number,
  previousDays: string[],
  attempt: number,
  onChunk: (html: string) => void,
  onDone: () => void,
  onError: (msg: string) => void
) {
  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const cities = (data as any).cities || []
  const destino = outLegs.length > 0 ? outLegs[outLegs.length - 1].destinationCode : '?'
  const cidadesTexto = cities.length > 0 ? cities.join(', ') : destino

  const dateBase = outLegs.length > 0 ? new Date(outLegs[0].date) : new Date()
  const dayDate = new Date(dateBase)
  dayDate.setDate(dayDate.getDate() + dayIndex)
  const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const regenerateNote = attempt > 0
    ? `\n\nNOTA: Esta e a tentativa ${attempt + 1}. Sugira atividades completamente diferentes das anteriores para este dia.`
    : ''

  const previousNote = previousDays.length > 0
    ? `\n\nDias ja aprovados: ${previousDays.length} dia(s). Nao repita atividades ou restaurantes dos dias anteriores.`
    : ''

  const hoteisDia = (data.selectedHotels || []).filter(h => h.confirmed && h.name.trim())
  const hoteisNota = hoteisDia.length > 0
    ? `\n- Hoteis confirmados: ${hoteisDia.map(h => `${h.city}: ${h.name}`).join(', ')}`
    : ''

  const prompt = `Voce e um especialista em viagens de luxo. Crie o roteiro do Dia ${dayIndex + 1} de ${totalDays} de uma viagem.

DADOS DA VIAGEM:
- Destino: ${destino}
- Cidades: ${cidadesTexto}
- Perfil: ${data.travelProfile}
- Estilos: ${data.travelStyles?.join(', ')}
- Transporte local: ${data.transport}
- Viajantes: ${data.travelersCount}
- Data do dia: ${dayLabel}
- Observacoes: ${data.notes || 'nenhuma'}${hoteisNota}${previousNote}${regenerateNote}

Gere HTML apenas para ESTE DIA com:
- Titulo do dia (Dia ${dayIndex + 1} - ${dayLabel})
- 5 a 7 atividades com horario, titulo, descricao curta, dica e custo estimado
- Sugestao de restaurante para almoco e jantar

Use estilos inline dark/dourado:
- Card do dia: background:#1a2235; border:1px solid #2d3a52; border-radius:12px; padding:20px; margin-bottom:16px
- Titulo: color:#c9973c; font-size:20px; font-weight:700; margin-bottom:16px
- Horarios: color:#c9973c; font-weight:600; font-size:13px
- Titulos atividade: color:#f0e6d3; font-weight:600; font-size:15px
- Descricoes: color:#8892a4; font-size:13px; line-height:1.6
- Dicas: background:rgba(201,151,60,0.08); border:1px solid #2d3a52; border-radius:8px; padding:8px 12px; color:#c9973c; font-size:12px; margin-top:8px

IMPORTANTE: qualquer link do Booking.com deve conter obrigatoriamente o parâmetro &aid=7962462 na URL.

Responda APENAS com o HTML, sem markdown, sem explicacoes.`

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) throw new Error('Erro ao conectar com o servidor')

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6)
        if (raw === '[DONE]') { onDone(); return }
        try {
          const { text } = JSON.parse(raw)
          if (text) onChunk(text)
        } catch {}
      }
    }
    onDone()
  } catch (e: any) {
    onError(e.message || 'Erro desconhecido')
  }
}
