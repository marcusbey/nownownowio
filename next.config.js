const { withPlausibleProxy } = require("next-plausible");
    
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                'node_modules/**',
                'src/.next/**',
            ],
        },
    },
    reactStrictMode: true,
    images: {
        dangerouslyAllowSVG: true,
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
        ignoreDuringBuilds: true
    },
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "nownownow.io", "www.nownownow.io"]
        }
    }
};

module.exports = {
    ...nextConfig,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
};