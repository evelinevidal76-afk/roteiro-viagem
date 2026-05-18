import React, { useState, useEffect } from 'react'
import type { WizardData, FlightInfo } from '../types'
import { Button, StepHeader, Card } from './ui'
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

function FlightLegCard({ index, total, flight, onRemove, onEdit }: {
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

function ManualForm({ num, manualData, updateManual, onSave, onCancel, error }: {
  num: string; manualData: FlightInfo; updateManual: (f: string, v: any) => void
  onSave: () => void; onCancel: () => void; error: string | null
}) {
  const calcDuration = (dep: string, arr: string) => {
    const [dh, dm] = dep.split(':').map(Number)
    const [ah, am] = arr.split(':').map(Number)
    if (isNaN(dh) || isNaN(dm) || isNaN(ah) || isNaN(am)) return
    let diff = (ah * 60 + am) - (dh * 60 + dm)
    if (diff < 0) diff += 24 * 60
    const h = Math.floor(diff / 60)
    const m = diff % 60
    updateManual('duration', m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`)
  }

  const handleOriginCode = async (v: string) => {
    const code = v.toUpperCase()
    updateManual('originCode', code)
    if (code.length === 3) {
      const city = await getAirportCity(code)
      if (city) updateManual('origin', city)
    }
  }

  const handleDestCode = async (v: string) => {
    const code = v.toUpperCase()
    updateManual('destinationCode', code)
    if (code.length === 3) {
      const city = await getAirportCity(code)
      if (city) updateManual('destination', city)
    }
  }

  const handleDeparture = (v: string) => {
    updateManual('departure', v)
    if (manualData.arrival) calcDuration(v, manualData.arrival)
  }

  const handleArrival = (v: string) => {
    updateManual('arrival', v)
    if (manualData.departure) calcDuration(manualData.departure, v)
  }

  return (
    <>
      {error && <div style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.4)', borderRadius: 8, padding: '10px 12px', color: '#f09595', fontSize: 12, marginBottom: 12 }}>⚠️ {error}</div>}
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Preencha os dados manualmente:</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <Field label="Companhia" value={manualData.airline} onChange={v => updateManual('airline', v)} placeholder="Azul, Copa..." />
        <Field label="Duração" value={manualData.duration} onChange={v => updateManual('duration', v)} placeholder="calculada automaticamente" />
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
        <Field label="Partida" value={manualData.departure} onChange={handleDeparture} placeholder="17:10" />
        <Field label="Chegada" value={manualData.arrival} onChange={handleArrival} placeholder="18:15" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={onSave}>✓ Confirmar voo</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </>
  )
}

// Componente reutilizável para grupo de voos (ida ou retorno)
function FlightGroup({
  title, legs, onLegsChange, destinationLabel, color = 'var(--gold)'
}: {
  title: string
  legs: FlightInfo[]
  onLegsChange: (legs: FlightInfo[]) => void
  destinationLabel?: string
  color?: string
}) {
  const [adding, setAdding] = useState(legs.length === 0)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [num, setNum] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const [manualData, setManualData] = useState<FlightInfo>(emptyManual())

  const resetForm = () => { setNum(''); setDate(''); setError(null); setManual(false); setManualData(emptyManual()) }

  useEffect(() => {
    if (manual && num.length >= 2 && !manualData.airline) {
      getAirlineName(num).then((name: string) => {
        if (name) setManualData(prev => ({ ...prev, airline: name }))
      })
    }
  }, [manual, num])

  const handleSearch = async () => {
    if (!num || !date) { setError('Preencha número e data'); return }
    setLoading(true); setError(null)
    try {
      const flight = await fetchFlight(num, date)
      saveLeg(flight)
    } catch {
      const airline = await getAirlineName(num)
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
    onLegsChange(updated)
    setAdding(false); resetForm()
  }

  const saveManual = () => {
    if (!manualData.originCode || !manualData.destinationCode || !manualData.departure || !manualData.arrival) {
      setError('Preencha: código de origem, destino, partida e chegada'); return
    }
    saveLeg({ ...manualData, flightNumber: num || manualData.flightNumber, date: date || manualData.date })
  }

  const removeLeg = (i: number) => {
    const updated = legs.filter((_, j) => j !== i)
    onLegsChange(updated)
    if (updated.length === 0) setAdding(true)
  }

  const startEdit = (i: number) => {
    const leg = legs[i]; setEditIndex(i)
    setNum(leg.flightNumber); setDate(leg.date)
    setManualData(leg); setManual(true); setAdding(true)
  }

  const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 14 }
  const lastDest = legs.length > 0 ? legs[legs.length - 1].destinationCode : null

  return (
    <div>
      {legs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {legs.map((leg, i) => (
            <FlightLegCard key={i} index={i} total={legs.length} flight={leg}
              onRemove={() => removeLeg(i)} onEdit={() => startEdit(i)} />
          ))}
          {lastDest && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0, marginLeft: 6 }} />
              <div style={{ fontSize: 13, color, fontWeight: 600 }}>
                {destinationLabel === 'origem' ? `🛫 ${lastDest} — Origem` : `🏁 ${lastDest} — ${destinationLabel || 'Destino final'}`}
              </div>
            </div>
          )}
        </div>
      )}

      {adding && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {editIndex !== null ? `Editar voo ${editIndex + 1}` : legs.length === 0 ? title : `Adicionar voo ${legs.length + 1}`}
          </div>
          {!manual ? (
            <>
              {error && <div style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.4)', borderRadius: 8, padding: '10px 12px', color: '#f09595', fontSize: 12, marginBottom: 12 }}>⚠️ {error}</div>}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Número do voo</label>
                  <input type="text" value={num} onChange={e => setNum(e.target.value.toUpperCase())} placeholder="Ex: AD4437, CM734" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Data</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <Button onClick={handleSearch} loading={loading} disabled={!num || !date}>🔍 Buscar voo</Button>
            </>
          ) : (
            <ManualForm num={num} manualData={manualData}
              updateManual={(f, v) => setManualData(prev => ({ ...prev, [f]: v }))}
              onSave={saveManual} onCancel={() => { setManual(false); setError(null) }} error={error} />
          )}
        </Card>
      )}

      {!adding && (
        <button onClick={() => { setAdding(true); setEditIndex(null); resetForm() }}
          style={{ width: '100%', padding: '10px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', background: 'none', color, fontSize: 13, cursor: 'pointer', marginBottom: 8 }}>
          + Adicionar próximo voo de {title.toLowerCase().includes('retorno') ? 'retorno' : 'ida'}
        </button>
      )}
    </div>
  )
}

export default function StepFlight({ data, update, onNext }: Props) {
  const [outLegs, setOutLegs] = useState<FlightInfo[]>(
    data.outboundLegs?.length ? data.outboundLegs : data.outboundFlight ? [data.outboundFlight] : []
  )
  const [retLegs, setRetLegs] = useState<FlightInfo[]>(
    data.returnLegs?.length ? data.returnLegs : data.returnFlight ? [data.returnFlight] : []
  )

  const handleOutLegs = (legs: FlightInfo[]) => {
    setOutLegs(legs)
    update({ outboundFlight: legs[0] || null, outboundLegs: legs })
  }

  const handleRetLegs = (legs: FlightInfo[]) => {
    setRetLegs(legs)
    update({ returnFlight: legs[0] || null, returnLegs: legs })
  }

  return (
    <div className="fade-up">
      <StepHeader title="Seus voos ✈️" subtitle="Adicione todos os voos da ida em sequência — incluindo conexões com voos diferentes." />

      <FlightGroup
        title="Primeiro voo da ida"
        legs={outLegs}
        onLegsChange={handleOutLegs}
      />

      <div style={{ marginTop: 16, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
          <input type="checkbox" checked={data.hasReturn}
            onChange={e => { update({ hasReturn: e.target.checked, returnFlight: null }); setRetLegs([]) }}
            style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
          <span style={{ fontSize: 14, color: 'var(--cream)' }}>Adicionar voo(s) de retorno</span>
        </label>

        {data.hasReturn && (
          <FlightGroup
            title="Primeiro voo do retorno"
            legs={retLegs}
            onLegsChange={handleRetLegs}
            destinationLabel="origem"
            color="var(--cream)"
          />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button onClick={onNext} disabled={outLegs.length === 0}>Continuar →</Button>
      </div>
    </div>
  )
}
