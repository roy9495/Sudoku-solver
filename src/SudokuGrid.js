import React from "react";
import './SudokuGrid.css'

function SudokuGrid({ sudokuValues, onChange }) {
  const handleInputChange = (rowIndex, colIndex, inputValue) => {
    // Validate input to accept only values from 1 to 9
    if (/^[1-9]$/.test(inputValue)) {
      // If the input is valid, call the onChange callback
      onChange(rowIndex, colIndex, inputValue);
    } else if (inputValue === "") {
      // If the input is empty, allow clearing the cell
      onChange(rowIndex, colIndex, "");
    }
    // Ignore any other input values (e.g., non-numeric values)
  };
  return (
    <div className="sudoku-grid">
      {sudokuValues.map((row, rowIndex) => (
        <div key={rowIndex} className="sudoku-row">
          {row.map((value, colIndex) => (
            <input
              key={colIndex}
              type="text"
              className="sudoku-cell"
              value={value || ""}
              onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SudokuGrid;
