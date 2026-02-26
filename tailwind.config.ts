import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E40AF',    // deep blue — data trust
          secondary: '#0F766E',  // teal — positive metrics
          accent: '#DC2626',     // red — alert/negative metrics
          neutral: '#374151',    // dark gray — text/labels
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F9FAFB',
          border: '#E5E7EB',
        },
        chart: {
          blue: '#3B82F6',
          teal: '#14B8A6',
          orange: '#F97316',
          purple: '#8B5CF6',
          red: '#EF4444',
          green: '#22C55E',
        }
      }
    }
  },
  plugins: [],
}
export default config
