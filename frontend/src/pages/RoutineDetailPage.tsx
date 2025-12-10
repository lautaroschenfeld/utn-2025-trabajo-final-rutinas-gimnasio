import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";

import { getRoutineById } from "../api/routines";
import RoutineDetails from "../components/RoutineDetails";
import RoutineCalendar from "../components/RoutineCalendar";
import type { Routine } from "../types";

export default function RoutineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await getRoutineById(Number(id));
        setRoutine(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la rutina.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        Volver
      </Button>
      {loading && (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {routine && (
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.05)",
            background: "#1c1c1c",
          }}
        >
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {routine.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {routine.description || "Sin descripción"}
          </Typography>

          <RoutineDetails routine={routine} />
          <RoutineCalendar routine={routine} />
        </Box>
      )}
    </Container>
  );
}
