import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const CONTRACT_SEED = [
  {
    issue_category: 'Discipline',
    issue_description: 'Written reprimand / letter of warning',
    article_number: 'Article 18',
    section_number: '18.1',
    summary: 'Member must receive written notice of discipline. Union rep has the right to be present at any investigatory meeting if the member requests it. Member has 10 days to respond in writing.',
    notes: 'Weingarten Rights apply — always ask if the member requested a rep.',
  },
  {
    issue_category: 'Discipline',
    issue_description: 'Suspension without pay',
    article_number: 'Article 18',
    section_number: '18.3',
    summary: 'Suspensions must be for just cause. Member must be notified in writing at least 24 hours before the suspension begins. Union must be notified simultaneously.',
    notes: 'Check if progressive discipline was followed. Look for prior verbal/written warnings.',
  },
  {
    issue_category: 'Discipline',
    issue_description: 'Termination / dismissal',
    article_number: 'Article 18',
    section_number: '18.5',
    summary: 'Termination requires just cause. Member must be given written notice stating specific reasons. Union has the right to grieve on the member\'s behalf within 15 days.',
    notes: 'File grievance immediately. Gather all documentation, witness names, and prior evaluations.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'Sick leave usage / accumulation',
    article_number: 'Article 11',
    section_number: '11.1',
    summary: 'Unit members earn 1 sick day per month (10 days/year). Sick leave is cumulative without limit. May be used for illness of the employee or immediate family member.',
    notes: 'Immediate family = spouse, children, parents, siblings, in-laws living in the household.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'Personal necessity leave',
    article_number: 'Article 11',
    section_number: '11.2',
    summary: 'Up to 7 days of sick leave per year may be used as personal necessity leave. No reason required for up to 3 days; reason required for 4–7 days.',
    notes: 'District cannot deny the first 3 days without cause. Document any denials.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'Bereavement leave',
    article_number: 'Article 11',
    section_number: '11.4',
    summary: '3 days paid leave for death of immediate family; 5 days if travel beyond 300 miles is required. Immediate family includes spouse, children, parents, siblings, grandparents, and in-laws.',
    notes: 'Can be extended using sick leave if needed. Always document in writing.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'FMLA / CFRA',
    article_number: 'Article 11',
    section_number: '11.7',
    summary: 'Up to 12 weeks of unpaid protected leave per year for qualifying health or family reasons. Member retains health benefits during leave. Job must be held or equivalent offered upon return.',
    notes: 'Employer must notify employee of FMLA eligibility within 5 days. File paperwork promptly.',
  },
  {
    issue_category: 'Schedule',
    issue_description: 'Change in work hours / shift change',
    article_number: 'Article 7',
    section_number: '7.2',
    summary: 'Employer must provide at least 2 weeks written notice before changing a classified employee\'s regular work schedule. Changes must meet operational need and are subject to grievance.',
    notes: 'Unilateral changes to established schedules without notice are grievable. Document the original schedule.',
  },
  {
    issue_category: 'Schedule',
    issue_description: 'Reduction in hours',
    article_number: 'Article 7',
    section_number: '7.4',
    summary: 'Reduction in hours constitutes a layoff and triggers seniority provisions. Least senior employees in the affected classification must be reduced first. Affected employees have the right to bump.',
    notes: 'Check seniority list before any reduction. Notify union immediately — bumping timelines are strict.',
  },
  {
    issue_category: 'Evaluation',
    issue_description: 'Negative performance evaluation',
    article_number: 'Article 14',
    section_number: '14.3',
    summary: 'Member must receive copy of evaluation before it is placed in the file. Member has the right to respond in writing within 10 days. Response must be attached to the evaluation.',
    notes: 'Review evaluation for specific, documented examples. Vague criticism is harder to defend. Check prior evals for consistency.',
  },
  {
    issue_category: 'Evaluation',
    issue_description: 'Evaluation cycle / frequency',
    article_number: 'Article 14',
    section_number: '14.1',
    summary: 'Probationary employees evaluated every 90 days. Permanent employees evaluated annually. Evaluations must be completed by [date per site calendar].',
    notes: 'Missed evaluation deadlines can be grieved. An overdue evaluation cannot retroactively justify discipline.',
  },
  {
    issue_category: 'Grievance',
    issue_description: 'Grievance timelines and steps',
    article_number: 'Article 16',
    section_number: '16.2',
    summary: 'Step 1: informal resolution with supervisor (5 days). Step 2: written grievance to principal/manager (10 days from incident). Step 3: appeal to HR (10 days from Step 2 response). Step 4: arbitration.',
    notes: 'Timelines are STRICT — missing a deadline typically waives the grievance. Always file in writing and keep copies.',
  },
  {
    issue_category: 'Overtime',
    issue_description: 'Overtime assignment and pay',
    article_number: 'Article 8',
    section_number: '8.1',
    summary: 'Overtime is voluntary unless contractually required. Hours over 8/day or 40/week paid at 1.5x. Must be pre-approved by supervisor. Rotation list used to ensure equitable distribution.',
    notes: 'Track OT rotation — if management is skipping employees on the list, file a grievance.',
  },
  {
    issue_category: 'Overtime',
    issue_description: 'Comp time in lieu of overtime',
    article_number: 'Article 8',
    section_number: '8.3',
    summary: 'Employee may elect comp time in lieu of overtime pay, up to 40 hours accumulated. Comp time must be used within 6 months or paid out. Employer cannot require comp time over cash payment.',
    notes: 'Agreement to use comp time must be mutual — employer cannot force it.',
  },
  {
    issue_category: 'Transfer',
    issue_description: 'Involuntary transfer',
    article_number: 'Article 9',
    section_number: '9.3',
    summary: 'Involuntary transfers must be for legitimate operational reasons. Member must receive written notice 10 days in advance. Member may request a meeting to discuss reasons.',
    notes: 'If used as discipline in disguise, it is grievable. Document any connection to prior complaints or protected activity.',
  },
  {
    issue_category: 'Transfer',
    issue_description: 'Voluntary transfer / job posting',
    article_number: 'Article 9',
    section_number: '9.1',
    summary: 'All vacancies must be posted for at least 5 days before being filled. Bargaining unit members have the right to apply. Seniority is a factor in selection when qualifications are equal.',
    notes: 'Keep copies of postings. If a less senior employee was selected, request the selection rationale in writing.',
  },
  {
    issue_category: 'Health & Safety',
    issue_description: 'Unsafe working conditions',
    article_number: 'Article 19',
    section_number: '19.1',
    summary: 'Employees have the right to refuse work that poses an imminent danger to health or safety. Must notify supervisor and union immediately. Cal/OSHA report can be filed if unresolved within 24 hours.',
    notes: 'Document the hazard with photos/dates. File Cal/OSHA complaint if district does not respond. This is never grievable — it is a statutory right.',
  },
  {
    issue_category: 'Health & Safety',
    issue_description: 'Workers compensation / on-the-job injury',
    article_number: 'Article 19',
    section_number: '19.4',
    summary: 'Injuries must be reported to employer the same day. Member entitled to medical treatment at district-approved provider. Industrial leave up to 60 days at full pay (Ed Code 45192).',
    notes: 'Do NOT let the member delay reporting. Industrial leave is separate from sick leave and cannot be charged to sick balance for the first 60 days.',
  },
  {
    issue_category: 'Probation',
    issue_description: 'Probationary period and rights',
    article_number: 'Article 13',
    section_number: '13.1',
    summary: 'New classified employees serve a 6-month probationary period. May be dismissed without cause during probation. Union may assist but grievance rights for termination are limited.',
    notes: 'Focus on documentation and support during probation. Advocate for proper onboarding and clear expectations.',
  },
  {
    issue_category: 'Layoff',
    issue_description: 'Layoff / reduction in force',
    article_number: 'Article 15',
    section_number: '15.1',
    summary: 'Layoffs must follow inverse seniority within classification. District must provide 60 days written notice. Laid-off employees have re-employment rights for 39 months.',
    notes: 'Request the seniority list immediately. Verify classification assignments. Re-employment list must be maintained — district cannot hire outside until list is exhausted.',
  },
]

export function useContractReference(userId) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('contract_quick_reference')
      .select('*')
      .order('issue_category')
      .order('issue_description')
    setEntries(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  async function addEntry(fields) {
    const { data, error } = await supabase
      .from('contract_quick_reference')
      .insert({ ...fields, user_id: userId })
      .select()
      .single()
    if (!error && data) setEntries(prev => [...prev, data].sort((a, b) =>
      a.issue_category.localeCompare(b.issue_category) || a.issue_description.localeCompare(b.issue_description)))
  }

  async function updateEntry(id, fields) {
    const { data, error } = await supabase
      .from('contract_quick_reference')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setEntries(prev => prev.map(e => e.id === id ? data : e))
  }

  async function deleteEntry(id) {
    await supabase.from('contract_quick_reference').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function seedDefaults() {
    const rows = CONTRACT_SEED.map(r => ({ ...r, user_id: userId }))
    const { data } = await supabase
      .from('contract_quick_reference')
      .insert(rows)
      .select()
    if (data) setEntries(prev => [...prev, ...data].sort((a, b) =>
      a.issue_category.localeCompare(b.issue_category) || a.issue_description.localeCompare(b.issue_description)))
  }

  return { entries, loading, addEntry, updateEntry, deleteEntry, seedDefaults }
}
