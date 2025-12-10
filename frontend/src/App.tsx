import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RoutineDetailPage from "./pages/RoutineDetailPage";

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#121212",
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: "blur(6px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            Rutinas de Gimnasio
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/" color="inherit">
              Inicio
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {isHome && (
        <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
          <Box
            sx={{
              p: 4,
              borderRadius: 3,
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Planifica, ajusta y visualiza tus rutinas
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={600}>
              CRUD completo, búsqueda en vivo y vista por día de la semana, todo en una sola interfaz.
            </Typography>
          </Box>
        </Container>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rutinas/:id" element={<RoutineDetailPage />} />
      </Routes>
    </Box>
  );
}

export default App;
