import { useAuth } from './hooks/useAuth'
import { useOrg } from './hooks/useOrg'
import AuthScreen from './components/AuthScreen'
import Onboarding from './components/Onboarding'
import Layout from './components/Layout'
import './app.css'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const org = useOrg(user)

  if (authLoading) return <div className="loading">Loading…</div>
  if (!user) return <AuthScreen />
  if (org.loading) return <div className="loading">Loading your chapters…</div>
  if (org.orgs.length === 0) {
    return <Onboarding user={user} onCreate={org.createOrganization} onJoin={org.joinOrganization} />
  }

  return <Layout user={user} org={org} />
}
