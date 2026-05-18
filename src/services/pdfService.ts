import type { GeneratedItinerary, WizardData } from '../types'

const TYPE_ICONS: Record<string, string> = {
  hotel: '🏨',
  restaurante: '🍽️',
  passeio: '🗺️',
  transporte: '🚗',
  voo: '✈️',
  livre: '☀️',
}

export async function exportToPDF(
  itinerary: GeneratedItinerary,
  data: WizardData
): Promise<void> {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  let y = margin

  const checkPage = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Header
  doc.setFillColor(10, 22, 40)
  doc.rect(0, 0, pageW, 40, 'F')
  doc.setTextColor(201, 151, 60)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('ROTEIRO DE VIAGEM', margin, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(245, 240, 232)
  doc.text('Decifrando Milhas — Planejador de Roteiros', margin, 26)
  doc.text(itinerary.destination.toUpperCase(), margin, 34)
  y = 50

  // Summary
  doc.setTextColor(10, 22, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const summaryLines = doc.splitTextToSize(itinerary.summary, contentW)
  doc.text(summaryLines, margin, y)
  y += summaryLines.length * 5 + 8

  // Flight info
  const flight = data.outboundFlight!
  doc.setFillColor(240, 235, 225)
  doc.rect(margin, y, contentW, 22, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 22, 40)
  doc.text('✈ VOO DE IDA', margin + 3, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${flight.flightNumber} | ${flight.originCode} → ${flight.destinationCode} | ${flight.date} | ${flight.departure} → ${flight.arrival}`,
    margin + 3,
    y + 14
  )
  doc.setFont('helvetica', 'bold')
  doc.text(`Duração: ${flight.duration}`, margin + 3, y + 20)
  y += 28

  // Days
  for (const day of itinerary.days) {
    checkPage(20)

    // Day header
    doc.setFillColor(10, 22, 40)
    doc.rect(margin, y, contentW, 9, 'F')
    doc.setTextColor(201, 151, 60)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(day.dayLabel.toUpperCase(), margin + 3, y + 6)
    y += 13

    for (const act of day.activities) {
      const icon = TYPE_ICONS[act.type] || '•'
      const titleText = `${act.time}  ${icon} ${act.title}`
      const descLines = doc.splitTextToSize(act.description, contentW - 6)
      const blockH = 7 + descLines.length * 4.5 + (act.tips ? 5 : 0) + 4

      checkPage(blockH)

      doc.setTextColor(10, 22, 40)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(titleText, margin + 3, y)
      y += 5

      if (act.estimatedCost) {
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 80, 40)
        doc.setFontSize(8)
        doc.text(`Custo estimado: ${act.estimatedCost}`, margin + 6, y)
        y += 4
      }

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(8)
      doc.text(descLines, margin + 6, y)
      y += descLines.length * 4.5

      if (act.tips) {
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(80, 100, 80)
        const tipLines = doc.splitTextToSize(`💡 ${act.tips}`, contentW - 8)
        doc.text(tipLines, margin + 6, y)
        y += tipLines.length * 4 + 1
      }

      y += 4
      doc.setDrawColor(220, 215, 205)
      doc.line(margin + 3, y, pageW - margin, y)
      y += 3
    }
    y += 4
  }

  // Hotels
  checkPage(30)
  doc.setFillColor(10, 22, 40)
  doc.rect(margin, y, contentW, 9, 'F')
  doc.setTextColor(201, 151, 60)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('🏨 SUGESTÕES DE HOSPEDAGEM', margin + 3, y + 6)
  y += 13

  for (const hotel of itinerary.hotels) {
    checkPage(25)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 22, 40)
    doc.setFontSize(9)
    doc.text(`${hotel.name} — ${hotel.category}`, margin + 3, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(8)
    doc.text(`📍 ${hotel.location}  |  💰 ${hotel.priceRange}`, margin + 6, y)
    y += 4
    doc.text(hotel.highlights.map(h => `• ${h}`).join('   '), margin + 6, y)
    y += 8
  }

  // Footer total cost
  checkPage(15)
  doc.setFillColor(240, 235, 225)
  doc.rect(margin, y, contentW, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 22, 40)
  doc.setFontSize(9)
  doc.text(
    `💰 Custo total estimado: ${itinerary.totalEstimatedCost}`,
    margin + 3,
    y + 8
  )
  y += 18

  // Footer
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(150, 140, 120)
  doc.text(
    'Gerado pelo Planejador de Roteiros — Decifrando Milhas | decifrandomilhas.com.br',
    margin,
    pageH - 8
  )

  doc.save(
    `roteiro-${itinerary.destination.toLowerCase().replace(/\s/g, '-')}.pdf`
  )
}
