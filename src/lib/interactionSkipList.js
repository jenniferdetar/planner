// Sender addresses that should never be imported as member interactions —
// CSEA broadcast/system addresses, or senders whose content is tracked elsewhere (e.g. HOA).
export const SKIPPED_SENDER_EMAILS = [
  'csea_email@csea.com',
  'memberbenefits@csea.com',
  'heatherlembcke@gmail.com',
  'n0rmavalencia@hotmail.com',
  'detar.jennifer@yahoo.com',
  'eolvera@lbpm.com',
  'shohsfield@hotmail.com',
]

export function isSkippedSender(email) {
  if (!email) return false
  return SKIPPED_SENDER_EMAILS.includes(email.trim().toLowerCase())
}
