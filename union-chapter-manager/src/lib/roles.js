// Member roles within a local. Genericized from the CSEA tracker's hard-coded
// E-Board / Steward / Labor Rep lists into per-org, per-member data.
export const MEMBER_ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'steward', label: 'Steward' },
  { value: 'eboard', label: 'E-Board' },
  { value: 'officer', label: 'Officer' },
  { value: 'labor_rep', label: 'Labor Rep' },
]

export function roleLabel(value) {
  return MEMBER_ROLES.find((r) => r.value === value)?.label || value
}

// App-user (login) roles inside an organization.
export const ORG_ROLES = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

export const ISSUE_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export const ISSUE_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]
