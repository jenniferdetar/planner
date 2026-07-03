import { summarizeEmailBody } from './emailSummary'

// Turns a { subject, text, date } email into an hoa_items record, guessing
// a category from subject/body keywords. Shared by the Yahoo and Gmail HOA
// sync paths so both categorize the same way.
export function emailToHoaItem(msg) {
  const subject = (msg.subject || '').trim()
  const body = (msg.text || '').trim()
  const date = msg.date ? msg.date.split('T')[0] : new Date().toISOString().split('T')[0]

  const text = (subject + ' ' + body).toLowerCase()
  let category = 'General'
  if (/mainten|repair|landscap|pool|roof|plumb|electric|fence|gate|paint|hvac|elevator/i.test(text)) category = 'Maintenance'
  else if (/financ|budget|dues|assessment|payment|invoice|fund|reserve|expense|income|cost/i.test(text)) category = 'Financials'
  else if (/insur/i.test(text)) category = 'Insurance'
  else if (/legal|attorney|lawsuit|violation|lien|rule|bylaw|enforce/i.test(text)) category = 'Legal'

  return {
    category,
    title: subject || '(no subject)',
    notes: summarizeEmailBody(body) || null,
    priority: 'Medium',
    status: 'Not Started',
    item_date: date,
  }
}
