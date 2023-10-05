import SudokuSolverComponent from "./SudokuSolverComponent";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import * as React from "react";
import Typography from "@mui/material/Typography";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          <h1>
            <React.Fragment>
              <CssBaseline />
              <Container maxWidth="sm" align="center">
                <Typography
                  variant="h4"
                  align="center"
                  color="inherit"
                  spacing={4}
                >
                  Sudoku Solver
                </Typography>

                <SudokuSolverComponent />
              </Container>
            </React.Fragment>
          </h1>
        </p>
      </header>
    </div>
  );
}

export default App;
