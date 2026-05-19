import React, { useEffect, useRef } from 'react'
import type { WizardData } from '../types'

const CJ_AID = '7962462'

// Garante código de afiliado em todos os links do Booking.com no HTML gerado
function injectAffiliateLinks(container: HTMLElement) {
  container.querySelectorAll<HTMLAnchorElement>('a[href*="booking.com"]').forEach(a => {
    try {
      const url = new URL(a.href)
      if (!url.searchParams.has('aid')) {
        url.searchParams.set('aid', CJ_AID)
        a.href = url.toString()
      }
    } catch {}
  })
}

interface Props {
  html: string
  loading: boolean
  data: WizardData
  onRestart: () => void
}

export default function ItineraryView({ html, loading, data, onRestart }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const handlePrint = () => window.print()

  useEffect(() => {
    if (contentRef.current && !loading) {
      injectAffiliateLinks(contentRef.current)
    }
  }, [html, loading])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }} className="no-print">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)', fontWeight: 700 }}>
            Decifrando Roteiros
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {data.travelersCount} viajante(s)
            {loading && <span style={{ marginLeft: 12, color: 'var(--gold)' }}>✦ Gerando roteiro...</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onRestart}
            style={{
              padding: '8px 16px', fontSize: 13, background: 'none',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            + Novo roteiro
          </button>
          {!loading && html && (
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px', fontSize: 13,
                background: 'var(--gold)', border: 'none', borderRadius: 8,
                color: '#0d1521', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)',
              }}
            >
              🖨️ Imprimir / PDF
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo streamado */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {!html && loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 40, height: 40,
              border: '2px solid var(--gold)', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Gerando seu roteiro personalizado...</p>
          </div>
        )}
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
