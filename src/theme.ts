import { createTheme } from '@mui/material';

export const createAppTheme = (isDarkMode: boolean) => 
  createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#0d6efd', // Bootstrap primary color
      },
      secondary: {
        main: '#6c757d', // Bootstrap secondary color
      },
      error: {
        main: '#dc3545', // Bootstrap danger color
        light: '#ff4d5f', // Brighter error color
      },
      warning: {
        main: '#ffc107', // Bootstrap warning color
        light: '#ffd54f', // Brighter warning color
      },
      info: {
        main: '#0dcaf0', // Bootstrap info color
        light: '#4dd8f7', // Brighter info color
      },
      success: {
        main: '#198754', // Bootstrap success color
        light: '#2ecc71', // Brighter success color
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Match Bootstrap's button text casing
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
          standardError: {
            backgroundColor: '#ff4d5f',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
          },
          standardWarning: {
            backgroundColor: '#ffd54f',
            color: '#000',
            '& .MuiAlert-icon': {
              color: '#000',
            },
          },
          standardInfo: {
            backgroundColor: '#4dd8f7',
            color: '#000',
            '& .MuiAlert-icon': {
              color: '#000',
            },
          },
          standardSuccess: {
            backgroundColor: '#2ecc71',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          '.fc': {
            '--fc-col-header-cell-bg-color': isDarkMode ? '#424242' : '#fff',
            '--fc-col-header-cell-text-color': isDarkMode ? '#fff' : '#212529',
            '--fc-col-header-cell-border-color': isDarkMode ? '#616161' : '#ddd',
            '--fc-list-day-text-color': isDarkMode ? '#fff' : '#212529',
            '--fc-list-day-bg-color': isDarkMode ? '#424242' : '#fff',
          },
          '.fc .fc-col-header-cell': {
            backgroundColor: isDarkMode ? '#424242' : '#fff',
            color: isDarkMode ? '#fff' : '#212529',
            borderColor: isDarkMode ? '#616161' : '#ddd',
          },
          '.fc .fc-col-header-cell-cushion': {
            color: isDarkMode ? '#fff' : '#212529',
          },
          '.fc .fc-list-day-cushion': {
            backgroundColor: isDarkMode ? '#424242' : '#fff',
            color: isDarkMode ? '#fff' : '#212529',
          },
          '.fc .fc-list-day': {
            backgroundColor: isDarkMode ? '#424242' : '#fff',
            color: isDarkMode ? '#fff' : '#212529',
          },
        },
      },
    },
  }); 