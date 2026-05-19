import React, { useState, useEffect, useRef } from 'react'
import type { WizardData } from '../types'
import { Button, ErrorBox } from './ui'
import { generateDay } from '../services/itineraryService'

interface Props {
  data: WizardData
  dayIndex: number
  totalDays: number
  previousDays: string[]
  onApprove: (html: string) => void
}

export default function DayApproval({ data, dayIndex, totalDays, previousDays, onApprove }: Props) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const htmlRef = useRef('')

  useEffect(() => {
    htmlRef.current = ''
    setHtml('')
    setLoading(true)
    setError(null)

    generateDay(
      data,
      dayIndex,
      totalDays,
      previousDays,
      attempt,
      (chunk) => {
        htmlRef.current += chunk
        setHtml(htmlRef.current)
      },
      () => setLoading(false),
      (msg) => {
        setError(msg)
        setLoading(false)
      }
    )
  }, [attempt, dayIndex])

  const handleRegenerate = () => setAttempt(a => a + 1)

  const progressPct = Math.round((dayIndex / totalDays) * 100)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>
            Decifrando Roteiros
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Dia {dayIndex + 1} de {totalDays}
            {loading && <span style={{ marginLeft: 10, color: 'var(--gold)' }}>✦ Gerando...</span>}
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ flex: 1, maxWidth: 220 }}>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--gold)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
            {dayIndex} de {totalDays} dias aprovados
          </div>
        </div>
      </header>

      {/* Conteudo streamado */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {!html && loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 40, height: 40,
              border: '2px solid var(--gold)', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Criando o Dia {dayIndex + 1}...</p>
            {attempt > 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                Gerando opcao diferente...
              </p>
            )}
          </div>
        )}

        {error && <ErrorBox message={error} />}

        {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
      </main>

      {/* Botoes de acao */}
      {!loading && !error && html && (
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          background: 'rgba(13,21,33,0.95)',
          position: 'sticky', bottom: 0,
        }}>
          <Button variant="secondary" onClick={handleRegenerate}>
            🔄 Gerar outra opcao
          </Button>
          <Button onClick={() => onApprove(htmlRef.current)}>
            {dayIndex + 1 < totalDays
              ? `✓ Aprovar Dia ${dayIndex + 1} e ver o proximo →`
              : `✓ Aprovar Dia ${dayIndex + 1} e ver o roteiro completo →`
            }
          </Button>
        </div>
      )}

      {error && !loading && (
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 12, justifyContent: 'center',
        }}>
          <Button variant="secondary" onClick={handleRegenerate}>Tentar novamente</Button>
        </div>
      )}
    </div>
  )
}
