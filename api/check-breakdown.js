// Reads the "Check Breakdown" budgeting spreadsheet from Jennifer's Google
// Drive and returns its Reference Sheet as structured budget-reference items
// (name / section / default amount), so the Planner's Budget › References tab
// can be synced from the single source of truth she already maintains.
//
// The master file is an .xlsx (not a native Google Sheet), so we download the
// raw bytes via the Drive API using the caller's own Google access token
// (the same provider token used for the Calendar sync, now also granted
// drive.readonly scope) and unzip/parse the workbook XML ourselves with
// fflate — no heavyweight spreadsheet dependency, and nothing runs against
// untrusted input beyond the user's own file.
import { unzipSync, strFromU8 } from 'fflate'

// "Check Breakdown.xlsx" in Jennifer's Drive. Overridable per-request or via env.
const DEFAULT_FILE_ID = '18VAjztvwZBoXjgY2I_kmuFl0AJbF8g-F'

// The spreadsheet's own "Category 2" tag → the Planner's budget_section enum.
// Cash (money set aside to spend, e.g. Gas/Groceries/Blow) maps to expense;
// Sinking Fund maps to savings.
const CATEGORY2_TO_SECTION = {
  bill: 'bill',
  expense: 'expense',
  cash: 'expense',
  'sinking fund': 'savings',
  debt: 'debt',
}

// Rows in the Reference Sheet's item list stop when we hit one of the
// downstream tables that can share the same worksheet/stream.
const TERMINATORS = ['account mapping', 'budget item', 'sheet4 category', 'legend', 'savings worksheets']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const { accessToken, fileId } = body || {}
  if (!accessToken) {
    res.status(400).json({ error: 'Missing Google access token' })
    return
  }
  const id = fileId || process.env.CHECK_BREAKDOWN_FILE_ID || DEFAULT_FILE_ID

  try {
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (driveRes.status === 401) {
      res.status(401).json({ error: 'GOOGLE_AUTH_EXPIRED' })
      return
    }
    if (driveRes.status === 403) {
      res.status(403).json({ error: 'Google Drive access not granted. Sign out and back in to allow Drive access.' })
      return
    }
    if (!driveRes.ok) {
      res.status(502).json({ error: `Drive download failed (${driveRes.status})` })
      return
    }

    const buf = new Uint8Array(await driveRes.arrayBuffer())
    const items = extractReferenceItems(buf)
    res.status(200).json({ items })
  } catch (err) {
    console.error('Check Breakdown sync error:', err)
    res.status(502).json({ error: err.message })
  }
}

// ─── xlsx parsing (minimal, via fflate) ──────────────────────────────────────

export function extractReferenceItems(bytes) {
  const files = unzipSync(bytes)
  const sharedStrings = files['xl/sharedStrings.xml']
    ? parseSharedStrings(strFromU8(files['xl/sharedStrings.xml']))
    : []

  const sheets = listSheets(files)

  // Prefer the tab named like "Reference Sheet"; otherwise scan every tab for
  // the header row so a rename doesn't silently break the sync.
  const ordered = [
    ...sheets.filter((s) => /reference/i.test(s.name)),
    ...sheets.filter((s) => !/reference/i.test(s.name)),
  ]

  for (const sheet of ordered) {
    const xml = files[sheet.path] ? strFromU8(files[sheet.path]) : ''
    if (!xml) continue
    const rows = sheetToRows(xml, sharedStrings)
    const items = itemsFromRows(rows)
    if (items.length) return items
  }
  return []
}

function listSheets(files) {
  const workbook = files['xl/workbook.xml'] ? strFromU8(files['xl/workbook.xml']) : ''
  const relsXml = files['xl/_rels/workbook.xml.rels'] ? strFromU8(files['xl/_rels/workbook.xml.rels']) : ''

  const ridToTarget = {}
  for (const tag of relsXml.match(/<Relationship\b[^>]*>/g) || []) {
    const rid = (tag.match(/Id="([^"]+)"/) || [])[1]
    let target = (tag.match(/Target="([^"]+)"/) || [])[1]
    if (!rid || !target) continue
    target = target.replace(/^\//, '')
    if (!target.startsWith('xl/')) target = `xl/${target}`
    ridToTarget[rid] = target
  }

  const sheets = []
  for (const tag of workbook.match(/<sheet\b[^>]*\/?>/g) || []) {
    const name = decodeXml((tag.match(/name="([^"]*)"/) || [])[1] || '')
    const rid = (tag.match(/r:id="([^"]*)"/) || [])[1]
    const path = ridToTarget[rid]
    if (path) sheets.push({ name, path })
  }
  return sheets
}

function parseSharedStrings(xml) {
  const out = []
  for (const m of xml.match(/<si\b[\s\S]*?<\/si>/g) || []) {
    let text = ''
    for (const t of m.match(/<t\b[^>]*>[\s\S]*?<\/t>/g) || []) {
      text += decodeXml(t.replace(/^<t\b[^>]*>/, '').replace(/<\/t>$/, ''))
    }
    out.push(text)
  }
  return out
}

function sheetToRows(xml, sharedStrings) {
  const rows = []
  for (const rowM of xml.match(/<row\b[^>]*>[\s\S]*?<\/row>/g) || []) {
    const cells = []
    const cellTags = rowM.match(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) || []
    for (const cell of cellTags) {
      const ref = cell.match(/r="([A-Z]+)\d+"/)
      const t = (cell.match(/\bt="([^"]*)"/) || [])[1]
      const colIdx = ref ? colToIndex(ref[1]) : cells.length
      let value = ''
      const vM = cell.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)
      if (t === 's' && vM) {
        value = sharedStrings[parseInt(vM[1], 10)] ?? ''
      } else if (t === 'inlineStr') {
        let text = ''
        for (const tt of cell.match(/<t\b[^>]*>[\s\S]*?<\/t>/g) || []) {
          text += decodeXml(tt.replace(/^<t\b[^>]*>/, '').replace(/<\/t>$/, ''))
        }
        value = text
      } else if (vM) {
        value = decodeXml(vM[1])
      }
      cells[colIdx] = value
    }
    rows.push(cells)
  }
  return rows
}

function itemsFromRows(rows) {
  let header = null
  for (let i = 0; i < rows.length; i++) {
    // Array.from densifies sparse rows (gapped cells leave holes) so findIndex
    // doesn't trip over undefined.
    const lower = Array.from(rows[i], (c) => (c || '').toString().trim().toLowerCase())
    const item = lower.findIndex((c) => c === 'item')
    const amount = lower.findIndex((c) => c === 'amount')
    const cat2 = lower.findIndex((c) => c.includes('category 2'))
    if (item !== -1 && amount !== -1 && cat2 !== -1) {
      const due = lower.findIndex((c) => c.includes('due date'))
      header = { rowIdx: i, item, amount, cat2, due }
      break
    }
  }
  if (!header) return []

  const items = []
  for (let i = header.rowIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    const name = (row[header.item] || '').toString().trim()
    if (!name) continue
    if (TERMINATORS.includes(name.toLowerCase())) break

    const cat2 = (row[header.cat2] || '').toString().trim().toLowerCase()
    if (!cat2) continue // rows without a Category 2 (e.g. "Left Over") aren't budget items
    const section = CATEGORY2_TO_SECTION[cat2]
    if (!section) continue

    items.push({
      name,
      section,
      defaultAmount: parseMoney(row[header.amount]),
    })
  }
  return items
}

function colToIndex(letters) {
  let n = 0
  for (let i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64)
  return n - 1
}

function parseMoney(v) {
  if (v == null) return null
  let s = v.toString().trim()
  if (!s) return null
  const negative = /^\(.*\)$/.test(s)
  s = s.replace(/[()$,\s]/g, '')
  if (s === '' || s === '-') return null
  const n = Number(s)
  if (Number.isNaN(n)) return null
  return negative ? -n : n
}

function decodeXml(s) {
  return (s || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
}
