/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/health', destination: '/health.html' },
      { source: '/goals', destination: '/goals.html' },
      { source: '/planning', destination: '/planning.html' },
      { source: '/work-planner', destination: '/work-planner.html' },
      { source: '/finance', destination: '/finance.html' },
      { source: '/hoa', destination: '/hoa.html' },
      { source: '/icaap', destination: '/icaap.html' },
      { source: '/csea', destination: '/csea.html' },
      { source: '/personal-planner', destination: '/personal-planner.html' },
    ]
  },
}

module.exports = nextConfig
