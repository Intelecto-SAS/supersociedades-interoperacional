import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: "#962D46",
          blue: "#2A477A",
          ink: "#1C2434",
        },
        flag: {
          yellow: "#FFC800",
          blue: "#003189",
          red: "#D80025",
        },
        surface: {
          DEFAULT: "#F4F6F8",
          card: "#FFFFFF",
          line: "#E2E6EC",
        },
      },
      fontFamily: {
        sans: ["Nunito Sans", "Verdana", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 36, 52, 0.06), 0 8px 24px rgba(42, 71, 122, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
