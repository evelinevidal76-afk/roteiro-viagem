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

      {/* Orçamento de viagem */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', marginBottom: 4 }}>
          Orçamento de viagem (opcional)
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>
          Preencha para ver o resumo financeiro completo antes de gerar o roteiro.
        </p>
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Passagens */}
          <div style={{ background: 'var(--navy-soft)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', marginBottom: 10 }}>✈️ Passagens aéreas</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Valor total (R$)</label>
                <input
                  type="number"
                  min={0}
                  value={data.flightCostBRL || ''}
                  onChange={e => update({ flightCostBRL: Number(e.target.value) })}
                  placeholder="Ex: 4800"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: 13,
                    background: '#111827', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--cream)', fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <div style={{ paddingTop: 18 }}>
                <button
                  onClick={() => update({ flightPaid: !data.flightPaid })}
                  style={{
                    padding: '8px 14px', fontSize: 12, borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'all 0.15s', whiteSpace: 'nowrap',
                    background: data.flightPaid ? 'rgba(52,211,153,0.15)' : 'transparent',
                    border: `1px solid ${data.flightPaid ? '#34d399' : 'var(--border)'}`,
                    color: data.flightPaid ? '#34d399' : 'var(--muted)',
                  }}
                >
                  {data.flightPaid ? '✓ Já pago' : 'A pagar'}
                </button>
              </div>
            </div>
          </div>
          {/* Gasto diário */}
          <div style={{ background: 'var(--navy-soft)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', marginBottom: 10 }}>🎒 Gasto diário estimado (por pessoa)</div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
              Atividades, alimentação, transporte local, extras. (Deixe 0 se não souber — pode ajustar depois.)
            </p>
            <input
              type="number"
              min={0}
              value={data.dailyBudgetBRL || ''}
              onChange={e => update({ dailyBudgetBRL: Number(e.target.value) })}
              placeholder="Ex: 500"
              style={{
                width: '100%', padding: '8px 10px', fontSize: 13,
                background: '#111827', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--cream)', fontFamily: 'var(--font-body)',
              }}
            />
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onBack}>← Voltar</Button>
        <Button onClick={onGenerate} loading={loading}>
          {loading ? 'Aguarde...' : 'Próximo →'}
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
