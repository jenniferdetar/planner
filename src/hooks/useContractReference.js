import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const CONTRACT_SEED = [
  {
    issue_category: 'Discipline',
    issue_description: 'Notice of Unsatisfactory Service or Act',
    article_number: 'Article X',
    section_number: '4.0',
    summary: 'A Notice of Unsatisfactory Service or Act that does not recommend disciplinary action carries the same appeal rights as an evaluation (10 working days to Division Head). Cannot be based on incidents more than 3 years old. Employee has the right to attach a written response.',
    notes: 'IMPORTANT: The CBA does NOT have a discipline article — formal discipline (suspension, dismissal) is governed by Ed Code 45308 and LAUSD Personnel Commission Rules. Article V explicitly EXCLUDES disciplinary matters from the grievance procedure.',
  },
  {
    issue_category: 'Discipline',
    issue_description: 'Suspension or dismissal (Ed Code process)',
    article_number: '',
    section_number: '',
    summary: 'Formal discipline (suspension without pay, demotion, dismissal) for permanent classified employees is governed by California Ed Code 45308 and LAUSD Personnel Commission Rules — NOT the CBA. Employees have the right to a hearing before the Personnel Commission.',
    notes: 'Article V of the CBA explicitly excludes disciplinary matters from the grievance/arbitration procedure. Contact CSEA immediately — timelines to request a Personnel Commission hearing are strict (typically 30 days from notice).',
  },
  {
    issue_category: 'Discipline',
    issue_description: 'Weingarten rights / investigatory meeting',
    article_number: 'Article V',
    section_number: '',
    summary: 'Under California law (Weingarten rights), an employee may request union representation at any investigatory meeting the employee reasonably believes could result in discipline. The District must honor this request or discontinue the meeting.',
    notes: 'Always ask: "Do you believe this meeting could lead to discipline? If so, you have the right to request a CSEA rep." Never waive this right and never proceed without a rep if the member is worried.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'Illness leave (sick leave) usage / accumulation',
    article_number: 'Article XI',
    section_number: '11.0',
    summary: 'Employees accrue 0.05 hours of full-pay illness leave per paid hour (approx. 10 days/year for full-time). Unused full-pay illness leave is cumulative without limit. Up to 13 days may be advanced at the start of a fiscal year before accrual.',
    notes: 'Half-pay illness days (credited at start of year to bring total to 100 days) do NOT carry over year to year. Only full-pay hours accumulate. If employee takes an advance and leaves, they may owe money back to the District.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'Personal necessity leave',
    article_number: 'Article XI',
    section_number: '13.0',
    summary: 'Up to 7 days per fiscal year of accrued illness leave may be used as personal necessity leave for specified compelling reasons (family death/illness, accident, birth of child, religious holiday, imminent home disaster, other significant event). Deducted from illness leave balance.',
    notes: '5 days\' advance written notice required for religious holidays, court appearances, and school visits. District may require verification. Cannot be used during a strike or work stoppage.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'Bereavement leave',
    article_number: 'Article XI',
    section_number: '8.0',
    summary: 'Per AB 1949 (effective Jan 1, 2023): 5 days of job-protected paid bereavement leave for death of a qualifying family member. Leave may be taken within 3 months of the death. Immediate family includes spouse, parent (step/foster/in-law), grandparent, child (step/foster/in-law), grandchild, sibling, and any relative in the household.',
    notes: 'This is a mandatory leave — the District has no discretion to deny it. A permanent employee may interrupt vacation to take bereavement leave.',
  },
  {
    issue_category: 'Leave',
    issue_description: 'Family Care and Medical Leave (FMLA/CFRA)',
    article_number: 'Article XI',
    section_number: '20.0',
    summary: 'Up to 12 weeks of unpaid protected leave per 12-month period for birth/adoption of a child, or serious health condition of employee, child, spouse, or parent. Employee must have 12 months of service and 130 workdays in the prior year. District maintains health benefits during leave.',
    notes: 'Give 30 days advance notice when foreseeable; as soon as possible otherwise. Medical certification required within 15 days of request. Pregnancy disability leave (Article XI, 9.0) is SEPARATE — employee may be entitled to both.',
  },
  {
    issue_category: 'Schedule',
    issue_description: 'Change in work schedule (hours/shift)',
    article_number: 'Article IX',
    section_number: '7.0',
    summary: 'A change in an employee\'s start/stop times or workweek assignment requires: (1) mutual agreement, (2) a declared emergency, or (3) a minimum of 14 calendar days\' written notice prior to the effective date. Temporary exemption available for enrolled college students where class time conflicts.',
    notes: 'Schedule changes without 14 days\' notice (absent emergency or agreement) are grievable under Article V. Document the original schedule and date change was imposed. Temporary exemption also available for day care needs of a child under 16 (up to 30 days).',
  },
  {
    issue_category: 'Schedule',
    issue_description: 'Reduction in hours',
    article_number: 'Article XXI',
    section_number: '1.0',
    summary: 'A reduction that results in a workyear reduction of 10 or more working days per year constitutes a "layoff" triggering Ed Code 45308 seniority protections. Reductions of this size are subject to bargaining upon CSEA request. Affected employees receive statutorily required notice.',
    notes: 'Any reduction of 10+ working days/year is a layoff — invoke the 20-day expedited bargaining period (Article XXI, 2.0) immediately. Request the seniority list and verify classification. Inverse seniority must be followed.',
  },
  {
    issue_category: 'Evaluation',
    issue_description: 'Negative / below-standard performance evaluation',
    article_number: 'Article X',
    section_number: '2.0',
    summary: 'Evaluations must be based on observations and knowledge — not unsubstantiated charges or rumors. Any below-"meets standards" rating must include: statement of the problem, desired improvement, suggestions for improvement, and provisions for assistance. Evaluator must discuss the evaluation with the employee. Employee may attach a written response.',
    notes: 'Employee\'s signature means receipt only — not agreement. Before rating "below standard" for excessive absences, the District must have previously warned the employee. For other deficiencies, evaluator must note whether employee was previously advised of them. Appeal within 10 working days (Article X, 3.0).',
  },
  {
    issue_category: 'Evaluation',
    issue_description: 'Evaluation schedule / frequency',
    article_number: 'Article X',
    section_number: '1.0',
    summary: 'Probationary employees: at least twice during the probationary period; monthly if any item is rated unsatisfactory. Permanent employees: at least annually. District must make reasonable effort to issue the annual evaluation at least 20 working days before end of assignment basis. A below-standard eval cannot be issued after the last day of the assignment basis.',
    notes: 'Missed evaluation deadlines are grievable under Article V. An overdue or untimely evaluation cannot form the basis for retroactive discipline. Watch the "last day of assignment basis" deadline — below-standard evals issued after it are procedurally defective.',
  },
  {
    issue_category: 'Grievance',
    issue_description: 'Grievance timelines and steps',
    article_number: 'Article V',
    section_number: '',
    summary: 'Step 1: Within 15 days of incident, written grievance to immediate supervisor; meeting within 5 days; response within 5 days (Step 1 ends day 9 after meeting). Step 2: Within 5 days, to Division Head/Local District Superintendent; same 5+5 timeline. Step 3: Within 5 days, to Deputy Superintendent or designee; response within 5 days. Arbitration: CSEA must request within 5 days after Step 3 ends.',
    notes: 'ALL TIME LIMITS ARE STRICT — missing any step deadline waives the grievance. A "day" = any day except Sat/Sun/holidays. Failure to respond by the District at any step = automatic denial; proceed to next step. Always file in writing on District Grievance Procedure Form. Keep copies of everything.',
  },
  {
    issue_category: 'Grievance',
    issue_description: 'What IS and IS NOT grievable',
    article_number: 'Article V',
    section_number: '',
    summary: 'A grievance is a claim that the District violated an EXPRESS TERM of the CBA. EXCLUDED from grievance: disciplinary matters, reductions in force/layoffs, exam procedures, performance evaluations (on the merits), and complaints between employees. Evaluation procedure violations (Article X) and Non-Discrimination (Article VII) may go through Steps 1–2 only.',
    notes: 'Before filing, confirm the specific CBA article allegedly violated. Vague grievances get denied. Disciplinary matters go to Personnel Commission, not grievance. Union (CSEA) must concur for arbitration — individual employees cannot demand arbitration on their own.',
  },
  {
    issue_category: 'Overtime',
    issue_description: 'Overtime assignment and pay',
    article_number: 'Article IX',
    section_number: '2.0',
    summary: 'Overtime is paid at 1.5x for: hours over 8/day or 40/week, or work on the 6th/7th day of the workweek. OT must be distributed equitably using a rotational list at the work site. Reasonable notice = no less than 24 hours (except emergencies). OT cannot be assigned on an arbitrary, capricious, discriminatory, or retaliatory basis.',
    notes: 'Track the OT rotation list — if the District skips employees or assigns OT out of order, file a grievance. For emergency or unanticipated OT, District must still make reasonable efforts to give advance notice.',
  },
  {
    issue_category: 'Overtime',
    issue_description: 'Comp time in lieu of overtime',
    article_number: 'Article IX',
    section_number: '2.0',
    summary: 'Comp time may be earned in lieu of overtime pay at 1.5x the hours worked, consistent with state and federal law. The District must pay or allow the employee to use comp time within 12 months of it being earned (or sooner if required by law).',
    notes: 'Per law, comp time arrangements for non-exempt employees must be agreed to in advance via a written MOU or CBA provision. District cannot unilaterally switch employees from OT cash to comp time. Confirm any comp time agreement is in writing.',
  },
  {
    issue_category: 'Transfer',
    issue_description: 'Involuntary transfer',
    article_number: 'Article XIV',
    section_number: '2.0',
    summary: 'Involuntary transfers may occur at District discretion. Notice required: 5 days for transfers within the same Local District; up to 10 days if outside the same Local District and employee demonstrates undue hardship. Employee is entitled to know the reason(s) for the transfer. Cannot be punitive, disciplinary, or retaliatory.',
    notes: 'If the transfer follows a grievance, complaint, or protected activity, document the timeline and file a grievance for retaliatory transfer. Transfers to/from "low-performing schools" or for safety reasons are expressly deemed non-disciplinary by the contract — harder to grieve.',
  },
  {
    issue_category: 'Transfer',
    issue_description: 'Voluntary transfer request',
    article_number: 'Article XIV',
    section_number: '3.0',
    summary: 'Employee submits transfer request on District form to immediate administrator. Approved requests are placed on a transfer eligibility list maintained by the Personnel Commission. Deferral up to 45 calendar days is permitted (but not for punitive/discriminatory reasons). Employee must accept or decline an offer within 3 working days and must be able to report within 10 working days.',
    notes: 'Requests remain on file 1 year. If rejected for a specific vacancy, employee is entitled to know the reasons upon request. Keep copies of all postings and requests. If a less senior employee was selected, request the selection rationale in writing.',
  },
  {
    issue_category: 'Health & Safety',
    issue_description: 'Unsafe working conditions',
    article_number: 'Article XIX',
    section_number: '',
    summary: 'The District is responsible for reasonably safe working conditions in conformance with applicable law. Employees must report unsafe conditions and are NOT to enter/occupy areas designated "unsafe" by a District or government authority. There shall be NO reprisal against an employee for reporting an unsafe condition. CSEA may request a joint meeting with District to consult on safety matters.',
    notes: 'Safety rights are primarily statutory (Cal/OSHA, Labor Code) — not just contractual. File a Cal/OSHA complaint (Form 1 online) if the District does not address a hazard within a reasonable time. Document everything with dates and photos. Retaliation for reporting is itself separately actionable.',
  },
  {
    issue_category: 'Health & Safety',
    issue_description: 'Industrial injury / on-the-job injury leave',
    article_number: 'Article XI',
    section_number: '12.0',
    summary: 'Employee injured on the job is entitled to up to 60 working days of industrial injury leave at full pay (not charged to sick leave) for the same injury. Must report the injury/illness in writing to the administrator within 2 working days and report to a District-approved physician. If injury results from an act of violence during assigned duties, leave may extend up to an additional 60 days (Section 12.1).',
    notes: 'Do NOT delay reporting — the 2-working-day report requirement is strict. Industrial leave is SEPARATE from regular illness leave and cannot be charged to the sick balance during the first 60 days. After industrial leave is exhausted, employee may use accrued illness or vacation. See also Ed Code 45192.',
  },
  {
    issue_category: 'Probation',
    issue_description: 'Probationary period — rights and evaluation',
    article_number: 'Article X',
    section_number: '1.0',
    summary: 'Probationary employees must be evaluated at least twice during the probationary period. If any evaluation item is rated unsatisfactory, evaluations may be issued every month for the remainder of probation. Dismissal during probation does not require just cause and is governed by Ed Code/Personnel Commission Rules — Article V grievance rights for termination are limited.',
    notes: 'Focus on documentation and support. Advocate for clear expectations and proper onboarding. If evaluation procedures are not followed (e.g., no written copy provided, no discussion), that IS grievable on procedure. A probationary employee dismissed in retaliation for protected activity (e.g., union activity) may have separate legal remedies under PERB.',
  },
  {
    issue_category: 'Layoff',
    issue_description: 'Layoff / reduction in force',
    article_number: 'Article XXI',
    section_number: '2.0',
    summary: 'Before issuing layoff notifications, the District must give CSEA 20 days\' written notice to allow expedited bargaining. Layoffs follow inverse seniority within classification under Ed Code 45308 and Personnel Commission Rules. Laid-off employees have reemployment rights for 39 months. No substitutes or limited-term staff may be hired in a classification while the reemployment list is active.',
    notes: 'Request the seniority list immediately upon layoff notice. Verify classification assignments — misclassification affects seniority standing. File for unemployment right away. Errors in layoff order (less senior employee retained) may be challenged at Personnel Commission. Reemployment list must be exhausted before any outside hire.',
  },
  // ── LA Chapter No. 500 Constitution (As Revised January 27, 2022) ──
  {
    issue_category: 'Constitution',
    issue_description: 'Name and Objects',
    article_number: 'Article I',
    section_number: '',
    summary: 'The organization is Los Angeles Chapter No. 500 of the California School Employees Association (CSEA). Its objects include promoting members\' welfare, securing reasonable hours/fair wages/improved working conditions, establishing cooperation with the employer, advancing free collective bargaining, promoting beneficial legislation, and promoting the economic and social welfare of members through unity and mutual cooperation.',
    notes: 'Revised January 27, 2022; Approved by CSEA August 30, 2022.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Membership – Active',
    article_number: 'Article II',
    section_number: 'Section 1(a)',
    summary: '"Active" membership carries full participation rights including the right to vote and hold elected/appointed offices. Extended to any person employed in a bargaining unit represented by this Chapter without regard to race, creed, color, national origin, sex, age, sexual orientation, or political belief. Active status ceases when a member becomes eligible for another membership category, with exceptions for layoff (up to 39-month reemployment period) and involuntary termination appeals.',
    notes: 'Active members must also be Active members of the Association as defined in the Association Constitution.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Membership – Inactive, Retired, Honorary',
    article_number: 'Article II',
    section_number: 'Sections 1(b)–1(e)',
    summary: 'Inactive: Unpaid leave/reemployment list members may continue at half the dues rate; no voice or vote. Lifetime Retired: One-time $25 fee; may attend meetings and receive newsletter; no voice/vote. Active Retired: Full dues; full participation except may not vote on contract ratification or concerted activities. Honorary: $25/year; attend meetings/functions; no voice/vote.',
    notes: 'Active Retired membership terminates automatically if the member ceases to be a Retired Member in good standing of the Association.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Membership – Good Standing & Termination',
    article_number: 'Article II',
    section_number: 'Sections 2–5',
    summary: 'Good standing is effective upon receipt of required dues for the current month. Membership terminates upon layoff (if member does not continue), voluntary/involuntary separation, termination of reemployment rights, or execution of a dues-termination document. Dues authorization is a contract; minimum 5 days advance written notice required to terminate payroll deduction.',
    notes: 'Expelled/suspended members are governed by Association Constitution procedures. Resigned members may rejoin as new members.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Dues and Assessments',
    article_number: 'Article III',
    section_number: '',
    summary: 'Association per capita dues: 1.5% of first $3,150 monthly gross salary (excl. overtime), max $472.50 per Sept–Aug year, paid by payroll deduction. Local Chapter dues: $15.00 per year, per-pay-period deduction or annual advance. Dues rate changes require a majority mail-ballot vote of Active members. Assessments require 3/4 vote of members present by secret ballot with 10 days\' advance written notice.',
    notes: 'No funds may be solicited in the Chapter\'s name without Executive Board authorization. All collected funds must be delivered to the Treasurer within 5 working days.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Officers & Executive Board',
    article_number: 'Article IV',
    section_number: 'Sections 1–3',
    summary: 'Elected officers: President, 1st VP, 2nd VP, Secretary, Treasurer, Assistant Treasurer, Communications Officer, Chief Union Steward, and Political Action Chair. The Executive Board consists of these officers plus the Immediate Past President. Eligibility requires 6 consecutive months of Active membership in good standing and participation in at least 2 qualifying activities (district meeting, chapter meeting, or CSEA training).',
    notes: 'President, 2nd VP, Treasurer, and Chief Union Steward elected in even-numbered years. 1st VP, Secretary, Assistant Treasurer, Communications Officer, and Political Action Chair elected in odd-numbered years.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Election Procedures',
    article_number: 'Article IV',
    section_number: 'Sections 4–6',
    summary: 'Nominations at October and November Chapter meetings. Online balloting begins no sooner than December 1. Election notice sent at least 10 calendar days before balloting closes. Plurality vote required; ties resolved by lot. Terms begin January 1 following election; serve 2 years. Presidential vacancy filled by 1st VP. Other vacancies filled by Executive Board recommendation with floor nominations.',
    notes: 'All election documents retained by Chapter Secretary for 1 year or until all challenges resolved, whichever is longer. Conducted per Association Policy 618.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Executive Board Authority & Officer Duties',
    article_number: 'Article V',
    section_number: '',
    summary: 'The Executive Board has general supervision of Chapter affairs between membership meetings. Reports all actions to membership at next meeting. Minutes/financial records kept for 5 years. Majority constitutes quorum. Officers must turn over all Chapter property (including electronic devices, passwords, files) to their successor upon leaving office. Board members must attend all meetings unless excused and must complete at least Level I Union Steward Training.',
    notes: 'President chairs Executive Board and Leadership Council, appoints committees, attends Regional Presidents\' Meetings. Chief Union Steward maintains grievance records and attends all Personnel Commission meetings. Political Action Chair reviews Board of Education agendas.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Leadership Council',
    article_number: 'Article VI',
    section_number: '',
    summary: 'Composed of: President (Chair), 1st VP, 2nd VP (Assistant Chair), Chief Union Steward, and District Representatives. District Representatives elected by Executive Board in even-numbered years; Assistant District Reps in odd-numbered years. Must have 6 months Active membership. Meets at least 6 times per year. District Reps must call at least 5 Local District/Beaudry Site informational meetings per fiscal year.',
    notes: 'Leadership Council quorum = majority of members. Meeting notice at least 5 days in advance. Members entitled to mileage reimbursement and release time for assigned duties.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Meetings – Regular, Special & Electronic',
    article_number: 'Article VII',
    section_number: '',
    summary: 'Regular meetings: September through June; schedule established in January. Special meetings: called by President, 2/3 vote of Executive Board, or petition of 20% of membership. Meeting notice: at least 5 days in advance for regular; 24 hours minimum for emergencies. Electronic meetings permitted with 2/3 Executive Board consent. Quorum: 10 members in good standing. Order of Business: Pledge, Minutes, Communications, EB Report, Treasurer\'s Report, Committee Reports, Steward Reports, Site Rep Reports, Unfinished Business, New Business, Good of the Order, Adjournment.',
    notes: 'Electronic meetings may not be used for secret ballot votes. Members joining by phone vote by roll call.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Control of Funds / Budget',
    article_number: 'Article VIII',
    section_number: '',
    summary: 'All funds deposited in the Chapter\'s name. Debit cards strictly prohibited. Disbursements by check signed by Treasurer AND President or 1st VP. Annual budget prepared by Executive Board, approved by membership no later than January. Expenditures over budget require membership approval, except under $100 may be approved by Executive Board and reported at next Chapter meeting.',
    notes: 'In absence/vacancy of Treasurer, funds disbursed on signature of President and one of: 1st VP, Secretary, or Assistant Treasurer.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Committees – Standing & Ad Hoc',
    article_number: 'Article IX',
    section_number: '',
    summary: 'Standing committees: Auditing, Communications, Constitution, Elections, Membership, Negotiating, Nominating, Political Action, Negotiations, and Scholarship. Appointed by President after January 1, subject to Executive Board ratification. Ad Hoc committees created as needed and cease upon completing their task. President is ex-officio member of all committees EXCEPT Auditing, Elections, and Nominating. Quorum = majority of committee members.',
    notes: 'Auditing Committee reviews Treasurer\'s books after each fiscal year close. Elections Committee oversees all elections and contract ratification votes per Association Policy 618.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Union Stewards',
    article_number: 'Article X',
    section_number: '',
    summary: 'Elected by Executive Board from members in good standing who have completed Level 1 and Level 2 Union Steward Training. Number determined by Executive Board. Term: January 1 to end of fiscal year. Duties: attend training, educate members on contract rights, act as channel between employees and Chapter, investigate/prepare grievances at the immediate-supervisory level, report all grievances to Chief Union Steward, maintain confidentiality.',
    notes: 'Vacancies filled by Executive Board appointment from qualified members in good standing. Grievance files turned over to Chief Union Steward upon completion.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Site Representatives',
    article_number: 'Article XI',
    section_number: '',
    summary: 'Appointed by the appropriate District Representative, subject to Executive Board election. Duties: recruit members, distribute Chapter newsletter/bulletins, keep members informed of Chapter/Association/Local District activities (grievances, negotiations, legislative/political activity), relay concerns to Union Steward or other Chapter officer, attend Chapter meetings and training workshops.',
    notes: 'Site Representatives serve each worksite; numbers determined by District Representative needs.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Recall or Removal from Office',
    article_number: 'Article XII',
    section_number: '',
    summary: 'Recall of elected officers/delegates: requires petition from 2/3 of Executive Board OR 30% of eligible members; special meeting within 15–30 days; 2/3 secret ballot vote of Active members present required. Removal of appointees: 2/3 Executive Board vote with 5 days advance notice to the member. Any appointed committee member missing 3 consecutive meetings (unexcused) is automatically removed. Resignation by elected officer requires acceptance by Active members at a Chapter meeting.',
    notes: 'Recall meeting attendance restricted to Executive Board, eligible Active members, authorized Association representatives, and pertinent witnesses. 10 days\' advance notice required.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Delegates to Conference',
    article_number: 'Article XIII',
    section_number: '',
    summary: 'Voting delegates to CSEA Annual Conference: Chapter President, 1st VP (automatic), plus additional elected delegates up to the Association\'s authorized maximum. Nominations at March meeting; secret ballot election at April meeting. Alternates elected in rank order of votes received. Delegates must attend at least one orientation meeting and report back to Chapter after conference.',
    notes: 'Delegate expenses (housing, travel, per diem, registration) paid by Chapter in accordance with Association Policy and subject to membership approval.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Contract Ratification Procedures',
    article_number: 'Article XIV',
    section_number: '',
    summary: 'Complies with Association Policy 610. Initial bargaining proposals determined by membership vote. Negotiated agreements submitted to CSEA Labor Relations Representative before ratification. Chapter President sets date/time/place for contract information meeting(s) open to all bargaining unit employees. Notice to bargaining unit at least 5 working days in advance. Ratification by online ballot; majority of votes cast required. No contract valid without membership ratification.',
    notes: 'Ballot notice sent at least 10 calendar days before online balloting closes. Elections Committee oversees the process. Results provided to membership within 5 days of tally.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Concerted Activities (Strike)',
    article_number: 'Article XV',
    section_number: '',
    summary: 'No concerted withholding of service may be instituted unless: (1) approved at a regular or special membership meeting by secret ballot vote of at least 65% of Active members in good standing present and voting, AND (2) approval granted by the Association\'s Board of Directors. If the dispute involves contract negotiations, the employer\'s last offer must also have been submitted to membership and rejected.',
    notes: 'Advance notice required for meeting where strike vote will occur. This is a high threshold — both 65% of members present AND Association Board approval required.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Amendments to Constitution',
    article_number: 'Article XVI',
    section_number: '',
    summary: 'Any member in good standing may submit a written amendment proposal at a Chapter meeting (first reading). The Chapter President places it on the next meeting agenda (second reading) with 10 days\' written notice to all members. Adoption requires 2/3 vote of Active members in good standing present and voting at the second reading. No amendment is operative until approved by the Association\'s Executive Director or Board of Directors.',
    notes: 'Constitution must always conform to Association Constitution & Bylaws and Policy; in any conflict, the Association document prevails.',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Fiscal Year & Parliamentary Authority',
    article_number: 'Articles XVIII–XIX',
    section_number: '',
    summary: 'Fiscal year: January 1 through December 31. Parliamentary authority: current edition of Robert\'s Rules of Order, Newly Revised, governs in all cases not inconsistent with this Constitution, the Association Constitution & Bylaws or Policy, or any special rules the Chapter adopts.',
    notes: '',
  },
  {
    issue_category: 'Constitution',
    issue_description: 'Delegates to LA County Federation of Labor',
    article_number: 'Article XXI',
    section_number: '',
    summary: 'Delegates: Chapter President (or Executive Board designee) plus additional delegates as authorized by the LA County Federation. Nominations in April; secret ballot election in May. Delegates must: report to Executive Board and Chapter; report at Regional President\'s Meetings; follow LA County Federation bylaws; represent Chapter on all applicable CSEA issues; attend monthly Federation meetings; ensure all actions are consistent with CSEA policies including political endorsements. Chapter President or designee also serves as COPE representative.',
    notes: 'Conducted per Association Policy 618 under Elections Committee supervision.',
  },
]

export function useContractReference(userId) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  const sort = (arr) =>
    [...arr].sort((a, b) =>
      a.issue_category.localeCompare(b.issue_category) ||
      a.issue_description.localeCompare(b.issue_description)
    )

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

  useEffect(() => {
    load()

    if (!userId) return

    const channel = supabase
      .channel('contract_quick_reference')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contract_quick_reference' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((prev) => {
              if (prev.some((e) => e.id === payload.new.id)) return prev
              return sort([...prev, payload.new])
            })
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) => prev.filter((e) => e.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setEntries((prev) => sort(prev.map((e) => (e.id === payload.new.id ? payload.new : e))))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load, userId])

  async function addEntry(fields) {
    const { data, error } = await supabase
      .from('contract_quick_reference')
      .insert({ ...fields, user_id: userId })
      .select()
      .single()
    if (!error && data) setEntries(prev => sort([...prev, data]))
  }

  async function updateEntry(id, fields) {
    const { data, error } = await supabase
      .from('contract_quick_reference')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setEntries(prev => sort(prev.map(e => e.id === id ? data : e)))
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
    if (data) setEntries(prev => sort([...prev, ...data]))
  }

  return { entries, loading, addEntry, updateEntry, deleteEntry, seedDefaults }
}
