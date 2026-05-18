import React, { useState, useEffect } from 'react'
import type { WizardData, FlightInfo } from '../types'
import { Button, StepHeader, ErrorBox, Card } from './ui'
import { fetchFlight } from '../services/flightService'
import { getAirportCity, getAirlineName } from '../services/lookupService'

interface Props {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onNext: () => void
}

const emptyManual = (num = '', date = ''): FlightInfo => ({
  flightNumber: num, date, airline: '', origin: '', originCode: '',
  destination: '', destinationCode: '', departure: '', arrival: '', duration: '', stops: [],
})

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 13 }} />
    </div>
  )
}

function FlightLeg({ index, total, flight, onRemove, onEdit }: {
  index: number; total: number; flight: FlightInfo; onRemove: () => void; onEdit: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
        {index < total - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0' }} />}
      </div>
      <div style={{ flex: 1, background: 'rgba(201,151,60,0.08)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Voo {index + 1} · {flight.flightNumber} · {flight.date}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cream)', fontFamily: 'var(--font-display)' }}>
              {flight.originCode} → {flight.destinationCode}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {flight.airline && `${flight.airline} · `}{flight.departure} → {flight.arrival}{flight.duration && ` · ${flight.duration}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEdit} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>editar</button>
            <button onClick={onRemove} style={{ fontSize: 16, color: '#e24b4a', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ManualForm({ manualData, updateManual, onSave, onCancel, error }: {
  manualData: FlightInfo
  updateManual: (field: string, v: any) => void
  onSave: () => void
  onCancel: () => void
  error: string | null
}) {
  // Auto-fill city from airport code
  const handleOriginCode = (v: string) => {
    const code = v.toUpperCase()
    updateManual('originCode', code)
    if (code.length === 3) {
      const city = getAirportCity(code)
      if (city) updateManual('origin', city)
    }
  }

  const handleDestCode = (v: string) => {
    const code = v.toUpperCase()
    updateManual('destinationCode', code)
    if (code.length === 3) {
      const city = getAirportCity(code)
      if (city) updateManual('destination', city)
    }
  }

  return (
    <>
      {error && <div style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.4)', borderRadius: 8, padding: '10px 12px', color: '#f09595', fontSize: 12, marginBottom: 12 }}>⚠️ {error}</div>}
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Preencha os dados manualmente:</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <Field label="Companhia" value={manualData.airline} onChange={v => updateManual('airline', v)} placeholder="Azul, Copa..." />
        <Field label="Duração" value={manualData.duration} onChange={v => updateManual('duration', v)} placeholder="1h05" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Origem</label>
          <input type="text" value={manualData.originCode} onChange={e => handleOriginCode(e.target.value)}
            placeholder="GIG" maxLength={3}
            style={{ width: '100%', padding: '8px 10px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 13, textTransform: 'uppercase' }} />
        </div>
        <Field label="Cidade origem" value={manualData.origin} onChange={v => updateManual('origin', v)} placeholder="Rio de Janeiro" />
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Destino</label>
          <input type="text" value={manualData.destinationCode} onChange={e => handleDestCode(e.target.value)}
            placeholder="CNF" maxLength={3}
            style={{ width: '100%', padding: '8px 10px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 13, textTransform: 'uppercase' }} />
        </div>
        <Field label="Cidade destino" value={manualData.destination} onChange={v => updateManual('destination', v)} placeholder="Belo Horizonte" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <Field label="Partida" value={manualData.departure} onChange={v => updateManual('departure', v)} placeholder="17:10" />
        <Field label="Chegada" value={manualData.arrival} onChange={v => updateManual('arrival', v)} placeholder="18:15" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={onSave}>✓ Confirmar voo</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </>
  )
}

function FlightFormBlock({ title, num, setNum, date, setDate, onSearch, loading, error,
  manual, manualData, updateManual, onSave, onCancelManual }: any) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
      {!manual ? (
        <>
          {error && <div style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.4)', borderRadius: 8, padding: '10px 12px', color: '#f09595', fontSize: 12, marginBottom: 12 }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Número do voo</label>
              <input type="text" value={num} onChange={e => setNum(e.target.value.toUpperCase())} placeholder="Ex: AD4437, CM734"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 14 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 14 }} />
            </div>
          </div>
          <Button onClick={onSearch} loading={loading} disabled={!num || !date}>🔍 Buscar voo</Button>
        </>
      ) : (
        <ManualForm manualData={manualData} updateManual={updateManual} onSave={onSave} onCancel={onCancelManual} error={error} />
      )}
    </Card>
  )
}

export default function StepFlight({ data, update, onNext }: Props) {
  const [legs, setLegs] = useState<FlightInfo[]>(data.outboundFlight ? [data.outboundFlight] : [])
  const [adding, setAdding] = useState(legs.length === 0)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [num, setNum] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const [manualData, setManualData] = useState<FlightInfo>(emptyManual())

  const [returnNum, setReturnNum] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnLoading, setReturnLoading] = useState(false)
  const [returnError, setReturnError] = useState<string | null>(null)
  const [returnManual, setReturnManual] = useState(false)
  const [returnManualData, setReturnManualData] = useState<FlightInfo>(emptyManual())
  const [returnConfirmed, setReturnConfirmed] = useState(!!data.returnFlight)

  const resetForm = () => { setNum(''); setDate(''); setError(null); setManual(false); setManualData(emptyManual()) }

  // Auto-fill airline from flight number
  useEffect(() => {
    if (num.length >= 2 && manual) {
      const airline = getAirlineName(num)
      if (airline) setManualData(prev => ({ ...prev, airline }))
    }
  }, [num, manual])

  useEffect(() => {
    if (returnNum.length >= 2 && returnManual) {
      const airline = getAirlineName(returnNum)
      if (airline) setReturnManualData(prev => ({ ...prev, airline }))
    }
  }, [returnNum, returnManual])

  const handleSearch = async () => {
    if (!num || !date) { setError('Preencha número e data'); return }
    setLoading(true); setError(null)
    try {
      const flight = await fetchFlight(num, date)
      saveLeg(flight)
    } catch {
      const airline = getAirlineName(num)
      setError('Voo não encontrado. Preencha manualmente:')
      setManual(true)
      setManualData({ ...emptyManual(num, date), airline })
    } finally { setLoading(false) }
  }

  const saveLeg = (flight: FlightInfo) => {
    let updated: FlightInfo[]
    if (editIndex !== null) {
      updated = [...legs]; updated[editIndex] = flight; setEditIndex(null)
    } else {
      updated = [...legs, flight]
    }
    setLegs(updated); setAdding(false); resetForm()
    update({ outboundFlight: updated[0] })
  }

  const saveManual = () => {
    if (!manualData.originCode || !manualData.destinationCode || !manualData.departure || !manualData.arrival) {
      setError('Preencha: código de origem, destino, partida e chegada'); return
    }
    saveLeg({ ...manualData, flightNumber: num || manualData.flightNumber, date: date || manualData.date })
  }

  const removeLeg = (i: number) => {
    const updated = legs.filter((_, j) => j !== i); setLegs(updated)
    update({ outboundFlight: updated[0] || null })
    if (updated.length === 0) setAdding(true)
  }

  const startEdit = (i: number) => {
    const leg = legs[i]; setEditIndex(i)
    setNum(leg.flightNumber); setDate(leg.date)
    setManualData(leg); setManual(true); setAdding(true)
  }

  const handleSearchReturn = async () => {
    if (!returnNum || !returnDate) return
    setReturnLoading(true); setReturnError(null)
    try {
      const flight = await fetchFlight(returnNum, returnDate)
      update({ returnFlight: flight }); setReturnConfirmed(true); setReturnManual(false)
    } catch {
      const airline = getAirlineName(returnNum)
      setReturnError('Voo não encontrado. Preencha manualmente:')
      setReturnManual(true)
      setReturnManualData({ ...emptyManual(returnNum, returnDate), airline })
    } finally { setReturnLoading(false) }
  }

  const saveReturnManual = () => {
    if (!returnManualData.originCode || !returnManualData.destinationCode || !returnManualData.departure || !returnManualData.arrival) {
      setReturnError('Preencha: código de origem, destino, partida e chegada'); return
    }
    const flight = { ...returnManualData, flightNumber: returnNum || returnManualData.flightNumber, date: returnDate || returnManualData.date }
    update({ returnFlight: flight }); setReturnConfirmed(true); setReturnManual(false); setReturnError(null)
  }

  const destination = legs.length > 0 ? legs[legs.length - 1].destinationCode : null

  return (
    <div className="fade-up">
      <StepHeader title="Seus voos ✈️" subtitle="Adicione todos os voos da ida em sequência — incluindo conexões com voos diferentes." />

      {legs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {legs.map((leg, i) => (
            <FlightLeg key={i} index={i} total={legs.length} flight={leg}
              onRemove={() => removeLeg(i)} onEdit={() => startEdit(i)} />
          ))}
          {destination && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, marginBottom: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginLeft: 6 }} />
              <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>🏁 {destination} — Destino final</div>
            </div>
          )}
        </div>
      )}

      {adding && (
        <FlightFormBlock
          title={editIndex !== null ? `Editar voo ${editIndex + 1}` : legs.length === 0 ? 'Primeiro voo da ida' : `Adicionar voo ${legs.length + 1}`}
          num={num} setNum={setNum} date={date} setDate={setDate}
          onSearch={handleSearch} loading={loading} error={error}
          manual={manual} manualData={manualData}
          updateManual={(field: string, v: any) => setManualData((prev: FlightInfo) => ({ ...prev, [field]: v }))}
          onSave={saveManual}
          onCancelManual={() => { setManual(false); setError(null) }}
        />
      )}

      {!adding && (
        <button onClick={() => { setAdding(true); setEditIndex(null); resetForm() }}
          style={{ width: '100%', padding: '12px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', background: 'none', color: 'var(--gold)', fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
          + Adicionar próximo voo da ida
        </button>
      )}

      <div style={{ marginTop: 8, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
          <input type="checkbox" checked={data.hasReturn}
            onChange={e => { update({ hasReturn: e.target.checked, returnFlight: null }); setReturnConfirmed(false); setReturnManual(false) }}
            style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
          <span style={{ fontSize: 14, color: 'var(--cream)' }}>Adicionar voo de retorno</span>
        </label>

        {data.hasReturn && !returnConfirmed && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Voo de retorno</div>
            {!returnManual ? (
              <>
                {returnError && <div style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.4)', borderRadius: 8, padding: '10px 12px', color: '#f09595', fontSize: 12, marginBottom: 12 }}>⚠️ {returnError}</div>}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Número do voo</label>
                    <input type="text" value={returnNum} onChange={e => setReturnNum(e.target.value.toUpperCase())} placeholder="Ex: CM735"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 14 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Data</label>
                    <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 14 }} />
                  </div>
                </div>
                <Button onClick={handleSearchReturn} loading={returnLoading} disabled={!returnNum || !returnDate}>🔍 Buscar voo de retorno</Button>
              </>
            ) : (
              <ManualForm manualData={returnManualData}
                updateManual={(field: string, v: any) => setReturnManualData((prev: FlightInfo) => ({ ...prev, [field]: v }))}
                onSave={saveReturnManual}
                onCancel={() => { setReturnManual(false); setReturnError(null) }}
                error={returnError} />
            )}
          </Card>
        )}

        {data.hasReturn && returnConfirmed && data.returnFlight && (
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>✓ Retorno confirmado</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cream)', fontFamily: 'var(--font-display)' }}>
              {data.returnFlight.originCode} → {data.returnFlight.destinationCode}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {data.returnFlight.airline && `${data.returnFlight.airline} · `}
              {data.returnFlight.flightNumber} · {data.returnFlight.date}
              {data.returnFlight.departure && ` · ${data.returnFlight.departure} → ${data.returnFlight.arrival}`}
            </div>
            <button onClick={() => { setReturnConfirmed(false); setReturnManual(false); update({ returnFlight: null }) }}
              style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Editar retorno
            </button>
          </Card>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button onClick={onNext} disabled={legs.length === 0}>Continuar →</Button>
      </div>
    </div>
  )
}
