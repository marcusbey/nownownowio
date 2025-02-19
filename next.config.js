/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google user profile images
      'avatars.githubusercontent.com', // GitHub avatars
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
