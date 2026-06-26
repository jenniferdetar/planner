import { useState, useEffect } from 'react'

export function useDailyInspiration() {
  const [verse, setVerse] = useState(null)
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    // Verse of the day via OurManna
    fetch('https://beta.ourmanna.com/api/v1/get/?format=json&order=daily')
      .then(r => r.json())
      .then(data => {
        const v = data?.verse?.details
        if (v) setVerse({ text: v.text, reference: v.reference })
      })
      .catch(() => {})

    // Quote of the day via ZenQuotes
    fetch('https://zenquotes.io/api/today')
      .then(r => r.json())
      .then(data => {
        const q = data?.[0]
        if (q) setQuote({ text: q.q, author: q.a })
      })
      .catch(() => {})
  }, [])

  return { verse, quote }
}
