import React, { useState, useEffect, useRef } from 'react'
import type { WizardData } from '../types'
import { Button, ErrorBox } from './ui'
import { generateDay } from '../services/itineraryService'

interface Props {
  data: WizardData
  dayIndex: number
  totalDays: number
  previousDays: string[]
  onApprove: (html: string) => void
  onBack?: (step?: number) => void
}

let imgSeedCounter = 0

// Converte URLs de imagem para picsum.photos com seed derivado das keywords
// source.unsplash.com foi descontinuado em 2023; loremflickr retorna fotos aleatórias
// picsum.photos é 100% confiável e varia pelo seed
function keywordSeed(keywords: string): string {
  let hash = 0
  for (let i = 0; i < keywords.length; i++) {
    hash = ((hash << 5) - hash + keywords.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString()
}

function fixImageUrls(html: string): string {
  return html.replace(/src="([^"]+)"/g, (match, url) => {
    // URL com placeholder {..} ou vazia
    if (url.includes('{') || url.includes('}') || url.trim() === '') {
      imgSeedCounter++
      return `src="https://picsum.photos/seed/t${imgSeedCounter * 17}/800/220"`
    }
    // loremflickr com keywords → picsum com seed derivado das keywords
    const flickrMatch = url.match(/loremflickr\.com\/(\d+)\/(\d+)\/(.+)/)
    if (flickrMatch) {
      const w = flickrMatch[1], h = flickrMatch[2], kw = flickrMatch[3]
      return `src="https://picsum.photos/seed/${keywordSeed(kw)}/${w}/${h}"`
    }
    // loremflickr sem keywords ou source.unsplash.com → picsum fallback
    if (/loremflickr\.com/.test(url) || /source\.unsplash\.com/.test(url)) {
      imgSeedCounter++
      return `src="https://picsum.photos/seed/t${imgSeedCounter * 17}/800/220"`
    }
    return match
  })
}

// Extrai lista de atividades do HTML gerado (horário + título)
function extractActivities(html: string): Array<{ time: string; title: string }> {
  const results: Array<{ time: string; title: string }> = []
  // Busca pares de horário (#c9973c + font-weight:600) seguido de título (#f0e6d3 + font-weight:600)
  const timeRe = /color:\s*#c9973c[^"]*font-weight:\s*600[^>]*>([^<]{3,15})<\//gi
  const titleRe = /color:\s*#f0e6d3[^"]*font-weight:\s*600[^>]*>([^<]{4,80})<\//gi

  const times = [...html.matchAll(timeRe)].map(m => m[1].trim())
  const titles = [...html.matchAll(titleRe)].map(m => m[1].trim())

  const len = Math.min(times.length, titles.length)
  for (let i = 0; i < len; i++) {
    results.push({ time: times[i], title: titles[i] })
  }
  // Se não emparelhou (estrutura diferente), retorna só títulos
  if (results.length === 0) {
    titles.forEach(t => results.push({ time: '', title: t }))
  }
  return results
}

export default function DayApproval({ data, dayIndex, totalDays, previousDays, onApprove, onBack }: Props) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [activitiesToChange, setActivitiesToChange] = useState<string[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [showBackMenu, setShowBackMenu] = useState(false)
  const [activities, setActivities] = useState<Array<{ time: string; title: string }>>([])
  const htmlRef = useRef('')
  const streamRef = useRef<HTMLDivElement>(null)
  const rafPendingRef = useRef(false)

  useEffect(() => {
    htmlRef.current = ''
    setHtml('')
    setLoading(true)
    setError(null)
    setShowSelector(false)
    setActivitiesToChange([])
    if (streamRef.current) streamRef.current.innerHTML = ''

    const stripFences = (raw: string) =>
      raw.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    // Durante o stream: substitui <img> por placeholders coloridos para evitar
    // flickering causado por imagens sendo destruídas/recriadas a cada chunk
    const stripImgsForStream = (html: string) =>
      html.replace(/<img([^>]*)>/gi, (_m, attrs) => {
        const hMatch = attrs.match(/height:\s*(\d+)/)
        const h = hMatch ? hMatch[1] : '180'
        return `<div style="width:100%;height:${h}px;background:rgba(201,151,60,0.06);border-radius:12px;margin-bottom:12px;border:1px solid rgba(201,151,60,0.12);"></div>`
      })

    generateDay(
      data, dayIndex, totalDays, previousDays, attempt,
      (chunk) => {
        htmlRef.current += chunk
        // Throttle via rAF — sem imagens durante streaming para evitar flickering
        if (!rafPendingRef.current) {
          rafPendingRef.current = true
          requestAnimationFrame(() => {
            if (streamRef.current) {
              streamRef.current.innerHTML = stripImgsForStream(stripFences(htmlRef.current))
            }
            rafPendingRef.current = false
          })
        }
      },
      () => {
        // Ao finalizar: React renderiza o HTML completo com imagens via dangerouslySetInnerHTML
        // setHtml + setLoading são batched — troca atômica sem flash
        const cleaned = fixImageUrls(stripFences(htmlRef.current))
        htmlRef.current = cleaned
        setHtml(cleaned)
        setLoading(false)
        setActivities(extractActivities(cleaned))
      },
      (msg) => { setError(msg); setLoading(false) },
      activitiesToChange.length > 0 ? activitiesToChange : undefined
    )
  }, [attempt, dayIndex])

  const toggleActivity = (title: string) => {
    setActivitiesToChange(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  const handlePartialRegenerate = () => {
    setShowSelector(false)
    setAttempt(a => a + 1)
  }

  const handleFullRegenerate = () => {
    setActivitiesToChange([])
    setShowSelector(false)
    setAttempt(a => a + 1)
  }

  const progressPct = Math.round((dayIndex / totalDays) * 100)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>
            Decifrando Roteiros
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Dia {dayIndex + 1} de {totalDays}
            {loading && <span style={{ marginLeft: 10, color: 'var(--gold)' }}>✦ Gerando...</span>}
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 220 }}>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: 'var(--gold)', borderRadius: 2, transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
            {dayIndex} de {totalDays} dias aprovados
          </div>
        </div>

        {onBack && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowBackMenu(v => !v)}
              style={{
                padding: '7px 14px', fontSize: 12, background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              ← Editar viagem
            </button>
            {showBackMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: '#1a2235', border: '1px solid var(--border)',
                borderRadius: 10, padding: '8px 0', minWidth: 220, zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                {[
                  { label: '✈️ Voos', step: 0 },
                  { label: '🗺️ Destinos e cidades', step: 1 },
                  { label: '👤 Perfil de viagem', step: 2 },
                  { label: '🎯 Estilos', step: 3 },
                  { label: '🚗 Transporte', step: 4 },
                  { label: '🏨 Hotéis', step: 5 },
                  { label: '📝 Detalhes e observações', step: 7 },
                ].map(item => (
                  <button
                    key={item.step}
                    onClick={() => { setShowBackMenu(false); onBack(item.step) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 16px', fontSize: 13,
                      background: 'none', border: 'none',
                      color: 'var(--cream)', cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,151,60,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Conteudo streamado */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%', paddingBottom: 140 }}>
        {!html && loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 40, height: 40,
              border: '2px solid var(--gold)', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Criando o Dia {dayIndex + 1}...</p>
            {activitiesToChange.length > 0 && (
              <p style={{ color: 'var(--gold)', fontSize: 12, marginTop: 8 }}>
                Substituindo {activitiesToChange.length} atividade(s)...
              </p>
            )}
          </div>
        )}

        {error && <ErrorBox message={error} />}
        {/* Durante streaming: DOM imperativo via ref (sem re-render, sem piscar) */}
        {loading && <div ref={streamRef} />}
        {/* Após concluir: React renderiza o HTML final com imagens via dangerouslySetInnerHTML */}
        {!loading && html && <div dangerouslySetInnerHTML={{ __html: html }} />}

        {/* Seletor de atividades para trocar */}
        {showSelector && activities.length > 0 && (
          <div style={{
            marginTop: 24,
            background: 'var(--navy-soft)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', marginBottom: 4 }}>
              Quais atividades você quer trocar?
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
              Marque as que não curtiu. As desmarcadas serão mantidas exatamente como estão.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activities.map((act, i) => {
                const checked = activitiesToChange.includes(act.title)
                return (
                  <label key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: checked ? 'rgba(201,151,60,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${checked ? 'rgba(201,151,60,0.4)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleActivity(act.title)}
                      style={{ accentColor: '#c9973c', width: 16, height: 16, flexShrink: 0 }}
                    />
                    <div>
                      {act.time && (
                        <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginRight: 8 }}>
                          {act.time}
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: 'var(--cream)' }}>{act.title}</span>
                    </div>
                  </label>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowSelector(false)}
                style={{
                  padding: '8px 16px', fontSize: 12, background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleFullRegenerate}
                style={{
                  padding: '8px 16px', fontSize: 12, background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                🔄 Trocar tudo
              </button>
              <button
                disabled={activitiesToChange.length === 0}
                onClick={handlePartialRegenerate}
                style={{
                  padding: '8px 18px', fontSize: 12, fontWeight: 600,
                  background: activitiesToChange.length > 0 ? 'var(--gold)' : 'rgba(201,151,60,0.2)',
                  border: 'none', borderRadius: 8,
                  color: activitiesToChange.length > 0 ? '#0d1521' : 'var(--muted)',
                  cursor: activitiesToChange.length > 0 ? 'pointer' : 'default',
                  fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                }}
              >
                Trocar {activitiesToChange.length > 0 ? `${activitiesToChange.length} selecionada(s)` : 'selecionadas'} →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Barra de ações */}
      {!loading && !error && html && !showSelector && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
          background: 'rgba(13,21,33,0.97)',
          position: 'sticky', bottom: 0,
        }}>
          <Button variant="secondary" onClick={() => setShowSelector(true)}>
            ✏️ Trocar algumas atividades
          </Button>
          <Button variant="secondary" onClick={handleFullRegenerate}>
            🔄 Gerar dia completamente diferente
          </Button>
          <Button onClick={() => onApprove(htmlRef.current)}>
            {dayIndex + 1 < totalDays
              ? `✓ Aprovar Dia ${dayIndex + 1} →`
              : `✓ Aprovar e ver roteiro completo →`
            }
          </Button>
        </div>
      )}

      {error && !loading && (
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 12, justifyContent: 'center',
        }}>
          <Button variant="secondary" onClick={handleFullRegenerate}>Tentar novamente</Button>
        </div>
      )}
    </div>
  )
}
