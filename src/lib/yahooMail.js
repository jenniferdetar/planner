import { parseWebformText, webformToInteraction } from './webformParser'

// Calls the /api/yahoo-sync serverless function, which reads the Yahoo
// inbox over IMAP server-side (Yahoo has no public Gmail-style mail API).
export async function fetchYahooWebformEmails() {
  const res = await fetch('/api/yahoo-sync', { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Yahoo sync error ${res.status}`)
  }
  const data = await res.json()
  return data.messages || []
}

// Parse a { id, text } message from /api/yahoo-sync into an interaction record
export function parseYahooEmailToInteraction(msg) {
  return webformToInteraction(parseWebformText(msg.text || ''), 'yahoo_message_id', msg.id)
}
