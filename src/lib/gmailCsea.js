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
