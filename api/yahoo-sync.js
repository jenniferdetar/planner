import { ImapFlow } from 'imapflow'

// Reads CSEA webform submission emails from a Yahoo Mail inbox over IMAP.
// Yahoo has no Gmail-style REST API, so this runs server-side using an
// account app password (Yahoo Mail Plus required) and proxies plain text
// bodies back to the client, which handles dedup/parsing/insert.
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
  })

  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX')
    try {
      const uids = await client.search({
        from: 'website@csea.com',
        subject: 'Webform submission from',
      })
      const recent = (uids || []).slice(-50)

      const messages = []
      for await (const msg of client.fetch(recent, { uid: true, source: false, envelope: true, bodyParts: ['text'] })) {
        const text = msg.bodyParts?.get('text')?.toString('utf8') || ''
        messages.push({ id: String(msg.uid), text })
      }

      res.status(200).json({ messages })
    } finally {
      lock.release()
    }
  } catch (err) {
    console.error('Yahoo IMAP sync error:', err)
    res.status(502).json({ error: 'Failed to read Yahoo Mail inbox' })
  } finally {
    await client.logout().catch(() => {})
  }
}
