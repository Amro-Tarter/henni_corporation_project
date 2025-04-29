/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
	  "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
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
		fontFamily: {
		  'heebo': ['Heebo', 'sans-serif'],
		  'gveret-levin': ['"Gveret Levin AlefAlefAlef"', 'cursive'],
		},
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  sidebar: {
			background: "hsl(var(--sidebar-background))",
			foreground: "hsl(var(--sidebar-foreground))",
			primary: "hsl(var(--sidebar-primary))",
			"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
			accent: "hsl(var(--sidebar-accent))",
			"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
			border: "hsl(var(--sidebar-border))",
			ring: "hsl(var(--sidebar-ring))",
		  },
		  'fire-glow': 'rgba(255, 165, 0, 0.8)',
		  'air-light': 'rgba(255, 255, 255, 0.8)',
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		keyframes: {
		  "accordion-down": {
			from: { height: "0" },
			to: { height: "var(--radix-accordion-content-height)" },
		  },
		  "accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: "0" },
		  },
		  "ember-float": {
			"0%": {
			  transform: "translateY(0) translateX(0) scale(1)",
			  opacity: "0"
			},
			"10%": {
			  opacity: "0.75"
			},
			"100%": {
			  transform: "translateY(-100px) translateX(10px) scale(0.5)",
			  opacity: "0"
			}
		  },
		  "float": {
			"0%": {
			  transform: "translateY(0) translateX(0)",
			  opacity: "0"
			},
			"50%": {
			  opacity: "0.6"
			},
			"100%": {
			  transform: "translateY(-150px) translateX(20px)",
			  opacity: "0"
			}
		  },
		  "wave": {
			"0%": {
			  transform: "translateX(0) translateZ(0) scaleY(1)"
			},
			"50%": {
			  transform: "translateX(-25%) translateZ(0) scaleY(0.95)"
			},
			"100%": {
			  transform: "translateX(-50%) translateZ(0) scaleY(1)"
			}
		  }
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		  "ember-float": "ember-float 3s ease-out infinite",
		  "float": "float 8s ease-out infinite",
		  "wave": "wave 15s linear infinite"
		},
	  },
	},
	plugins: [
	  require("tailwindcss-animate"),
	  require("@tailwindcss/typography"),
	],
  }