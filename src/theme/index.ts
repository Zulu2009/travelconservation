import { createTheme, ThemeOptions } from '@mui/material/styles';

// Conservation-themed color palette
const conservationColors = {
  primary: {
    main: '#1B4332', // Deep Forest Green
    light: '#2D5A47',
    dark: '#0F2E1F',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#8B4513', // Earth Brown
    light: '#A0623D',
    dark: '#5D2E0C',
    contrastText: '#FFFFFF',
  },
  accent: {
    main: '#006994', // Ocean Blue
    light: '#3387A8',
    dark: '#004A6B',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#52B788', // Conservation Green
    light: '#75C5A0',
    dark: '#3A8060',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F77F00', // Sunset Orange
    light: '#F99933',
    dark: '#CC6600',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FEFEFE', // Warm White
    paper: '#F1F8E9', // Light Sage
  },
  text: {
    primary: '#1B4332',
    secondary: '#5D2E0C',
  },
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: conservationColors.primary,
    secondary: conservationColors.secondary,
    success: conservationColors.success,
    warning: conservationColors.warning,
    error: conservationColors.error,
    background: conservationColors.background,
    text: conservationColors.text,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(27, 67, 50, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(27, 67, 50, 0.2)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(27, 67, 50, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(27, 67, 50, 0.12)',
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
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: conservationColors.background.default,
          color: conservationColors.text.primary,
          boxShadow: '0 1px 3px rgba(27, 67, 50, 0.1)',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
};

export const theme = createTheme(themeOptions);

// Custom theme extensions
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

// Utility functions for theme usage
export const getConservationTypeColor = (type: string) => {
  switch (type) {
    case 'wildlife':
      return conservationColors.success.main;
    case 'marine':
      return conservationColors.accent.main;
    case 'forest':
      return conservationColors.primary.main;
    case 'cultural':
      return conservationColors.secondary.main;
    default:
      return conservationColors.primary.main;
  }
};

export const getLuxuryLevelColor = (level: number) => {
  const colors = [
    '#52B788', // Level 1 - Conservation Green
    '#75C5A0', // Level 2 - Light Green
    '#006994', // Level 3 - Ocean Blue
    '#8B4513', // Level 4 - Earth Brown
    '#F77F00', // Level 5 - Sunset Orange (Ultra Luxury)
  ];
  return colors[level - 1] || colors[0];
};

export default theme;
