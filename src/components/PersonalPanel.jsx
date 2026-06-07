import { useState } from 'react'
import './PersonalPanel.css'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ/edit?usp=drivesdk'
const SHEET_EMBED = 'https://docs.google.com/spreadsheets/d/1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ/edit?usp=sharing&rm=minimal'

const SUB_TABS = [
  { key: 'spreadsheet', label: 'Spreadsheet' },
]

export default function PersonalPanel() {
  const [activeTab, setActiveTab] = useState('spreadsheet')
  const [embedError, setEmbedError] = useState(false)

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
          <div className="sheet-container">
            <div className="sheet-toolbar">
              <span className="sheet-label">Google Sheets</span>
              <a
                href={SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sheet-open-btn"
              >
                ↗ Open in Google Sheets
              </a>
            </div>
            {embedError ? (
              <div className="sheet-embed-fallback">
                <p>This sheet can't be embedded directly.</p>
                <a
                  href={SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sheet-fallback-link"
                >
                  Open Spreadsheet →
                </a>
              </div>
            ) : (
              <iframe
                className="sheet-iframe"
                src={SHEET_EMBED}
                title="Personal Spreadsheet"
                onError={() => setEmbedError(true)}
                allow="clipboard-write"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
