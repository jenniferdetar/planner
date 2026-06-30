// Looks up a web page's <title> via a CORS-friendly metadata API, falling
// back to the page's hostname if the lookup fails or returns nothing useful.
export async function fetchPageTitle(url) {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    if (res.ok) {
      const { data } = await res.json()
      if (data?.title) return data.title
    }
  } catch {
    // Metadata lookup failed; fall through to the hostname fallback.
  }

  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
