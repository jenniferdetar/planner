import { parseWebformText, webformToInteraction } from './webformParser'
import { isSkippedSender } from './interactionSkipList'
import { searchGmailMessages, fetchGmailMessage, extractPlainText, getHeader } from './gmail'

// Search for CSEA webform submission emails — read-only, never changes read/unread status
export async function fetchCseaWebformEmails(providerToken) {
  return searchGmailMessages(providerToken, 'subject:"Webform submission from" from:website@csea.com', 50)
}

export const fetchEmailBody = fetchGmailMessage

// Parse a full Gmail message object into an interaction record
export function parseEmailToInteraction(msg) {
  const fromHeader = getHeader(msg.payload, 'From')
  const fromEmail = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader
  if (isSkippedSender(fromEmail)) return null

  const text = extractPlainText(msg.payload || {})
  return webformToInteraction(parseWebformText(text), 'gmail_message_id', msg.id)
}
