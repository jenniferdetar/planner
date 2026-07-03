import { searchGmailMessages, fetchGmailMessage, extractPlainText, getHeader } from './gmail'

// Search Gmail for any message mentioning "elevator" — elevator vendors and
// building management often aren't in the usual HOA correspondent list, so
// this searches by keyword instead of sender.
export async function fetchHoaElevatorEmails(providerToken) {
  return searchGmailMessages(providerToken, 'elevator', 50)
}

export const fetchGmailHoaMessage = fetchGmailMessage

// Parse a full Gmail message into the { id, subject, text, date } shape
// emailToHoaItem() expects.
export function gmailMessageToEmail(msg) {
  const subject = getHeader(msg.payload, 'Subject')
  const dateHeader = getHeader(msg.payload, 'Date')
  const date = dateHeader ? new Date(dateHeader).toISOString() : null
  const text = extractPlainText(msg.payload || {})
  return { id: msg.id, subject, text, date }
}
