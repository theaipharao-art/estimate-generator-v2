export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { imageBase64, mimeType } = req.body
    if (!imageBase64) return res.status(400).json({ error: 'No image' })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Server not configured' })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 },
          }, {
            type: 'text',
            text: 'Extract ONLY this JSON: {"jobNumber":"", "location":"", "serviceLine":"", "urgency":"Normal", "scope":"", "techRate":41, "helperRate":21, "tripCharge":30}',
          }],
        }],
      }),
    })

    if (!response.ok) {
      return res.status(500).json({ error: 'Claude API error' })
    }

    const data = await response.json()
    const text = data.content[0].text

    let extracted = { jobNumber: '', location: '', serviceLine: '', urgency: 'Normal', scope: '', techRate: 41, helperRate: 21, tripCharge: 30 }
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) extracted = JSON.parse(jsonMatch[0])
    } catch (e) {
      console.log('Parse error')
    }

    res.json(extracted)
  } catch (error) {
    res.status(500).json({ error: 'Failed to process' })
  }
}
