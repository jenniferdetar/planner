// Looks up a book cover thumbnail server-side. Both Open Library and Google
// Books generally allow cross-origin GET requests, but routing this through
// our own API avoids depending on that and keeps the two-source fallback
// logic (and any future rate-limit handling) in one place.
async function fetchFromOpenLibrary(title, author) {
  try {
    const params = new URLSearchParams({ title, limit: '1', fields: 'cover_i' })
    if (author) params.set('author', author)
    const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`)
    if (!res.ok) return null
    const data = await res.json()
    const coverId = data.docs?.[0]?.cover_i
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null
  } catch {
    return null
  }
}

async function fetchFromGoogleBooks(title, author) {
  try {
    const q = author ? `intitle:${title} inauthor:${author}` : `intitle:${title}`
    const params = new URLSearchParams({ q, maxResults: '1' })
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`)
    if (!res.ok) return null
    const data = await res.json()
    const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail
    return thumb ? thumb.replace(/^http:/, 'https:') : null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { title, author } = req.query
  if (!title) {
    res.status(400).json({ error: 'Missing title' })
    return
  }

  const coverUrl = (await fetchFromOpenLibrary(title, author)) || (await fetchFromGoogleBooks(title, author))
  res.status(200).json({ coverUrl })
}
