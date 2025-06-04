import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004089',
      light: '#335fa8',
      dark: '#002c60',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#f73378',
      dark: '#ab003c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02857em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 0,
          padding: '8px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: '#5065c9',
        },
        containedSecondary: {
          background: '#ff1a6c',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          '&:hover': {
            boxShadow: 'none',
          },
          transition: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          borderRadius: 0,
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
        elevation2: {
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
        elevation4: {
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5065c9',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          background: '#5065c9',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#388e3c',
          borderColor: '#388e3c',
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          color: '#1976d2',
          borderColor: '#1976d2',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          color: '#f57c00',
          borderColor: '#f57c00',
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#d32f2f',
          borderColor: '#d32f2f',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
        outlined: {
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
        indicator: {
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '100% !important',
          padding: '0 24px',
        }
      }
    },
    MuiBox: {
      styleOverrides: {
        root: {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }
      }
    },
  },
});

export default theme; 