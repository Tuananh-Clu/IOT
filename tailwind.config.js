/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        lot: {
          asphalt: '#111714',
          asphalt2: '#17211C',
          panel: '#1B2822',
          lane: '#ECE7D8',
          muted: '#A9B2A8',
          empty: '#2FBF71',
          reserved: '#F0B429',
          occupied: '#D64545',
          sensor: '#2C7DA0',
          divider: 'rgba(236, 231, 216, 0.16)',
        },
      },
      boxShadow: {
        led: '0 0 18px rgba(47, 191, 113, 0.24)',
        alert: '0 0 18px rgba(214, 69, 69, 0.24)',
      },
      borderRadius: {
        control: '8px',
      },
    },
  },
  plugins: [],
}
