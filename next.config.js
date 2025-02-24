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
};

module.exports = nextConfig;
