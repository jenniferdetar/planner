import { parseWebformText, webformToInteraction } from './webformParser'
import { isSkippedSender } from './interactionSkipList'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

// Search for CSEA webform submission emails — read-only, never changes read/unread status
export async function fetchCseaWebformEmails(providerToken) {
  const params = new URLSearchParams({
    q: 'subject:"Webform submission from" from:website@csea.com',
    maxResults: '50',
  })
  const res = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${providerToken}` },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('GMAIL_AUTH_EXPIRED')
    throw new Error(`Gmail error ${res.status}`)
  }
  const data = await res.json()
  return data.messages || []
}

export async function fetchEmailBody(providerToken, messageId) {
  const res = await fetch(`${GMAIL_API}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${providerToken}` },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`Gmail fetch error ${res.status}`)
  return res.json()
}

function decodeBase64(str) {
  try {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
  } catch {
    return ''
  }
}

function extractPlainText(payload) {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64(payload.body.data)
  }
  // Prefer plain text parts before falling back to HTML
  if (payload.parts) {
    const plain = payload.parts.find(p => p.mimeType === 'text/plain')
    if (plain) return extractPlainText(plain)
    for (const part of payload.parts) {
      const text = extractPlainText(part)
      if (text) return text
    }
  }
  // Last resort: strip HTML tags from HTML-only emails
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    const html = decodeBase64(payload.body.data)
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }
  return ''
}

function getHeader(payload, name) {
  const h = payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase())
  return h?.value || ''
}

// Parse a full Gmail message object into an interaction record
export function parseEmailToInteraction(msg) {
  const fromHeader = getHeader(msg.payload, 'From')
  const fromEmail = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader
  if (isSkippedSender(fromEmail)) return null

  const text = extractPlainText(msg.payload || {})
  return webformToInteraction(parseWebformText(text), 'gmail_message_id', msg.id)
}
