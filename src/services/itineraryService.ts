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

  const prompt = `Você é um especialista em viagens de luxo e milhas aéreas. Crie um roteiro de viagem completo em HTML bonito e bem estruturado.

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

Gere HTML completo com estas seções:
- Cabeçalho com destino, resumo e custo estimado total
- Um bloco por dia com título do dia, data e lista de atividades (horário, título, descrição, dica, custo estimado)
- Seção de hotéis sugeridos com nome, categoria, localização, preço e destaques

Use estas classes CSS inline para estilo dark/dourado:
- Fundo dos cards: background:#1a2235; border:1px solid #2d3a52; border-radius:12px; padding:20px; margin-bottom:16px
- Títulos dos dias: color:#c9973c; font-size:20px; font-weight:700; margin-bottom:4px
- Horários: color:#c9973c; font-weight:600; font-size:13px
- Títulos de atividade: color:#f0e6d3; font-weight:600; font-size:15px
- Descrições: color:#8892a4; font-size:13px; line-height:1.6
- Dicas: background:rgba(201,151,60,0.08); border:1px solid #2d3a52; border-radius:8px; padding:8px 12px; color:#c9973c; font-size:12px; margin-top:8px
- Hotéis: background:#1a2235; border:1px solid #2d3a52; border-radius:12px; padding:20px; margin-bottom:12px
- Tags de destaque: background:rgba(255,255,255,0.05); border:1px solid #2d3a52; border-radius:20px; padding:4px 10px; font-size:11px; color:#8892a4; display:inline-block; margin:3px

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
