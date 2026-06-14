import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Sidebar, { TASK_AREAS } from './Sidebar'

vi.mock('../lib/supabase', () => ({ signOut: vi.fn() }))

const defaultProps = {
  asanaTasks: [],
  asanaProjects: [],
  asanaStatus: 'idle',
  onAddAsanaTask: vi.fn(),
  onCompleteAsanaTask: vi.fn(),
  user: { email: 'test@example.com', user_metadata: {} },
  sections: {},
  onUpdateSection: vi.fn(),
}

describe('TASK_AREAS', () => {
  it('contains all expected areas', () => {
    expect(TASK_AREAS).toEqual(['CSEA', 'Finance', 'GCU', 'iCAAP', 'Personal', 'General'])
  })
})

describe('Sidebar', () => {
  it('renders the app name', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('My Meridian Planner')).toBeInTheDocument()
  })

  it('shows the user display name derived from email', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('shows full_name when provided in user_metadata', () => {
    const user = { email: 'test@example.com', user_metadata: { full_name: 'Jennifer' } }
    render(<Sidebar {...defaultProps} user={user} />)
    expect(screen.getByText('Jennifer')).toBeInTheDocument()
  })

  it('renders all section nav links', () => {
    render(<Sidebar {...defaultProps} />)
    for (const label of ['Roles', 'Goals', 'Meetings', 'Mission', 'Notes', 'Vision', 'Values']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('opens a section overlay when a section button is clicked', async () => {
    render(<Sidebar {...defaultProps} />)
    await userEvent.click(screen.getByText('Goals'))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
