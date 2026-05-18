import React, { useState } from 'react'
import type { GeneratedItinerary, WizardData, Activity } from '../types'
import { Button, Spinner } from './ui'
import { exportToPDF } from '../services/pdfService'

const TYPE_COLORS: Record<string, string> = {
  hotel: '#c9973c',
  restaurante: '#1D9E75',
  passeio: '#378ADD',
  transporte: '#888780',
  voo: '#c9973c',
  livre: '#7F77DD',
}

const TYPE_ICONS: Record<string, string> = {
  hotel: '🏨',
  restaurante: '🍽️',
  passeio: '🗺️',
  transporte: '🚗',
  voo: '✈️',
  livre: '☀️',
}

interface Props {
  itinerary: GeneratedItinerary
  data: WizardData
  onRestart: () => void
}

export default function ItineraryView({ itinerary, data, onRestart }: Props) {
  const [exporting, setExporting] = useState(false)
  const [activeDay, setActiveDay] = useState(0)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportToPDF(itinerary, data)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

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
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)', fontWeight: 700 }}>
            {itinerary.destination}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {itinerary.days.length} dias · {data.travelersCount} viajante(s)
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={onRestart}>+ Novo roteiro</Button>
          <Button onClick={handleExport} loading={exporting}>
            {exporting ? '' : '📥 Exportar PDF'}
          </Button>
        </div>
      </header>

      {/* Summary */}
      <div style={{
        padding: '16px 24px',
        background: 'var(--navy-soft)',
        borderBottom: '1px solid var(--border)',
        fontSize: 13,
        color: 'var(--muted)',
        lineHeight: 1.6,
      }}>
        {itinerary.summary}
        <span style={{ marginLeft: 16, color: 'var(--gold)', fontWeight: 600 }}>
          💰 {itinerary.totalEstimatedCost}
        </span>
      </div>

      {/* Day tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        gap: 0,
      }}>
        {itinerary.days.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            style={{
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: i === activeDay ? 600 : 400,
              color: i === activeDay ? 'var(--gold)' : 'var(--muted)',
              background: 'none',
              border: 'none',
              borderBottom: i === activeDay ? '2px solid var(--gold)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}
          >
            {day.dayLabel.split('—')[0].trim()}
          </button>
        ))}
        <button
          onClick={() => setActiveDay(itinerary.days.length)}
          style={{
            padding: '12px 16px',
            fontSize: 12,
            fontWeight: activeDay === itinerary.days.length ? 600 : 400,
            color: activeDay === itinerary.days.length ? 'var(--gold)' : 'var(--muted)',
            background: 'none',
            border: 'none',
            borderBottom: activeDay === itinerary.days.length ? '2px solid var(--gold)' : '2px solid transparent',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          🏨 Hotéis
        </button>
      </div>

      {/* Content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        {activeDay < itinerary.days.length ? (
          <DayView day={itinerary.days[activeDay]} />
        ) : (
          <HotelsView hotels={itinerary.hotels} />
        )}
      </main>
    </div>
  )
}

function DayView({ day }: { day: GeneratedItinerary['days'][0] }) {
  return (
    <div className="fade-up">
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        color: 'var(--cream)',
        marginBottom: 4,
        fontWeight: 700,
      }}>
        {day.dayLabel}
      </h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>{day.date}</p>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: 42,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'var(--border)',
        }} />

        {day.activities.map((act, i) => (
          <ActivityCard key={i} activity={act} index={i} />
        ))}
      </div>
    </div>
  )
}

function ActivityCard({ activity: act, index }: { activity: Activity; index: number }) {
  const [open, setOpen] = useState(false)
  const color = TYPE_COLORS[act.type] || '#888'
  const icon = TYPE_ICONS[act.type] || '•'

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        marginBottom: 16,
        animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
      }}
    >
      {/* Time + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>{act.time}</span>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: `${color}22`,
          border: `1.5px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          zIndex: 1,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          flex: 1,
          background: 'var(--navy-soft)',
          border: '1px solid var(--border)',
          borderLeft: `3px solid ${color}`,
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: 0,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--cream)' }}>{act.title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
              {act.duration}{act.estimatedCost ? ` · ${act.estimatedCost}` : ''}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
        </div>

        {open && (
          <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--cream)', lineHeight: 1.6, marginBottom: act.tips ? 10 : 0 }}>
              {act.description}
            </p>
            {act.tips && (
              <div style={{
                background: 'rgba(201,151,60,0.08)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: 'var(--gold)',
                lineHeight: 1.5,
              }}>
                💡 {act.tips}
              </div>
            )}
            {act.link && (
              <a
                href={act.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: 'var(--gold)', textDecoration: 'underline' }}
                onClick={e => e.stopPropagation()}
              >
                🔗 Site oficial
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function HotelsView({ hotels }: { hotels: GeneratedItinerary['hotels'] }) {
  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--cream)', marginBottom: 24, fontWeight: 700 }}>
        Sugestões de hospedagem
      </h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {hotels.map((hotel, i) => (
          <div
            key={i}
            style={{
              background: 'var(--navy-soft)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--cream)' }}>{hotel.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                  {hotel.category} · 📍 {hotel.location}
                </div>
              </div>
              <div style={{
                background: 'rgba(201,151,60,0.12)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 12,
                color: 'var(--gold)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {hotel.priceRange}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {hotel.highlights.map((h, j) => (
                <span key={j} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 11,
                  color: 'var(--muted)',
                }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
