// Produces a short extractive summary from raw email text: strips quoted
// reply chains and common signature/footer lines, then takes the first
// few sentences of what's left.
export function summarizeEmailBody(text, maxSentences = 3) {
  if (!text) return ''

  const lines = text.split('\n')
  const kept = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^>/.test(trimmed)) break
    if (/^On .+wrote:$/.test(trimmed)) break
    if (/^-{2,}\s*Original Message\s*-{2,}$/i.test(trimmed)) break
    if (/^From:\s/.test(trimmed) && kept.length > 0) break
    if (/^(Sent from my|Get Outlook for|Sent from Yahoo)/i.test(trimmed)) continue
    kept.push(line)
  }

  const body = kept.join('\n').trim()
  if (!body) return ''

  const sentences = body.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+(\s|$)/g) || [body]
  return sentences.slice(0, maxSentences).join('').replace(/\s+/g, ' ').trim()
}
