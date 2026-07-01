import { parseWebformText, webformToInteraction } from './webformParser'
import { isSkippedSender } from './interactionSkipList'
import { summarizeEmailBody } from './emailSummary'

export async function fetchYahooCseaEmails() {
  const res = await fetch('/api/yahoo-sync', { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Yahoo CSEA sync error ${res.status}`)
  }
  const data = await res.json()
  return data.messages || []
}

// Try webform parse first; fall back to a generic interaction from subject/body.
export function parseYahooEmailToInteraction(msg) {
  // Attempt structured webform parse
  const parsed = parseWebformText(msg.text || '')
  if (parsed.name) {
    return webformToInteraction(parsed, 'yahoo_message_id', msg.id)
  }

  if (isSkippedSender(msg.from)) return null

  // Generic fallback: use sender name (or address) as member_name
  const memberName = msg.fromName || msg.from || 'Unknown'
  const date = msg.date ? msg.date.split('T')[0] : new Date().toISOString().split('T')[0]
  const discussion = [msg.subject, summarizeEmailBody(msg.text)].filter(Boolean).join('\n\n')

  if (!discussion.trim()) return null

  return {
    category: 'General',
    date_spoke: date,
    member_name: memberName,
    work_location: '',
    discussion,
    who_involved: 'Jennifer Detar',
    contact_person: memberName,
    point_of_contact: msg.from || '',
    archived: false,
    yahoo_message_id: msg.id,
  }
}
