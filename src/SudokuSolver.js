function solveSudoku(grid) {
  const emptyCell = findEmptyCell(grid);

  if (!emptyCell) {
    // No empty cells, puzzle is solved
    return true;
  }

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValidMove(grid, row, col, num)) {
      grid[row][col] = num;

      if (solveSudoku(grid)) {
        return true;
      }

      // If the current configuration doesn't lead to a solution, backtrack
      grid[row][col] = 0;
    }
  }

  return false;
}

function findEmptyCell(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

function isValidMove(grid, row, col, num) {
  // Check if num is already in the same row, column, or 3x3 grid
  return (
    !isInRow(grid, row, num) &&
    !isInColumn(grid, col, num) &&
    !isInBox(grid, row - (row % 3), col - (col % 3), num)
  );
}

function isInRow(grid, row, num) {
  return grid[row].includes(num);
}

function isInColumn(grid, col, num) {
  return grid.some((row) => row[col] === num);
}

function isInBox(grid, startRow, startCol, num) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (grid[row + startRow][col + startCol] === num) {
        return true;
      }
    }
  }
  return false;
}

export default solveSudoku;
