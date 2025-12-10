import { Grid, Skeleton, Typography } from "@mui/material";
import type { Routine } from "../types";
import RoutineCard from "./RoutineCard";

type Props = {
  routines: Routine[];
  onView: (id: number) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (routine: Routine) => void;
  onDuplicate: (routine: Routine) => void;
  loading?: boolean;
  emptyMessage?: string;
};

export default function RoutineList({
  routines,
  onDelete,
  onEdit,
  onView,
  onDuplicate,
  loading = false,
  emptyMessage = "No hay rutinas registradas.",
}: Props) {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(3)].map((_, idx) => (
          <Grid key={idx} size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (routines.length === 0) {
    return <Typography color="text.secondary">{emptyMessage}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {routines.map((routine) => (
        <Grid key={routine.id} size={{ xs: 12, md: 6 }}>
          <RoutineCard
            routine={routine}
            onView={() => onView(routine.id)}
            onEdit={() => onEdit(routine)}
            onDelete={() => onDelete(routine)}
            onDuplicate={() => onDuplicate(routine)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
