import { parseWebformText, webformToInteraction } from './webformParser'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

// Search for CSEA webform submission emails — read-only, never changes read/unread status
export async function fetchCseaWebformEmails(providerToken) {
  const params = new URLSearchParams({
    q: 'subject:"Webform submission from" from:website@csea.com',
    maxResults: '50',
  })
  const res = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${providerToken}` },
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
  })
  if (!res.ok) throw new Error(`Gmail fetch error ${res.status}`)
  return res.json()
}

// Fetch all threads involving Emily Raab (sender or CC), deduped by thread ID.
// Returns [{threadId, msgId}] where msgId is the first message seen in each thread.
export async function fetchEmilyRaabEmails(providerToken) {
  const threadFirstMsg = new Map()
  let pageToken = ''

  do {
    const params = new URLSearchParams({
      q: 'from:eraab@csea.com OR cc:eraab@csea.com',
      maxResults: '500',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(`${GMAIL_API}/messages?${params}`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    })
    if (!res.ok) {
      if (res.status === 401) throw new Error('GMAIL_AUTH_EXPIRED')
      throw new Error(`Gmail error ${res.status}`)
    }
    const data = await res.json()

    for (const msg of (data.messages || [])) {
      if (!threadFirstMsg.has(msg.threadId)) {
        threadFirstMsg.set(msg.threadId, msg.id)
      }
    }
    pageToken = data.nextPageToken || ''
  } while (pageToken)

  return Array.from(threadFirstMsg.entries()).map(([threadId, msgId]) => ({ threadId, msgId }))
}

export async function fetchEmailMetadata(providerToken, messageId) {
  const params = new URLSearchParams({ format: 'metadata' })
  params.append('metadataHeaders', 'Subject')
  params.append('metadataHeaders', 'From')
  params.append('metadataHeaders', 'Date')

  const res = await fetch(`${GMAIL_API}/messages/${messageId}?${params}`, {
    headers: { Authorization: `Bearer ${providerToken}` },
  })
  if (!res.ok) throw new Error(`Gmail metadata error ${res.status}`)
  return res.json()
}

export function parseEmilyRaabEmailToInteraction(msg, threadId) {
  const headers = msg.payload?.headers || []
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  const subject = getHeader('Subject')
  const from = getHeader('From')
  const dateHeader = getHeader('Date')

  let date_spoke = new Date().toISOString().split('T')[0]
  if (dateHeader) {
    const d = new Date(dateHeader)
    if (!isNaN(d)) date_spoke = d.toISOString().split('T')[0]
  }

  const snippet = msg.snippet || ''
  const discussion = subject ? `Subject: ${subject}\n\n${snippet}` : snippet

  return {
    category: 'General',
    date_spoke,
    member_name: 'Emily Raab',
    work_location: '',
    discussion,
    who_involved: from || 'Emily Raab',
    contact_person: 'Emily Raab',
    point_of_contact: 'eraab@csea.com',
    archived: false,
    gmail_message_id: threadId,
  }
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

// Parse a full Gmail message object into an interaction record
export function parseEmailToInteraction(msg) {
  const text = extractPlainText(msg.payload || {})
  return webformToInteraction(parseWebformText(text), 'gmail_message_id', msg.id)
}
