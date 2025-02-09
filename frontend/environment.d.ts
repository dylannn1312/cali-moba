declare global {
  namespace NodeJS {
    interface ProcessEnv {
        API_URL: string;
        ICP_API_HOST: string;
        TOKEN: string;
        TOKEN_DECIMALS: number;
    }
  }
}
export {}
