import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#10B981", // Calming Green
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3B82F6", // Trust Blue
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F59E0B", // Warning / Alert Gold
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#4B5563",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        // AYUSH Prakriti Dosha Palette
        vata: {
          DEFAULT: "#9333EA", // Purple
          light: "#F3E8FF",
          dark: "#6B21A8",
        },
        pitta: {
          DEFAULT: "#EF4444", // Fiery Red
          light: "#FEE2E2",
          dark: "#B91C1C",
        },
        kapha: {
          DEFAULT: "#06B6D4", // Water/Earth Teal
          light: "#CFFAFE",
          dark: "#0E7490",
        },
      },
      fontSize: {
        xs: ["1rem", { lineHeight: "1.5rem" }], // 16px min
        sm: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        base: ["1.25rem", { lineHeight: "1.875rem" }], // 20px
        lg: ["1.5rem", { lineHeight: "2.25rem" }], // 24px
        xl: ["1.75rem", { lineHeight: "2.5rem" }], // 28px
        "2xl": ["2rem", { lineHeight: "2.75rem" }], // 32px
        "3xl": ["2.5rem", { lineHeight: "3.25rem" }], // 40px
        "4xl": ["3rem", { lineHeight: "3.75rem" }], // 48px
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      keyframes: {
        pulseMic: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
          "50%": { transform: "scale(1.08)", boxShadow: "0 0 0 20px rgba(239, 68, 68, 0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-10px)" },
          "40%, 80%": { transform: "translateX(10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseMic: "pulseMic 1.8s infinite",
        shake: "shake 0.4s ease-in-out",
        fadeIn: "fadeIn 0.3s ease-out forwards",
      },
      minHeight: {
        touch: "60px",
        button: "80px",
      },
      minWidth: {
        touch: "60px",
      },
    },
  },
  plugins: [],
};

export default config;
