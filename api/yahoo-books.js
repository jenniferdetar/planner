import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

const BN_SENDER = 'barnesandnoble@t.barnesandnoble.com'
const BN_SUBJECT = 'Billing Summary'

// Reads Barnes & Noble order-confirmation emails and returns the line items
// (book titles) from each, regardless of which folder they're filed in.
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

    const lock = await client.getMailboxLock('INBOX')
    const orders = []
    try {
      const uids = await client.search({ from: BN_SENDER, subject: BN_SUBJECT })
      const recent = uids.slice(-100)

      for await (const msg of client.fetch(recent, { uid: true, envelope: true, source: true })) {
        const parsed = await simpleParser(msg.source)
        const text = parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''
        const items = parseOrderItems(text)
        if (!items.length) continue

        orders.push({
          id: String(msg.uid),
          date: msg.envelope?.date?.toISOString?.() || '',
          orderTotal: parseOrderTotal(text),
          items,
        })
      }
    } finally {
      lock.release()
    }

    res.status(200).json({ orders })
  } catch (err) {
    console.error('Yahoo Books IMAP error:', err)
    res.status(502).json({ error: err.message })
  } finally {
    await client.logout().catch(() => {})
  }
}

// Extracts book titles from the "Item(s) Shipped/Billed ... Qty" section of
// a Barnes & Noble order-confirmation email. Each item is on its own line,
// ending with a whitespace-separated quantity.
function parseOrderItems(text) {
  const match = text.match(/Item\(s\)\s+Shipped\/Billed[\s\S]*?Qty\s*\n([\s\S]*?)(?:Order Subtotal|Order Total)/i)
  const block = match ? match[1] : ''
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean)

  const items = []
  for (const line of lines) {
    const lineMatch = line.match(/^(.*\S)\s+(\d+)$/)
    if (lineMatch) {
      items.push({ title: lineMatch[1].trim(), qty: Number(lineMatch[2]) })
    } else {
      items.push({ title: line, qty: 1 })
    }
  }
  return items
}

function parseOrderTotal(text) {
  const match = text.match(/Order Total:\s*\$?([\d,.]+)/i)
  return match ? match[1] : null
}
