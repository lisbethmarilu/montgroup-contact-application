/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Externalize Playwright packages to prevent bundling issues
  serverComponentsExternalPackages: [
    'playwright-aws-lambda',
    'playwright-core',
    'chromium-bidi',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize all Playwright-related packages to prevent bundling issues
      config.externals = config.externals || []
      
      config.externals.push(({ request }, callback) => {
        // Externalize Playwright packages and their submodules
        if (
          request === 'playwright-aws-lambda' ||
          request === 'playwright-core' ||
          request === 'chromium-bidi' ||
          request.startsWith('playwright-aws-lambda/') ||
          request.startsWith('playwright-core/') ||
          request.startsWith('chromium-bidi/') ||
          request.includes('playwright-core/lib') ||
          request.includes('chromium-bidi/lib')
        ) {
          return callback(null, `commonjs ${request}`)
        }
        callback()
      })
    }
    return config
  },
}

module.exports = nextConfig
