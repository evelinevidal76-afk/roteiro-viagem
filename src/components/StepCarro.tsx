import React, { useState } from 'react'
import type { WizardData } from '../types'
import { StepHeader, NavButtons } from './ui'

interface CarOption {
  category: string
  description: string
  priceRange: string
  examples: string[]
  icon: string
}

interface Props {
  data: WizardData
  update: (patch: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

const CAR_OPTIONS: CarOption[] = [
  {
    category: 'Econômico',
    description: 'Ideal para cidades, baixo consumo, fácil estacionamento',
    priceRange: 'US$ 25 - US$ 50/dia',
    examples: ['Volkswagen Gol', 'Hyundai HB20', 'Fiat Argo'],
    icon: '🚗',
  },
  {
    category: 'Intermediário',
    description: 'Conforto adicional, ideal para estradas e cidades médias',
    priceRange: 'US$ 50 - US$ 90/dia',
    examples: ['Toyota Corolla', 'Honda Civic', 'Chevrolet Cruze'],
    icon: '🚘',
  },
  {
    category: 'SUV / Espaçoso',
    description: 'Para grupos, bagagens grandes ou estradas irregulares',
    priceRange: 'US$ 80 - US$ 150/dia',
    examples: ['Jeep Compass', 'Toyota RAV4', 'Hyundai Tucson'],
    icon: '🚙',
  },
]

function buildRentalcarsUrl(destination: string, pickup: string, dropoff: string) {
  const dest = encodeURIComponent(destination)
  return `https://www.rentalcars.com/pt/?affiliateCode=7962462&preflang=pt&adplat=meta&pickup=${dest}&pickupDate=${pickup}&dropoffDate=${dropoff}`
}

export default function StepCarro({ data, update, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  const outLegs = (data as any).outboundLegs || (data.outboundFlight ? [data.outboundFlight] : [])
  const retLegs = (data as any).returnLegs || (data.returnFlight ? [data.returnFlight] : [])
  const cities = (data as any).cities || []
  const destino = cities.length > 0 ? cities[0] : (outLegs.length > 0 ? outLegs[outLegs.length - 1].destinationCode : '?')
  const pickup = outLegs.length > 0 ? outLegs[0].date : ''
  const dropoff = retLegs.length > 0 ? retLegs[0].date : ''

  const handleSelect = (i: number) => {
    setSelected(i)
    update({ selectedCar: CAR_OPTIONS[i] } as any)
  }

  return (
    <div className="fade-up">
      <StepHeader
        title="Aluguel de carro 🚗"
        subtitle={`Escolha a categoria de carro para ${destino}`}
      />

      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        {CAR_OPTIONS.map((car, i) => (
          <div
            key={i}
            onClick={() => handleSelect(i)}
            style={{
              background: 'var(--navy-soft)',
              border: `1px solid ${selected === i ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {selected === i && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: 'var(--gold)', color: '#0d1521',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>✓</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{car.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--cream)' }}>{car.category}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{car.description}</div>
                </div>
              </div>
              <div style={{
                background: 'rgba(201,151,60,0.12)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '4px 10px',
                fontSize: 12, color: 'var(--gold)',
                fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {car.priceRange}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {car.examples.map((ex, j) => (
                <span key={j} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 11, color: 'var(--muted)',
                }}>{ex}</span>
              ))}
            </div>

            <a
              href={buildRentalcarsUrl(destino, pickup, dropoff)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'inline-block',
                background: '#e87722',
                color: 'white',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
              }}
            >
              🚗 Ver opções →
            </a>
          </div>
        ))}
      </div>

      {pickup && dropoff && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <a
            href={buildRentalcarsUrl(destino, pickup, dropoff)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline' }}
          >
            Ver todas as opções de carro em {destino} →
          </a>
        </div>
      )}

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel={selected !== null ? 'Continuar com este carro →' : 'Pular esta etapa →'}
      />
    </div>
  )
}
