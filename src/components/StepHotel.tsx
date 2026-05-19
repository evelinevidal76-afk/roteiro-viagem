import React, { useState } from 'react'
import type { WizardData, TravelProfile, SelectedHotel, MealPlan } from '../types'
import { StepHeader, NavButtons } from './ui'

const CJ_AID = '7962462'

const MEAL_PLANS: { value: MealPlan; label: string; icon: string; description: string }[] = [
  { value: 'sem_refeicoes', label: 'Sem refeições', icon: '🍽️', description: 'Nenhuma refeição incluída' },
  { value: 'cafe_da_manha', label: 'Café da manhã', icon: '☕', description: 'Café da manhã incluído' },
  { value: 'meia_pensao', label: 'Meia pensão', icon: '🌅', description: 'Café + jantar incluídos' },
  { value: 'pensao_completa', label: 'Pensão completa', icon: '🍳', description: 'Café, almoço e jantar' },
  { value: 'all_inclusive', label: 'All inclusive', icon: '✨', description: 'Tudo incluído' },
]

interface ProfileConfig {
  reviewMin: number
  reviewLabel: string
  starsFilter: string
  starsLabel: string
  order: string
  orderLabel: string
  icon: string
}

const PROFILE_CONFIG: Record<string, ProfileConfig> = {
  economico: {
    reviewMin: 80,
    reviewLabel: 'Nota 8,0+',
    starsFilter: '2%7C3',
    starsLabel: '2 a 3 estrelas',
    order: 'price',
    orderLabel: 'Mais baratos primeiro',
    icon: '💰',
  },
  intermediario: {
    reviewMin: 85,
    reviewLabel: 'Nota 8,5+',
    starsFilter: '3%7C4',
    starsLabel: '3 a 4 estrelas',
    order: 'review_score_and_count',
    orderLabel: 'Melhor avaliados',
    icon: '⭐',
  },
  luxo: {
    reviewMin: 90,
    reviewLabel: 'Nota 9,0+ (Excepcional)',
    starsFilter: '4%7C5',
    starsLabel: '4 a 5 estrelas',
    order: 'class_and_price',
    orderLabel: 'Mais luxuosos',
    icon: '✨',
  },
  misto: {
    reviewMin: 85,
    reviewLabel: 'Nota 8,5+',
    starsFilter: '3%7C4%7C5',
    starsLabel: '3 a 5 estrelas',
    order: 'review_score_and_count',
    orderLabel: 'Melhor avaliados',
    icon: '🎯',
  },
}

function buildBookingUrl(
  destination: string,
  checkIn: string,
  checkOut: string,
  profile: TravelProfile | null,
  adults: number
): string {
  const dest = encodeURIComponent(destination)
  const cfg = PROFILE_CONFIG[profile || 'intermediario']
  const nflt = `review_score%3D${cfg.reviewMin}%7Cclass%3D${cfg.starsFilter}`
  return (
    `https://www.booking.com/searchresults.html` +
    `?ss=${dest}` +
    `&checkin=${checkIn}` +
    `&checkout=${checkOut}` +
    `&group_adults=${adults}` +
    `&aid=${CJ_AID}` +
    `&nflt=${nflt}` +
    `&order=${cfg.order}` +
    `&lang=pt-br`
  )
}

interface Props {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepHotel({ data, update, onNext, onBack }: Props) {
  const cities: string[] = (data as any).cities || []
  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const retLegs = (data as any).returnLegs || (data.returnFlight ? [data.returnFlight] : [])
  const checkIn: string = outLegs.length > 0 ? outLegs[0].date : ''
  const checkOut: string = retLegs.length > 0 ? retLegs[0].date : ''

  const cfg = PROFILE_CONFIG[data.travelProfile || 'intermediario']

  const [choices, setChoices] = useState<SelectedHotel[]>(
    () => cities.map(city => {
      const saved = data.selectedHotels?.find(h => h.city === city)
      return {
        city,
        name: saved?.name || '',
        confirmed: saved?.confirmed || false,
        mealPlan: saved?.mealPlan || null,
        imageUrl: saved?.imageUrl || '',
        roomImageUrl: saved?.roomImageUrl || '',
        pricePerNightBRL: saved?.pricePerNightBRL || 0,
        nights: saved?.nights || 1,
        hotelPaid: saved?.hotelPaid || false,
      }
    })
  )

  const updateChoice = (i: number, patch: Partial<SelectedHotel>) => {
    const next = choices.map((h, j) => j === i ? { ...h, ...patch } : h)
    setChoices(next)
    update({ selectedHotels: next })
  }

  const allConfirmed = choices.length > 0 && choices.every(h => h.confirmed)

  return (
    <div className="fade-up">
      <StepHeader
        title="Escolha seus hotéis 🏨"
        subtitle="Abrimos o Booking.com já filtrado com as melhores opções para o seu perfil."
      />

      {/* Badge de filtros ativos */}
      <div style={{
        background: 'rgba(201,151,60,0.08)',
        border: '1px solid rgba(201,151,60,0.25)',
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>{cfg.icon}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', textTransform: 'capitalize' }}>
            Perfil {data.travelProfile} — filtros ativos
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {cfg.reviewLabel} · {cfg.starsLabel} · {cfg.orderLabel}
          </div>
        </div>
      </div>

      {cities.length === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
          Nenhuma cidade selecionada. Volte ao passo Destino.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
          {cities.map((city, i) => (
            <div key={i} style={{
              background: 'var(--navy-soft)',
              border: `1px solid ${choices[i]?.confirmed ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '18px 20px',
              transition: 'border-color 0.2s',
            }}>
              {/* Cabecalho da cidade */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--cream)' }}>
                    📍 {city}
                  </div>
                  {checkIn && checkOut && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                      {checkIn} → {checkOut} · {data.travelersCount} pessoa(s)
                    </div>
                  )}
                </div>
                {choices[i]?.confirmed && (
                  <div style={{
                    background: 'var(--gold)', color: '#0d1521',
                    borderRadius: '50%', width: 26, height: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>✓</div>
                )}
              </div>

              {/* Botao de busca com filtros */}
              <a
                href={buildBookingUrl(city, checkIn, checkOut, data.travelProfile, data.travelersCount)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#003580', color: 'white',
                  borderRadius: 8, padding: '9px 16px',
                  fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  fontFamily: 'var(--font-body)', marginBottom: 14,
                }}
              >
                🏨 Ver hotéis em {city} com nota {cfg.reviewLabel} →
              </a>

              {/* Campo para registrar o hotel escolhido */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                  Hotel escolhido (registre aqui para incluir no roteiro)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={choices[i]?.name || ''}
                    onChange={e => updateChoice(i, { name: e.target.value, confirmed: false })}
                    placeholder={`Ex: Ibis ${city}, Grand Hyatt ${city}...`}
                    style={{
                      flex: 1, padding: '9px 12px',
                      background: '#111827',
                      border: `1px solid ${choices[i]?.confirmed ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 8, color: 'var(--cream)', fontSize: 13,
                      fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!choices[i]?.confirmed && !choices[i]?.name.trim()) return
                      updateChoice(i, { confirmed: !choices[i]?.confirmed })
                    }}
                    style={{
                      padding: '9px 14px',
                      background: choices[i]?.confirmed ? 'var(--gold)' : 'transparent',
                      border: `1px solid ${choices[i]?.confirmed ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 8,
                      color: choices[i]?.confirmed ? '#0d1521' : 'var(--muted)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                      opacity: (!choices[i]?.name.trim() && !choices[i]?.confirmed) ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {choices[i]?.confirmed ? '✓ Confirmado' : 'Confirmar'}
                  </button>
                </div>
              </div>

              {/* Regime alimentar */}
              {(
                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                    Regime de alimentação
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {MEAL_PLANS.map(mp => (
                      <button
                        key={mp.value}
                        onClick={() => updateChoice(i, { mealPlan: choices[i]?.mealPlan === mp.value ? null : mp.value })}
                        title={mp.description}
                        style={{
                          padding: '6px 12px',
                          background: choices[i]?.mealPlan === mp.value ? 'rgba(201,151,60,0.15)' : 'transparent',
                          border: `1px solid ${choices[i]?.mealPlan === mp.value ? 'var(--gold)' : 'var(--border)'}`,
                          borderRadius: 20,
                          color: choices[i]?.mealPlan === mp.value ? 'var(--gold)' : 'var(--muted)',
                          fontSize: 11, fontWeight: choices[i]?.mealPlan === mp.value ? 600 : 400,
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                          transition: 'all 0.15s', whiteSpace: 'nowrap',
                        }}
                      >
                        {mp.icon} {mp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orçamento do hotel */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Orçamento do hotel
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {/* Diária */}
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Diária (R$)</label>
                    <input
                      type="number"
                      min={0}
                      value={choices[i]?.pricePerNightBRL || ''}
                      onChange={e => updateChoice(i, { pricePerNightBRL: Number(e.target.value) })}
                      placeholder="0"
                      style={{
                        width: '100%', padding: '8px 10px', fontSize: 13,
                        background: '#111827', border: '1px solid var(--border)',
                        borderRadius: 8, color: 'var(--cream)', fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>
                  {/* Noites */}
                  <div style={{ flex: '0 0 auto' }}>
                    <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Noites</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateChoice(i, { nights: Math.max(1, (choices[i]?.nights || 1) - 1) })}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--cream)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cream)', minWidth: 20, textAlign: 'center' }}>{choices[i]?.nights || 1}</span>
                      <button onClick={() => updateChoice(i, { nights: (choices[i]?.nights || 1) + 1 })}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--cream)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                  {/* Total + pago */}
                  <div style={{ flex: '1 1 auto', textAlign: 'right' }}>
                    {(choices[i]?.pricePerNightBRL || 0) > 0 && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>
                        R$ {((choices[i]?.pricePerNightBRL || 0) * (choices[i]?.nights || 1)).toLocaleString('pt-BR')}
                      </div>
                    )}
                    <button
                      onClick={() => updateChoice(i, { hotelPaid: !choices[i]?.hotelPaid })}
                      style={{
                        padding: '5px 12px', fontSize: 11, borderRadius: 20, cursor: 'pointer',
                        fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                        background: choices[i]?.hotelPaid ? 'rgba(52,211,153,0.15)' : 'transparent',
                        border: `1px solid ${choices[i]?.hotelPaid ? '#34d399' : 'var(--border)'}`,
                        color: choices[i]?.hotelPaid ? '#34d399' : 'var(--muted)',
                      }}
                    >
                      {choices[i]?.hotelPaid ? '✓ Já pago' : 'A pagar lá'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel={allConfirmed ? 'Continuar →' : 'Pular esta etapa →'}
      />
    </div>
  )
}
