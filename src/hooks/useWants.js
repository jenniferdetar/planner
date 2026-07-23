import { useState, useEffect, useCallback } from 'react'

const SHEET_ID = '1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ'

// New single-list layout lives on its own tab so the original grid is untouched.
// Columns: A=#, B=Want, C=Category, D=Answered, E=Date answered, F=Notes (row 1 = header)
const LIST_TAB = 'List'
const LIST_RANGE = `${LIST_TAB}!A2:F`
const HEADERS = ['#', 'Want', 'Category', 'Answered', 'Date answered', 'Notes']
const COLS = { num: 'A', text: 'B', category: 'C', answered: 'D', date: 'E', notes: 'F' }

// Legacy grid: pairs of (num, text) columns — A-B = 1-20, C-D = 21-40, E-F = 41-60, G-H = 61-80.
// The tab it lives on isn't necessarily named "Sheet1", so we discover the real name at import time.
const OLD_GRID_RANGE = 'A1:H20'

export const CATEGORIES = ['Faith', 'Health', 'Career', 'Education', 'CSEA', 'Home', 'Finances', 'Jeff', 'Other']

const CATEGORY_RULES = [
  [/church|god|discern|decern/i, 'Faith'],
  [/health|weigh|\blbs\b|medication|doctor|meal prep|spices|spaghetti|freeze dryer|dentures/i, 'Health'],
  [/\bgcu\b|\bmpa\b|master'?s|\bdegree\b|graduat|university|college|semester|diploma|coursework/i, 'Education'],
  [/csea|\bunion\b|conference|delegate|member intern|labor rep|e-?board|bargaining|steward|release time/i, 'CSEA'],
  [/travel agent|work from home|side hu|amazon|storefront|coupon/i, 'Career'],
  [/house|home|acre|cleaner|laundry|chef|\bcar\b/i, 'Home'],
  [/pay off|saving|checking|\$|net worth|bankruptcy|debt|income|financial manager|money/i, 'Finances'],
  [/jeff|sex with/i, 'Jeff'],
]

function categorize(text) {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat
  return 'Other'
}

function getToken(providerToken) {
  return providerToken || localStorage.getItem('gcal_provider_token')
}

// Pull Google's descriptive message out of a failed Sheets API response so the
// UI can show the real reason (expired token vs. missing scope vs. API disabled)
// instead of a generic "something went wrong".
async function sheetsError(res) {
  const body = await res.json().catch(() => null)
  const msg = body?.error?.message || ''
  const err = new Error(msg || `Sheets API error: ${res.status}`)
  err.status = res.status
  err.googleMessage = msg
  return err
}

// Wrap a tab title for use in an A1 range, escaping embedded single quotes.
function quoteTitle(title) {
  return `'${title.replace(/'/g, "''")}'`
}

function parseLegacy(values) {
  const items = []
  if (!values) return items
  const colPairs = [[0, 1], [2, 3], [4, 5], [6, 7]]
  for (const [numCol, textCol] of colPairs) {
    for (let row = 0; row < values.length; row++) {
      const rowData = values[row] || []
      const num = parseInt(rowData[numCol], 10)
      const text = (rowData[textCol] ?? '').toString().trim()
      if (!isNaN(num) && num > 0 && text) items.push({ num, text })
    }
  }
  items.sort((a, b) => a.num - b.num)
  return items
}

export function useWants(providerToken) {
  const [wants, setWants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)

  const token = getToken(providerToken)

  async function apiGet(range) {
    return fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }

  async function apiPut(range, values) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
      }
    )
    if (!res.ok) throw await sheetsError(res)
  }

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet(LIST_RANGE)
      if (res.status === 400) {
        // Range can't be parsed because the List tab doesn't exist yet.
        const err = await sheetsError(res)
        if (/unable to parse range|not found/i.test(err.googleMessage)) {
          setNeedsSetup(true)
          setWants([])
          return
        }
        throw err
      }
      if (!res.ok) throw await sheetsError(res)
      const data = await res.json()
      const rows = data.values || []
      const parsed = rows
        .map((r, i) => ({
          rowIndex: i + 2, // header is row 1, so data starts at row 2
          num: r[0] ?? '',
          text: (r[1] ?? '').toString(),
          category: r[2] ?? '',
          answered: (r[3] ?? '').toString().trim().toLowerCase() === 'yes',
          date: r[4] ?? '',
          notes: r[5] ?? '',
        }))
        .filter((w) => w.text.trim() !== '')
      setNeedsSetup(false)
      setWants(parsed)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  // Returns the spreadsheet's tabs as { title, index }, ordered left to right.
  async function getSheets() {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties(title,index)`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) throw await sheetsError(res)
    const data = await res.json()
    return (data.sheets || [])
      .map((s) => s.properties)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  }

  async function ensureTab() {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title: LIST_TAB } } }] }),
      }
    )
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const msg = body?.error?.message || ''
      if (/already exists/i.test(msg)) return // tab is already there — fine
      throw new Error(msg || `Could not create tab: ${res.status}`)
    }
  }

  // One-time import: read the old grid, de-duplicate, auto-categorize, renumber,
  // and write the clean single list into the List tab.
  async function migrate() {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      // The old grid lives on the first tab that isn't our new List tab —
      // discover its real name rather than assuming "Sheet1".
      const sheetsMeta = await getSheets()
      const source = sheetsMeta.find((s) => s.title !== LIST_TAB)
      if (!source) throw new Error('Could not find a tab to import your wants from.')
      const res = await apiGet(`${quoteTitle(source.title)}!${OLD_GRID_RANGE}`)
      if (!res.ok) throw await sheetsError(res)
      const data = await res.json()
      const legacy = parseLegacy(data.values)

      const seen = new Set()
      const unique = []
      for (const item of legacy) {
        const key = item.text.trim().toLowerCase()
        if (!key || seen.has(key)) continue
        seen.add(key)
        unique.push(item)
      }

      await ensureTab()

      const rows = [HEADERS]
      unique.forEach((item, i) => {
        rows.push([String(i + 1), item.text, categorize(item.text), '', '', ''])
      })
      await apiPut(`${LIST_TAB}!A1:F${rows.length}`, rows)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateField(want, field, value) {
    if (!token) return
    setSaving(true)
    try {
      await apiPut(`${LIST_TAB}!${COLS[field]}${want.rowIndex}`, [[value]])
      setWants((prev) => prev.map((w) => (w.rowIndex === want.rowIndex ? { ...w, [field]: value } : w)))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAnswered(want) {
    if (!token) return
    const nowAnswered = !want.answered
    const today = nowAnswered ? new Date().toISOString().slice(0, 10) : ''
    setSaving(true)
    try {
      await apiPut(`${LIST_TAB}!D${want.rowIndex}:E${want.rowIndex}`, [[nowAnswered ? 'Yes' : '', today]])
      setWants((prev) =>
        prev.map((w) => (w.rowIndex === want.rowIndex ? { ...w, answered: nowAnswered, date: today } : w))
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function addWant(text) {
    const trimmed = (text || '').trim()
    if (!token || !trimmed) return
    setSaving(true)
    try {
      const nextNum = wants.reduce((m, w) => Math.max(m, parseInt(w.num, 10) || 0), 0) + 1
      const row = [String(nextNum), trimmed, categorize(trimmed), '', '', '']
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(`${LIST_TAB}!A:F`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [row] }),
        }
      )
      if (!res.ok) throw new Error(`Add error: ${res.status}`)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return {
    wants, loading, error, saving, needsSetup,
    reload: load, migrate, updateField, toggleAnswered, addWant,
  }
}
