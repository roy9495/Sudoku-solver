import React, { useState } from "react";
import SudokuGrid from "./SudokuGrid";
import solveSudoku from "./SudokuSolver";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

function SudokuSolverComponent() {
  const initialGrid = [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0],
  ];

  const exampleGrid1 = [
    [0, 0, 0, 0, 0, 6, 0, 5, 0],
    [2, 0, 7, 0, 8, 0, 0, 0, 0],
    [0, 0, 4, 0, 0, 0, 0, 0, 0],
    [0, 6, 0, 0, 0, 5, 0, 0, 0],
    [0, 0, 8, 0, 4, 0, 1, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 9, 0],
    [0, 0, 0, 0, 0, 0, 7, 0, 0],
    [0, 0, 0, 0, 1, 0, 8, 0, 4],
    [0, 3, 0, 2, 0, 0, 0, 0, 0],
  ];

  const exampleGrid2 = [
    [5, 0, 0, 0, 3, 0, 9, 0, 0],
    [0, 0, 1, 5, 0, 0, 0, 3, 0],
    [9, 3, 0, 0, 0, 0, 0, 8, 0],
    [4, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 8, 5, 9, 0, 0, 0],
    [0, 0, 0, 0, 0, 6, 0, 0, 7],
    [0, 6, 0, 0, 0, 0, 0, 5, 1],
    [0, 9, 0, 0, 0, 5, 7, 0, 0],
    [0, 0, 5, 0, 7, 0, 0, 0, 3],
  ];

  const [sudokuValues, setSudokuValues] = useState(initialGrid);
  const [exampleCount, setExampleCount] = useState(0);
  const [isSolved, setIsSolved] = useState(false); // State to track if the Sudoku is solved
  const [open, setOpen] = useState(false); // State to control the dialog open/close

  const handleSolveClick = () => {
    const solvedGrid = [...sudokuValues];
    if (solveSudoku(solvedGrid)) {
      setSudokuValues(solvedGrid);
      setIsSolved(true);
      setOpen(true); // Open the dialog when Sudoku is solved
    } else {
      alert("This Sudoku puzzle cannot be solved.");
    }
  };

  const handleClose = () => {
    setOpen(false); // Close the dialog
  };

  const handleResetClick = () => {
    setSudokuValues(initialGrid);
    setExampleCount(0);
  };

  const handleExampleClick = () => {
    // Determine which example grid to use based on exampleCount
    const exampleGrid = exampleCount % 2 === 0 ? exampleGrid1 : exampleGrid2;
    setSudokuValues(exampleGrid);

    // Increment the example count
    setExampleCount(exampleCount + 1);
  };

  const handleInputChange = (row, col, value) => {
    // Update the Sudoku grid when the user inputs values
    const updatedGrid = [...sudokuValues];
    updatedGrid[row][col] = parseInt(value) || 0;
    setSudokuValues(updatedGrid);
  };

  return (
    <div>
      <SudokuGrid sudokuValues={sudokuValues} onChange={handleInputChange} />
      <Box sx={{ "& button": { m: 1 } }}>
        <Button variant="contained" color="warning" onClick={handleSolveClick}>
          Solve
        </Button>
        <Button variant="contained" color="primary" onClick={handleResetClick}>
          Reset
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExampleClick}
        >
          Example
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Sudoku Solved!</DialogTitle>
        <DialogContent>
          <DialogContentText>Yay! It is solved!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SudokuSolverComponent;
