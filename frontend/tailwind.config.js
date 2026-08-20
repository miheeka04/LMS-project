/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#211B36",
        indigo: {
          DEFAULT: "#4F46E5",
          dark: "#3730A3",
          light: "#818CF8",
        },
        violet: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
        },
        cream: "#FDFBF7",
        emerald: {
          DEFAULT: "#10B981",
        },
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)",
        "card-glow": "radial-gradient(circle at top left, rgba(124,58,237,0.25), transparent 60%)",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(79, 70, 229, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
