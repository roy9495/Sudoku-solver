import React, { useState } from "react";
import SudokuGrid from "./SudokuGrid";
import solveSudoku from "./SudokuSolver";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

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

  const handleSolveClick = () => {
    const solvedGrid = [...sudokuValues];
    if (solveSudoku(solvedGrid)) {
      setSudokuValues(solvedGrid);
    } else {
      // Display a message that the puzzle is unsolvable
      alert("This Sudoku puzzle cannot be solved.");
    }
  };

  const handleResetClick = () => {
    setSudokuValues(initialGrid);
  };

  const handleExampleClick = () => {
    setSudokuValues(exampleGrid1);
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
    </div>
  );
}

export default SudokuSolverComponent;
