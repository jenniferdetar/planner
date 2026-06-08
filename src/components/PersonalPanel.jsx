import './PersonalPanel.css'

const SHEET_EMBED_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQw-kXg2P4HWAlxsvx8c9h4HWNTBSx7M1_r-ZJQsxAOHMcUPZK3OMcrB85LOBOoXHePzf5D0pYLgSlF/pubhtml?widget=true&headers=false'

export default function PersonalPanel() {
  return (
    <div className="personal-panel">
      <div className="personal-header">
        <div className="personal-title-row">
          <h2 className="personal-title">Personal</h2>
        </div>
      </div>
      <div className="personal-body">
        <iframe
          src={SHEET_EMBED_URL}
          className="sheet-embed"
          title="My Spreadsheet"
          frameBorder="0"
        />
      </div>
    </div>
  )
}
