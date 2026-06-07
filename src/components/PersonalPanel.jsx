import { useState } from 'react'
import './PersonalPanel.css'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ/edit?usp=drivesdk'

const SUB_TABS = [
  { key: 'spreadsheet', label: 'Spreadsheet' },
]

export default function PersonalPanel() {
  const [activeTab, setActiveTab] = useState('spreadsheet')

  return (
    <div className="personal-panel">
      <div className="personal-header">
        <div className="personal-title-row">
          <h2 className="personal-title">Personal</h2>
        </div>
        <div className="personal-sub-tabs">
          {SUB_TABS.map(tab => (
            <button
              key={tab.key}
              className={`personal-sub-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="personal-body">
        {activeTab === 'spreadsheet' && (
          <div className="sheet-launcher">
            <div className="sheet-launcher-icon">📊</div>
            <h3 className="sheet-launcher-title">My Spreadsheet</h3>
            <p className="sheet-launcher-desc">Opens in Google Sheets</p>
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sheet-launch-btn"
            >
              Open Spreadsheet →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
