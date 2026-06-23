// App.js
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Grid3x3Icon from "@mui/icons-material/Grid3x3";

import SudokuSolverComponent from "./SudokuSolverComponent";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Sync theme class to document.body for CSS variable overrides
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
    }
  }, [darkMode]);

  const activeTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#6366f1", // Indigo
        light: "#818cf8",
      },
      secondary: {
        main: "#a855f7", // Purple
        light: "#c084fc",
      },
      background: {
        default: darkMode ? "#0b0f19" : "#f8fafc",
        paper: darkMode ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.75)",
      },
      text: {
        primary: darkMode ? "#f3f4f6" : "#0f172a",
        secondary: darkMode ? "#9ca3af" : "#475569",
      },
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    shape: {
      borderRadius: 16,
    },
  });

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      
      {/* Background Glowing Blobs */}
      <div className="bg-glowing-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Main Wrapper */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 4, 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Header Block */}
        <Box
          component="header"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            pb: 2.5,
            borderBottom: darkMode 
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Grid3x3Icon color="primary" sx={{ fontSize: 36 }} className="glow-text-primary" />
            <Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  background: darkMode 
                    ? "linear-gradient(90deg, #818cf8 0%, #c084fc 100%)"
                    : "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Sudoku Solver Visualizer
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                A premium backtracking solver with real-time visual step-by-step updates
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            color="inherit"
            aria-label="Toggle Theme Mode"
            sx={{
              background: darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
              border: darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: "12px",
              padding: "10px",
              "&:hover": {
                background: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
              }
            }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>

        {/* Solver Body Component */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <SudokuSolverComponent />
        </Box>

        {/* Footer Block */}
        <Box
          component="footer"
          sx={{
            mt: "auto",
            pt: 4,
            pb: 2,
            textAlign: "center",
            borderTop: darkMode
              ? "1px solid rgba(255, 255, 255, 0.05)"
              : "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
            Sudoku Solver Visualizer • Designed with Premium HSL Colors & Interactive Backtracking
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
