declare global {
  namespace NodeJS {
    interface ProcessEnv {
        API_URL: string;
        SUDOKU_CONTRACT: string;
        ICP_API_HOST: string;
    }
  }
}
export {}
