// Proxies TikTok's oEmbed endpoint. TikTok doesn't reliably send CORS
// headers for third-party origins, so calling it directly from the browser
// silently fails for many requests — fetch it server-side instead.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { url } = req.query
  if (!url) {
    res.status(400).json({ error: 'Missing url' })
    return
  }

  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
    if (!response.ok) {
      res.status(200).json({ title: null, author_name: null, thumbnail_url: null })
      return
    }
    const data = await response.json()
    res.status(200).json({
      title: data.title || null,
      author_name: data.author_name || null,
      thumbnail_url: data.thumbnail_url || null,
    })
  } catch (err) {
    console.error('TikTok oEmbed error:', err)
    res.status(200).json({ title: null, author_name: null, thumbnail_url: null })
  }
}
