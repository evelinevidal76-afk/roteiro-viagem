import React, { useState, useEffect } from 'react'
import type { WizardData } from '../types'
import { StepHeader, NavButtons } from './ui'

interface Hotel {
  name: string
  category: string
  location: string
  priceRange: string
  highlights: string[]
  bookingUrl: string
}

interface Props {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

const CJ_AID = '7962462'

function buildBookingUrl(destination: string, checkIn: string, checkOut: string) {
  const dest = encodeURIComponent(destination)
  return `https://www.booking.com/searchresults.html?ss=${dest}&checkin=${checkIn}&checkout=${checkOut}&aid=${CJ_AID}`
}

export default function StepHotel({ data, update, onNext, onBack }: Props) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const retLegs = (data as any).returnLegs || (data.returnFlight ? [data.returnFlight] : [])
  const cities = (data as any).cities || []
  const destino = cities.length > 0 ? cities[0] : (outLegs.length > 0 ? outLegs[outLegs.length - 1].destinationCode : '?')
  const checkIn = outLegs.length > 0 ? outLegs[0].date : ''
  const checkOut = retLegs.length > 0 ? retLegs[0].date : ''

  useEffect(() => {
    const prompt = `Sugira exatamente 3 hotéis para ${destino} no período de ${checkIn} a ${checkOut} para ${data.travelersCount} viajante(s) com perfil "${data.travelProfile}".

Responda APENAS com JSON válido neste formato, sem markdown:
[
  {
    "name": "Nome do hotel",
    "category": "5 estrelas",
    "location": "Localização específica",
    "priceRange": "US$ 150 - US$ 250/noite",
    "highlights": ["vista para o mar", "café da manhã incluso", "spa"]
  }
]`

    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
      .then(r => r.json())
      .then(({ text }) => {
        const clean = text.replace(/```json|```/g, '').trim()
        const start = clean.indexOf('[')
        const end = clean.lastIndexOf(']')
        const parsed: Omit<Hotel, 'bookingUrl'>[] = JSON.parse(clean.slice(start, end + 1))
        setHotels(parsed.map(h => ({
          ...h,
          bookingUrl: buildBookingUrl(h.name + ' ' + destino, checkIn, checkOut),
        })))
        setLoading(false)
      })
      .catch(() => {
        setError('Erro ao buscar sugestões de hotéis')
        setLoading(false)
      })
  }, [])

  const handleSelect = (i: number) => {
    setSelected(i)
    update({ selectedHotel: hotels[i] } as any)
  }

  return (
    <div className="fade-up">
      <StepHeader
        title="Escolha seu hotel 🏨"
        subtitle={`Sugestões para ${destino} baseadas no seu perfil`}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 32, height: 32,
            border: '2px solid var(--gold)', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Buscando as melhores opções...</p>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>{error}</div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
          {hotels.map((hotel, i) => (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                background: 'var(--navy-soft)',
                border: `1px solid ${selected === i ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {selected === i && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'var(--gold)', color: '#0d1521',
                  borderRadius: '50%', width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>✓</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--cream)' }}>{hotel.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                    {hotel.category} · 📍 {hotel.location}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(201,151,60,0.12)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 12, color: 'var(--gold)',
                  fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {hotel.priceRange}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {hotel.highlights.map((h, j) => (
                  <span key={j} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, color: 'var(--muted)',
                  }}>{h}</span>
                ))}
              </div>

              
                href={hotel.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'inline-block',
                  background: '#003580',
                  color: 'white',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                🏨 Ver no Booking.com →
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Link direto para busca geral */}
      {!loading && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          
            href={buildBookingUrl(destino, checkIn, checkOut)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline' }}
          >
            Ver todos os hotéis disponíveis em {destino} →
          </a>
        </div>
      )}

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel={selected !== null ? 'Continuar com este hotel →' : 'Pular esta etapa →'}
      />
    </div>
  )
}
