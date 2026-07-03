import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

// Reads all emails from the Yahoo Mail CSEA / Chapter 500 folder over IMAP.
// Falls back to searching INBOX by sender if no dedicated folder is found.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { YAHOO_EMAIL, YAHOO_APP_PASSWORD } = process.env
  if (!YAHOO_EMAIL || !YAHOO_APP_PASSWORD) {
    res.status(500).json({ error: 'Yahoo Mail is not configured' })
    return
  }

  const client = new ImapFlow({
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true,
    auth: { user: YAHOO_EMAIL, pass: YAHOO_APP_PASSWORD },
    logger: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  })

  try {
    await client.connect()

    // Find the CSEA / Chapter 500 folder
    const csea = await findCseaFolder(client)
    const messages = csea
      ? await readFolder(client, csea)
      : await searchInbox(client)

    res.status(200).json({ messages, folder: csea || 'INBOX (search)' })
  } catch (err) {
    console.error('Yahoo CSEA IMAP sync error:', err)
    res.status(502).json({ error: err.message })
  } finally {
    await client.logout().catch(() => {})
  }
}

async function findCseaFolder(client) {
  const mailboxes = await client.list()
  const mb = mailboxes.find(m => {
    const p = m.path.toLowerCase()
    return p.includes('csea') || p.includes('chapter 500') || p.includes('chapter500')
  })
  return mb?.path || null
}

async function readFolder(client, folderPath) {
  const lock = await client.getMailboxLock(folderPath)
  try {
    const uids = await client.search({ all: true })
    const recent = uids.slice(-100)
    return await fetchMessages(client, recent)
  } finally {
    lock.release()
  }
}

async function searchInbox(client) {
  const lock = await client.getMailboxLock('INBOX')
  try {
    const uids = await client.search({ from: 'csea.com' })
    const recent = (uids || []).slice(-100)
    return await fetchMessages(client, recent)
  } finally {
    lock.release()
  }
}

async function fetchMessages(client, uids) {
  if (!uids.length) return []
  const messages = []
  for await (const msg of client.fetch(uids, { uid: true, envelope: true, source: true })) {
    const parsed = await simpleParser(msg.source)
    const text = parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''
    messages.push({
      id: String(msg.uid),
      subject: msg.envelope?.subject || '',
      from: msg.envelope?.from?.[0]?.address || '',
      fromName: msg.envelope?.from?.[0]?.name || '',
      date: msg.envelope?.date?.toISOString?.() || '',
      text: text.trim(),
    })
  }
  return messages
}
