import React, { useEffect, useRef } from 'react'
import type { WizardData } from '../types'
import { getCurrencyByAirport, formatLocalAmount } from '../data/currencies'

const CJ_AID = '7962462'

let imgSeedCounter = 0
function fixImageUrls(html: string): string {
  return html.replace(/src="([^"]+)"/g, (match, url) => {
    if (url.includes('{') || url.includes('}') || url.trim() === '') {
      imgSeedCounter++
      return `src="https://picsum.photos/seed/${imgSeedCounter}/800/220"`
    }
    if (/loremflickr\.com\/\d+\/\d+\/?$/.test(url)) {
      imgSeedCounter++
      return `src="https://picsum.photos/seed/${imgSeedCounter}/800/220"`
    }
    return match
  })
}

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

function calcTotalDays(data: WizardData): number {
  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const retLegs = (data as any).returnLegs || (data.returnFlight ? [data.returnFlight] : [])
  if (outLegs.length === 0) return 5
  const outDate = new Date(outLegs[0].date)
  if (retLegs.length > 0) {
    const diff = Math.round((new Date(retLegs[0].date).getTime() - outDate.getTime()) / 86400000)
    return Math.max(1, Math.min(diff, 21))
  }
  return 5
}

function BudgetCard({ data }: { data: WizardData }) {
  const totalDays = calcTotalDays(data)
  const hotels = (data.selectedHotels || []).filter(h => h.confirmed && h.name.trim())
  const hotelTotal = hotels.reduce((s, h) => s + (h.pricePerNightBRL || 0) * (h.nights || 1), 0)
  const hotelPaid = hotels.filter(h => h.hotelPaid).reduce((s, h) => s + (h.pricePerNightBRL || 0) * (h.nights || 1), 0)
  const flightTotal = data.flightCostBRL || 0
  const dailyTotal = (data.dailyBudgetBRL || 0) * totalDays * (data.travelersCount || 1)
  const grandTotal = flightTotal + hotelTotal + dailyTotal
  const totalPaid = (data.flightPaid ? flightTotal : 0) + hotelPaid
  const totalUnpaid = grandTotal - totalPaid

  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const destCode = outLegs.length > 0 ? outLegs[outLegs.length - 1].destinationCode : ''
  const currency = getCurrencyByAirport(destCode)

  if (grandTotal === 0) return null

  return (
    <div style={{
      background: '#1a2235', border: '1px solid #2d3a52', borderRadius: 14,
      padding: '20px 24px', marginBottom: 28,
    }} className="no-print">
      <div style={{ fontSize: 13, fontWeight: 700, color: '#c9973c', marginBottom: 14 }}>
        💰 Resumo financeiro da viagem
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        {flightTotal > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#8892a4', marginBottom: 4 }}>✈️ Passagens</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0e6d3' }}>R$ {flightTotal.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 11, color: data.flightPaid ? '#34d399' : '#f59e0b', marginTop: 3 }}>{data.flightPaid ? '✓ Já pago' : '⚠ A pagar'}</div>
          </div>
        )}
        {hotelTotal > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#8892a4', marginBottom: 4 }}>🏨 Hospedagem</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0e6d3' }}>R$ {hotelTotal.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 11, color: hotelPaid === hotelTotal ? '#34d399' : '#f59e0b', marginTop: 3 }}>
              {hotelPaid === hotelTotal ? '✓ Já pago' : hotelPaid > 0 ? `✓ R$ ${hotelPaid.toLocaleString('pt-BR')} pago` : '⚠ A pagar lá'}
            </div>
          </div>
        )}
        {dailyTotal > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#8892a4', marginBottom: 4 }}>🎒 Gastos diários</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0e6d3' }}>R$ {dailyTotal.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 11, color: '#8892a4', marginTop: 3 }}>{totalDays} dias · {data.travelersCount} pessoa(s)</div>
          </div>
        )}
        <div style={{ background: 'rgba(201,151,60,0.08)', border: '1px solid rgba(201,151,60,0.25)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: '#c9973c', marginBottom: 4 }}>TOTAL</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#c9973c' }}>R$ {grandTotal.toLocaleString('pt-BR')}</div>
          {totalPaid > 0 && <div style={{ fontSize: 11, color: '#34d399', marginTop: 3 }}>✓ R$ {totalPaid.toLocaleString('pt-BR')} pago</div>}
        </div>
      </div>
      {totalUnpaid > 0 && currency.code !== 'BRL' && (
        <div style={{ background: 'rgba(201,151,60,0.06)', border: '1px solid rgba(201,151,60,0.18)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#c9973c', fontWeight: 600, marginBottom: 2 }}>💱 Levar na {currency.name}</div>
            <div style={{ fontSize: 10, color: '#8892a4' }}>Cotação aprox. · confirme antes de viajar</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f0e6d3' }}>{formatLocalAmount(totalUnpaid, currency)}</div>
        </div>
      )}
    </div>
  )
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
        {!loading && <BudgetCard data={data} />}
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: fixImageUrls(html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim()) }} />
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
