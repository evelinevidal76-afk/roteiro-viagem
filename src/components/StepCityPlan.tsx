import React, { useState } from 'react'
import type { WizardData, CityPlan } from '../types'
import { StepHeader, Button } from './ui'
import { CITY_ATTRACTIONS, GENERIC_ATTRACTIONS } from '../data/attractions'
import { getCurrencyByAirport, formatLocalAmount } from '../data/currencies'

interface Props {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onGenerate: () => void
  onBack: () => void
  totalDays: number
}

function BudgetSummary({ data, totalDays }: { data: WizardData; totalDays: number }) {
  const hotels = (data.selectedHotels || []).filter(h => h.confirmed && h.name.trim())
  const hotelTotal = hotels.reduce((s, h) => s + (h.pricePerNightBRL || 0) * (h.nights || 1), 0)
  const hotelPaid = hotels.filter(h => h.hotelPaid).reduce((s, h) => s + (h.pricePerNightBRL || 0) * (h.nights || 1), 0)
  const hotelUnpaid = hotelTotal - hotelPaid

  const flightTotal = data.flightCostBRL || 0
  const flightPaid = data.flightPaid ? flightTotal : 0
  const flightUnpaid = data.flightPaid ? 0 : flightTotal

  const dailyTotal = (data.dailyBudgetBRL || 0) * totalDays * (data.travelersCount || 1)

  const grandTotal = flightTotal + hotelTotal + dailyTotal
  const totalPaid = flightPaid + hotelPaid
  const totalUnpaid = flightUnpaid + hotelUnpaid + dailyTotal

  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const destCode = outLegs.length > 0 ? outLegs[outLegs.length - 1].destinationCode : ''
  const currency = getCurrencyByAirport(destCode)

  const hasBudget = grandTotal > 0

  if (!hasBudget) return null

  const row = (label: string, brl: number, sub?: string, color?: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <span style={{ fontSize: 13, color: 'var(--cream)' }}>{label}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{sub}</span>}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--cream)' }}>
        R$ {brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
      </span>
    </div>
  )

  return (
    <div style={{ background: 'var(--navy-soft)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 14 }}>
        💰 Resumo financeiro da viagem
      </div>

      {flightTotal > 0 && row('✈️ Passagens', flightTotal, data.flightPaid ? '(já pago)' : '(a pagar)')}
      {hotelTotal > 0 && row('🏨 Hospedagem total', hotelTotal, hotels.length > 0 ? `${hotels.length} hotel(is)` : undefined)}
      {dailyTotal > 0 && row(
        '🎒 Gastos diários',
        dailyTotal,
        `R$${(data.dailyBudgetBRL || 0).toLocaleString('pt-BR')} × ${totalDays} dias × ${data.travelersCount} pessoa(s)`
      )}

      {/* Totais */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cream)' }}>Total estimado</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>
            R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
        </div>
        {totalPaid > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#34d399' }}>✓ Já pago</span>
            <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
        )}
        {totalUnpaid > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#f59e0b' }}>⚠ Ainda a pagar / levar</span>
            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
              R$ {totalUnpaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
        )}
      </div>

      {/* Conversão para moeda local */}
      {totalUnpaid > 0 && currency.code !== 'BRL' && (
        <div style={{
          marginTop: 14, padding: '12px 14px',
          background: 'rgba(201,151,60,0.07)', border: '1px solid rgba(201,151,60,0.2)',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>
            💱 Leve na {currency.name}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cream)' }}>
            {formatLocalAmount(totalUnpaid, currency)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
            Cotação aprox.: 1 {currency.code} = R$ {currency.brlPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · Confirme antes de viajar.
          </div>
          {hotels.filter(h => !h.hotelPaid && h.pricePerNightBRL > 0).length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
              Inclui hospedagem a pagar localmente + gastos diários estimados.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getAttractionsForCity(city: string, styles: string[]): string[] {
  const key = Object.keys(CITY_ATTRACTIONS).find(k =>
    k.toLowerCase() === city.toLowerCase() ||
    city.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(city.toLowerCase())
  )
  if (key) return CITY_ATTRACTIONS[key]

  // Fallback: mix generic suggestions based on travel styles
  const generic = new Set<string>()
  for (const style of styles) {
    const items = GENERIC_ATTRACTIONS[style] || []
    items.forEach(i => generic.add(i))
  }
  if (generic.size === 0) {
    Object.values(GENERIC_ATTRACTIONS).slice(0, 3).flat().forEach(i => generic.add(i))
  }
  return [...generic].slice(0, 12)
}

export default function StepCityPlan({ data, update, onGenerate, onBack, totalDays }: Props) {
  const cities = data.cities.length > 0
    ? data.cities
    : ['Destino principal']

  const [plans, setPlans] = useState<CityPlan[]>(() => {
    if (data.cityPlans && data.cityPlans.length === cities.length) return data.cityPlans
    // Use cityNights from StepCities if available, else distribute evenly
    const cityNights = data.cityNights || []
    const base = Math.floor(totalDays / cities.length)
    const remainder = totalDays % cities.length
    return cities.map((city, i) => ({
      city,
      days: cityNights[i] || (base + (i === 0 ? remainder : 0)),
      selectedAttractions: [],
    }))
  })

  const [customInput, setCustomInput] = useState<Record<number, string>>({})

  const usedDays = plans.reduce((s, p) => s + p.days, 0)
  const remaining = totalDays - usedDays

  const setDays = (idx: number, delta: number) => {
    setPlans(prev => prev.map((p, i) => {
      if (i !== idx) return p
      const next = Math.max(1, p.days + delta)
      if (delta > 0 && remaining <= 0) return p
      return { ...p, days: next }
    }))
  }

  const toggleAttraction = (idx: number, attraction: string) => {
    setPlans(prev => prev.map((p, i) => {
      if (i !== idx) return p
      const sel = p.selectedAttractions.includes(attraction)
        ? p.selectedAttractions.filter(a => a !== attraction)
        : [...p.selectedAttractions, attraction]
      return { ...p, selectedAttractions: sel }
    }))
  }

  const addCustom = (idx: number) => {
    const val = (customInput[idx] || '').trim()
    if (!val) return
    setPlans(prev => prev.map((p, i) => {
      if (i !== idx) return p
      if (p.selectedAttractions.includes(val)) return p
      return { ...p, selectedAttractions: [...p.selectedAttractions, val] }
    }))
    setCustomInput(prev => ({ ...prev, [idx]: '' }))
  }

  const handleGenerate = () => {
    update({ cityPlans: plans })
    onGenerate()
  }

  const canGenerate = plans.every(p => p.selectedAttractions.length > 0)

  return (
    <div className="fade-up">
      <StepHeader
        title="O que você quer conhecer?"
        subtitle={`${totalDays} dias de viagem · distribua os dias e marque os lugares de interesse em cada cidade.`}
      />

      {/* Days balance bar */}
      <div style={{
        background: 'var(--navy-soft)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, color: 'var(--cream)' }}>
          <span style={{ fontWeight: 700, color: usedDays === totalDays ? 'var(--gold)' : 'var(--cream)' }}>
            {usedDays}
          </span>{' '}
          <span style={{ color: 'var(--muted)' }}>de {totalDays} dias distribuídos</span>
        </span>
        {remaining !== 0 && (
          <span style={{ fontSize: 12, color: remaining > 0 ? '#f59e0b' : '#ef4444' }}>
            {remaining > 0 ? `+${remaining} dias sem cidade` : `${Math.abs(remaining)} dias a mais`}
          </span>
        )}
        {remaining === 0 && (
          <span style={{ fontSize: 12, color: 'var(--gold)' }}>✓ Distribuição perfeita</span>
        )}
      </div>

      {plans.map((plan, idx) => {
        const options = getAttractionsForCity(plan.city, data.travelStyles || [])
        return (
          <div key={idx} style={{
            background: 'var(--navy-soft)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '20px', marginBottom: 20,
          }}>
            {/* City header + day counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{plan.city}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {plan.selectedAttractions.length} lugar(es) selecionado(s)
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setDays(idx, -1)}
                  disabled={plan.days <= 1}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: plan.days <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(201,151,60,0.12)',
                    border: '1px solid var(--border)', color: plan.days <= 1 ? 'var(--muted)' : 'var(--gold)',
                    fontSize: 18, cursor: plan.days <= 1 ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >−</button>
                <div style={{ textAlign: 'center', minWidth: 52 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cream)', lineHeight: 1 }}>{plan.days}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{plan.days === 1 ? 'dia' : 'dias'}</div>
                </div>
                <button
                  onClick={() => setDays(idx, 1)}
                  disabled={remaining <= 0}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: remaining <= 0 ? 'rgba(255,255,255,0.03)' : 'rgba(201,151,60,0.12)',
                    border: '1px solid var(--border)', color: remaining <= 0 ? 'var(--muted)' : 'var(--gold)',
                    fontSize: 18, cursor: remaining <= 0 ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >+</button>
              </div>
            </div>

            {/* Attractions grid */}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
              Marque o que quer visitar:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {options.map(attraction => {
                const selected = plan.selectedAttractions.includes(attraction)
                return (
                  <button
                    key={attraction}
                    onClick={() => toggleAttraction(idx, attraction)}
                    style={{
                      padding: '6px 12px', fontSize: 12, borderRadius: 20,
                      border: `1px solid ${selected ? 'rgba(201,151,60,0.6)' : 'var(--border)'}`,
                      background: selected ? 'rgba(201,151,60,0.14)' : 'rgba(255,255,255,0.02)',
                      color: selected ? 'var(--gold)' : 'var(--muted)',
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                    }}
                  >
                    {selected ? '✓ ' : ''}{attraction}
                  </button>
                )
              })}
            </div>

            {/* Custom attraction input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={customInput[idx] || ''}
                onChange={e => setCustomInput(prev => ({ ...prev, [idx]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCustom(idx)}
                placeholder="Adicionar outro lugar..."
                style={{
                  flex: 1, padding: '7px 12px', fontSize: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--cream)', fontFamily: 'var(--font-body)',
                }}
              />
              <button
                onClick={() => addCustom(idx)}
                style={{
                  padding: '7px 14px', fontSize: 12, background: 'rgba(201,151,60,0.12)',
                  border: '1px solid rgba(201,151,60,0.3)', borderRadius: 8,
                  color: 'var(--gold)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >+ Adicionar</button>
            </div>

            {/* Selected list */}
            {plan.selectedAttractions.length > 0 && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(201,151,60,0.05)', borderRadius: 8, border: '1px solid rgba(201,151,60,0.15)' }}>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>
                  Selecionados ({plan.selectedAttractions.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {plan.selectedAttractions.map(a => (
                    <span
                      key={a}
                      onClick={() => toggleAttraction(idx, a)}
                      style={{
                        fontSize: 11, padding: '3px 8px', background: 'rgba(201,151,60,0.12)',
                        borderRadius: 12, color: 'var(--cream)', cursor: 'pointer',
                        border: '1px solid rgba(201,151,60,0.25)',
                      }}
                      title="Clique para remover"
                    >
                      {a} ×
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Resumo de orçamento */}
      <BudgetSummary data={data} totalDays={totalDays} />

      {!canGenerate && (
        <p style={{ fontSize: 12, color: '#f59e0b', marginBottom: 16, textAlign: 'center' }}>
          Selecione ao menos 1 lugar em cada cidade para continuar.
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onBack}>← Voltar</Button>
        <Button onClick={handleGenerate} disabled={!canGenerate}>
          ✨ Gerar meu roteiro
        </Button>
      </div>
    </div>
  )
}
