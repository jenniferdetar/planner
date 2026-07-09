// Looks up a book cover thumbnail via our own API (which checks Open Library,
// then falls back to Google Books). Routed server-side rather than called
// directly from the browser to avoid depending on either API's CORS support.
export async function fetchBookCoverUrl(title, author) {
  if (!title) return null
  try {
    const params = new URLSearchParams({ title })
    if (author) params.set('author', author)
    const res = await fetch(`/api/book-cover?${params.toString()}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.coverUrl || null
  } catch {
    return null
  }
}
