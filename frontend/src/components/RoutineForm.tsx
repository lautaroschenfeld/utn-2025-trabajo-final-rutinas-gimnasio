import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import {
  DragDropContext,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import ExerciseFields from "./ExerciseFields";
import type { DayOfWeek, Exercise, Routine, RoutinePayload } from "../types";

type Props = {
  onSubmit: (payload: RoutinePayload) => Promise<void>;
  initialData?: Routine | null;
  submitting?: boolean;
  onCancel?: () => void;
};

const DAY_ORDER: DayOfWeek[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const emptyExercise = (): Exercise => ({
  name: "",
  day_of_week: "Lunes",
  series: 3,
  repetitions: 10,
  weight: null,
  notes: "",
  order: 1,
});

export default function RoutineForm({
  onSubmit,
  initialData,
  submitting = false,
  onCancel,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? "");
      setExercises(
        initialData.exercises
          .map((ex) => ({ ...ex, weight: ex.weight ?? null, notes: ex.notes ?? "" }))
          .sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week))
      );
    } else {
      setName("");
      setDescription("");
      setExercises([emptyExercise()]);
    }
  }, [initialData]);

  const handleExerciseChange = (index: number, updated: Exercise) => {
    const next = [...exercises];
    next[index] = updated;
    setExercises(next);
  };

  const handleAddExercise = () => {
    setExercises((prev) => [...prev, { ...emptyExercise(), order: prev.length + 1 }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    setExercises((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[targetIndex];
      next[targetIndex] = { ...next[index], order: targetIndex + 1 };
      next[index] = { ...temp, order: index + 1 };
      return next;
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(exercises);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    const withOrder = reordered.map((ex, idx) => ({ ...ex, order: idx + 1 }));
    setExercises(withOrder);
  };

  const normalizeExercises = (list: Exercise[]): Exercise[] => {
    return DAY_ORDER.flatMap((day) => {
      const items = list.filter((ex) => ex.day_of_week === day && ex.name.trim());
      return items
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((ex, idx) => ({
          ...ex,
          order: idx + 1,
          notes: ex.notes?.trim() || "",
          weight: ex.weight === null || ex.weight === undefined ? null : ex.weight,
        }));
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("El nombre de la rutina es obligatorio.");
      return;
    }

    const validExercises = normalizeExercises(exercises);
    if (validExercises.length === 0) {
      setError("Agrega al menos un ejercicio con nombre.");
      return;
    }
    const invalid = validExercises.find(
      (ex) => ex.series <= 0 || ex.repetitions <= 0 || (ex.weight ?? 0) < 0
    );
    if (invalid) {
      setError("Series, repeticiones y peso deben ser valores válidos y positivos.");
      return;
    }

    setError(null);
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      exercises: validExercises,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <div>
            <Typography variant="h5" fontWeight={700}>
              {initialData ? "Editar rutina" : "Crear nueva rutina"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define la rutina y organiza los ejercicios por día y orden.
            </Typography>
          </div>
          {onCancel && (
            <Button color="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Nombre de la rutina"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={3}
          fullWidth
        />

        <Divider flexItem />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            Ejercicios
          </Typography>
          <Button
            onClick={handleAddExercise}
            startIcon={<AddCircleOutlineIcon />}
            variant="outlined"
            color="primary"
          >
            Agregar ejercicio
          </Button>
        </Stack>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="exercises">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {exercises.map((exercise, index) => (
                  <Draggable
                    key={exercise.id ? `ex-${exercise.id}` : `new-${index}`}
                    draggableId={exercise.id ? `ex-${exercise.id}` : `new-${index}`}
                    index={index}
                  >
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                      >
                        <ExerciseFields
                          exercise={exercise}
                          onChange={(updated) => handleExerciseChange(index, updated)}
                          onRemove={() => handleRemoveExercise(index)}
                          onMoveUp={() => moveExercise(index, "up")}
                          onMoveDown={() => moveExercise(index, "down")}
                          disableMoveUp={index === 0}
                          disableMoveDown={index === exercises.length - 1}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={submitting}
          sx={{ alignSelf: "flex-end", px: 3 }}
        >
          {initialData ? "Guardar cambios" : "Guardar rutina"}
        </Button>
      </Stack>
    </Box>
  );
}
