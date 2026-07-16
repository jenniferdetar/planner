import { ICAAP_PROGRAM_ROSTER } from '../data/icaapProgramRoster'
import './IcaapProgramsPanel.css'

// Fixed categorical order (validated for CVD-safe adjacency) — do not reorder or cycle.
const PROGRAM_COLORS = {
  Induction: '#2a78d6',
  'PRC/TCA': '#008300',
  IF: '#e87ba4',
  RLAA: '#eda100',
  SNSCC: '#1baf7a',
  CalTPA: '#eb6834',
  BiLAA: '#4a3aa7',
}

function buildProgramCounts() {
  const counts = {}
  for (const person of ICAAP_PROGRAM_ROSTER) {
    counts[person.program] = (counts[person.program] || 0) + 1
  }
  return Object.entries(counts)
    .map(([program, count]) => ({ program, count }))
    .sort((a, b) => b.count - a.count)
}

function buildFundingBreakdown() {
  const counts = {}
  for (const person of ICAAP_PROGRAM_ROSTER) {
    if (!person.fundingSource) continue
    counts[person.fundingSource] = (counts[person.fundingSource] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export default function IcaapProgramsPanel() {
  const programCounts = buildProgramCounts()
  const fundingBreakdown = buildFundingBreakdown()
  const totalEntries = ICAAP_PROGRAM_ROSTER.length
  const uniquePeople = new Set(ICAAP_PROGRAM_ROSTER.map(p => p.employeeNumber === 710791 ? 'segovia-710791' : p.name)).size
  const maxCount = Math.max(...programCounts.map(p => p.count))

  return (
    <div className="programs-panel">
      <div className="programs-header">
        <div className="programs-total">
          <span className="programs-total-num">{uniquePeople}</span>
          <span className="programs-total-lbl">Unique Individuals</span>
        </div>
        <div className="programs-total programs-total-secondary">
          <span className="programs-total-num">{totalEntries}</span>
          <span className="programs-total-lbl">Roster Entries</span>
        </div>
        <p className="programs-note">
          {totalEntries} entries across the two submission lists, {uniquePeople} unique people — Jasmin/Jasmine Segovia
          (employee #710791) appears on both the August 2026 Prof Expert List and the PRC Submission list.
        </p>
      </div>

      <div className="programs-bars">
        {programCounts.map(({ program, count }) => (
          <div className="programs-bar-row" key={program}>
            <span className="programs-bar-label">{program}</span>
            <div className="programs-bar-track">
              <div
                className="programs-bar-fill"
                style={{ width: `${(count / maxCount) * 100}%`, background: PROGRAM_COLORS[program] || '#888' }}
              />
            </div>
            <span className="programs-bar-count">{count}</span>
          </div>
        ))}
      </div>

      <div className="programs-funding">
        <span className="programs-funding-title">PRC/TCA by Funding Source</span>
        <table className="programs-funding-table">
          <tbody>
            {fundingBreakdown.map(([source, count]) => (
              <tr key={source}>
                <td className="programs-funding-source">{source}</td>
                <td className="programs-funding-count">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
