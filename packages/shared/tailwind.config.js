/**
 * Copyright (c) 2025 Bounty Solutions Inc.
 * All Rights Reserved.
 * This code is proprietary and confidential.
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#3B82F6',
        accent: '#10B981',
        surface: '#F8FAFC',
        'surface-raised': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
