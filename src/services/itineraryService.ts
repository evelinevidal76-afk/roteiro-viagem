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

  const MEAL_LABELS: Record<string, string> = {
    sem_refeicoes: 'sem refeições incluídas',
    cafe_da_manha: 'café da manhã incluído',
    meia_pensao: 'meia pensão (café da manhã + jantar incluídos)',
    pensao_completa: 'pensão completa (café, almoço e jantar incluídos)',
    all_inclusive: 'all inclusive (todas as refeições e bebidas incluídas)',
  }

  const hoteisTexto = hoteis.length > 0
    ? hoteis.map(h => {
        const regime = h.mealPlan ? ` — regime: ${MEAL_LABELS[h.mealPlan]}` : ''
        return `  ${h.city}: ${h.name}${regime}`
      }).join('\n')
    : '  Não informado (use sugestões genéricas)'

  // Regras de refeições baseadas no regime
  const regrasRefeicoes = hoteis
    .filter(h => h.mealPlan && h.mealPlan !== 'sem_refeicoes')
    .map(h => {
      if (h.mealPlan === 'cafe_da_manha') return `  - ${h.city}: o hotel serve café da manhã, não precisa sugerir café externo nessa cidade`
      if (h.mealPlan === 'meia_pensao') return `  - ${h.city}: o hotel serve café da manhã e jantar, sugira apenas almoço externo nessa cidade`
      if (h.mealPlan === 'pensao_completa') return `  - ${h.city}: o hotel serve todas as refeições, não sugira restaurantes externos nessa cidade`
      if (h.mealPlan === 'all_inclusive') return `  - ${h.city}: hotel all inclusive, todas as refeições e bebidas estão incluídas, não sugira restaurantes externos nessa cidade`
      return ''
    })
    .filter(Boolean)
    .join('\n')

  // Imagens dos hotéis para incluir no HTML
  const hoteisImagens = hoteis
    .filter(h => h.imageUrl || h.roomImageUrl)
    .map(h => {
      const imgs = []
      if (h.imageUrl) imgs.push(`    foto exterior: ${h.imageUrl}`)
      if (h.roomImageUrl) imgs.push(`    foto do quarto: ${h.roomImageUrl}`)
      return `  ${h.city} — ${h.name}:\n${imgs.join('\n')}`
    })
    .join('\n')

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
${regrasRefeicoes ? `\nREGRAS DE REFEIÇÕES (siga obrigatoriamente):\n${regrasRefeicoes}` : ''}
${hoteisImagens ? `\nIMAGENS DOS HOTÉIS (use no HTML da seção de hospedagem):\n${hoteisImagens}` : ''}

VOOS DE IDA:
${voosIda || '  Não informado'}

VOOS DE RETORNO:
${voosRetorno || '  Não informado'}

Gere HTML completo com estas seções:
- Cabeçalho com destino, resumo e custo estimado total
- Um bloco por dia com título do dia, data e lista de atividades (horário, título, descrição, dica, custo estimado)
- Para cada atividade de passeio ou restaurante, inclua uma imagem usando: <img src="https://loremflickr.com/800/200/{palavras-chave-em-ingles-separadas-por-virgula}" style="width:100%;border-radius:8px;margin:8px 0;object-fit:cover;max-height:180px" loading="lazy" alt="{nome da atividade}" onerror="this.style.display='none'">
- Seção de hospedagem confirmada com os hotéis escolhidos (ou sugestões genéricas se não informado). Se o hotel tem imagens fornecidas, exiba-as com <img src="{url}" style="width:100%;border-radius:8px;margin:8px 0;object-fit:cover;max-height:220px" loading="lazy" onerror="this.style.display='none'">

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
  onError: (msg: string) => void,
  activitiesToChange?: string[]
) {
  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const cities = (data as any).cities || []
  const destino = outLegs.length > 0 ? outLegs[outLegs.length - 1].destinationCode : '?'
  const cidadesTexto = cities.length > 0 ? cities.join(', ') : destino

  const dateBase = outLegs.length > 0 ? new Date(outLegs[0].date) : new Date()
  const dayDate = new Date(dateBase)
  dayDate.setDate(dayDate.getDate() + dayIndex)
  const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const regenerateNote = activitiesToChange && activitiesToChange.length > 0
    ? `\n\nSUBSTITUIÇÃO PARCIAL OBRIGATÓRIA: Mantenha TODAS as atividades deste dia EXATAMENTE como estão, EXCETO as listadas abaixo, que devem ser substituídas por alternativas completamente diferentes (mesmo horário, mesmo tipo de atividade, mas locais/restaurantes/experiências diferentes):\n${activitiesToChange.map(a => `  - ${a}`).join('\n')}`
    : attempt > 0
      ? `\n\nNOTA: Esta é a tentativa ${attempt + 1}. Sugira atividades COMPLETAMENTE DIFERENTES das anteriores — outros locais, outros restaurantes, outras experiências.`
      : ''

  // Extrai títulos de atividades já usadas nos dias anteriores
  const usedTitles: string[] = []
  for (const dayHtml of previousDays) {
    const re = /font-weight:\s*600[^>]*>([^<]{5,70})<\//gi
    let m: RegExpExecArray | null
    while ((m = re.exec(dayHtml)) !== null) {
      const t = m[1].trim()
      if (t.length >= 5 && !/^\d/.test(t) && !/^(Dia|Day|DIA|Hotel)\s/i.test(t)) {
        usedTitles.push(t)
      }
    }
  }
  const previousNote = previousDays.length > 0
    ? `\n\nDIAS ANTERIORES JÁ APROVADOS — NÃO REPITA NADA DISSO:\n${usedTitles.length > 0 ? usedTitles.map(t => `  - ${t}`).join('\n') : `  (${previousDays.length} dia(s) aprovado(s))`}\nIsso inclui restaurantes, passeios, museus, praias, mercados. Use locais e estabelecimentos completamente diferentes.`
    : ''

  // Descobre qual cidade e quais atrações correspondem a este dia
  const cityPlans = data.cityPlans || []
  let currentCityPlan: { city: string; days: number; selectedAttractions: string[] } | null = null
  if (cityPlans.length > 0) {
    let dayCount = 0
    for (const plan of cityPlans) {
      if (dayIndex < dayCount + plan.days) {
        currentCityPlan = plan
        break
      }
      dayCount += plan.days
    }
  }

  const cityAttractionNote = currentCityPlan && currentCityPlan.selectedAttractions.length > 0
    ? `\n\nCIDADE DESTE DIA: ${currentCityPlan.city}\nATRAÇÕES SELECIONADAS PELO VIAJANTE (priorize incluir as que ainda não foram usadas nos dias anteriores):\n${currentCityPlan.selectedAttractions.map(a => `  - ${a}`).join('\n')}`
    : ''

  const hoteisDia = (data.selectedHotels || []).filter(h => h.confirmed && h.name.trim())

  const MEAL_LABELS_DAY: Record<string, string> = {
    sem_refeicoes: 'sem refeições incluídas',
    cafe_da_manha: 'café da manhã incluído',
    meia_pensao: 'meia pensão (café da manhã + jantar incluídos)',
    pensao_completa: 'pensão completa (café, almoço e jantar incluídos)',
    all_inclusive: 'all inclusive (todas as refeições e bebidas incluídas)',
  }

  const hoteisNota = hoteisDia.length > 0
    ? `\n- Hoteis confirmados: ${hoteisDia.map(h => {
        const regime = h.mealPlan ? ` (${MEAL_LABELS_DAY[h.mealPlan]})` : ''
        return `${h.city}: ${h.name}${regime}`
      }).join(', ')}`
    : ''

  const regrasRefeicoesDia = hoteisDia
    .filter(h => h.mealPlan && h.mealPlan !== 'sem_refeicoes')
    .map(h => {
      if (h.mealPlan === 'cafe_da_manha') return `  - Hotel em ${h.city} serve café da manhã, não sugira café externo`
      if (h.mealPlan === 'meia_pensao') return `  - Hotel em ${h.city} serve café da manhã e jantar, sugira apenas almoço externo`
      if (h.mealPlan === 'pensao_completa') return `  - Hotel em ${h.city} serve todas as refeições, não sugira restaurantes externos`
      if (h.mealPlan === 'all_inclusive') return `  - Hotel em ${h.city} é all inclusive, não sugira restaurantes externos`
      return ''
    })
    .filter(Boolean)
    .join('\n')

  // Para o Dia 1, inclui horário de chegada para planejar corretamente
  const arrivalNote = dayIndex === 0 && outLegs.length > 0
    ? `\nIMPORTANTE — DIA DE CHEGADA: O voo de ida chega às ${outLegs[outLegs.length - 1].arrival} no destino. Considere pelo menos 1h para desembarque/imigração/bagagem e traslado ao hotel. NÃO coloque atividades antes da chegada. Se o voo chegar após as 14h, inicie com check-in, descanso e no máximo 1 atividade leve à tarde/noite.`
    : ''

  const prompt = `Você é um especialista em viagens de luxo. Crie o roteiro do Dia ${dayIndex + 1} de ${totalDays} de uma viagem em HTML com design de livreto de viagem — limpo, inspirador, fundo branco.

DADOS DA VIAGEM:
- Destino: ${destino}
- Cidades: ${cidadesTexto}
- Perfil: ${data.travelProfile}
- Estilos: ${data.travelStyles?.join(', ')}
- Transporte local: ${data.transport}
- Viajantes: ${data.travelersCount}
- Data do dia: ${dayLabel}
- Observações: ${data.notes || 'nenhuma'}${hoteisNota}${cityAttractionNote}${previousNote}${regenerateNote}${arrivalNote}
${regrasRefeicoesDia ? `\nREGRAS DE REFEIÇÕES (siga obrigatoriamente):\n${regrasRefeicoesDia}` : ''}

ESTRUTURA HTML OBRIGATÓRIA — use exatamente este layout:

<div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.12);margin-bottom:28px;">

  <!-- COVER: imagem de capa full-width do destino/cidade do dia -->
  <div style="position:relative;overflow:hidden;">
    <img src="https://source.unsplash.com/800x280/?cancun,beach,travel" style="width:100%;height:240px;object-fit:cover;display:block;" loading="lazy" onerror="this.style.display='none'" alt="Dia ${dayIndex + 1}">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.05) 30%,rgba(0,0,0,0.72));display:flex;flex-direction:column;justify-content:flex-end;padding:28px;">
      <div style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">DIA ${dayIndex + 1} DE ${totalDays}</div>
      <div style="color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">{titulo do dia e data}</div>
    </div>
  </div>

  <!-- ATIVIDADES -->
  <div style="padding:8px 28px 20px;">

    <!-- Repita este bloco para cada atividade (5 a 7 no total) -->
    <div style="padding:22px 0;border-bottom:1px solid #f3efe8;">
      <div style="color:#c9973c;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">09:00 — 10:30</div>
      <div style="color:#111827;font-size:16px;font-weight:600;margin-bottom:10px;">Nome da Atividade</div>
      <img src="https://source.unsplash.com/800x220/?cenote,mexico,turquoise,water" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:12px;" loading="lazy" onerror="this.style.display='none'" alt="atividade">
      <p style="color:#4b5563;font-size:13px;line-height:1.75;margin:0 0 12px;">Descrição da atividade</p>
      <div style="background:#fffbf2;border-left:3px solid #c9973c;border-radius:0 8px 8px 0;padding:10px 14px;color:#92400e;font-size:12px;line-height:1.55;margin-bottom:10px;">💡 Dica prática</div>
      <span style="color:#c9973c;font-size:12px;font-weight:600;">💰 Custo estimado: valor</span>
    </div>

  </div>

  <!-- HOTÉIS (apenas se houver hotel confirmado na cidade, coloque ao final do dia) -->
  <!-- Para cada hotel confirmado: gere link Booking.com direto para o hotel: https://www.booking.com/searchresults.html?ss={nome+do+hotel}+{cidade}&aid=7962462 -->
  <!-- Use imagem automática: <img src="https://source.unsplash.com/800x260/?{hotel-name},{city},hotel,lobby" ...> -->

</div>

REGRAS DE IMAGENS (OBRIGATÓRIO):
- Todas as URLs de imagem devem usar source.unsplash.com no formato: https://source.unsplash.com/LARGURAxALTURA/?palavra1,palavra2,palavra3
- NUNCA coloque variáveis ou chaves {{ }} dentro da URL. Use palavras reais em inglês do local.
- NUNCA use loremflickr.com — as fotos lá são aleatórias e irrelevantes.
- Exemplos corretos: https://source.unsplash.com/800x220/?eiffel,tower,paris — https://source.unsplash.com/800x220/?colosseum,rome,italy — https://source.unsplash.com/800x220/?sushi,restaurant,japan
- Para restaurantes use o tipo de culinária: https://source.unsplash.com/800x220/?mexican,food,restaurant — https://source.unsplash.com/800x220/?seafood,beach,restaurant
- Para hotéis: https://source.unsplash.com/800x260/?hotel,pool,luxury — https://source.unsplash.com/800x260/?resort,tropical,beach
- Para praias: https://source.unsplash.com/800x220/?beach,turquoise,water — Para cenotes: https://source.unsplash.com/800x220/?cenote,cave,water
- Para ruínas/arqueologia: https://source.unsplash.com/800x220/?ruins,archaeology,mexico
- Use sempre 2 a 3 palavras-chave específicas ao local, não genéricas como "travel" ou "tourism"
- Sugestão de ${regrasRefeicoesDia.includes('almoço') ? 'almoço' : 'almoço e jantar'} com nome real do restaurante, link Google Maps e imagem automática
- Links Booking.com sempre com &aid=7962462

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
