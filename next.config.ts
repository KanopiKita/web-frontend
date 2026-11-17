import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  allowedDevOrigins: ['kanopiindonesia.id', '*.kanopiindonesia.id', 'localhost:3001'],
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
