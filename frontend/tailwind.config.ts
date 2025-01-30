import type { Config } from "tailwindcss";
import { THEME } from "./styles/theme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: THEME.PRIMARY_COLOR,
        secondary: THEME.SECONDARY_COLOR,
        text: THEME.TEXT_COLOR,
        button: THEME.BUTTON_COLOR,
        "button-hover": THEME.BUTTON_HOVER_COLOR,
        muted: THEME.MUTED_COLOR,
      },
    }
  },
  plugins: [],
};
export default config;
