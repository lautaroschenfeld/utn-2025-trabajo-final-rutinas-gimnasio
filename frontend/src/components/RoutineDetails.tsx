import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import NotesIcon from "@mui/icons-material/Notes";
import TimelineIcon from "@mui/icons-material/Timeline";

import type { DayOfWeek, Routine } from "../types";

const DAY_ORDER: DayOfWeek[] = [
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

export default function RoutineDetails({ routine }: Props) {
  return (
    <Stack spacing={3}>
      {DAY_ORDER.map((day) => {
        const exercises = routine.exercises
          .filter((ex) => ex.day_of_week === day)
          .sort((a, b) => a.order - b.order);
        if (exercises.length === 0) return null;

        return (
          <Box key={day} sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)", background: "#1c1c1c" }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <Chip label={day} color="primary" variant="outlined" sx={{ borderRadius: 2 }} />
              <Typography variant="caption" color="text.secondary">
                {exercises.length} ejercicio(s)
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {exercises.map((ex) => (
                <Box
                  key={ex.id ?? `${ex.name}-${ex.order}`}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "#1e1e1e",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        #{ex.order} {ex.name}
                      </Typography>
                      <Chip size="small" label={`${ex.series} x ${ex.repetitions}`} />
                      {ex.weight !== null && ex.weight !== undefined && (
                        <Chip
                          size="small"
                          color="secondary"
                          label={`${ex.weight} kg`}
                          icon={<FitnessCenterIcon fontSize="small" />}
                        />
                      )}
                    </Stack>
                  </Stack>
                  {ex.notes && (
                    <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                      <NotesIcon fontSize="small" color="disabled" />
                      <Typography variant="body2" color="text.secondary">
                        {ex.notes}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
