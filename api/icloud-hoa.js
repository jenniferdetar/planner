import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

// HOA correspondents — emails to/from/cc'ing any of these are pulled in as
// HOA items regardless of which folder they're filed in.
const HOA_ADDRESSES = [
  'n0rmavalencia@hotmail.com',
  'gutierrez.emelly01@gmail.com',
  'detar.jennifer@yahoo.com',
  'parkreseda111@gmail.com',
  'vanoosheh@wilshireinsurance.com',
]

// Reads emails involving the HOA correspondents above and returns them as
// structured records, regardless of which folder they're filed in.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { ICLOUD_EMAIL, ICLOUD_APP_PASSWORD } = process.env
  if (!ICLOUD_EMAIL || !ICLOUD_APP_PASSWORD) {
    res.status(500).json({ error: 'iCloud Mail is not configured' })
    return
  }

  const client = new ImapFlow({
    host: 'imap.mail.me.com',
    port: 993,
    secure: true,
    auth: { user: ICLOUD_EMAIL, pass: ICLOUD_APP_PASSWORD },
    logger: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  })

  try {
    await client.connect()

    const folders = ['INBOX']
    const hoaPath = await findHoaFolder(client)
    if (hoaPath && hoaPath !== 'INBOX') folders.push(hoaPath)

    const seen = new Set()
    const messages = []
    for (const folderPath of folders) {
      const lock = await client.getMailboxLock(folderPath)
      try {
        const uids = await searchHoaMessages(client)
        const recent = uids.slice(-200)

        for await (const msg of client.fetch(recent, { uid: true, envelope: true, source: true })) {
          const key = `${folderPath}:${msg.uid}`
          if (seen.has(key)) continue
          seen.add(key)

          const parsed = await simpleParser(msg.source)
          const text = parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''
          const cleanText = stripBoilerplate(text)
          // Keep bare UIDs for the legacy HOA-folder path so they stay
          // compatible with previously-imported yahoo_uid values; prefix
          // UIDs from any other folder (e.g. INBOX) to avoid collisions,
          // since IMAP UIDs are only unique within a single folder.
          const needsPrefix = folders.length > 1 && folderPath !== hoaPath
          messages.push({
            id: needsPrefix ? `${folderPath}:${msg.uid}` : String(msg.uid),
            subject: msg.envelope?.subject || '',
            from: msg.envelope?.from?.[0]?.address || '',
            date: msg.envelope?.date?.toISOString?.() || '',
            text: cleanText,
          })
        }
      } finally {
        lock.release()
      }
    }

    res.status(200).json({ messages, folders })
  } catch (err) {
    console.error('iCloud HOA IMAP error:', err)
    res.status(502).json({ error: err.message })
  } finally {
    await client.logout().catch(() => {})
  }
}

// Matches any message where an HOA correspondent appears as sender, recipient,
// or cc — or that mentions "elevator" anywhere, since elevator vendors/managers
// often aren't in the correspondent list above.
async function searchHoaMessages(client) {
  const or = []
  for (const addr of HOA_ADDRESSES) {
    or.push({ from: addr }, { to: addr }, { cc: addr })
  }
  or.push({ subject: 'elevator' }, { body: 'elevator' })
  return client.search({ or })
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
