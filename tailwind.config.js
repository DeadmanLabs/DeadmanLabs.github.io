/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code, pre': {
              textAlign: 'left',
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.white'),
              borderRadius: theme('borderRadius.md'),
            },
            pre: {
              padding: theme('padding.4'),
              overflowX: 'auto',
            },
            h2: { color: theme('colors.white') },
            maxWidth: 'none'
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}