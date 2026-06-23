// SudokuSolver.js

/**
 * Solves the Sudoku grid synchronously using standard backtracking.
 * Modifies the grid in place. Returns true if solvable, false otherwise.
 */
export function solveSudoku(grid) {
  const emptyCell = findEmptyCell(grid);
  if (!emptyCell) {
    return true; // No empty cells, solved
  }

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValidMove(grid, row, col, num)) {
      grid[row][col] = num;

      if (solveSudoku(grid)) {
        return true;
      }

      // Backtrack
      grid[row][col] = 0;
    }
  }

  return false;
}

/**
 * Generator function that yields the grid and state at each step of the solver.
 * Yields objects of the form: { grid: number[][], status: 'trying' | 'backtrack' | 'success', cell: [number, number] }
 * Modifies the grid in place.
 */
export function* solveSudokuGenerator(grid) {
  const emptyCell = findEmptyCell(grid);
  if (!emptyCell) {
    yield { grid: copyGrid(grid), status: 'success', cell: null };
    return true;
  }

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValidMove(grid, row, col, num)) {
      grid[row][col] = num;
      yield { grid: copyGrid(grid), status: 'trying', cell: [row, col] };

      const solved = yield* solveSudokuGenerator(grid);
      if (solved) {
        return true;
      }

      // Backtrack
      grid[row][col] = 0;
      yield { grid: copyGrid(grid), status: 'backtrack', cell: [row, col] };
    }
  }

  return false;
}

/**
 * Validates the entire Sudoku board for any rule violations (conflicts).
 * Returns true if the board is valid (no duplicates in rows, columns, or boxes), false otherwise.
 */
export function validateGrid(grid) {
  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Set();
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (seen.has(val)) return false;
        seen.add(val);
      }
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = new Set();
    for (let r = 0; r < 9; r++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (seen.has(val)) return false;
        seen.add(val);
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Set();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const val = grid[boxRow + r][boxCol + c];
          if (val !== 0) {
            if (seen.has(val)) return false;
            seen.add(val);
          }
        }
      }
    }
  }

  return true;
}

/**
 * Finds all cell coordinates that conflict with another cell in their row, col, or box.
 * Returns a Set of stringified coordinates "row,col".
 */
export function getConflicts(grid) {
  const conflicts = new Set();

  // Check rows for duplicates
  for (let r = 0; r < 9; r++) {
    const seen = {}; // num -> array of col indices
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (!seen[val]) seen[val] = [];
        seen[val].push(c);
      }
    }
    Object.keys(seen).forEach(num => {
      if (seen[num].length > 1) {
        seen[num].forEach(c => conflicts.add(`${r},${c}`));
      }
    });
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = {}; // num -> array of row indices
    for (let r = 0; r < 9; r++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (!seen[val]) seen[val] = [];
        seen[val].push(r);
      }
    }
    Object.keys(seen).forEach(num => {
      if (seen[num].length > 1) {
        seen[num].forEach(r => conflicts.add(`${r},${c}`));
      }
    });
  }

  // Check boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = {}; // num -> array of [r, c]
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const currR = boxRow + r;
          const currC = boxCol + c;
          const val = grid[currR][currC];
          if (val !== 0) {
            if (!seen[val]) seen[val] = [];
            seen[val].push([currR, currC]);
          }
        }
      }
      Object.keys(seen).forEach(num => {
        if (seen[num].length > 1) {
          seen[num].forEach(([r, c]) => conflicts.add(`${r},${c}`));
        }
      });
    }
  }

  return conflicts;
}

// Helpers
function findEmptyCell(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        return [r, c];
      }
    }
  }
  return null;
}

export function isValidMove(grid, row, col, num) {
  // Check row (ignoring target cell itself)
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }

  // Check column (ignoring target cell itself)
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }

  // Check box (ignoring target cell itself)
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const currR = startRow + r;
      const currC = startCol + c;
      if ((currR !== row || currC !== col) && grid[currR][currC] === num) {
        return false;
      }
    }
  }

  return true;
}

function copyGrid(grid) {
  return grid.map(row => [...row]);
}

export default solveSudoku;
