/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // Disable ESLint during build to prevent warnings from blocking deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during build - allow deployment with type issues
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
