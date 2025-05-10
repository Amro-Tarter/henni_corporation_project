/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
	  "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
	],
	safelist: [
    // backgrounds
    'bg-fire','bg-fire-accent','bg-fire-soft',
    'bg-water','bg-water-accent','bg-water-soft',
    'bg-air','bg-air-accent','bg-air-soft',
    'bg-earth','bg-earth-accent','bg-earth-soft',
    'bg-metal','bg-metal-accent','bg-metal-soft',

    // hover backgrounds
    'hover:bg-fire','hover:bg-fire-accent','hover:bg-fire-soft',
    'hover:bg-water','hover:bg-water-accent','hover:bg-water-soft',
    'hover:bg-air','hover:bg-air-accent','hover:bg-air-soft',
    'hover:bg-earth','hover:bg-earth-accent','hover:bg-earth-soft',
    'hover:bg-metal','hover:bg-metal-accent','hover:bg-metal-soft',

    // borders
    'border-fire','border-fire-accent','border-fire-soft',
    'border-water','border-water-accent','border-water-soft',
    'border-air','border-air-accent','border-air-soft',
    'border-earth','border-earth-accent','border-earth-soft',
    'border-metal','border-metal-accent','border-metal-soft',

    // text colors
    'text-fire-accent','text-fire-dark',
    'text-water-accent','text-water-dark',
    'text-air-accent','text-air-dark',
    'text-earth-accent','text-earth-dark',
    'text-metal-accent','text-metal-dark',

    // focus:border
    'focus:border-fire-accent','focus:border-water-accent',
    'focus:border-air-accent','focus:border-earth-accent','focus:border-metal-accent',

    // focus:ring
    'focus:ring-fire-accent','focus:ring-water-accent',
    'focus:ring-air-accent','focus:ring-earth-accent','focus:ring-metal-accent',

		// rings
    'ring-fire','ring-fire-accent','ring-fire-soft',
    'ring-water','ring-water-accent','ring-water-soft',
    'ring-air','ring-air-accent','ring-air-soft',
    'ring-earth','ring-earth-accent','ring-earth-soft',
    'ring-metal','ring-metal-accent','ring-metal-soft',

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
  
		  // 🔥 ELEMENTAL COLORS
		  earth: {
			DEFAULT: "hsl(var(--earth))",
			accent: "hsl(var(--earth-accent))",
			soft: "hsl(var(--earth-soft))",
		  },
		  metal: {
			DEFAULT: "hsl(var(--metal))",
			accent: "hsl(var(--metal-accent))",
			soft: "hsl(var(--metal-soft))",
		  },
		  air: {
			DEFAULT: "hsl(var(--air))",
			accent: "hsl(var(--air-accent))",
			soft: "hsl(var(--air-soft))",
		  },
		  water: {
			DEFAULT: "hsl(var(--water))",
			accent: "hsl(var(--water-accent))",
			soft: "hsl(var(--water-soft))",
		  },
		  fire: {
			DEFAULT: "hsl(var(--fire))",
			accent: "hsl(var(--fire-accent))",
			soft: "hsl(var(--fire-soft))",
		  },
  
		  // Extra tokens
		  'cta': 'hsl(var(--cta))',
		  'success': 'hsl(var(--success))',
		  'error': 'hsl(var(--error))',
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
  