// SudokuGrid.js
import React, { useState } from "react";
import "./SudokuGrid.css";

function SudokuGrid({ sudokuValues, initialValues, conflicts, solvingCell, onChange, isSolving, onFocusCell }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleInputChange = (rowIndex, colIndex, inputValue) => {
    if (isSolving) return; // Disable input while solving

    // If the cell is a preset given number, don't allow changes
    if (initialValues[rowIndex][colIndex] !== 0) return;

    // Validate input: accept only 1-9
    if (/^[1-9]$/.test(inputValue)) {
      onChange(rowIndex, colIndex, parseInt(inputValue));
    } else if (inputValue === "") {
      onChange(rowIndex, colIndex, 0);
    }
  };

  const handleKeyDown = (e, row, col) => {
    if (isSolving) return;

    let nextRow = row;
    let nextCol = col;

    switch (e.key) {
      case "ArrowUp":
        nextRow = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        nextRow = Math.min(8, row + 1);
        break;
      case "ArrowLeft":
        nextCol = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        nextCol = Math.min(8, col + 1);
        break;
      case "Backspace":
      case "Delete":
        if (initialValues[row][col] === 0) {
          onChange(row, col, 0);
        }
        return;
      default:
        // Let standard characters (like numbers) fall through to onChange
        return;
    }

    e.preventDefault();
    const nextInput = document.querySelector(
      `input[data-row="${nextRow}"][data-col="${nextCol}"]`
    );
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  };

  // Check if a cell is highlighted as part of the hovered cell's constraint guides
  const getHighlightClass = (r, c) => {
    if (!hoveredCell) return "";

    const { row, col } = hoveredCell;
    if (row === r && col === c) {
      return "highlight-active-hover";
    }

    const sameRow = row === r;
    const sameCol = col === c;
    const sameBox =
      Math.floor(row / 3) === Math.floor(r / 3) &&
      Math.floor(col / 3) === Math.floor(c / 3);

    if (sameRow || sameCol || sameBox) {
      return "highlight-guide";
    }

    return "";
  };

  // Determine cell state styles
  const getCellStateClass = (r, c, value) => {
    if (value === 0) return "";

    // Check if the cell is currently being animated/checked by the solver
    if (isSolving && solvingCell) {
      const [solveR, solveC, status] = solvingCell;
      if (solveR === r && solveC === c) {
        if (status === "trying") return "cell-trying";
        if (status === "backtrack") return "cell-backtrack";
        if (status === "success") return "cell-success-step";
      }
    }

    // Check for conflicts
    if (conflicts.has(`${r},${c}`)) {
      return "cell-conflict";
    }

    // Preset given numbers vs user entered numbers
    if (initialValues[r][c] !== 0) {
      return "cell-given";
    }

    return "cell-user";
  };

  const isReadOnly = (r, c) => {
    return isSolving || initialValues[r][c] !== 0;
  };

  return (
    <div className="sudoku-grid-wrapper">
      <div className="sudoku-grid">
        {sudokuValues.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isThickRight = colIndex === 2 || colIndex === 5;
            const isThickBottom = rowIndex === 2 || rowIndex === 5;
            const isAltBlock = (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 !== 0;
            const cellStateClass = getCellStateClass(rowIndex, colIndex, value);
            const highlightClass = getHighlightClass(rowIndex, colIndex);

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                data-row={rowIndex}
                data-col={colIndex}
                className={`sudoku-cell col-${colIndex} row-${rowIndex} ${
                  isThickRight ? "border-right-thick" : ""
                } ${isThickBottom ? "border-bottom-thick" : ""} ${
                  isAltBlock ? "cell-block-alt" : ""
                } ${cellStateClass} ${highlightClass}`}
                value={value === 0 ? "" : value}
                readOnly={isReadOnly(rowIndex, colIndex)}
                onChange={(e) =>
                  handleInputChange(rowIndex, colIndex, e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => setHoveredCell(null)}
                onFocus={() => onFocusCell && onFocusCell({ row: rowIndex, col: colIndex })}
                maxLength={1}
                inputMode="numeric"
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default SudokuGrid;
