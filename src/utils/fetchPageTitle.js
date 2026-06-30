// Looks up a page's <title> via microlink.io's free metadata API (CORS-enabled,
// no server needed since this app has no backend of its own).
export async function fetchPageTitle(url) {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    const { data } = await res.json()
    return data?.title || null
  } catch {
    return null
  }
}
