/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{js,jsx,ts,tsx}",
	  "./components/**/*.{js,jsx,ts,tsx}",
	  "./app/**/*.{js,jsx,ts,tsx}",
	  "./src/**/*.{js,jsx,ts,tsx}",
	],
	prefix: "",
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
		  theme: {
			text: {
			  primary: "#801100",
			  secondary: "#B62203",
			},
			heading: {
			  primary: "#D73502",
			  accent: "#FC4400",
			},
			bg: {
			  primary: "#FF7500",
			  secondary: "#FAC000",
			},
		  },
		  fire: {
			DEFAULT: "#D73502",
			light: "#FDBA74",
			dark: "#C2410C",
			glow: "#FFD700",
			accent: "#FF4500",
		  },
		  air: {
			DEFAULT: "#D3E4FD",
			light: "#F1F5F9",
			dark: "#93C5FD",
			accent: "#BAE6FD",
		  },
		  water: {
			DEFAULT: "#0EA5E9",
			light: "#38BDF8",
			dark: "#0369A1",
			accent: "#7DD3FC",
		  },
		  earth: {
			DEFAULT: "#84cc16",
			light: "#F2FCE2",
			dark: "#4d7c0f",
			accent: "#FDE1D3",
		  },
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
			DEFAULT: "hsl(var(--sidebar-background))",
			foreground: "hsl(var(--sidebar-foreground))",
			primary: "hsl(var(--sidebar-primary))",
			"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
			accent: "hsl(var(--sidebar-accent))",
			"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
			border: "hsl(var(--sidebar-border))",
			ring: "hsl(var(--sidebar-ring))",
		  },
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
		  flicker: {
			"0%, 100%": { opacity: "1" },
			"50%": { opacity: "0.8" },
		  },
		  float: {
			"0%, 100%": { transform: "translateY(0)" },
			"50%": { transform: "translateY(-10px)" },
		  },
		  ripple: {
			"0%": { transform: "scale(0.95)", opacity: "0.7" },
			"50%": { transform: "scale(1)", opacity: "1" },
			"100%": { transform: "scale(0.95)", opacity: "0.7" },
		  },
		  grow: {
			"0%": { transform: "scaleY(0)", transformOrigin: "bottom" },
			"100%": { transform: "scaleY(1)", transformOrigin: "bottom" },
		  },
		  "ember-float": {
			"0%": {
			  transform: "translateY(0) translateX(0) rotate(0deg)",
			  opacity: "1",
			},
			"50%": { opacity: "0.5" },
			"100%": {
			  transform: "translateY(-100px) translateX(20px) rotate(360deg)",
			  opacity: "0",
			},
		  },
		  wave: {
			"0%": { transform: "translateX(0)" },
			"50%": { transform: "translateX(-25%)" },
			"100%": { transform: "translateX(-50%)" },
		  },
		  "fade-in-up": {
			"0%": { opacity: "0", transform: "translateY(20px)" },
			"100%": { opacity: "1", transform: "translateY(0)" },
		  },
		  "fade-in": {
			"0%": { opacity: "0" },
			"100%": { opacity: "1" },
		  },
		  "slide-in-right": {
			"0%": { transform: "translateX(100%)" },
			"100%": { transform: "translateX(0)" },
		  },
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		  flicker: "flicker 3s ease-in-out infinite",
		  float: "float 6s ease-in-out infinite",
		  ripple: "ripple 3s ease-in-out infinite",
		  grow: "grow 1.5s ease-out",
		  "ember-float": "ember-float 3s ease-out infinite",
		  wave: "wave 15s linear infinite",
		  "fade-in-up": "fade-in-up 0.7s ease-out",
		  "fade-in": "fade-in 0.5s ease-out",
		  "slide-in-right": "slide-in-right 0.5s ease-out",
		},
		fontFamily: {
		  "gveret-levin": ['"Gveret Levin"', "cursive"],
		  heebo: ['"Heebo"', "sans-serif"],
		},
		backgroundImage: {
		  "fire-gradient": "#D73502",
		  "air-gradient":
			"linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)",
		  "water-gradient":
			"linear-gradient(90deg, #0EA5E9 0%, #7DD3FC 100%)",
		  "earth-gradient":
			"linear-gradient(90deg, #84cc16 0%, #F2FCE2 100%)",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }
  