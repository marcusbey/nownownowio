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
};

module.exports = nextConfig;