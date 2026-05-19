import React, { useState, useEffect } from 'react'
import type { WizardData, SelectedHotel } from './types'
import StepFlight from './components/StepFlight'
import StepCities, { StepProfile, StepStyles, StepTransport } from './components/Steps'
import StepHotel from './components/StepHotel'
import StepCarro from './components/StepCarro'
import StepExtras from './components/StepExtras'
import StepCityPlan from './components/StepCityPlan'
import ItineraryView from './components/ItineraryView'
import DayApproval from './components/DayApproval'
import {
  salvarEstado, recuperarSessao, getSessaoId, clearSessaoId,
  getSessaoCodigo, getSessaoEmail, setSessaoEmail,
  salvarEmail, recuperarSessaoPorCodigo,
} from './services/dbService'

const STEPS = ['Voo', 'Destino', 'Perfil', 'Estilo', 'Transporte', 'Hotel', 'Carro', 'Detalhes', 'Destinos']
const LS_KEY = 'decifrando_roteiros_step'
const PROGRESS_KEY = 'decifrando_roteiros_progress'

type AppMode = 'wizard' | 'dayApproval' | 'fullItinerary'

interface AppProgress {
  mode: AppMode
  approvedDays: string[]
  currentDayIndex: number
  totalDays: number
  fullItineraryHtml: string | null
  selectedHotels: SelectedHotel[]
}

function saveProgress(p: AppProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  } catch {}
}

function loadProgress(): AppProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const initialData: WizardData = {
  outboundFlight: null,
  outboundLegs: [],
  returnFlight: null,
  returnLegs: [],
  hasReturn: false,
  citiesCount: 1,
  cities: [],
  cityNights: [],
  travelProfile: null,
  travelStyles: [],
  transport: null,
  selectedHotels: [],
  travelersCount: 2,
  notes: '',
  cityPlans: [],
  flightCostBRL: 0,
  flightPaid: false,
  dailyBudgetBRL: 0,
}

function calculateTotalDays(data: WizardData): number {
  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const retLegs = (data as any).returnLegs || (data.returnFlight ? [data.returnFlight] : [])

  if (outLegs.length === 0) return 5

  // Usa último trecho de ida (data de chegada ao destino) como ponto de partida
  // parseLocalDate evita o bug de timezone: new Date('2026-10-20') vira UTC 00:00
  // que no fuso UTC-3 do Brasil fica dia 19 às 21h
  const parseLocalDate = (str: string) => {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d, 12, 0, 0)
  }
  const lastOutLeg = outLegs[outLegs.length - 1]
  const outDate = parseLocalDate(lastOutLeg.date)
  if (retLegs.length > 0) {
    const retDate = parseLocalDate(retLegs[0].date)
    const diff = Math.round((retDate.getTime() - outDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, Math.min(diff, 21))
  }
  return 5
}

function usesCarRental(data: WizardData) {
  return data.transport === 'carro' || data.transport === 'misto'
}

export default function App() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(initialData)
  const [mode, setMode] = useState<AppMode>('wizard')
  const [approvedDays, setApprovedDays] = useState<string[]>([])
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [fullItineraryHtml, setFullItineraryHtml] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accessCode, setAccessCode] = useState<string | null>(getSessaoCodigo)
  const [userEmail, setUserEmail] = useState<string>(getSessaoEmail() || '')
  const [showRecovery, setShowRecovery] = useState(() => !getSessaoId())
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [recoveryError, setRecoveryError] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSaved, setEmailSaved] = useState(!!getSessaoEmail())
  const [codeCopied, setCodeCopied] = useState(false)

  useEffect(() => {
    const sessaoId = getSessaoId()
    const progress = loadProgress()
    const hasSavedData = !!sessaoId || !!progress

    // Se não há nada salvo, pula direto para o wizard sem mostrar spinner
    if (!hasSavedData) {
      setRestoring(false)
      return
    }

    const restoreAll = async () => {
      // 1. Restaura progresso do roteiro (localStorage — rápido, sem rede)
      if (progress) {
        if (progress.selectedHotels?.length) {
          setData(prev => ({ ...prev, selectedHotels: progress.selectedHotels }))
        }
        if (progress.mode !== 'wizard') {
          setMode(progress.mode)
          setApprovedDays(progress.approvedDays || [])
          setCurrentDayIndex(progress.currentDayIndex || 0)
          setTotalDays(progress.totalDays || 0)
          setFullItineraryHtml(progress.fullItineraryHtml || null)
        }
      }

      // 2. Restaura WizardData do Supabase (com timeout de 4s para não travar)
      if (sessaoId) {
        const timeout = new Promise<null>(res => setTimeout(() => res(null), 4000))
        const saved = await Promise.race([
          recuperarSessao(sessaoId).catch(() => null),
          timeout,
        ])
        if (saved) {
          setData(prev => ({ ...prev, ...saved }))
          const savedStep = parseInt(localStorage.getItem(LS_KEY) || '0')
          setStep(savedStep)
        }
      }

      setRestoring(false)
    }

    restoreAll()
  }, [])

  const update = async (patch: Partial<WizardData>) => {
    const next = { ...data, ...patch }
    setData(next)
    setSaving(true)

    // Persiste hotéis no localStorage junto com o progresso atual
    const progress = loadProgress()
    saveProgress({
      mode: progress?.mode || 'wizard',
      approvedDays: progress?.approvedDays || [],
      currentDayIndex: progress?.currentDayIndex || 0,
      totalDays: progress?.totalDays || 0,
      fullItineraryHtml: progress?.fullItineraryHtml || null,
      selectedHotels: next.selectedHotels || [],
    })

    try { await salvarEstado(next) } catch {}
    // Detecta quando a sessão (e o código) é criada pela primeira vez
    if (!accessCode) {
      const code = getSessaoCodigo()
      if (code) setAccessCode(code)
    }
    setSaving(false)
  }

  const goToStep = (s: number) => {
    setStep(s)
    localStorage.setItem(LS_KEY, String(s))
  }

  const next = () => {
    const nextStep = step + 1
    if (nextStep === 6 && !usesCarRental(data)) {
      goToStep(7)
    } else {
      goToStep(Math.min(nextStep, STEPS.length - 1))
    }
  }

  const back = () => {
    const prevStep = step - 1
    if (prevStep === 6 && !usesCarRental(data)) {
      goToStep(5)
    } else {
      goToStep(Math.max(prevStep, 0))
    }
  }

  const handleBackToWizard = (targetStep?: number) => {
    setMode('wizard')
    const s = targetStep ?? step
    goToStep(s)
    saveProgress({
      mode: 'wizard',
      approvedDays,
      currentDayIndex,
      totalDays,
      fullItineraryHtml,
      selectedHotels: data.selectedHotels || [],
    })
  }

  const handleGenerate = () => {
    const days = calculateTotalDays(data)
    setTotalDays(days)
    setCurrentDayIndex(0)
    setApprovedDays([])
    setFullItineraryHtml(null)
    setMode('dayApproval')
    saveProgress({
      mode: 'dayApproval',
      approvedDays: [],
      currentDayIndex: 0,
      totalDays: days,
      fullItineraryHtml: null,
      selectedHotels: data.selectedHotels || [],
    })
  }

  const handleApproveDay = (html: string) => {
    const newApproved = [...approvedDays, html]
    setApprovedDays(newApproved)

    if (newApproved.length >= totalDays) {
      const header = `<div style="margin-bottom:32px">
        <h1 style="font-family:Georgia,serif;color:#c9973c;font-size:28px;font-weight:700;margin-bottom:8px">Roteiro Completo</h1>
        <p style="color:#8892a4;font-size:14px">${data.travelersCount} viajante(s) · ${totalDays} dias aprovados</p>
      </div>`
      const fullHtml = header + newApproved.join('\n')
      setFullItineraryHtml(fullHtml)
      setMode('fullItinerary')
      saveProgress({
        mode: 'fullItinerary',
        approvedDays: newApproved,
        currentDayIndex: totalDays,
        totalDays,
        fullItineraryHtml: fullHtml,
        selectedHotels: data.selectedHotels || [],
      })
    } else {
      const nextDay = currentDayIndex + 1
      setCurrentDayIndex(nextDay)
      saveProgress({
        mode: 'dayApproval',
        approvedDays: newApproved,
        currentDayIndex: nextDay,
        totalDays,
        fullItineraryHtml: null,
        selectedHotels: data.selectedHotels || [],
      })
    }
  }

  const restart = () => {
    clearSessaoId()
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem(PROGRESS_KEY)
    setStep(0)
    setData(initialData)
    setMode('wizard')
    setApprovedDays([])
    setCurrentDayIndex(0)
    setTotalDays(0)
    setFullItineraryHtml(null)
    setAccessCode(null)
    setUserEmail('')
    setEmailSaved(false)
    setShowRecovery(true)
  }

  const handleRecovery = async () => {
    if (!recoveryEmail.trim() || !recoveryCode.trim()) {
      setRecoveryError('Preencha e-mail e código.')
      return
    }
    setRecoveryLoading(true)
    setRecoveryError('')
    const saved = await recuperarSessaoPorCodigo(recoveryEmail, recoveryCode)
    if (saved) {
      setData(prev => ({ ...prev, ...saved }))
      const savedStep = parseInt(localStorage.getItem(LS_KEY) || '0')
      setStep(savedStep)
      setAccessCode(recoveryCode.trim().toUpperCase())
      setUserEmail(recoveryEmail.trim().toLowerCase())
      setEmailSaved(true)
      setShowRecovery(false)
    } else {
      setRecoveryError('E-mail ou código não encontrado. Verifique e tente novamente.')
    }
    setRecoveryLoading(false)
  }

  const handleSaveEmail = async () => {
    const sessaoId = getSessaoId()
    if (!sessaoId || !userEmail.trim() || emailSaved) return
    setEmailSaving(true)
    await salvarEmail(sessaoId, userEmail)
    setEmailSaved(true)
    setSessaoEmail(userEmail.trim().toLowerCase())
    setEmailSaving(false)
  }

  const handleCopyCode = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
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

  // Tela de recuperação — aparece quando não há sessão no localStorage
  if (showRecovery) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gold)', fontWeight: 700 }}>Decifrando Roteiros</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>Decifrando Milhas</div>
        </div>

        <div style={{ width: '100%', maxWidth: 400, background: 'var(--navy-soft)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cream)', marginBottom: 4 }}>Recuperar roteiro salvo</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Informe o e-mail e o código recebido ao criar seu roteiro.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>E-mail</label>
              <input
                type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)}
                placeholder="seu@email.com" onKeyDown={e => e.key === 'Enter' && handleRecovery()}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Código (ex: ABC123)</label>
              <input
                type="text" value={recoveryCode} onChange={e => setRecoveryCode(e.target.value.toUpperCase())}
                placeholder="ABC123" maxLength={6} onKeyDown={e => e.key === 'Enter' && handleRecovery()}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cream)', fontSize: 16, letterSpacing: '0.2em', fontWeight: 700, boxSizing: 'border-box' }}
              />
            </div>
            {recoveryError && <div style={{ fontSize: 12, color: '#f87171' }}>{recoveryError}</div>}
            <button onClick={handleRecovery} disabled={recoveryLoading}
              style={{ padding: '11px', background: 'var(--gold)', border: 'none', borderRadius: 8, color: '#0d1521', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {recoveryLoading ? 'Buscando...' : 'Recuperar meu roteiro'}
            </button>
          </div>
        </div>

        <button onClick={() => setShowRecovery(false)}
          style={{ fontSize: 13, color: 'var(--gold)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Criar novo roteiro →
        </button>
      </div>
    )
  }

  if (mode === 'dayApproval') {
    return (
      <DayApproval
        data={data}
        dayIndex={currentDayIndex}
        totalDays={totalDays}
        previousDays={approvedDays}
        onApprove={handleApproveDay}
        onBack={handleBackToWizard}
      />
    )
  }

  if (mode === 'fullItinerary' && fullItineraryHtml !== null) {
    return <ItineraryView html={fullItineraryHtml} loading={false} data={data} onRestart={restart} />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>Decifrando Roteiros</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Decifrando Milhas</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {saving && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Salvando...</span>}

          {/* Código de acesso */}
          {accessCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,151,60,0.1)', border: '1px solid rgba(201,151,60,0.3)', borderRadius: 8, padding: '5px 10px' }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>CÓDIGO</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em' }}>{accessCode}</span>
              <button onClick={handleCopyCode} title="Copiar código"
                style={{ fontSize: 11, color: codeCopied ? '#34d399' : 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>
                {codeCopied ? '✓' : '⎘'}
              </button>
            </div>
          )}

          {/* Salvar e-mail (aparece quando há código mas e-mail ainda não foi salvo) */}
          {accessCode && !emailSaved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)}
                placeholder="seu@email.com" onKeyDown={e => e.key === 'Enter' && handleSaveEmail()}
                style={{ padding: '5px 8px', fontSize: 11, background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--cream)', width: 160 }} />
              <button onClick={handleSaveEmail} disabled={emailSaving || !userEmail.trim()}
                style={{ fontSize: 11, padding: '5px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--gold)', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {emailSaving ? '...' : 'Salvar e-mail'}
              </button>
            </div>
          )}
          {accessCode && emailSaved && (
            <span style={{ fontSize: 11, color: '#34d399' }}>✓ {userEmail}</span>
          )}

          {/* Botão de retorno ao roteiro em andamento */}
          {totalDays > 0 && (
            <button
              onClick={() => {
                if (fullItineraryHtml) {
                  setMode('fullItinerary')
                } else {
                  setMode('dayApproval')
                }
                saveProgress({
                  mode: fullItineraryHtml ? 'fullItinerary' : 'dayApproval',
                  approvedDays,
                  currentDayIndex,
                  totalDays,
                  fullItineraryHtml,
                  selectedHotels: data.selectedHotels || [],
                })
              }}
              style={{
                padding: '7px 14px', fontSize: 12, fontWeight: 600,
                background: 'var(--gold)', border: 'none', borderRadius: 8,
                color: '#0d1521', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              {fullItineraryHtml ? '→ Ver roteiro completo' : `→ Continuar roteiro (Dia ${currentDayIndex + 1}/${totalDays})`}
            </button>
          )}

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
        {STEPS.map((label, i) => {
          if (label === 'Carro' && !usesCarRental(data)) return null
          return (
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
          )
        })}
      </div>

      {step > 0 && (
        <div style={{ padding: '6px 24px', background: 'rgba(201,151,60,0.06)', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--gold)' }}>●</span> Progresso salvo automaticamente
        </div>
      )}

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {step === 0 && <StepFlight data={data} update={update} onNext={next} />}
        {step === 1 && <StepCities data={data} update={update} onNext={next} onBack={back} />}
        {step === 2 && <StepProfile data={data} update={update} onNext={next} onBack={back} />}
        {step === 3 && <StepStyles data={data} update={update} onNext={next} onBack={back} />}
        {step === 4 && <StepTransport data={data} update={update} onNext={next} onBack={back} />}
        {step === 5 && <StepHotel data={data} update={update} onNext={next} onBack={back} />}
        {step === 6 && <StepCarro data={data} update={update} onNext={next} onBack={back} />}
        {step === 7 && (
          <StepExtras data={data} update={update} onGenerate={next} onBack={back} loading={false} error={null} />
        )}
        {step === 8 && (
          <StepCityPlan data={data} update={update} onGenerate={handleGenerate} onBack={back} totalDays={calculateTotalDays(data)} />
        )}
      </main>
    </div>
  )
}
