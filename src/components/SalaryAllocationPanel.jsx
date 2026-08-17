import './SalaryAllocationPanel.css'

// Salary Allocation — Alpha Work, Lunch & Break Schedules
// 2026-2027 School Year · Effective 08/10/2026
// Source: Salary_Allocation_Lunch_Schedules_08102026.pdf

const WORK_SCHEDULES = [
  '8:00 am - 5:00 pm (Hour Lunch)',
  '7:30 am - 4:30 pm (Hour Lunch)',
]

// Names in "First Last" format. Sorted by Alpha caseload range (A→Z) so you
// can find a member's last name and see which SCA to contact; SUPV last.
const SCHEDULE = [
  { sca: 'Roberta Barrera',  group: 2, ext: '29040', alpha: 'A - BRING',        hub: 'North', lunch: '1:30 - 2:30',  break: '11:00 - 11:20' },
  { sca: 'Clara Velasquez',  group: 2, ext: '29064', alpha: 'BRINH - DEC',      hub: 'West',  lunch: '12:00 - 1:00', break: '3:10 - 3:30' },
  { sca: 'Tasha Hardy',      group: 1, ext: '12480', alpha: 'DED - GILA',       hub: 'North', lunch: '12:00 - 1:00', break: '10:00 - 10:20' },
  { sca: 'Danita Hamptonie', group: 2, ext: '29048', alpha: 'GILB - JIL',       hub: 'West',  lunch: '1:30 - 2:30',  break: '10:00 - 10:20' },
  { sca: 'Marcia Mendoza',   group: 1, ext: '15296', alpha: 'JIM - MARTE',      hub: 'South', lunch: '1:30 - 2:30',  break: '11:00 - 11:20' },
  { sca: 'Cecile Natividad', group: 1, ext: '16138', alpha: 'MARTF - OHAR',     hub: 'North', lunch: '12:30 - 1:30', break: '10:30 - 10:50' },
  { sca: 'Maria Mejia',      group: 2, ext: '29050', alpha: 'OHAS - RIVERA, K', hub: 'East',  lunch: '12:00 - 1:00', break: '3:10 - 3:30' },
  { sca: 'Veronica Rito',    group: 1, ext: '29056', alpha: 'RIVERA, L - SWA',  hub: 'East',  lunch: '12:30 - 1:30', break: '10:40 - 11:00' },
  { sca: 'Deserine Estrada', group: 2, ext: '29034', alpha: 'SWB - Z',          hub: 'South', lunch: '12:30 - 1:30', break: '3:10 - 3:30' },
  { sca: 'Brenda Neblett',   group: 1, ext: '18331', alpha: 'SUPV',             hub: 'West',  lunch: '1:00 - 2:00',  break: '11:00 - 11:20' },
]

// Audit of D & G-Table Projections / Futures / ETK-TK Requirements
// (evaluator → auditor pairings preserved; rows sorted by evaluator last name)
const AUDITS = [
  { evaluator: 'Tasha Hardy',     auditor: 'Veronica Rito' },
  { evaluator: 'Maria Mejia',     auditor: 'Tasha Hardy' },
  { evaluator: 'Veronica Rito',   auditor: 'Clara Velasquez' },
  { evaluator: 'Clara Velasquez', auditor: 'Maria Mejia' },
]

// Self-Audits of D & G-Table Projections / Futures / ETK-TK Requirements
// (sorted by last name)
const SELF_AUDITS = ['Roberta Barrera', 'Deserine Estrada', 'Danita Hamptonie', 'Marcia Mendoza', 'Cecile Natividad']

const HUB_COLORS = {
  North: '#2a78d6',
  South: '#008300',
  East: '#eda100',
  West: '#4a3aa7',
}

export default function SalaryAllocationPanel() {
  return (
    <div className="salloc-panel">
      <div className="salloc-header">
        <h2 className="salloc-title">Salary Allocation — Alpha Work, Lunch &amp; Break Schedules</h2>
        <span className="salloc-subtitle">2026–2027 School Year · Effective 08/10/2026</span>
        <p className="salloc-note">
          Work schedules are divided by two groups, with one group taking the 8:00–5:00 shift each week.
        </p>
        <div className="salloc-shifts">
          {WORK_SCHEDULES.map((s, i) => (
            <span className="salloc-shift" key={s}>
              <span className="salloc-shift-lbl">Work Schedule {i + 1}</span>
              <span className="salloc-shift-time">{s}</span>
            </span>
          ))}
        </div>
      </div>

      <p className="salloc-lookup-hint">
        Find the member's last name in the <strong>Alpha</strong> range, then contact that SCA about their Salary Allocation.
      </p>

      <div className="salloc-table-wrap">
        <table className="salloc-table">
          <thead>
            <tr>
              <th className="salloc-alpha-col">Alpha (Caseload Range)</th>
              <th>SCA — Contact</th>
              <th>Extension</th>
              <th>Group</th>
              <th>HUB</th>
              <th>Lunch</th>
              <th>Break</th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map(row => (
              <tr key={row.ext}>
                <td className="salloc-alpha">{row.alpha}</td>
                <td className="salloc-name">{row.sca}</td>
                <td className="salloc-center salloc-ext">{row.ext}</td>
                <td className="salloc-center">
                  <span className={`salloc-group salloc-group-${row.group}`}>{row.group}</span>
                </td>
                <td className="salloc-center">
                  <span className="salloc-hub" style={{ background: HUB_COLORS[row.hub] || '#888' }}>{row.hub}</span>
                </td>
                <td className="salloc-center salloc-time">{row.lunch}</td>
                <td className="salloc-center salloc-time">{row.break}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="salloc-audits">
        <div className="salloc-card">
          <span className="salloc-card-title">Audit of D &amp; G-Table Projections / Futures / ETK-TK Requirements</span>
          <table className="salloc-audit-table">
            <thead>
              <tr>
                <th>Evaluator</th>
                <th>Auditor</th>
              </tr>
            </thead>
            <tbody>
              {AUDITS.map(a => (
                <tr key={a.evaluator}>
                  <td>{a.evaluator}</td>
                  <td>{a.auditor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="salloc-card">
          <span className="salloc-card-title">Self-Audits of D &amp; G-Table Projections / Futures / ETK-TK Requirements</span>
          <ul className="salloc-selfaudit-list">
            {SELF_AUDITS.map(name => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
