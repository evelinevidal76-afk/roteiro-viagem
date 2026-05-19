import React from 'react'
import type { WizardData, TravelProfile, TravelStyle, Transport } from '../types'
import { StepHeader, NavButtons, Card } from './ui'

// ─── Step 2: Cities ───────────────────────────────────────────────────────────
export default function StepCities({
  data, update, onNext, onBack
}: { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  const cities: string[] = (data as any).cities || []
  const cityNights: number[] = data.cityNights || []

  const setCount = (n: number) => {
    const current = cities.slice(0, n)
    const nights = cityNights.slice(0, n)
    while (current.length < n) current.push('')
    while (nights.length < n) nights.push(3)
    update({ citiesCount: n, cities: current, cityNights: nights } as any)
  }

  const setCity = (i: number, v: string) => {
    const updated = [...cities]
    updated[i] = v
    update({ cities: updated } as any)
  }

  const setNights = (i: number, delta: number) => {
    const updated = [...cityNights]
    while (updated.length <= i) updated.push(3)
    updated[i] = Math.max(1, (updated[i] || 3) + delta)
    update({ cityNights: updated } as any)
  }

  const totalNights = cityNights.reduce((s, n) => s + (n || 3), 0)
  const canContinue = cities.length > 0 && cities.every(c => c.trim().length > 0)

  return (
    <div className="fade-up">
      <StepHeader
        title="Destino(s) 🗺️"
        subtitle="Quantas cidades e quantas noites em cada uma?"
      />

      {/* Seleção de quantidade */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <Card
            key={n}
            selected={data.citiesCount === n}
            onClick={() => setCount(n)}
            style={{ textAlign: 'center', padding: '16px 8px' }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: data.citiesCount === n ? 'var(--gold)' : 'var(--cream)', fontFamily: 'var(--font-display)' }}>{n}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{n === 1 ? 'cidade' : 'cidades'}</div>
          </Card>
        ))}
      </div>

      {/* Campos de cidade + noites */}
      {cities.length > 0 && (
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          {cities.map((city, i) => (
            <div key={i} style={{
              background: 'var(--navy-soft)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                {cities.length === 1 ? 'Cidade' : `Cidade ${i + 1}`}
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(i, e.target.value)}
                  placeholder={i === 0 ? 'Ex: Cancún' : i === 1 ? 'Ex: Playa del Carmen' : 'Ex: Tulum'}
                  style={{
                    flex: 1, padding: '10px 12px',
                    background: '#111827', border: `1px solid ${city.trim() ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: 8, color: 'var(--cream)', fontSize: 14,
                    fontFamily: 'var(--font-body)',
                  }}
                />
                {/* Contador de noites */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setNights(i, -1)}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--cream)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <div style={{ textAlign: 'center', minWidth: 42 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{cityNights[i] || 3}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>noites</div>
                  </div>
                  <button onClick={() => setNights(i, 1)}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--cream)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cities.length > 1 && (
        <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right', marginBottom: 24 }}>
          Total: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{totalNights} noites</span>
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} disabled={!canContinue} />
    </div>
  )
}

// ─── Step 3: Profile ──────────────────────────────────────────────────────────
const PROFILES: { id: TravelProfile; label: string; desc: string; icon: string }[] = [
  { id: 'economico', label: 'Econômico', desc: 'Hostels, restaurantes locais, transporte público', icon: '💰' },
  { id: 'intermediario', label: 'Intermediário', desc: 'Hotéis 3-4 estrelas, restaurantes variados', icon: '⚖️' },
  { id: 'luxo', label: 'Luxo', desc: 'Hotéis 5 estrelas, restaurantes finos, experiências VIP', icon: '✨' },
  { id: 'misto', label: 'Misto', desc: 'Combina categorias conforme a atividade', icon: '🎯' },
]

export function StepProfile({
  data, update, onNext, onBack
}: { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up">
      <StepHeader
        title="Perfil de viagem 💼"
        subtitle="Como você prefere viajar?"
      />
      <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
        {PROFILES.map(p => (
          <Card
            key={p.id}
            selected={data.travelProfile === p.id}
            onClick={() => update({ travelProfile: p.id })}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <span style={{ fontSize: 28 }}>{p.icon}</span>
            <div>
              <div style={{ fontWeight: 600, color: data.travelProfile === p.id ? 'var(--gold)' : 'var(--cream)', fontSize: 15 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.desc}</div>
            </div>
          </Card>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.travelProfile} />
    </div>
  )
}

// ─── Step 4: Styles ───────────────────────────────────────────────────────────
const STYLES: { id: TravelStyle; label: string; icon: string }[] = [
  { id: 'gastronomico', label: 'Gastronômico', icon: '🍽️' },
  { id: 'cultural', label: 'Cultural', icon: '🎭' },
  { id: 'aventura', label: 'Aventura', icon: '🧗' },
  { id: 'relax', label: 'Relax / Spa', icon: '🧘' },
  { id: 'compras', label: 'Compras', icon: '🛍️' },
  { id: 'natureza', label: 'Natureza', icon: '🌿' },
  { id: 'historico', label: 'Histórico / Arqueológico', icon: '🏛️' },
  { id: 'praias', label: 'Praias', icon: '🏖️' },
  { id: 'vida_noturna', label: 'Vida Noturna', icon: '🎵' },
  { id: 'familia', label: 'Família com crianças', icon: '👨‍👩‍👧' },
]

export function StepStyles({
  data, update, onNext, onBack
}: { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  const toggle = (id: TravelStyle) => {
    const styles = data.travelStyles.includes(id)
      ? data.travelStyles.filter(s => s !== id)
      : [...data.travelStyles, id]
    update({ travelStyles: styles })
  }

  return (
    <div className="fade-up">
      <StepHeader
        title="Estilo de viagem 🎨"
        subtitle="Selecione todos que combinam com você. Pode escolher mais de um!"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
        {STYLES.map(s => {
          const sel = data.travelStyles.includes(s.id)
          return (
            <Card
              key={s.id}
              selected={sel}
              onClick={() => toggle(s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}
            >
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? 'var(--gold)' : 'var(--cream)' }}>{s.label}</span>
              {sel && <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: 16 }}>✓</span>}
            </Card>
          )
        })}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={data.travelStyles.length === 0} />
    </div>
  )
}

// ─── Step 5: Transport ────────────────────────────────────────────────────────
const TRANSPORTS: { id: Transport; label: string; desc: string; icon: string }[] = [
  { id: 'carro', label: 'Aluguel de carro', desc: 'Mais liberdade e flexibilidade de horários', icon: '🚗' },
  { id: 'transporte_publico', label: 'Transporte público', desc: 'Ônibus, metrô, trem — mais econômico', icon: '🚆' },
  { id: 'misto', label: 'Misto', desc: 'Combina carro e transporte público', icon: '🔄' },
  { id: 'tour_guiado', label: 'Tours guiados', desc: 'Tudo organizado, sem preocupação', icon: '🎫' },
]

export function StepTransport({
  data, update, onNext, onBack
}: { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up">
      <StepHeader
        title="Como vai se locomover? 🚗"
        subtitle="Qual o seu meio de transporte principal no destino?"
      />
      <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
        {TRANSPORTS.map(t => (
          <Card
            key={t.id}
            selected={data.transport === t.id}
            onClick={() => update({ transport: t.id })}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <span style={{ fontSize: 28 }}>{t.icon}</span>
            <div>
              <div style={{ fontWeight: 600, color: data.transport === t.id ? 'var(--gold)' : 'var(--cream)', fontSize: 15 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.desc}</div>
            </div>
          </Card>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.transport} />
    </div>
  )
}
