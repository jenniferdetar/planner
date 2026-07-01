import { isSkippedSender } from './interactionSkipList'
import { summarizeEmailBody } from './emailSummary'

// Parses CSEA union webform submission text into structured fields.
// Shared by Gmail and Yahoo Mail sync, since both deliver the same email format.
export function parseWebformText(text) {
  function field(label) {
    const re = new RegExp(label + '\\s*\\n([^\\n]+)', 'i')
    const m = text.match(re)
    return m ? m[1].trim() : ''
  }

  const name = field('FULL NAME') || field('Full Name')
  const email = field('EMAIL ADDRESS') || field('Email Address')
  const phone = field('DAYTIME PHONE NUMBER') || field('Daytime Phone Number')

  // Message block: everything between MESSAGE\n and CONTACT ME BY
  const msgMatch = text.match(/MESSAGE\s*\n([\s\S]+?)(?:CONTACT ME BY|$)/i)
  const message = msgMatch ? msgMatch[1].trim() : ''

  // Date: "Submitted on Fri, MM/DD/YYYY - HH:MM"
  const dateMatch = text.match(/Submitted on [^,]+,\s*(\d{2}\/\d{2}\/\d{4})/)
  let date = new Date().toISOString().split('T')[0]
  if (dateMatch) {
    const [m2, d2, y] = dateMatch[1].split('/')
    date = `${y}-${m2}-${d2}`
  }

  return { name, email, phone, message, date }
}

// Builds a member_interactions record from parsed webform fields.
// idField/idValue let callers tag the record with the source message id (gmail_message_id or yahoo_message_id).
export function webformToInteraction({ name, email, phone, message, date }, idField, idValue) {
  if (!name) return null
  if (isSkippedSender(email)) return null

  const discussion = [
    summarizeEmailBody(message) || message,
    phone ? `Phone: ${phone}` : '',
    email ? `Email: ${email}` : '',
  ].filter(Boolean).join('\n')

  return {
    category: 'General',
    date_spoke: date,
    member_name: name,
    work_location: '',
    discussion,
    who_involved: 'Jennifer Detar',
    contact_person: name,
    point_of_contact: email || '',
    archived: false,
    [idField]: idValue,
  }
}
