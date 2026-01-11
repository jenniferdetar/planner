import { redirect } from 'next/navigation'

/**
 * Serve only the static calendar layout (blue header) and avoid the alternate layout.
 * Root route immediately redirects to the static `public/index.html`.
 */
export default function HomePage() {
  redirect('/index.html')
}
