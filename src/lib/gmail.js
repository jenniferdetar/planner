const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me'

function headers(token) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

// Decode base64url to plain string
function decodeBase64(str) {
  if (!str) return ''
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    return decodeURIComponent(
      atob(b64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    )
  } catch {
    return ''
  }
}

function getHeader(headers, name) {
  return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function parseMessage(msg) {
  const hdrs = msg.payload?.headers ?? []
  const subject = getHeader(hdrs, 'Subject') || '(no subject)'
  const from = getHeader(hdrs, 'From')
  const to = getHeader(hdrs, 'To')
  const date = getHeader(hdrs, 'Date')

  // Extract plain-text body
  function findBody(part) {
    if (!part) return ''
    if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64(part.body.data)
    if (part.parts) {
      for (const p of part.parts) {
        const found = findBody(p)
        if (found) return found
      }
    }
    return ''
  }

  const body = findBody(msg.payload)
  const snippet = msg.snippet ?? ''

  return {
    id: msg.id,
    threadId: msg.threadId,
    subject,
    from,
    to,
    date: date ? new Date(date) : null,
    snippet,
    body,
    unread: msg.labelIds?.includes('UNREAD') ?? false,
    starred: msg.labelIds?.includes('STARRED') ?? false,
    labels: msg.labelIds ?? [],
  }
}

export async function fetchThreads(token, query = 'in:inbox', maxResults = 30) {
  const url = `${BASE}/threads?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 401) throw new Error('GMAIL_AUTH_EXPIRED')
  if (!res.ok) throw new Error(`Gmail /threads ${res.status}`)
  const { threads = [] } = await res.json()
  return threads // [{ id, threadId, snippet }]
}

export async function fetchThread(token, threadId) {
  const url = `${BASE}/threads/${threadId}?format=full`
  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 401) throw new Error('GMAIL_AUTH_EXPIRED')
  if (!res.ok) throw new Error(`Gmail /threads/${threadId} ${res.status}`)
  const data = await res.json()
  return {
    id: data.id,
    messages: (data.messages ?? []).map(parseMessage),
  }
}

export async function fetchMessageList(token, query = 'in:inbox', maxResults = 30) {
  const url = `${BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 401) throw new Error('GMAIL_AUTH_EXPIRED')
  if (!res.ok) throw new Error(`Gmail /messages ${res.status}`)
  const { messages = [] } = await res.json()
  return messages
}

export async function fetchMessage(token, id) {
  const url = `${BASE}/messages/${id}?format=full`
  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 401) throw new Error('GMAIL_AUTH_EXPIRED')
  if (!res.ok) throw new Error(`Gmail /messages/${id} ${res.status}`)
  return parseMessage(await res.json())
}

export async function markRead(token, id) {
  const res = await fetch(`${BASE}/messages/${id}/modify`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
  })
  if (!res.ok) throw new Error(`Gmail markRead ${res.status}`)
}

export async function markUnread(token, id) {
  const res = await fetch(`${BASE}/messages/${id}/modify`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ addLabelIds: ['UNREAD'] }),
  })
  if (!res.ok) throw new Error(`Gmail markUnread ${res.status}`)
}

export async function archiveMessage(token, id) {
  const res = await fetch(`${BASE}/messages/${id}/modify`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ removeLabelIds: ['INBOX'] }),
  })
  if (!res.ok) throw new Error(`Gmail archive ${res.status}`)
}

export async function sendEmail(token, { to, subject, body, replyToMessageId, threadId }) {
  // Build RFC 2822 message
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ]
  if (replyToMessageId) lines.splice(2, 0, `In-Reply-To: ${replyToMessageId}`, `References: ${replyToMessageId}`)

  const raw = btoa(unescape(encodeURIComponent(lines.join('\r\n'))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const payload = { raw }
  if (threadId) payload.threadId = threadId

  const res = await fetch(`${BASE}/messages/send`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  })
  if (!res.ok) throw new Error(`Gmail send ${res.status}`)
  return res.json()
}

export async function fetchProfile(token) {
  const res = await fetch(`${BASE}/profile`, { headers: headers(token) })
  if (!res.ok) throw new Error(`Gmail /profile ${res.status}`)
  return res.json() // { emailAddress, messagesTotal, threadsTotal, historyId }
}
