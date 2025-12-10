import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";

import {
  createRoutine,
  deleteRoutine,
  duplicateRoutine,
  exportCsv,
  getRoutines,
  getStats,
  searchRoutines,
  updateRoutine,
} from "../api/routines";
import RoutineForm from "../components/RoutineForm";
import RoutineList from "../components/RoutineList";
import SearchBar from "../components/SearchBar";
import { useDebounce } from "../hooks/useDebounce";
import type {
  DayOfWeek,
  PaginatedRoutines,
  Routine,
  RoutinePayload,
  Stats,
} from "../types";
import { saveAs } from "file-saver";

const DAYS: DayOfWeek[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [meta, setMeta] = useState<PaginatedRoutines["meta"] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | "">("");
  const [searchResults, setSearchResults] = useState<Routine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDelete, setConfirmDelete] = useState<Routine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [stats, setStats] = useState<Stats | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [hasAnyRoutine, setHasAnyRoutine] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, 350);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRoutines(page, pageSize, selectedDay || undefined);
        setRoutines(data.items);
        setMeta(data.meta);
        if (!selectedDay && data.meta.total > 0) {
          setHasAnyRoutine(true);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las rutinas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, selectedDay]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
        if (data.total_routines > 0) {
          setHasAnyRoutine(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedTerm.trim()) {
        setSearchResults(null);
        setSearching(false);
        setPage(1);
        return;
      }
      try {
        setSearching(true);
        const results = await searchRoutines(
          debouncedTerm,
          page,
          pageSize,
          selectedDay || undefined
        );
        setSearchResults(results.items);
        setMeta(results.meta);
      } catch (err) {
        console.error(err);
        setError("No se pudo ejecutar la búsqueda.");
      } finally {
        setSearching(false);
      }
    };

    runSearch();
  }, [debouncedTerm, page, pageSize, selectedDay]);

  const refreshStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (payload: RoutinePayload) => {
    try {
      setSubmitting(true);
      if (selectedRoutine) {
        const updated = await updateRoutine(selectedRoutine.id, payload);
        setRoutines((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setSelectedRoutine(null);
        setSnackbar({
          open: true,
          message: "Rutina actualizada con éxito.",
          severity: "success",
        });
      } else {
        const created = await createRoutine(payload);
        setRoutines((prev) => [created, ...prev]);
        setSnackbar({ open: true, message: "Rutina creada correctamente.", severity: "success" });
      }
      setSearchResults(null);
      setSearchTerm("");
      setPage(1);
      refreshStats();
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Hubo un error al guardar la rutina.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteRoutine(confirmDelete.id);
      setRoutines((prev) => prev.filter((r) => r.id !== confirmDelete.id));
      setSearchResults((prev) => (prev ? prev.filter((r) => r.id !== confirmDelete.id) : prev));
      setSnackbar({ open: true, message: "Rutina eliminada.", severity: "success" });
      refreshStats();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "No se pudo eliminar la rutina.", severity: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleDuplicate = async (routine: Routine) => {
    try {
      const duplicated = await duplicateRoutine(routine.id);
      setRoutines((prev) => [duplicated, ...prev]);
      setSnackbar({ open: true, message: "Rutina duplicada.", severity: "success" });
      refreshStats();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "No se pudo duplicar la rutina.", severity: "error" });
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await exportCsv();
      saveAs(blob, "rutinas.csv");
      setSnackbar({ open: true, message: "Exportado a CSV.", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "No se pudo exportar el CSV.", severity: "error" });
    }
  };

  const routinesToShow = searchResults !== null ? searchResults : routines;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                background: "#1c1c1c",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
                  <div>
                    <Typography variant="h5" fontWeight={700}>
                      Rutinas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gestiona, busca y explora tus rutinas. La búsqueda es en tiempo real.
                    </Typography>
                  </div>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={() => { setSelectedRoutine(null); setOpenForm(true); }}>
                      Nueva rutina
                    </Button>
                    <Button startIcon={<DownloadIcon />} onClick={handleExportCsv} variant="outlined">
                      Exportar CSV
                    </Button>
                  </Stack>
                </Stack>
                <SearchBar
                  value={searchTerm}
                  onChange={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                  }}
                  placeholder="Buscar por nombre..."
                  loading={searching}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                  <FormControl fullWidth>
                    <InputLabel>Día</InputLabel>
                    <Select
                      label="Día"
                      value={selectedDay}
                      onChange={(e) => {
                        setSelectedDay(e.target.value as DayOfWeek | "");
                        setPage(1);
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {DAYS.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                {stats && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      borderRadius: 3,
                      background: "#1e1e1e",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} mb={1}>
                      Estadísticas
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`Rutinas: ${stats.total_routines}`} color="primary" />
                      <Chip label={`Ejercicios: ${stats.total_exercises}`} color="primary" />
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>

            {error && (
              <Alert
                severity="error"
                icon={false}
                sx={{
                  background: "#1c1c1c",
                  color: "#e04300",
                  border: "1px solid #e04300",
                }}
              >
                {error}
              </Alert>
            )}

            <RoutineList
              routines={routinesToShow}
              onView={(id) => navigate(`/rutinas/${id}`)}
              onEdit={(routine) => { setSelectedRoutine(routine); setOpenForm(true); }}
              onDelete={(routine) => setConfirmDelete(routine)}
              onDuplicate={handleDuplicate}
              loading={loading}
              emptyMessage={
                searchResults !== null
                  ? "No se encontraron rutinas con ese nombre."
                  : selectedDay && hasAnyRoutine
                    ? "Aún no hay rutinas creadas para este día."
                    : "Aún no hay rutinas creadas."
              }
            />
            {meta && meta.pages > 1 && (
              <Stack direction="row" justifyContent="center">
                <Pagination
                  count={meta.pages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Stack>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Eliminar rutina</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que deseas eliminar la rutina "{confirmDelete?.name}"? Esta acción no se puede
            deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button color="primary" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedRoutine ? "Editar rutina" : "Crear rutina"}</DialogTitle>
        <DialogContent>
          <RoutineForm
            onSubmit={handleSubmit}
            initialData={selectedRoutine}
            submitting={submitting}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          icon={false}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{
            width: "100%",
            background: "#1c1c1c",
            color: "#e04300",
            border: "1px solid #e04300",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
