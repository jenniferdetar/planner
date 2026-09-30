import './SalaryAllocationPanel.css'

// Salary Allocation — Alpha Work assignments
// 2026-2027 School Year · Effective 08/10/2026
// Source: Salary_Allocation_Lunch_Schedules_08102026.pdf

// Names in "First Last" format. Sorted by Alpha caseload range (A→Z) so you
// can find a member's last name and see which SCA to contact; SUPV last.
const SCHEDULE = [
  { sca: 'Roberta Barrera',  group: 2, ext: '29040', alpha: 'A - BRING',        hub: 'North' },
  { sca: 'Clara Velasquez',  group: 2, ext: '29064', alpha: 'BRINH - DEC',      hub: 'West' },
  { sca: 'Tasha Hardy',      group: 1, ext: '12480', alpha: 'DED - GILA',       hub: 'North' },
  { sca: 'Danita Hamptonie', group: 2, ext: '29048', alpha: 'GILB - JIL',       hub: 'West' },
  { sca: 'Marcia Mendoza',   group: 1, ext: '15296', alpha: 'JIM - MARTE',      hub: 'South' },
  { sca: 'Cecile Natividad', group: 1, ext: '16138', alpha: 'MARTF - OHAR',     hub: 'North' },
  { sca: 'Maria Mejia',      group: 2, ext: '29050', alpha: 'OHAS - RIVERA, K', hub: 'East' },
  { sca: 'Veronica Rito',    group: 1, ext: '29056', alpha: 'RIVERA, L - SWA',  hub: 'East' },
  { sca: 'Deserine Estrada', group: 2, ext: '29034', alpha: 'SWB - Z',          hub: 'South' },
  { sca: 'Brenda Neblett',   group: 1, ext: '18331', alpha: 'SUPV',             hub: 'West' },
]

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
        <h2 className="salloc-title">Salary Allocation — Alpha Work</h2>
        <span className="salloc-subtitle">2026–2027 School Year · Effective 08/10/2026</span>
      </div>

      <p className="salloc-lookup-hint">
        Find the member's last name in the <strong>Alpha</strong> range, then contact that SCA about their Salary Allocation.
      </p>

      <div className="salloc-tables">
        {[
          SCHEDULE.slice(0, Math.ceil(SCHEDULE.length / 2)),
          SCHEDULE.slice(Math.ceil(SCHEDULE.length / 2)),
        ].map((rows, i) => (
          <div className="salloc-table-wrap" key={i}>
            <table className="salloc-table">
              <thead>
                <tr>
                  <th className="salloc-alpha-col">Alpha (Caseload Range)</th>
                  <th>SCA — Contact</th>
                  <th>Extension</th>
                  <th>Group</th>
                  <th>HUB</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
