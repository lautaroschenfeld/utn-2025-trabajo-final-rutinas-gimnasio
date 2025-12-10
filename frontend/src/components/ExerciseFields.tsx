import { Box, IconButton, MenuItem, Paper, Stack, TextField, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { Exercise, DayOfWeek } from "../types";

const DAY_OPTIONS: DayOfWeek[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

type Props = {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
};

export default function ExerciseFields({
  exercise,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  disableMoveDown,
  disableMoveUp,
}: Props) {
  const handleChange = (field: keyof Exercise, value: unknown) => {
    onChange({ ...exercise, [field]: value });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#1c1c1c",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Subir">
            <span>
              <IconButton size="small" onClick={onMoveUp} disabled={disableMoveUp} color="primary">
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bajar">
            <span>
              <IconButton
                size="small"
                onClick={onMoveDown}
                disabled={disableMoveDown}
                color="primary"
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Tooltip title="Eliminar ejercicio">
          <IconButton color="primary" onClick={onRemove}>
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1.4fr 1fr 0.8fr 0.8fr",
          },
          alignItems: "center",
        }}
      >
        <Box>
          <TextField
            required
            fullWidth
            label="Nombre del ejercicio"
            value={exercise.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </Box>
        <Box>
          <TextField
            select
            fullWidth
            label="Día"
            value={exercise.day_of_week}
            onChange={(e) => handleChange("day_of_week", e.target.value as DayOfWeek)}
          >
            {DAY_OPTIONS.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box>
          <TextField
            fullWidth
            required
            type="number"
            label="Series"
            inputProps={{ min: 1 }}
            value={exercise.series}
            onChange={(e) => handleChange("series", Number(e.target.value))}
          />
        </Box>
        <Box>
          <TextField
            fullWidth
            required
            type="number"
            label="Reps"
            inputProps={{ min: 1 }}
            value={exercise.repetitions}
            onChange={(e) => handleChange("repetitions", Number(e.target.value))}
          />
        </Box>
        <Box sx={{ gridColumn: { xs: "span 1", sm: "span 1", md: "span 1" } }}>
          <TextField
            fullWidth
            type="number"
            label="Peso (kg)"
            inputProps={{ min: 0 }}
            value={exercise.weight ?? ""}
            onChange={(e) =>
              handleChange("weight", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </Box>
        <Box sx={{ gridColumn: { xs: "span 1", sm: "span 1", md: "span 3" } }}>
          <TextField
            fullWidth
            label="Notas"
            value={exercise.notes ?? ""}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </Box>
      </Box>
    </Paper>
  );
}
