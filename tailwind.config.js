/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // ── SP (Smart Parking) — New Design System ──────────────────────
        sp: {
          // Backgrounds (dark to light)
          void:     '#05080C',
          base:     '#080D14',
          surface:  '#0E1520',
          elevated: '#162030',
          overlay:  '#1A2840',

          // Borders
          border:        'rgba(148,163,184,0.08)',
          'border-md':   'rgba(148,163,184,0.14)',
          'border-strong':'rgba(148,163,184,0.22)',

          // Brand — Blue
          brand:      '#3B82F6',
          'brand-dim': 'rgba(59,130,246,0.15)',
          'brand-glow':'rgba(59,130,246,0.30)',
          'brand-text':'#93C5FD',

          // Text hierarchy
          text:   '#F1F5F9',
          'text-2':'#94A3B8',
          'text-3':'#475569',
          'text-4':'#1E293B',

          // Status — Parking Slot
          available:   '#22C55E',
          'available-dim': 'rgba(34,197,94,0.12)',
          occupied:    '#EF4444',
          'occupied-dim': 'rgba(239,68,68,0.12)',
          reserved:    '#F59E0B',
          'reserved-dim': 'rgba(245,158,11,0.12)',
          maintenance: '#6B7280',
          'maintenance-dim': 'rgba(107,114,128,0.12)',

          // Status — Payment
          paid:    '#22C55E',
          pending: '#F59E0B',
          failed:  '#EF4444',

          // Status — Safety
          safe:    '#22C55E',
          warning: '#F59E0B',
          danger:  '#EF4444',
          'danger-glow': 'rgba(239,68,68,0.35)',
          'danger-dim':  'rgba(239,68,68,0.12)',

          // Chart accent colors
          chart1: '#3B82F6',
          chart2: '#8B5CF6',
          chart3: '#22C55E',
          chart4: '#F59E0B',
          chart5: '#EF4444',
          chart6: '#06B6D4',
        },

        // ── NX (Legacy — kept for Login page compatibility) ──────────────
        nx: {
          void:    '#070A0E',
          deep:    '#0C1018',
          surface: '#111827',
          elevated:'#1A2235',
          border:  'rgba(255,255,255,0.07)',
          'border-active': 'rgba(255,255,255,0.15)',
          cyan:    '#00D4FF',
          'cyan-dim': 'rgba(0,212,255,0.15)',
          'cyan-glow':'rgba(0,212,255,0.25)',
          'cyan-text':'#7EEEFF',
          violet:  '#7C3AED',
          'violet-text':'#C4B5FD',
          orange:  '#FF6B35',
          'orange-text':'#FFA07A',
          green:   '#10D98A',
          'green-dim':'rgba(16,217,138,0.12)',
          'green-text':'#6EE7B7',
          red:     '#FF4D6A',
          'red-dim':'rgba(255,77,106,0.12)',
          'red-text':'#FCA5A5',
          amber:   '#F59E0B',
          text:    '#E8EDF5',
          'text-secondary':'#8B95A6',
          'text-muted':'#4D5668',
        },
      },

      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        card: '12px',
      },

      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':  '0 4px 24px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)',
        'elevated':    '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
        'panel-glow':  '0 0 0 1px rgba(59,130,246,0.2), 0 4px 16px rgba(0,0,0,0.4)',
        'brand-glow':  '0 0 24px rgba(59,130,246,0.35), 0 0 8px rgba(59,130,246,0.2)',
        'danger-glow': '0 0 32px rgba(239,68,68,0.5), 0 0 8px rgba(239,68,68,0.3)',
        'available-glow': '0 0 16px rgba(34,197,94,0.3)',
        'focus':       '0 0 0 2px #080D14, 0 0 0 4px #3B82F6',
        // Legacy
        'cyan-glow':   '0 0 20px rgba(0,212,255,0.3)',
        'green-glow':  '0 0 16px rgba(16,217,138,0.25)',
        'orange-glow': '0 0 20px rgba(255,107,53,0.3)',
      },

      fontSize: {
        'display-xl': ['60px', { lineHeight: '68px', fontWeight: '700', letterSpacing: '-0.04em' }],
        'display-lg': ['44px', { lineHeight: '52px', fontWeight: '700', letterSpacing: '-0.03em' }],
        'display-md': ['32px', { lineHeight: '40px', fontWeight: '600', letterSpacing: '-0.025em' }],
        'display-sm': ['22px', { lineHeight: '30px', fontWeight: '600', letterSpacing: '-0.02em' }],
        'heading':    ['15px', { lineHeight: '22px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'subheading': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'body':       ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm':    ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption':    ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'overline':   ['11px', { lineHeight: '14px', fontWeight: '600', letterSpacing: '0.08em' }],
        'kpi':        ['30px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.02em' }],
      },

      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0'   },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1'   },
          '50%':      { opacity: '0.5' },
        },
        'danger-flash': {
          '0%, 100%': { backgroundColor: 'rgba(239,68,68,0.15)' },
          '50%':      { backgroundColor: 'rgba(239,68,68,0.30)' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },

      animation: {
        'slide-up':       'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left':  'slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':        'fade-in 0.25s ease-out',
        shimmer:          'shimmer 1.6s linear infinite',
        'pulse-ring':     'pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse':     'glow-pulse 2s ease-in-out infinite',
        'danger-flash':   'danger-flash 1s ease-in-out infinite',
        'scan-line':      'scan-line 8s linear infinite',
      },
    },
  },
  plugins: [],
}
