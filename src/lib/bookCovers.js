// Looks up a book cover thumbnail via the Open Library Search API (no key required).
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

// Fallback for titles Open Library doesn't index (many small/indie/self-published
// books) via the Google Books volumes API (no key required for this query volume).
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

export async function fetchBookCoverUrl(title, author) {
  if (!title) return null
  return (await fetchFromOpenLibrary(title, author)) || (await fetchFromGoogleBooks(title, author))
}
