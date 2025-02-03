declare global {
  namespace NodeJS {
    interface ProcessEnv {
        API_URL: string;
        ICP_API_HOST: string;
        TOKEN: string;
        TOKEN_DECIMALS: number;
        ICP_LEDGER_CANISTER_ID: string;
    }
  }
}
export {}
