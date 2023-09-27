import React from "react";
import './SudokuGrid.css'

function SudokuGrid({ sudokuValues, onChange }) {
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
              onChange={(e) => onChange(rowIndex, colIndex, e.target.value)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SudokuGrid;
