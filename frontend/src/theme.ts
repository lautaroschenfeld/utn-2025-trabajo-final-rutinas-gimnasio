import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#e04300",
    },
    secondary: {
      main: "#e04300",
    },
    background: {
      default: "#121212",
      paper: "#1c1c1c",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#cfcfcf",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
  },
});

export default theme;
