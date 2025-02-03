/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: process.env.API_URL,
        SUDOKU_CONTRACT: process.env.SUDOKU_CONTRACT,
        ICP_API_HOST: process.env.ICP_API_HOST,
        TOKEN: process.env.TOKEN,
        TOKEN_DECIMALS: parseInt(process.env.TOKEN_DECIMALS),
        ICP_LEDGER_CANISTER_ID: process.env.ICP_LEDGER_CANISTER_ID,
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
