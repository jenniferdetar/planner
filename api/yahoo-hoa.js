import { ImapFlow } from 'imapflow'

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
  })

  try {
    await client.connect()

    // Find the HOA folder
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
      for await (const msg of client.fetch(recent, { uid: true, envelope: true, bodyParts: ['text', '1'] })) {
        const text =
          msg.bodyParts?.get('text')?.toString('utf8') ||
          msg.bodyParts?.get('1')?.toString('utf8') ||
          ''
        messages.push({
          id: String(msg.uid),
          subject: msg.envelope?.subject || '',
          from: msg.envelope?.from?.[0]?.address || '',
          date: msg.envelope?.date?.toISOString?.() || '',
          text: text.trim(),
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

async function findHoaFolder(client) {
  const mailboxes = await client.list()
  const mb = mailboxes.find(m => m.path.toLowerCase().includes('hoa'))
  return mb?.path || null
}

async function listFolders(client) {
  const mailboxes = await client.list()
  return mailboxes.map(m => m.path)
}
