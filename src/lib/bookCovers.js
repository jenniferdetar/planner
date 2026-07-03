// Looks up a book cover thumbnail via the Open Library Search API (no key required).
export async function fetchBookCoverUrl(title, author) {
  if (!title) return null
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
