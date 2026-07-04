import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        panel: 'var(--panel)',
        'panel-border': 'var(--panel-border)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'on-accent': 'var(--on-accent)',
        'signal-primary': 'var(--signal-primary)',
        'signal-primary-dim': 'var(--signal-primary-dim)',
        ember: 'var(--ember)',
        'ember-dim': 'var(--ember-dim)',
        'thinking-a': 'var(--thinking-a)',
        'thinking-b': 'var(--thinking-b)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
      },
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-5': 'var(--space-5)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      transitionDuration: {
        state: 'var(--transition-state)',
        'state-fast': 'var(--transition-state-fast)',
        panel: 'var(--transition-panel)',
      },
    },
  },
  plugins: [],
};

export default config;
