import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import type { Routine } from "../types";

type Props = {
  routine: Routine;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
   onDuplicate: () => void;
};

export default function RoutineCard({ routine, onView, onEdit, onDelete, onDuplicate }: Props) {
  const days = Array.from(new Set(routine.exercises.map((ex) => ex.day_of_week)));

  return (
    <Card
      sx={{
        height: "100%",
        background: "#1c1c1c",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <CalendarMonthIcon fontSize="small" color="primary" />
          <Typography variant="caption" color="text.secondary">
            Creada {new Date(routine.created_at).toLocaleDateString()}
          </Typography>
        </Stack>
        <Typography variant="h6" gutterBottom>
          {routine.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" minHeight={50} mb={2}>
          {routine.description || "Sin descripción"}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
          {days.length > 0 ? (
            days.map((day) => (
              <Chip
                key={day}
                label={day}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))
          ) : (
            <Chip label="Sin ejercicios" size="small" color="warning" variant="outlined" />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {routine.exercises.length} ejercicio(s)
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button startIcon={<VisibilityIcon />} onClick={onView}>
          Ver
        </Button>
        <Button startIcon={<EditIcon />} onClick={onEdit}>
          Editar
        </Button>
        <Button startIcon={<ContentCopyIcon />} onClick={onDuplicate}>
          Duplicar
        </Button>
        <Button color="primary" startIcon={<DeleteOutlineIcon />} onClick={onDelete}>
          Eliminar
        </Button>
      </CardActions>
    </Card>
  );
}
