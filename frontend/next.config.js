/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: process.env.API_URL,
        SUDOKU_CONTRACT: process.env.SUDOKU_CONTRACT,
        ICP_API_HOST: process.env.ICP_API_HOST,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // output: 'export'
}

module.exports = nextConfig
