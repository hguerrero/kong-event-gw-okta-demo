import React from 'react';
import './kong-theme.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#CCFF00', // Electric Lime
      contrastText: '#000F06',
    },
    secondary: {
      main: '#B7BDB5', // Bay
      contrastText: '#000F06',
    },
    background: {
      default: '#000F06', // Dark Green
      paper: '#101110',
    },
    text: {
      primary: '#CCFF00',
      secondary: '#B7BDB5',
    },
    grey: {
      50: '#E7EDE5',
      100: '#D7DED4',
      200: '#CDD4CB',
      300: '#B7BDB5',
      400: '#a3a9a1',
      500: '#858983',
      600: '#6b706c',
      700: '#4A4D49',
      800: '#2a2d29',
      900: '#101110',
    },
  },
  typography: {
    fontFamily: 'Funnel Sans, Arial, sans-serif',
    h1: {
      fontSize: '4.5rem',
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.19,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: 'Space Grotesk, Funnel Sans, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000F06',
          color: '#CCFF00',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000F06',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          borderRadius: 8,
          border: '1px solid #CDD4CB',
          backgroundColor: '#101110',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
          padding: '12px 24px',
          fontSize: '1rem',
          fontFamily: 'Space Grotesk, Funnel Sans, sans-serif',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          backgroundColor: '#CCFF00',
          color: '#000F06',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#e6ff4d',
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          backgroundColor: '#000F06',
          color: '#CCFF00',
          '&:hover': {
            backgroundColor: '#4A4D49',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#CCFF00',
          color: '#CCFF00',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#e6ff4d',
            color: '#000F06',
            backgroundColor: '#B7BDB5',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#CCFF00',
          color: '#000F06',
        },
        colorSecondary: {
          backgroundColor: '#B7BDB5',
          color: '#000F06',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CCFF00',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CCFF00',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#101110',
        },
      },
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
