// Reads every row from the "Open Items" data source in the Park Reseda HOA
// Notion workspace and returns them as structured records. Requires a
// Notion internal integration token (NOTION_API_KEY) that has been shared
// with the "Open Items" database, plus its data source id (NOTION_HOA_DATA_SOURCE_ID) —
// defaults to the Open Items data source in Jennifer's HOA workspace.
const DEFAULT_DATA_SOURCE_ID = '2bfc3a06-78ac-8020-b2c8-000b2f4ce7f7'
const NOTION_VERSION = '2025-09-03'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { NOTION_API_KEY, NOTION_HOA_DATA_SOURCE_ID } = process.env
  if (!NOTION_API_KEY) {
    res.status(500).json({ error: 'Notion is not configured' })
    return
  }

  const dataSourceId = NOTION_HOA_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID

  try {
    const items = []
    let cursor
    do {
      const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || `Notion API error ${response.status}`)
      }
      const data = await response.json()
      for (const page of data.results || []) items.push(pageToItem(page))
      cursor = data.has_more ? data.next_cursor : null
    } while (cursor)

    res.status(200).json({ items })
  } catch (err) {
    console.error('Notion HOA sync error:', err)
    res.status(502).json({ error: err.message })
  }
}

function pageToItem(page) {
  const props = page.properties || {}
  return {
    id: page.id,
    title: plainText(props['Subject Line']?.title),
    status: props['Status ']?.status?.name || null,
    priority: props['Priority ']?.select?.name || null,
    category: props['Category ']?.select?.name || null,
    unitArea: plainText(props['Unit/Area']?.rich_text),
    date: props['Date']?.date?.start || null,
    url: page.url,
  }
}

function plainText(richTextArray) {
  return (richTextArray || []).map(t => t.plain_text).join('').trim()
}
