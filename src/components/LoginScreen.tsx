import React from 'react'
import { signInWithGoogle } from '../lib/supabase'
import './LoginScreen.css'

export default function LoginScreen(): React.ReactElement {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-icon">◆</span>
          <span className="login-name">My Meridian Planner</span>
        </div>
        <p className="login-tagline">Your personal agenda planner</p>
        <div className="login-divider" />
        <p className="login-desc">
          Sign in with Google to sync your calendar, tasks, and notes.
        </p>
        <button className="google-btn" onClick={signInWithGoogle}>
          <GoogleIcon />
          Continue with Google
        </button>
        <p className="login-note">
          Calendar access is requested so your Google Calendar events appear in the schedule.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 15.4 19.2 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.6C29.6 36.1 26.9 37 24 37c-5.7 0-10.6-3.1-11.7-7.5l-7 5.4C8.1 41.5 15.5 45 24 45z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.8 2.5-2.4 4.6-4.5 6l6.6 5.6C41.6 36.6 45 30.9 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  )
}
