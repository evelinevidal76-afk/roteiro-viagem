import React, { useState, useEffect, useRef } from 'react'
import type { WizardData } from './types'
import StepFlight from './components/StepFlight'
import StepCities, { StepProfile, StepStyles, StepTransport } from './components/Steps'
import StepHotel from './components/StepHotel'
import StepExtras from './components/StepExtras'
import ItineraryView from './components/ItineraryView'
import { generateItineraryStream } from './services/itineraryService'
import { salvarEstado, recuperarSessao, getSessaoId, clearSessaoId } from './services/dbService'

const STEPS = ['Voo', 'Destino', 'Perfil', 'Estilo', 'Transporte', 'Hotel', 'Detalhes']
const LS_KEY = 'decifrando_roteiros_step'

const initialData: WizardData = {
  outboundFlight: null,
  outboundLegs: [],
  returnFlight: null,
  returnLegs: [],
  hasReturn: false,
  citiesCount: 1,
  cities: [],
  travelProfile: null,
  travelStyles: [],
  transport: null,
  travelersCount: 2,
  notes: '',
}

export default function App() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(initialData)
  const [itineraryHtml, setItineraryHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [saving, setSaving] = useState(false)
  const htmlRef = useRef('')

  useEffect(() => {
    const sessaoId = getSessaoId()
    if (sessaoId) {
      recuperarSessao(sessaoId).then((saved: Partial<WizardData> | null) => {
        if (saved) {
          setData(prev => ({ ...prev, ...saved }))
          const savedStep = parseInt(localStorage.getItem(LS_KEY) || '0')
          setStep(savedStep)
        }
        setRestoring(false)
      })
    } else {
      setRestoring(false)
    }
  }, [])

  const update = async (patch: Partial<WizardData>) => {
    const next = { ...data, ...patch }
    setData(next)
    setSaving(true)
    try { await salvarEstado(next) } catch {}
    setSaving(false)
  }

  const goToStep = (s: number) => {
    setStep(s)
    localStorage.setItem(LS_KEY, String(s))
  }

  const next = () => goToStep(Math.min(step + 1, STEPS.length - 1))
  const back = () => goToStep(Math.max(step - 1, 0))

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    htmlRef.current = ''
    setItineraryHtml('')

    generateItineraryStream(
      data,
      (chunk) => {
        htmlRef.current += chunk
        setItineraryHtml(htmlRef.current)
      },
      () => { setLoading(false) },
      (msg) => {
        setError(msg)
        setLoading(false)
        setItineraryHtml(null)
      }
    )
  }

  const restart = () => {
    clearSessaoId()
    localStorage.removeItem(LS_KEY)
    setStep(0)
    setData(initialData)
    setItineraryHtml(null)
    setError(null)
    htmlRef.current = ''
  }

  if (restoring) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Recuperando seu progresso...</p>
        </div>
      </div>
    )
  }

  if (itineraryHtml !== null) {
    return <ItineraryView html={itineraryHtml} loading={loading} data={data} onRestart={restart} />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>Decifrando Roteiros</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Decifrando Milhas</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {saving && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Salvando...</span>}
          {(data.outboundFlight || step > 0) && (
            <button onClick={restart} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Recomeçar
            </button>
          )}
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Passo {step + 1} de {STEPS.length}</div>
        </div>
      </header>

      <div style={{ height: 3, background: 'var(--navy-soft)' }}>
        <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--gold)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto', padding: '0 24px' }}>
        {STEPS.map((label, i) => (
          <button key={label} onClick={() => i < step && goToStep(i)}
            style={{
              padding: '12px 16px', fontSize: 12,
              fontWeight: i === step ? 600 : 400,
              color: i === step ? 'var(--gold)' : i < step ? 'var(--cream)' : 'var(--muted)',
              background: 'none', border: 'none',
              borderBottom: i === step ? '2px solid var(--gold)' : '2px solid transparent',
              whiteSpace: 'nowrap', cursor: i < step ? 'pointer' : 'default',
              transition: 'all 0.2s', fontFamily: 'var(--font-body)',
            }}>
            {i < step ? '✓ ' : ''}{label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <div style={{ padding: '6px 24px', background: 'rgba(201,151,60,0.06)', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--gold)' }}>●</span> Progresso salvo automaticamente no banco de dados
        </div>
      )}

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {step === 0 && <StepFlight data={data} update={update} onNext={next} />}
        {step === 1 && <StepCities data={data} update={update} onNext={next} onBack={back} />}
        {step === 2 && <StepProfile data={data} update={update} onNext={next} onBack={back} />}
        {step === 3 && <StepStyles data={data} update={update} onNext={next} onBack={back} />}
        {step === 4 && <StepTransport data={data} update={update} onNext={next} onBack={back} />}
        {step === 5 && <StepHotel data={data} update={update} onNext={next} onBack={back} />}
        {step === 6 && (
          <StepExtras data={data} update={update} onGenerate={handleGenerate} onBack={back} loading={loading} error={error} />
        )}
      </main>
    </div>
  )
}
