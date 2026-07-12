// Reads items from the "iCAAP" Notion database and returns them as
// structured records.
const DEFAULT_DATA_SOURCE_ID = '8b44a36c-6055-4927-89fc-aedd8f214d8d'
const NOTION_VERSION = '2025-09-03'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { NOTION_API_KEY, NOTION_ICAAP_DATA_SOURCE_ID } = process.env
  if (!NOTION_API_KEY) {
    res.status(500).json({ error: 'Notion is not configured' })
    return
  }

  const headers = {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }

  try {
    const dataSourceId = NOTION_ICAAP_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID
    const items = (await queryDataSource(dataSourceId, headers)).map(pageToItem)
    res.status(200).json({ items })
  } catch (err) {
    console.error('Notion iCAAP sync error:', err)
    res.status(502).json({ error: err.message })
  }
}

async function queryDataSource(dataSourceId, headers) {
  const items = []
  let cursor
  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.message || `Notion API error ${response.status}`)
    }
    const data = await response.json()
    items.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : null
  } while (cursor)
  return items
}

function pageToItem(page) {
  const props = page.properties || {}
  return {
    id: page.id,
    title: plainText(props['Title']?.title),
    status: props['Status']?.select?.name || null,
    priority: props['Priority']?.select?.name || null,
    category: plainText(props['Category']?.rich_text),
    dueDate: props['Due Date']?.date?.start || null,
    description: plainText(props['Description']?.rich_text),
    notes: plainText(props['Notes']?.rich_text),
  }
}

function plainText(richTextArray) {
  return (richTextArray || []).map(t => t.plain_text).join('').trim()
}
