import { useState } from 'react'
import { signOut } from '../lib/supabase'
import { useMembers } from '../hooks/useMembers'
import { useWorksites } from '../hooks/useWorksites'
import { useInteractions } from '../hooks/useInteractions'
import { useIssues } from '../hooks/useIssues'
import { useNotes } from '../hooks/useNotes'
import { useLinks } from '../hooks/useLinks'
import MembersPanel from './MembersPanel'
import WorksitesPanel from './WorksitesPanel'
import InteractionsPanel from './InteractionsPanel'
import IssuesPanel from './IssuesPanel'
import NotesPanel from './NotesPanel'
import LinksPanel from './LinksPanel'
import LearnPanel from './LearnPanel'
import SettingsPanel from './SettingsPanel'

const TABS = [
  { id: 'members', label: 'Members' },
  { id: 'worksites', label: 'Worksites' },
  { id: 'interactions', label: 'Interactions' },
  { id: 'issues', label: 'Issues' },
  { id: 'notes', label: 'Notes' },
  { id: 'links', label: 'Links' },
  { id: 'learn', label: 'Learn' },
  { id: 'settings', label: 'Settings' },
]

export default function Layout({ user, org }) {
  const [tab, setTab] = useState('members')
  const orgId = org.currentOrgId

  // All data hooks are scoped to the active org; switching orgs re-fetches.
  const members = useMembers(orgId)
  const worksites = useWorksites(orgId)
  const interactions = useInteractions(orgId, user.id)
  const issues = useIssues(orgId, user.id)
  const notes = useNotes(orgId, user.id)
  const links = useLinks(orgId, user.id)

  const badge = {
    members: members.members.length,
    interactions: interactions.interactions.length,
    issues: issues.issues.filter((i) => i.status !== 'closed' && i.status !== 'resolved').length,
    notes: notes.notes.length,
    links: links.links.length,
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-brand-mark">UCM</div>
          <h1>Union Chapter Manager</h1>
        </div>
        <div className="app-header-right">
          {org.orgs.length > 1 && (
            <select className="org-select" value={orgId} onChange={(e) => org.switchOrg(e.target.value)}>
              {org.orgs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
          <span className="header-user">{user.email}</span>
          <button className="header-signout" onClick={() => signOut()}>Sign out</button>
        </div>
      </header>

      <nav className="app-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`app-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {badge[t.id] > 0 && <span className="tab-badge">{badge[t.id]}</span>}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'members' && <MembersPanel members={members} worksites={worksites.worksites} />}
        {tab === 'worksites' && <WorksitesPanel worksites={worksites} memberList={members.members} />}
        {tab === 'interactions' && <InteractionsPanel interactions={interactions} memberList={members.members} />}
        {tab === 'issues' && <IssuesPanel issues={issues} memberList={members.members} />}
        {tab === 'notes' && <NotesPanel notes={notes} />}
        {tab === 'links' && <LinksPanel links={links} />}
        {tab === 'learn' && <LearnPanel />}
        {tab === 'settings' && <SettingsPanel user={user} org={org} />}
      </main>
    </div>
  )
}
