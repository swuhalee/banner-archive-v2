import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f6f6f6', // --bg
      paper: '#ffffff',   // --surface
    },
    text: {
      primary: '#111111',   // --text-strong
      secondary: '#222222', // --text
      disabled: '#6a6a6a',  // --text-muted
    },
    primary: {
      main: '#3b82f6', // --accent
    },
    divider: '#dddddd', // --line
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), "Noto Sans KR", sans-serif',
  },
  components: {
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-active': { color: '#111111' },
          '&.Mui-completed': { color: '#111111' },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        ':root': {
          '--bg': theme.palette.background.default,
          '--surface': theme.palette.background.paper,
          '--surface-alt': '#f1f1f1',
          '--text-strong': theme.palette.text.primary,
          '--text': theme.palette.text.secondary,
          '--text-muted': theme.palette.text.disabled,
          '--line': theme.palette.divider,
          '--line-strong': '#bcbcbc',
          '--accent': theme.palette.primary.main,
          '--accent-muted': '#9ca3af',
        },
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
        },
        body: {
          margin: 0,
          padding: 0,
          background: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: 'var(--font-geist-sans), "Noto Sans KR", sans-serif',
        },
        a: {
          color: 'inherit',
          textDecoration: 'none',
        },
        ':focus-visible': {
          outline: '2px solid #111111',
          outlineOffset: '2px',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            transitionDuration: '0.01ms !important',
            animationDuration: '0.01ms !important',
          },
        },
      }),
    },
  },
})

export default theme
