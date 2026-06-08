import { useState } from 'react'
import { useGmail } from '../hooks/useGmail'
import GmailPanel from './GmailPanel'
import './PersonalPanel.css'

const SHEET_EMBED_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQw-kXg2P4HWAlxsvx8c9h4HWNTBSx7M1_r-ZJQsxAOHMcUPZK3OMcrB85LOBOoXHePzf5D0pYLgSlF/pubhtml?widget=true&headers=false'

const SUB_TABS = [
  { key: 'gmail', label: 'Gmail' },
  { key: 'spreadsheet', label: 'Spreadsheet' },
]

export default function PersonalPanel({ providerToken, onReconnect }) {
  const [activeTab, setActiveTab] = useState('gmail')
  const gmail = useGmail(providerToken)

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
        {activeTab === 'gmail' && (
          <GmailPanel
            {...gmail}
            providerToken={providerToken}
            onReconnect={onReconnect}
          />
        )}

        {activeTab === 'spreadsheet' && (
          <iframe
            src={SHEET_EMBED_URL}
            className="sheet-embed"
            title="My Spreadsheet"
            frameBorder="0"
          />
        )}
      </div>
    </div>
  )
}
