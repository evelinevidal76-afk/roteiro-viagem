import React from 'react'
import type { WizardData, TravelProfile, TravelStyle, Transport } from '../types'
import { StepHeader, NavButtons, Card } from './ui'

// ─── Step 2: Cities ───────────────────────────────────────────────────────────
export default function StepCities({
  data, update, onNext, onBack
}: { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="fade-up">
      <StepHeader
        title="Quantas cidades? 🗺️"
        subtitle="Quantas cidades base você quer incluir no roteiro?"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {[1, 2, 3, 4].map(n => (
          <Card
            key={n}
            selected={data.citiesCount === n}
            onClick={() => update({ citiesCount: n })}
            style={{ textAlign: 'center', padding: '20px 12px' }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{'🏙️'.repeat(Math.min(n, 3))}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: data.citiesCount === n ? 'var(--gold)' : 'var(--cream)', fontFamily: 'var(--font-display)' }}>{n}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{n === 1 ? 'cidade' : 'cidades'}</div>
          </Card>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
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
