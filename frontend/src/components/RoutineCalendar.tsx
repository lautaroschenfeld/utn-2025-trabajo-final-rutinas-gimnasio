import { Box, Grid, Typography, Paper, Stack, Chip } from "@mui/material";
import type { Routine, DayOfWeek } from "../types";

const DAYS: DayOfWeek[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

type Props = {
  routine: Routine;
};

export default function RoutineCalendar({ routine }: Props) {
  return (
    <Paper
      sx={{
        p: 2,
        mt: 3,
        background: "#1c1c1c",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Calendario semanal
      </Typography>
      <Grid container spacing={2} alignItems="stretch">
        {DAYS.map((day) => {
          const dayExercises = routine.exercises
            .filter((ex) => ex.day_of_week === day)
            .sort((a, b) => a.order - b.order);
          return (
            <Grid key={day} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: "flex" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  p: 2,
                  borderRadius: 2,
                  minHeight: 160,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#1e1e1e",
                  width: "100%",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {day}
                </Typography>
                {dayExercises.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Sin ejercicios
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {dayExercises.map((ex) => (
                      <Chip
                        key={ex.id ?? `${ex.name}-${ex.order}`}
                        label={`#${ex.order} ${ex.name} (${ex.series}x${ex.repetitions})`}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
