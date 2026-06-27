import { useState, useEffect, useCallback } from 'react'

const SHEET_ID = '1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ'
const RANGE = 'Sheet1!A1:H20'

function getToken() {
  return localStorage.getItem('gcal_provider_token')
}

// Sheet layout: pairs of columns (num, text): A-B = 1-20, C-D = 21-40, E-F = 41-60, G-H = 61-80
// Additional sheets cover 81+
function parseRows(values) {
  const wants = []
  if (!values) return wants
  const rowCount = values.length
  const colPairs = [
    [0, 1],   // A, B  -> 1-20
    [2, 3],   // C, D  -> 21-40
    [4, 5],   // E, F  -> 41-60
    [6, 7],   // G, H  -> 61-80
  ]
  for (let pair = 0; pair < colPairs.length; pair++) {
    const [numCol, textCol] = colPairs[pair]
    for (let row = 0; row < rowCount; row++) {
      const rowData = values[row] || []
      const num = parseInt(rowData[numCol], 10)
      const text = rowData[textCol] ?? ''
      if (!isNaN(num) && num > 0) {
        wants.push({ num, text, row, pair })
      }
    }
  }
  wants.sort((a, b) => a.num - b.num)
  return wants
}

function wantsToA1(want) {
  // Map want.pair and want.row back to sheet column
  const colLetters = ['B', 'D', 'F', 'H']
  const col = colLetters[want.pair]
  const row = want.row + 1
  return `Sheet1!${col}${row}`
}

export function useWants(providerToken) {
  const [wants, setWants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const token = providerToken || getToken()

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(RANGE)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error(`Sheets API error: ${res.status}`)
      const data = await res.json()
      setWants(parseRows(data.values))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  async function updateWant(want, newText) {
    if (!token) return
    setSaving(true)
    const range = wantsToA1(want)
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ range, majorDimension: 'ROWS', values: [[newText]] }),
        }
      )
      if (!res.ok) throw new Error(`Save error: ${res.status}`)
      setWants(prev => prev.map(w => w.num === want.num ? { ...w, text: newText } : w))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return { wants, loading, error, saving, reload: load, updateWant }
}
