# Premium Sudoku Solver Visualizer

A premium, interactive web application that solves Sudoku puzzles step-by-step using a backtracking algorithm. Built with React and styled using CSS Custom Properties and Material UI.

Live Demo: [sudoku-solver-umber.vercel.app](https://sudoku-solver-umber.vercel.app/)

## ✨ Key Features
- **Backtracking Visualizer**: Real-time visualization of the backtracking search algorithm (depth-first search) with adjustable speed options (Turbo, Fast, Medium, Slow).
- **Instant Solver (⚡)**: Solves the board instantly, showing overall execution time in milliseconds and the number of backtracks required.
- **Custom Themeing**: Fully responsive light/dark themes:
  - **White Theme (Light)**: Clean, solid black grid lines (`#000000`).
  - **Black Theme (Dark)**: Glowing, solid white grid lines (`#ffffff`).
- **Interactive Control Center**:
  - **Game Presets**: Quickly load preset puzzles (Easy, Medium, Hard) from a solid, opaque selection menu.
  - **Interactive Keypad**: Mouse-driven input helper for cell selection and entering digits.
  - **Visualizer Guide**: Educative legend explaining cell animation states (Trying, Backtracking, Success Steps, Conflicts).
- **Responsive Layout**: Designed to look stunning on both desktop and mobile viewports.

## 🚀 Getting Started

To run the application locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
```
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### 3. Build for Production
```bash
npm run build
```
Builds the app for production in the `build` folder, optimizing the bundle for maximum performance.

## 📂 Project Structure
- [src/index.js](src/index.js): Entry point where global styles are imported.
- [src/index.css](src/index.css): Contains global variable tokens for styling, colors, and light/dark theme overrides.
- [src/SudokuSolverComponent.js](src/SudokuSolverComponent.js): Main dashboard coordinator component including layout grid, presets, speed slider, buttons, and visualizer logic.
- [src/SudokuGrid.js](src/SudokuGrid.js): Grid board renderer handling focus highlights, conflict display, and key event navigation.
- [src/SudokuSolver.js](src/SudokuSolver.js): Depth-first search (DFS) backtracking solver engine implemented using JavaScript generators.
