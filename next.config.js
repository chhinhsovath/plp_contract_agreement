/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Base path for serving under https://plp-tms.moeys.gov.kh/agreement
  basePath: '/agreement',
  // Asset prefix for proper static file loading
  assetPrefix: '/agreement',
}

module.exports = nextConfig