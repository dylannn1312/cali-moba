/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: process.env.API_URL,
        ICP_API_HOST: process.env.ICP_API_HOST,
        TOKEN: process.env.TOKEN,
        TOKEN_DECIMALS: parseInt(process.env.TOKEN_DECIMALS),
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    webpack: config => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding')
        return config
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
}

export default nextConfig;
