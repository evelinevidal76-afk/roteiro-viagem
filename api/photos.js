// Palavras que indicam fotos genéricas/de trabalho — nunca queremos isso para viagem
const BAD_KEYWORDS = ['typewriter', 'desk', 'laptop', 'office', 'work', 'computer', 'keyboard',
  'notebook', 'coffee', 'business', 'meeting', 'fog', 'mist', 'pine', 'snow', 'winter', 'city']

function isBadPhoto(photo) {
  const alt = (photo.alt || '').toLowerCase()
  const photographer = (photo.photographer || '').toLowerCase()
  return BAD_KEYWORDS.some(kw => alt.includes(kw))
}

export default async function handler(req, res) {
  const { q, w = '800', h = '220' } = req.query
  if (!q) return res.status(400).json({ error: 'missing q' })

  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    const seed = String(q).slice(0, 14).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
    return res.redirect(`https://picsum.photos/seed/${seed}/${w}/${h}`)
  }

  // Enriquece a query com contexto de viagem para evitar fotos de escritório
  const query = String(q)
  const enriched = /hotel|resort|beach|pool|tropical|sea|ocean|travel|vacation|nature|ruins|cenote|jungle|reef/.test(query.toLowerCase())
    ? query
    : `${query} travel outdoor`

  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(enriched)}&per_page=15&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    )
    if (!r.ok) throw new Error(`Pexels ${r.status}`)
    const data = await r.json()
    const photos = (data.photos || []).filter(p => !isBadPhoto(p))

    if (photos.length === 0) {
      // Fallback: tenta query mais genérica de viagem
      const r2 = await fetch(
        `https://api.pexels.com/v1/search?query=travel+vacation+tropical&per_page=5&orientation=landscape`,
        { headers: { Authorization: apiKey } }
      )
      const d2 = await r2.json()
      const fallbackPhotos = d2.photos || []
      if (fallbackPhotos.length > 0) {
        const url = fallbackPhotos[0].src.large2x || fallbackPhotos[0].src.large
        res.setHeader('Cache-Control', 'public, max-age=3600')
        return res.redirect(302, url)
      }
      const seed = String(q).slice(0, 14).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
      return res.redirect(`https://picsum.photos/seed/${seed}/${w}/${h}`)
    }

    // Hash determinístico da query original → foto consistente a cada reload
    let hash = 0
    for (let i = 0; i < q.length; i++) hash = (hash * 31 + q.charCodeAt(i)) | 0
    const photo = photos[Math.abs(hash) % photos.length]
    const url = photo.src.large2x || photo.src.large || photo.src.original
    res.setHeader('Cache-Control', 'public, max-age=604800') // 7 dias
    res.redirect(302, url)
  } catch {
    const seed = String(q).slice(0, 14).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
    res.redirect(`https://picsum.photos/seed/${seed}/${w}/${h}`)
  }
}
