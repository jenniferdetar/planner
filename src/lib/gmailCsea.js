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

// Senders whose mail is bulk/automated, not direct member correspondence
const BULK_SENDERS = [
  'csea_email@csea.com',
  'supportdesk@csea.com',
  'memberbenefits@csea.com',
  'commtoolseditor@csea.com',
  'website@csea.com', // webform submissions are handled separately, above
  'calendar-notification@google.com',
  'no-reply@zoom.us',
  'adobesign@adobesign.com',
  'postmaster@outlook.com',
  'no-reply@otter.ai',
]

const CORRESPONDENCE_QUERY = [
  'CSEA',
  ...BULK_SENDERS.map((s) => `-from:${s}`),
  '-subject:"Automatic reply"',
  '-subject:"Daily Agenda"',
  '-subject:"Webform submission from"',
].join(' ')

// Search for direct CSEA-related member correspondence threads, excluding bulk/automated mail
export async function fetchCseaCorrespondenceThreads(providerToken) {
  const params = new URLSearchParams({
    q: CORRESPONDENCE_QUERY,
    maxResults: '50',
  })
  const res = await fetch(`${GMAIL_API}/threads?${params}`, {
    headers: { Authorization: `Bearer ${providerToken}` },
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('GMAIL_AUTH_EXPIRED')
    throw new Error(`Gmail error ${res.status}`)
  }
  const data = await res.json()
  return data.threads || []
}

export async function fetchThread(providerToken, threadId) {
  const res = await fetch(`${GMAIL_API}/threads/${threadId}?format=full`, {
    headers: { Authorization: `Bearer ${providerToken}` },
  })
  if (!res.ok) throw new Error(`Gmail thread fetch error ${res.status}`)
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
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractPlainText(part)
      if (text) return text
    }
  }
  return ''
}

function parseWebformText(text) {
  function field(label) {
    const re = new RegExp(label + '\\s*\\n([^\\n]+)', 'i')
    const m = text.match(re)
    return m ? m[1].trim() : ''
  }

  const name = field('FULL NAME') || field('Full Name')
  const email = field('EMAIL ADDRESS') || field('Email Address')
  const phone = field('DAYTIME PHONE NUMBER') || field('Daytime Phone Number')

  // Message block: everything between MESSAGE\n and CONTACT ME BY
  const msgMatch = text.match(/MESSAGE\s*\n([\s\S]+?)(?:CONTACT ME BY|$)/i)
  const message = msgMatch ? msgMatch[1].trim() : ''

  // Date: "Submitted on Fri, MM/DD/YYYY - HH:MM"
  const dateMatch = text.match(/Submitted on [^,]+,\s*(\d{2}\/\d{2}\/\d{4})/)
  let date = new Date().toISOString().split('T')[0]
  if (dateMatch) {
    const [m2, d2, y] = dateMatch[1].split('/')
    date = `${y}-${m2}-${d2}`
  }

  return { name, email, phone, message, date }
}

// Parse a full Gmail message object into an interaction record
export function parseEmailToInteraction(msg) {
  const text = extractPlainText(msg.payload || {})
  const { name, email, phone, message, date } = parseWebformText(text)

  if (!name) return null

  const discussion = [
    message,
    phone ? `Phone: ${phone}` : '',
    email ? `Email: ${email}` : '',
  ].filter(Boolean).join('\n')

  return {
    category: 'General',
    date_spoke: date,
    member_name: name,
    work_location: '',
    discussion,
    who_involved: 'Jennifer Detar',
    contact_person: name,
    point_of_contact: email || '',
    archived: false,
    gmail_message_id: msg.id,
  }
}

function headerVal(headers, name) {
  const h = (headers || []).find((h) => h.name.toLowerCase() === name.toLowerCase())
  return h ? h.value : ''
}

// Pick the best display name out of a "Name <email>" style header value
function bestCounterpartName(headerValue) {
  const m = headerValue.match(/^"?([^"<]+)"?\s*<([^>]+)>/)
  if (m) return { name: m[1].trim(), email: m[2].trim().toLowerCase() }
  const email = headerValue.trim().toLowerCase()
  return { name: email, email }
}

// Parse a full Gmail thread object into an interaction record, identifying the
// external counterparty (anyone who isn't selfEmail) as the member contacted
export function parseThreadToInteraction(thread, selfEmail) {
  const messages = thread.messages || []
  if (!messages.length) return null

  const self = (selfEmail || '').toLowerCase()
  let counterpart = null
  let subject = ''
  const bodies = []

  for (const msg of messages) {
    const headers = msg.payload?.headers || []
    if (!subject) subject = headerVal(headers, 'Subject')
    const from = headerVal(headers, 'From')
    if (from && !counterpart && !from.toLowerCase().includes(self)) {
      counterpart = bestCounterpartName(from)
    }
    const text = extractPlainText(msg.payload || {}).trim()
    if (text) bodies.push(text)
  }

  if (!counterpart) return null

  const lastMsg = messages[messages.length - 1]
  const dateHeader = headerVal(lastMsg.payload?.headers || [], 'Date')
  const date = dateHeader
    ? new Date(dateHeader).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const discussion = `${subject}\n\n${bodies.join('\n---\n')}`.slice(0, 4000).trim()

  return {
    category: 'Email',
    date_spoke: date,
    member_name: counterpart.name,
    work_location: '',
    discussion,
    who_involved: 'Jennifer Detar',
    contact_person: counterpart.name,
    point_of_contact: counterpart.email,
    archived: false,
    gmail_message_id: thread.id,
  }
}
