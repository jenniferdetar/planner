// Sections render as a two-page binder spread. Each section component builds
// its left page and right page and hands both to `spread`; the dashboard
// supplies one that draws real pages. Without it the halves just stack.
export const stackPages = (left, right) => <>{left}{right}</>
