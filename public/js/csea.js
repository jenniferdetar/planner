const fallbackStewards = [
  { name: 'Gema Larios', role: 'Chief Steward, Steward' },
  { name: 'Anita Persoff', role: 'Steward' },
  { name: 'Belva Douglas', role: 'Steward' },
  { name: 'Caden Stearns', role: 'Steward' },
  { name: 'Carol Turckel', role: 'Steward' },
  { name: 'Christopher Crump', role: 'Steward' },
  { name: 'Frances Parrish', role: 'Steward' },
  { name: 'Helen Lopez', role: 'Steward' },
  { name: 'Jennifer DeTar', role: 'Steward' },
  { name: 'Letetsia Fox', role: 'Steward' },
  { name: 'Marcia Scott', role: 'Steward' },
  { name: 'Matthew Korn', role: 'Steward' },
  { name: 'Karla Toscano', role: 'Steward' },
  { name: 'Ronald Baucume', role: 'Steward' }
]
let stewards = [...fallbackStewards]

const issueTypes = ['Grievance', 'Gripe', 'Complaint']
const issuePriorities = ['Low', 'Medium', 'High']
const issueStatuses = ['Open', 'In Progress', 'Resolved', 'Closed']

const sampleIssues = [
  {
    id: 3,
    memberId: '',
    member: 'Elizabeth Leons',
    type: 'Gripe',
    description: 'Concern about layoffs and involuntary movements at John B Monlux Elementary',
    steward: 'Jennifer DeTar',
    priority: 'Medium',
    status: 'Closed',
    date: 'Jun 6, 2024'
  },
  {
    id: 4,
    memberId: '169165',
    member: 'Ernest Cadena',
    type: 'Complaint',
    description: 'Asked if LAUSD will offer a Golden Handshake for early retirement next year',
    steward: 'Gema Larios',
    priority: 'Medium',
    status: 'Closed',
    date: 'Jun 14, 2024'
  },
  {
    id: 5,
    memberId: '889099',
    member: 'Sindy Banuelos',
    type: 'Complaint',
    description: 'Denied overtime after taking PTO; needs CPA details',
    steward: 'Belva Douglas',
    priority: 'High',
    status: 'Closed',
    date: 'Jun 14, 2024'
  },
  {
    id: 6,
    memberId: '233249',
    member: 'Roberta Barrera',
    type: 'Grievance',
    description: 'Requested reclassification and a salary study',
    steward: 'Letetsia Fox',
    priority: 'High',
    status: 'Closed',
    date: 'Jun 26, 2024'
  },
  {
    id: 7,
    memberId: '767065',
    member: 'Esmeralda Flores',
    type: 'Grievance',
    description: 'Seniority list needs review across departments to catch printing mistakes',
    steward: 'Letetsia Fox',
    priority: 'Medium',
    status: 'Closed',
    date: 'Jul 24, 2024'
  },
  {
    id: 8,
    memberId: '963222',
    member: 'Jerri Paley-Hayashi',
    type: 'Complaint',
    description: 'Issues reaching TSAc custodian for FSA claims and reimbursement explanations',
    steward: 'Anita Persoff',
    priority: 'High',
    status: 'Closed',
    date: 'Jul 25, 2024'
  },
  {
    id: 10,
    memberId: '995305',
    member: 'Brian Wanta',
    type: 'Complaint',
    description: 'Lunch schedule clarification; sent member contract details and referral',
    steward: 'Marcia Scott',
    priority: 'Low',
    status: 'Closed',
    date: 'Aug 16, 2024'
  },
  {
    id: 11,
    memberId: '',
    member: 'Trina Trang',
    type: 'Gripe',
    description: 'Looking for steps for Senior Office Techs',
    steward: 'Carol Turckel',
    priority: 'Low',
    status: 'Closed',
    date: 'May 20, 2024'
  },
  {
    id: 12,
    memberId: '883688',
    member: 'Norma Fuentes',
    type: 'Complaint',
    description: 'Reported SAA talking down, possible retaliation, and damage to scanner cord during lunch period',
    steward: 'Caden Stearns',
    priority: 'Medium',
    status: 'Closed',
    date: 'Apr 19, 2024'
  },
  {
    id: 13,
    memberId: '',
    member: 'Mary-Rose Ghazarian',
    type: 'Complaint',
    description: 'Mistreatment by supervisor shared; wants support',
    steward: 'Christopher Crump',
    priority: 'Medium',
    status: 'Closed',
    date: 'Jun 2, 2024'
  },
  {
    id: 14,
    memberId: '149874',
    member: 'Esther Cid',
    type: 'Grievance',
    description: 'Questions about salary allocations; needs review',
    steward: 'Christopher Crump',
    priority: 'Medium',
    status: 'Closed',
    date: 'Jun 4, 2024'
  },
  {
    id: 15,
    memberId: '1065524',
    member: 'Isabel Lemus Ramirez',
    type: 'Complaint',
    description: 'Office Technician position being cut; asked about involuntary transfer and vacancies',
    steward: 'Karla Toscano',
    priority: 'High',
    status: 'Closed',
    date: 'Jun 6, 2024'
  },
  {
    id: 16,
    memberId: '401002',
    member: 'Victor Lopez',
    type: 'Grievance',
    description: 'Meeting scheduled about working out of classification; member reports duties match assignment',
    steward: 'Caden Stearns',
    priority: 'Medium',
    status: 'Closed',
    date: 'Jun 21, 2024'
  },
  {
    id: 17,
    memberId: '1042572',
    member: 'Jennifer Burbank',
    type: 'Grievance',
    description: 'Working out of classification and unable to get experience credited; needs forms signed to validate work',
    steward: 'Matthew Korn',
    priority: 'Medium',
    status: 'Closed',
    date: 'Dec 11, 2024'
  }
]

let issues = [...sampleIssues]
let filteredIssues = [...sampleIssues]

async function loadMemberIdsFromCsv() {
  try {
    const res = await fetch('data/Ch. 500-RB 11-7-2024.xlsx - QueryBuilder.csv', { cache: 'no-store' })
    if (!res.ok) return
    const text = await res.text()
    const [headerLine, ...lines] = text.trim().split(/\r?\n/)
    const headers = headerLine.replace('\ufeff', '').split(',')

    const idx = key => headers.findIndex(h => h.trim() === key)
    const firstIdx = idx('First Name')
    const lastIdx = idx('Last Name')
    const idIdx = idx('Member ID')

    if (firstIdx === -1 || lastIdx === -1 || idIdx === -1) return

    const nameToId = {}
    lines.forEach(line => {
      const cols = line.split(',')
      const first = (cols[firstIdx] || '').trim()
      const last = (cols[lastIdx] || '').trim()
      const memberId = (cols[idIdx] || '').trim()
      if (!first || !last || !memberId) return
      nameToId[`${first} ${last}`.toLowerCase()] = memberId
    })

    let updated = false
    issues = issues.map(issue => {
      if (issue.memberId && issue.memberId.trim()) return issue
      const key = (issue.member || '').toLowerCase()
      if (nameToId[key]) {
        updated = true
        return { ...issue, memberId: nameToId[key] }
      }
      return issue
    })

    if (updated) {
      renderIssues()
    }
  } catch (err) {
    console.warn('Could not load member IDs', err)
  }
}

async function loadStewardsFromJson() {
  try {
    const res = await fetch('data/csea_stewards.json?v=20260108', { cache: 'no-store' })
    if (!res.ok) throw new Error('Steward file unavailable')
    const data = await res.json()
    if (Array.isArray(data) && data.length) {
      stewards = data
    }
  } catch (err) {
    console.warn('Falling back to built-in steward list', err)
  }
}

function getFilteredIssues(searchTerm = '') {
  if (!searchTerm.trim()) {
    return issues
  }

  const term = searchTerm.toLowerCase()
  return issues.filter(issue =>
    issue.memberId.toLowerCase().includes(term) ||
    issue.member.toLowerCase().includes(term) ||
    issue.description.toLowerCase().includes(term) ||
    issue.steward.toLowerCase().includes(term) ||
    issue.type.toLowerCase().includes(term)
  )
}

function buildTypeDropdown(currentType, issueId) {
  const options = issueTypes.map(type => 
    `<option value="${type}" ${type === currentType ? 'selected' : ''}>${type}</option>`
  ).join('')
  return `<select data-issue-id="${issueId}" class="type-select w-full min-w-[100px] px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer bg-white">${options}</select>`
}

function buildStewardDropdown(currentSteward, issueId) {
  const options = stewards.map(s => 
    `<option value="${s.name}" ${s.name === currentSteward ? 'selected' : ''}>${s.name}</option>`
  ).join('')
  return `<select data-issue-id="${issueId}" class="steward-select w-full min-w-[140px] px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer bg-white">${options}</select>`
}

function buildPriorityDropdown(currentPriority, issueId) {
  const options = issuePriorities.map(p => 
    `<option value="${p}" ${p === currentPriority ? 'selected' : ''}>${p}</option>`
  ).join('')
  return `<select data-issue-id="${issueId}" class="priority-select w-full min-w-[90px] px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer bg-white">${options}</select>`
}

function buildStatusDropdown(currentStatus, issueId) {
  const options = issueStatuses.map(s => 
    `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`
  ).join('')
  return `<select data-issue-id="${issueId}" class="status-select w-full min-w-[110px] px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer bg-white">${options}</select>`
}

function renderIssues(searchTerm = '') {
  const tbody = document.getElementById('issuesBody')
  tbody.innerHTML = ''

  filteredIssues = getFilteredIssues(searchTerm)

  filteredIssues.forEach(issue => {
    const tr = document.createElement('tr')
    tr.className = 'hover:bg-gray-50 transition'

    tr.innerHTML = `
      <td class="px-3 py-3 text-sm text-gray-700">${issue.memberId || '-'}</td>
      <td class="px-3 py-3 text-sm text-gray-700">${issue.member}</td>
      <td class="px-2 py-3 text-sm text-gray-700">${buildTypeDropdown(issue.type, issue.id)}</td>
      <td class="px-3 py-3 text-sm text-gray-700 text-left">${issue.description}</td>
      <td class="px-2 py-3 text-sm text-gray-700">${buildStewardDropdown(issue.steward, issue.id)}</td>
      <td class="px-2 py-3 text-sm text-gray-700">${buildPriorityDropdown(issue.priority, issue.id)}</td>
      <td class="px-2 py-3 text-sm text-gray-700">${buildStatusDropdown(issue.status, issue.id)}</td>
      <td class="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">${issue.date}</td>
    `

    tbody.appendChild(tr)
  })

  attachDropdownListeners()
  updateStats()
}

function attachDropdownListeners() {
  document.querySelectorAll('.type-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const issueId = parseInt(e.target.dataset.issueId)
      const idx = issues.findIndex(i => i.id === issueId)
      if (idx !== -1) issues[idx].type = e.target.value
      updateStats()
    })
  })

  document.querySelectorAll('.steward-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const issueId = parseInt(e.target.dataset.issueId)
      const idx = issues.findIndex(i => i.id === issueId)
      if (idx !== -1) issues[idx].steward = e.target.value
      updateStats()
    })
  })

  document.querySelectorAll('.priority-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const issueId = parseInt(e.target.dataset.issueId)
      const idx = issues.findIndex(i => i.id === issueId)
      if (idx !== -1) issues[idx].priority = e.target.value
      updateStats()
    })
  })

  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const issueId = parseInt(e.target.dataset.issueId)
      const idx = issues.findIndex(i => i.id === issueId)
      if (idx !== -1) issues[idx].status = e.target.value
      updateStats()
    })
  })
}

function updateStats() {
  document.getElementById('stat-total').textContent = issues.length
  document.getElementById('stat-open').textContent = issues.filter(i => i.status === 'Open').length
  document.getElementById('stat-progress').textContent = issues.filter(i => i.status === 'In Progress').length
  document.getElementById('stat-resolved').textContent = issues.filter(i => i.status === 'Resolved').length
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadStewardsFromJson()
  renderIssues()
  loadMemberIdsFromCsv()

  const searchInput = document.getElementById('searchInput')
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      renderIssues(e.target.value)
    })
  }
})
