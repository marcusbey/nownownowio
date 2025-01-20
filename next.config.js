const { withPlausibleProxy } = require("next-plausible");
    
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/a/**',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                pathname: '/profile_images/**',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true // Temporarily disable ESLint during build
    },
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "https://nownownow.io"]
        }
    }
};

module.exports = nextConfig;