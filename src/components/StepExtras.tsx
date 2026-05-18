import React from 'react'
import type { WizardData } from '../types'
import { StepHeader, Button, ErrorBox, Card } from './ui'

interface Props {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onGenerate: () => void
  onBack: () => void
  loading: boolean
  error: string | null
}

export default function StepExtras({ data, update, onGenerate, onBack, loading, error }: Props) {
  const flight = data.outboundFlight!

  return (
    <div className="fade-up">
      <StepHeader
        title="Últimos detalhes ✨"
        subtitle="Revise e personalize seu roteiro antes de gerar."
      />

      {/* Summary */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Resumo da sua viagem
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <SummaryRow icon="✈️" label="Voo" value={`${flight.flightNumber} · ${flight.originCode} → ${flight.destinationCode}`} />
          <SummaryRow icon="📅" label="Data" value={flight.date} />
          <SummaryRow icon="🏙️" label="Cidades" value={`${data.citiesCount} cidade(s)`} />
          <SummaryRow icon="💼" label="Perfil" value={data.travelProfile || ''} />
          <SummaryRow icon="🎨" label="Estilo" value={data.travelStyles.join(', ')} />
          <SummaryRow icon="🚗" label="Transporte" value={data.transport || ''} />
        </div>
      </Card>

      {/* Travelers count */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--cream)', display: 'block', marginBottom: 8 }}>
          Número de viajantes
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => update({ travelersCount: Math.max(1, data.travelersCount - 1) })}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--navy-soft)', border: '1px solid var(--border)',
              color: 'var(--cream)', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >−</button>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--cream)', minWidth: 32, textAlign: 'center' }}>
            {data.travelersCount}
          </span>
          <button
            onClick={() => update({ travelersCount: Math.min(10, data.travelersCount + 1) })}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--navy-soft)', border: '1px solid var(--border)',
              color: 'var(--cream)', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >+</button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {data.travelersCount === 1 ? 'viajante' : 'viajantes'}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--cream)', display: 'block', marginBottom: 6 }}>
          Observações especiais (opcional)
        </label>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
          Alergias, mobilidade reduzida, preferências específicas, datas especiais...
        </p>
        <textarea
          value={data.notes}
          onChange={e => update({ notes: e.target.value })}
          placeholder="Ex: Uma das viajantes é vegetariana. Temos criança de 5 anos. Queremos incluir um dia de descanso."
          rows={4}
          style={{
            width: '100%',
            padding: '11px 14px',
            background: 'var(--navy-soft)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--cream)',
            fontSize: 13,
            resize: 'vertical',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
          }}
        />
      </div>

      {error && <ErrorBox message={error} />}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onBack}>← Voltar</Button>
        <Button onClick={onGenerate} loading={loading}>
          {loading ? 'Gerando roteiro...' : '✨ Gerar meu roteiro'}
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--cream)', textTransform: 'capitalize' }}>{value}</span>
    </div>
  )
}
