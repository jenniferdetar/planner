import './PersonalPanel.css'

const SHEET_EMBED_URL = 'https://docs.google.com/spreadsheets/d/1jFsKvlXd0SvvGGkNLjjiAK-trWxUNgagRwxodSLQggQ/edit?usp=sharing&rm=minimal'

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
