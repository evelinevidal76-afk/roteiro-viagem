export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { prompt } = req.body
    const apiKey = process.env.ANTHROPIC_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_KEY não configurada no servidor' })
    }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: `Erro Anthropic: ${err}` })
    }
    const data = await response.json()
    const text = data?.content?.[0]?.text || ''
    return res.status(200).json({ text })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
