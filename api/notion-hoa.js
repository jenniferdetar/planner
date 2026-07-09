// Reads HOA items from the Park Reseda HOA Notion workspace and returns them
// as structured records. Requires a Notion internal integration token
// (NOTION_API_KEY) that has been shared with the "HOA" page tree.
//
// The Notion workspace has two shapes of item:
//  1. A handful of legacy rows that live directly in the "Open Items" data
//     source (queried via the Notion search API).
//  2. The vast majority of items, which are plain child pages nested under
//     one of the "Open Items" category buckets (Financials, Maintainence,
//     Incidents, Insurance, Cleaning Scope of Work, Legal, Governance) or
//     one of the "Completed items" pages (Financials, Incidents, Insurance,
//     Legal, Maintaince & Repairs, Governance). These don't carry Notion
//     properties (status/priority/date), so status is inferred from which
//     section they live under and category from which bucket/page they live
//     under.
const DEFAULT_DATA_SOURCE_ID = '2bfc3a06-78ac-8020-b2c8-000b2f4ce7f7'
const NOTION_VERSION = '2025-09-03'

// Bucket/page id -> { section, category } used to walk nested child pages.
// category here is the raw Notion bucket name; src/lib/notionHoa.js maps it
// to the Planner's category list.
const SECTIONS = [
  { id: '2c1c3a0678ac8024a117e6258a377e2d', section: 'open', category: 'Financials' },
  { id: '2c1c3a0678ac80cd9889c3e9fb817e51', section: 'open', category: 'Maintainence' },
  { id: '2c1c3a0678ac80449becfebc2f52e2bb', section: 'open', category: 'Incidents' },
  { id: '2c1c3a0678ac80a6a52af04f7085b87a', section: 'open', category: 'Insurance' },
  { id: '2e2c3a0678ac80648858d739dbe4e95f', section: 'open', category: 'Cleaning Scope of Work' },
  { id: '397c3a0678ac814daa04d03ccb72d6be', section: 'open', category: 'Legal' },
  { id: '397c3a0678ac81edaa22e596ba5ae730', section: 'open', category: 'Governance' },
  { id: '2c1c3a0678ac8045b623f46e1ef3d30d', section: 'completed', category: 'Financials' },
  { id: '2c1c3a0678ac8064aeffdefb2e564d15', section: 'completed', category: 'Incidents' },
  { id: '2c1c3a0678ac8000963be08197761886', section: 'completed', category: 'Insurance' },
  { id: '2c1c3a0678ac8004861cd518bb1835cd', section: 'completed', category: 'Legal' },
  { id: '2c1c3a0678ac800d9e4eefcfd6a6dc9d', section: 'completed', category: 'Maintaince & Repairs' },
  { id: '397c3a0678ac81e486aef60c419e756e', section: 'completed', category: 'Governance' },
]
const BUCKET_IDS = new Set(SECTIONS.map(s => s.id.replace(/-/g, '')))

// Friendlier titles for buckets whose content lives directly on the bucket
// page itself (no child pages) — used as the fallback item title below.
const BUCKET_TITLE_OVERRIDES = {
  '397c3a0678ac814daa04d03ccb72d6be': 'Gomez v. Park Reseda — Ongoing Litigation',
}

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

  const headers = {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }

  try {
    const byId = new Map()

    // Legacy data-source rows (skip the bucket/section containers themselves —
    // those are just empty category headers, not real items).
    const dataSourceId = NOTION_HOA_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID
    for (const page of await queryDataSource(dataSourceId, headers)) {
      if (BUCKET_IDS.has(page.id.replace(/-/g, ''))) continue
      const item = dataSourceRowToItem(page)
      if (item.title) byId.set(item.id, item)
    }

    // Nested child pages under each Open Items bucket / Completed items page.
    // A bucket with no child pages likely has its content written directly
    // on the bucket page itself (e.g. a single ongoing case) — treat the
    // bucket page as one item in that case rather than dropping it.
    for (const section of SECTIONS) {
      const children = await fetchChildPages(section.id, headers)
      if (children.length === 0) {
        const normalizedId = section.id.replace(/-/g, '')
        byId.set(section.id, {
          id: section.id,
          title: BUCKET_TITLE_OVERRIDES[normalizedId] || section.category,
          status: section.section === 'open' ? 'Open' : 'Done',
          priority: null,
          category: section.category,
          unitArea: '',
          date: null,
          url: `https://www.notion.so/${normalizedId}`,
        })
        continue
      }
      for (const child of children) {
        const item = childPageToItem(child, section)
        if (item.title) byId.set(item.id, item)
      }
    }

    res.status(200).json({ items: Array.from(byId.values()) })
  } catch (err) {
    console.error('Notion HOA sync error:', err)
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

async function fetchChildPages(blockId, headers) {
  const children = []
  let cursor
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`)
    url.searchParams.set('page_size', '100')
    if (cursor) url.searchParams.set('start_cursor', cursor)
    const response = await fetch(url, { headers })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.message || `Notion API error ${response.status}`)
    }
    const data = await response.json()
    for (const block of data.results || []) {
      if (block.type === 'child_page') children.push(block)
    }
    cursor = data.has_more ? data.next_cursor : null
  } while (cursor)
  return children
}

function dataSourceRowToItem(page) {
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

function childPageToItem(block, section) {
  const title = (block.child_page?.title || '').trim()
  return {
    id: block.id,
    title,
    status: section.section === 'open' ? 'Open' : 'Done',
    priority: null,
    category: section.category,
    unitArea: extractUnit(title),
    date: null,
    url: `https://www.notion.so/${block.id.replace(/-/g, '')}`,
  }
}

function extractUnit(title) {
  const match = /\bunit\s*#?\s*(\d{1,4}[a-z]?)\b/i.exec(title || '')
  return match ? match[1] : ''
}

function plainText(richTextArray) {
  return (richTextArray || []).map(t => t.plain_text).join('').trim()
}
