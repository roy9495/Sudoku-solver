// SudokuSolverComponent.js
import React, { useState, useEffect, useRef } from "react";
import SudokuGrid from "./SudokuGrid";
import { solveSudoku, solveSudokuGenerator, getConflicts, validateGrid } from "./SudokuSolver";
import { PRESETS } from "./SudokuPresets";

// MUI Components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import BackspaceIcon from "@mui/icons-material/Backspace";
import SpeedIcon from "@mui/icons-material/Speed";
import GridOnIcon from "@mui/icons-material/GridOn";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoopIcon from "@mui/icons-material/Loop";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function SudokuSolverComponent() {
  const [presetKey, setPresetKey] = useState("easy");
  const [sudokuValues, setSudokuValues] = useState(PRESETS.easy.grid.map(row => [...row]));
  const [initialValues, setInitialValues] = useState(PRESETS.easy.grid.map(row => [...row]));
  const [focusedCell, setFocusedCell] = useState(null);

  // Solver States
  const [isSolving, setIsSolving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [solvingCell, setSolvingCell] = useState(null);
  const [visualSpeed, setVisualSpeed] = useState(15); // Default speed is Fast (15ms)
  
  // Metrics
  const [backtracks, setBacktracks] = useState(0);
  const [solveTime, setSolveTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Ready to solve");

  // UX Feedback States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("error");

  // Visualizer Refs for asynchronous stepping
  const visualizerTimeoutRef = useRef(null);
  const generatorRef = useRef(null);
  const currentGridRef = useRef(null);
  const startTimeRef = useRef(0);
  const backtrackCountRef = useRef(0);

  // Compute conflicts dynamically for the current board state
  const conflicts = getConflicts(sudokuValues);

  // Load a new preset
  const handlePresetChange = (event) => {
    if (isSolving) stopVisualSolve();
    const key = event.target.value;
    setPresetKey(key);
    const newGrid = PRESETS[key].grid.map((row) => [...row]);
    setSudokuValues(newGrid);
    setInitialValues(newGrid);
    setFocusedCell(null);
    setBacktracks(0);
    setSolveTime(0);
    setStatusMessage(`Loaded preset: ${PRESETS[key].name}`);
  };

  // Cell manual input changes
  const handleInputChange = (row, col, value) => {
    const updatedGrid = sudokuValues.map((r, rIdx) =>
      r.map((val, cIdx) => (rIdx === row && cIdx === col ? value : val))
    );
    setSudokuValues(updatedGrid);
    // Also save it to initialValues so it acts as the starting state when solving
    setInitialValues(updatedGrid);
  };

  // Keyboard/Keypad input handler
  const handleKeypadClick = (num) => {
    if (isSolving || !focusedCell) return;
    const { row, col } = focusedCell;
    
    // Can't edit preset cells
    if (PRESETS[presetKey].grid[row][col] !== 0) return;

    handleInputChange(row, col, num);
  };

  // Reset grid back to the state before solving
  const handleResetClick = () => {
    if (isSolving) stopVisualSolve();
    setSudokuValues(initialValues.map(row => [...row]));
    setBacktracks(0);
    setSolveTime(0);
    setStatusMessage("Reset grid to initial state");
  };

  // Clear board completely to blank
  const handleClearClick = () => {
    if (isSolving) stopVisualSolve();
    setPresetKey("empty");
    const emptyGrid = PRESETS.empty.grid.map((row) => [...row]);
    setSudokuValues(emptyGrid);
    setInitialValues(emptyGrid);
    setFocusedCell(null);
    setBacktracks(0);
    setSolveTime(0);
    setStatusMessage("Cleared board");
  };

  // Instant solver
  const handleInstantSolve = () => {
    if (isSolving) stopVisualSolve();

    // Check for validation errors first
    if (!validateGrid(initialValues)) {
      showToast("Cannot solve: The board has rules conflicts!", "error");
      setStatusMessage("Solve failed: Conflicts detected");
      return;
    }

    const gridCopy = initialValues.map(row => [...row]);
    const t0 = performance.now();
    const success = solveSudoku(gridCopy);
    const t1 = performance.now();

    if (success) {
      setSudokuValues(gridCopy);
      setSolveTime(Math.round(t1 - t0));
      setStatusMessage("Solved instantly!");
      setDialogOpen(true);
    } else {
      showToast("This Sudoku puzzle cannot be solved.", "error");
      setStatusMessage("Unsolvable puzzle");
    }
  };

  // Visual Backtracking Solver - Play/Start
  const startVisualSolve = () => {
    if (isSolving) {
      if (isPaused) {
        setIsPaused(false);
        setStatusMessage("Solving...");
      }
      return;
    }

    // Check validation first
    if (!validateGrid(initialValues)) {
      showToast("Cannot solve: The board has rules conflicts!", "error");
      setStatusMessage("Solve failed: Conflicts detected");
      return;
    }

    const gridCopy = initialValues.map(row => [...row]);
    currentGridRef.current = gridCopy;
    generatorRef.current = solveSudokuGenerator(gridCopy);

    setIsSolving(true);
    setIsPaused(false);
    setBacktracks(0);
    setSolveTime(0);
    backtrackCountRef.current = 0;
    setStatusMessage("Solving Sudoku visually...");
    
    startTimeRef.current = performance.now();
    runStepper();
  };

  // Visual Backtracking Solver - Pause
  const pauseVisualSolve = () => {
    setIsPaused(true);
    setStatusMessage("Paused");
    if (visualizerTimeoutRef.current) {
      clearTimeout(visualizerTimeoutRef.current);
    }
  };

  // Visual Backtracking Solver - Stop/Revert
  const stopVisualSolve = () => {
    setIsSolving(false);
    setIsPaused(false);
    setSolvingCell(null);
    if (visualizerTimeoutRef.current) {
      clearTimeout(visualizerTimeoutRef.current);
    }
    setSudokuValues(initialValues.map(row => [...row]));
    setStatusMessage("Stopped visual solve");
  };

  // The step animation scheduler
  const runStepper = () => {
    if (visualizerTimeoutRef.current) clearTimeout(visualizerTimeoutRef.current);
    
    visualizerTimeoutRef.current = setTimeout(() => {
      executeStep();
    }, visualSpeed);
  };

  // Execute a single step from the generator
  const executeStep = () => {
    if (!generatorRef.current || isPaused) return;

    const { value, done } = generatorRef.current.next();

    if (done) {
      setIsSolving(false);
      setSolvingCell(null);
      const duration = Math.round(performance.now() - startTimeRef.current);
      setSolveTime(duration);

      if (value) {
        // Solved
        setSudokuValues(currentGridRef.current);
        setStatusMessage(`Solved in ${duration}ms!`);
        setDialogOpen(true);
      } else {
        showToast("No solution exists for this Sudoku puzzle.", "error");
        setStatusMessage("Unsolvable puzzle");
      }
      return;
    }

    // Step state
    const { grid, status, cell } = value;
    setSudokuValues(grid);
    if (cell) {
      setSolvingCell([cell[0], cell[1], status]);
    }

    if (status === "backtrack") {
      backtrackCountRef.current += 1;
      setBacktracks(backtrackCountRef.current);
    }

    // Calculate real-time duration
    setSolveTime(Math.round(performance.now() - startTimeRef.current));

    runStepper();
  };

  // React to speed adjustments on the fly
  useEffect(() => {
    if (isSolving && !isPaused) {
      runStepper();
    }
    return () => {
      if (visualizerTimeoutRef.current) clearTimeout(visualizerTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualSpeed, isSolving, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (visualizerTimeoutRef.current) clearTimeout(visualizerTimeoutRef.current);
    };
  }, []);

  // Snackbar helper
  const showToast = (message, severity = "error") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  // Format speed labels
  const getSpeedLabel = (value) => {
    if (value >= 150) return "Slow";
    if (value >= 60) return "Medium";
    if (value >= 15) return "Fast";
    return "Turbo";
  };

  const getSliderValue = (delay) => {
    if (delay <= 2) return 0;
    if (delay <= 15) return 1;
    if (delay <= 60) return 2;
    return 3;
  };

  const getDelayFromSlider = (value) => {
    if (value === 0) return 2;
    if (value === 1) return 15;
    if (value === 2) return 60;
    return 200;
  };

  return (
    <Box sx={{ mt: 3, mb: 5, width: "100%" }}>
      {/* Metrics Row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Paper
          className="glass-panel"
          sx={{
            px: 3,
            py: 1.2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderRadius: 4,
            backgroundImage: "none",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: isSolving
                ? isPaused
                  ? "warning.main"
                  : "success.main"
                : "primary.main",
              boxShadow: isSolving && !isPaused ? "0 0 10px #10b981" : "none",
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Status:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
            {statusMessage}
          </Typography>
        </Paper>

        <Stack direction="row" spacing={2}>
          <Paper
            className="glass-panel"
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 4,
              backgroundImage: "none",
            }}
          >
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {solveTime} ms
            </Typography>
          </Paper>

          <Paper
            className="glass-panel"
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 4,
              backgroundImage: "none",
            }}
          >
            <LoopIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {backtracks} backtracks
            </Typography>
          </Paper>
        </Stack>
      </Stack>

      {/* Main Grid & Control Panel Grid */}
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={4}
        justifyContent="center"
        alignItems={{ xs: "center", lg: "stretch" }}
      >
        {/* Left Column: Sudoku Grid + Visualizer Guide */}
        <Stack spacing={3} sx={{ width: "100%", maxWidth: 450, alignItems: "center" }}>
          {/* Sudoku Grid View */}
          <Box sx={{ position: "relative" }}>
            <SudokuGrid
              sudokuValues={sudokuValues}
              initialValues={PRESETS[presetKey].grid}
              conflicts={conflicts}
              solvingCell={solvingCell}
              onChange={handleInputChange}
              isSolving={isSolving}
              onFocusCell={setFocusedCell}
            />
          </Box>

          {/* Visualizer Guide Widget */}
          <Card className="glass-panel" sx={{ borderRadius: "12px", width: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <InfoOutlinedIcon color="primary" /> Visualizer Guide
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                The solver uses a <strong>Backtracking Algorithm</strong> (Depth-First Search) to systematically search for solutions. It tries digits 1–9 in empty cells, reverting (backtracking) whenever a constraint is violated.
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.5px", color: "text.primary" }}>
                Cell Color Legend
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: "rgba(245, 158, 11, 0.28)", border: "1px solid rgba(245, 158, 11, 0.5)" }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Trying Digits</Typography>
                </Stack>
                
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: "rgba(244, 63, 94, 0.3)", border: "1px solid rgba(244, 63, 94, 0.5)" }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Backtracking</Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: "rgba(16, 185, 129, 0.35)", border: "1px solid rgba(16, 185, 129, 0.5)" }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Success Step</Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: "3px", backgroundColor: "rgba(244, 63, 94, 0.18)", border: "1px solid rgba(244, 63, 94, 0.3)" }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Constraint Conflict</Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: "3px", border: "1px solid var(--grid-line-thin)", bgcolor: "var(--cell-bg)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "var(--cell-text-given)", fontSize: "0.6rem" }}>5</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Preset Givens</Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: "3px", border: "1px solid var(--grid-line-thin)", bgcolor: "var(--cell-bg)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--cell-text-user)", fontSize: "0.6rem" }}>9</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>User Entered</Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Right Column: Game Presets, Solver Engine, Interactive Keypad */}
        <Stack spacing={3} sx={{ width: "100%", maxWidth: 400 }}>
          {/* Preset Select & Board Actions */}
          <Card className="glass-panel" sx={{ borderRadius: "12px" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <GridOnIcon color="primary" /> Game Presets
              </Typography>

              <FormControl fullWidth size="medium" sx={{ mb: 3 }}>
                <InputLabel id="preset-label" sx={{ color: "text.secondary" }}>Select Preset Puzzle</InputLabel>
                <Select
                  labelId="preset-label"
                  value={presetKey}
                  label="Select Preset Puzzle"
                  onChange={handlePresetChange}
                  disabled={isSolving}
                  sx={{
                    borderRadius: 3,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--card-border)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--primary-color)",
                    },
                  }}
                >
                  {Object.keys(PRESETS).map((key) => (
                    <MenuItem key={key} value={key}>
                      {PRESETS[key].name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 2, borderColor: "var(--card-border)" }} />

              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  startIcon={<RotateLeftIcon />}
                  onClick={handleResetClick}
                  sx={{ borderRadius: 3, textTransform: "none", py: 1 }}
                >
                  Reset
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearClick}
                  sx={{ borderRadius: 3, textTransform: "none", py: 1 }}
                >
                  Clear Board
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Solver Controls */}
          <Card className="glass-panel" sx={{ borderRadius: "12px" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <SpeedIcon color="secondary" /> Solver Engine
              </Typography>

              {/* Speed Slider */}
              <Box sx={{ px: 1, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    Visualizer Delay:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "secondary.main" }}>
                    {visualSpeed} ms ({getSpeedLabel(visualSpeed)})
                  </Typography>
                </Stack>
                <Slider
                  value={getSliderValue(visualSpeed)}
                  onChange={(e, val) => setVisualSpeed(getDelayFromSlider(val))}
                  min={0}
                  max={3}
                  step={null}
                  marks={[
                    { value: 0, label: "Turbo" },
                    { value: 1, label: "Fast" },
                    { value: 2, label: "Med" },
                    { value: 3, label: "Slow" },
                  ]}
                  disabled={!isSolving}
                  color="secondary"
                  sx={{
                    "& .MuiSlider-markLabel": {
                      color: "text.secondary",
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </Box>

              {/* Solver Action Buttons */}
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2}>
                  {/* Visual Solve Button */}
                  {!isSolving || isPaused ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<PlayArrowIcon />}
                      onClick={startVisualSolve}
                      sx={{
                        borderRadius: 3.5,
                        textTransform: "none",
                        py: 1.2,
                        fontWeight: 700,
                        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                      }}
                    >
                      {isPaused ? "Resume" : "Visual Solve"}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<PauseIcon />}
                      onClick={pauseVisualSolve}
                      sx={{ borderRadius: 3.5, textTransform: "none", py: 1.2, fontWeight: 700 }}
                    >
                      Pause
                    </Button>
                  )}

                  {/* Stop Button */}
                  <Button
                    variant="outlined"
                    color="inherit"
                    disabled={!isSolving}
                    onClick={stopVisualSolve}
                    sx={{
                      borderRadius: 3.5,
                      minWidth: 54,
                      borderColor: "var(--card-border)",
                      "&:hover": { borderColor: "var(--primary-color)" },
                    }}
                  >
                    <StopIcon />
                  </Button>
                </Stack>

                {/* Instant Solve Button */}
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={<FlashOnIcon />}
                  onClick={handleInstantSolve}
                  disabled={isSolving}
                  sx={{
                    borderRadius: 3.5,
                    textTransform: "none",
                    py: 1.2,
                    fontWeight: 700,
                    boxShadow: "0 4px 14px rgba(168, 85, 247, 0.4)",
                  }}
                >
                  Instant Solve (⚡)
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* On-screen Keypad */}
          <Card className="glass-panel" sx={{ borderRadius: "12px" }}>
            <CardContent sx={{ p: 3 }}>
              <Tooltip title="Click a cell inside the grid, then click keypad buttons to enter digits. Preset cells are locked." arrow>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                  }}
                >
                  <BackspaceIcon color="action" /> Interactive Keypad
                  <InfoOutlinedIcon fontSize="small" sx={{ opacity: 0.5 }} />
                </Typography>
              </Tooltip>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 1.2,
                  justifyContent: "center",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleKeypadClick(num)}
                    disabled={isSolving || !focusedCell}
                    sx={{
                      minWidth: 0,
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      borderWidth: "1.5px",
                      "&:hover": { borderWidth: "1.5px" },
                    }}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleKeypadClick(0)}
                  disabled={isSolving || !focusedCell}
                  sx={{
                    minWidth: 0,
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <BackspaceIcon fontSize="small" />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Stack>

      {/* Success Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            p: 2,
            maxWidth: 320,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Sudoku Solved!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
            The algorithm successfully solved this puzzle.
          </Typography>
          <Stack spacing={1.5} sx={{ p: 2, background: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Solve Mode</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {solveTime < 100 && backtracks === 0 ? "Instant Solver" : "Visual Solver"}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Time Elapsed</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.light" }}>{solveTime} ms</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Backtracks</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "secondary.light" }}>{backtracks}</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: 3, py: 1, fontWeight: 700 }}
          >
            Awesome!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          variant="filled"
          sx={{ borderRadius: 3, width: "100%", fontWeight: 600 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SudokuSolverComponent;
