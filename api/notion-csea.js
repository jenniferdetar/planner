// Reads member-interaction rows from the "CSEA" Notion database (part of the
// Personal Operating System workspace) and returns them as structured
// records. The database is shared with general CSEA events/networking rows,
// so only rows with Entry Type = "Member Interaction" are returned — those
// are the ones logged (or forwarded from iCloud Mail) specifically as member
// contacts, as opposed to conference/meetup tracking.
const DEFAULT_DATA_SOURCE_ID = '2c2c3a06-78ac-81c1-8a33-000bf434308a'
const NOTION_VERSION = '2025-09-03'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { NOTION_API_KEY, NOTION_CSEA_DATA_SOURCE_ID } = process.env
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
    const dataSourceId = NOTION_CSEA_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID
    const items = []
    for (const page of await queryDataSource(dataSourceId, headers)) {
      const item = pageToItem(page)
      if (item.entryType === 'Member Interaction') items.push(item)
    }

    res.status(200).json({ items })
  } catch (err) {
    console.error('Notion CSEA sync error:', err)
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
    entryType: props['Entry Type']?.select?.name || null,
    title: plainText(props['Event/Meeting Name']?.title),
    memberName: plainText(props['Member Name']?.rich_text),
    workLocation: plainText(props['Work Location']?.rich_text),
    category: props['Interaction Category']?.select?.name || null,
    dateSpoken: props['Date Spoken']?.date?.start || null,
    discussion: plainText(props['Outcome/Notes']?.rich_text),
    pointOfContact: plainText(props['Host/Organizer']?.rich_text),
    createdTime: page.created_time,
  }
}

function plainText(richTextArray) {
  return (richTextArray || []).map(t => t.plain_text).join('').trim()
}
