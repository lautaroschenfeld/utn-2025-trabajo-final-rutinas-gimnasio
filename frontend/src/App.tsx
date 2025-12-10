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
import logo from "./assets/logo.png";

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
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{ flexGrow: 1, textAlign: "center", cursor: "pointer" }}
            component={Link}
            to="/"
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 28, width: "auto", display: "block", borderRadius: 0, objectFit: "contain" }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Rutinas de Gimnasio
            </Typography>
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
              Administra tus rutinas en un solo lugar: crea, edita, busca y organiza ejercicios por día, con el contexto de tu semana siempre a mano. Duplica lo que ya funciona, guarda tus ajustes y comparte o exporta cuando lo necesites.
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
