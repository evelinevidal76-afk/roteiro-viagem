import React, { useState } from 'react'
import type { WizardData } from '../types'
import { Button, Input, StepHeader, ErrorBox, Card } from './ui'
import { fetchFlight } from '../services/flightService'

interface Props {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onNext: () => void
}

export default function StepFlight({ data, update, onNext }: Props) {
  const [flightNum, setFlightNum] = useState('')
  const [date, setDate] = useState('')
  const [returnNum, setReturnNum] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingReturn, setLoadingReturn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchFlight = async () => {
    if (!flightNum || !date) {
      setError('Preencha o número do voo e a data')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const flight = await fetchFlight(flightNum, date)
      update({ outboundFlight: flight })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const searchReturn = async () => {
    if (!returnNum || !returnDate) return
    setLoadingReturn(true)
    try {
      const flight = await fetchFlight(returnNum, returnDate)
      update({ returnFlight: flight })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingReturn(false)
    }
  }

  const canContinue = !!data.outboundFlight

  return (
    <div className="fade-up">
      <StepHeader
        title="Seus voos ✈️"
        subtitle="Informe o número do voo e a data. Vamos buscar automaticamente origem, destino e horários."
      />

      {error && <ErrorBox message={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input
          label="Número do voo de ida"
          value={flightNum}
          onChange={setFlightNum}
          placeholder="Ex: LA3450, G31234"
          hint="IATA ou código da companhia"
        />
        <Input
          label="Data de partida"
          value={date}
          onChange={setDate}
          type="date"
        />
      </div>

      <Button onClick={searchFlight} loading={loading} disabled={!flightNum || !date}>
        🔍 Buscar voo de ida
      </Button>

      {data.outboundFlight && (
        <Card style={{ marginTop: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ✓ Voo encontrado
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--cream)' }}>
            {data.outboundFlight.originCode} → {data.outboundFlight.destinationCode}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {data.outboundFlight.airline} · {data.outboundFlight.flightNumber}
          </div>
          <div style={{ fontSize: 13, color: 'var(--cream)', marginTop: 6 }}>
            {data.outboundFlight.departure} → {data.outboundFlight.arrival} · {data.outboundFlight.duration}
          </div>
        </Card>
      )}

      {/* Voo de retorno */}
      <div style={{ marginTop: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={data.hasReturn}
            onChange={e => update({ hasReturn: e.target.checked })}
            style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
          />
          <span style={{ fontSize: 14, color: 'var(--cream)' }}>Adicionar voo de retorno</span>
        </label>

        {data.hasReturn && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Número do voo de retorno"
                value={returnNum}
                onChange={setReturnNum}
                placeholder="Ex: LA3451"
              />
              <Input
                label="Data do retorno"
                value={returnDate}
                onChange={setReturnDate}
                type="date"
              />
            </div>
            <Button onClick={searchReturn} loading={loadingReturn} variant="secondary" disabled={!returnNum || !returnDate}>
              🔍 Buscar voo de retorno
            </Button>

            {data.returnFlight && (
              <Card style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                  ✓ Retorno encontrado
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--cream)' }}>
                  {data.returnFlight.originCode} → {data.returnFlight.destinationCode}
                </div>
                <div style={{ fontSize: 13, color: 'var(--cream)', marginTop: 4 }}>
                  {data.returnFlight.departure} → {data.returnFlight.arrival} · {data.returnFlight.duration}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <Button onClick={onNext} disabled={!canContinue}>
          Continuar →
        </Button>
      </div>
    </div>
  )
}
