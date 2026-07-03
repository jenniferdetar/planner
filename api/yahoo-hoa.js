import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

// Reads emails from the Yahoo Mail HOA folder and returns them as structured records.
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

    const hoaPath = await findHoaFolder(client)
    if (!hoaPath) {
      res.status(200).json({ messages: [], folders: await listFolders(client) })
      return
    }

    const lock = await client.getMailboxLock(hoaPath)
    try {
      const uids = await client.search({ all: true })
      const recent = uids.slice(-100)

      const messages = []
      for await (const msg of client.fetch(recent, { uid: true, envelope: true, source: true })) {
        const parsed = await simpleParser(msg.source)
        const text = parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''
        const cleanText = stripBoilerplate(text)
        messages.push({
          id: String(msg.uid),
          subject: msg.envelope?.subject || '',
          from: msg.envelope?.from?.[0]?.address || '',
          date: msg.envelope?.date?.toISOString?.() || '',
          text: cleanText,
        })
      }

      res.status(200).json({ messages, folder: hoaPath })
    } finally {
      lock.release()
    }
  } catch (err) {
    console.error('Yahoo HOA IMAP error:', err)
    res.status(502).json({ error: err.message })
  } finally {
    await client.logout().catch(() => {})
  }
}

// Some forwarded/nested messages leave a raw base64-encoded body (or a
// stray MIME boundary header) in the parsed plain text instead of being
// decoded — decode it back to readable text before summarizing.
function decodeStrayBase64(text) {
  if (!text) return text
  let out = text.replace(/^\t?boundary="[^"]*"\s*/i, '')
  const stripped = out.replace(/\s+/g, '')
  if (stripped.length > 60 && /^[A-Za-z0-9+/=]+$/.test(stripped)) {
    try {
      const decoded = Buffer.from(stripped, 'base64').toString('utf8')
      if (decoded && /[a-zA-Z]{3,}/.test(decoded)) out = decoded
    } catch { /* not valid base64, leave as-is */ }
  }
  return out
}

function stripBoilerplate(text) {
  if (!text) return ''
  return decodeStrayBase64(text)
    // Strip quoted reply lines
    .replace(/^>.*$/gm, '')
    // Strip LBPM auto-footer
    .replace(/If you need immediate assistance[\s\S]*$/i, '')
    // Collapse excess blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function findHoaFolder(client) {
  const mailboxes = await client.list()
  const mb = mailboxes.find(m => m.path.toLowerCase().includes('hoa'))
  return mb?.path || null
}

async function listFolders(client) {
  const mailboxes = await client.list()
  return mailboxes.map(m => m.path)
}
