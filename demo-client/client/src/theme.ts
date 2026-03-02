// Kong 2026 Brand Theme Tokens
// This file centralizes the color and typography tokens for the new Kong brand look.

export const colors = {
  electricLime: '#CCFF00', // Primary brand color, CTA, accents
  darkGreen: '#000F06',   // Primary background for dark theme
  bay: '#B7BDB5',         // Neutral background, secondary surfaces
  white: '#FFFFFF',       // White theme background
  grayscale: {
    50: '#E7EDE5',
    100: '#D7DED4',
    200: '#CDD4CB',
    300: '#B7BDB5', // Bay
    500: '#858983',
    700: '#4A4D49',
    900: '#101110',
  },
};

export const typography = {
  fontFamily: {
    primary: 'Funnel Sans, Arial, sans-serif',
    code: 'Roboto Mono, monospace',
    button: 'Space Grotesk, Arial, sans-serif',
  },
  headingXL: {
    fontWeight: 700,
    fontSize: '72px',
    lineHeight: '78px',
  },
  headingL: {
    fontWeight: 700,
    fontSize: '32px',
    lineHeight: '38px',
  },
  bodyL: {
    fontWeight: 400,
    fontSize: '20px',
    lineHeight: '28px',
  },
};
