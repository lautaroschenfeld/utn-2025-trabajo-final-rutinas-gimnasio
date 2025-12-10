import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 360,
        background: "#1c1c1c",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={onView}
      role="button"
      tabIndex={0}
    >
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthIcon fontSize="small" color="primary" />
            <Typography variant="caption" color="text.secondary">
              Creada el {new Date(routine.created_at).toLocaleDateString()}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
            sx={{ color: "#e04300" }}
          >
            <MoreVertIcon />
          </IconButton>
        </Stack>
        <Typography variant="h6" gutterBottom>
          {routine.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {routine.description || "Sin descripción"}
        </Typography>
        <Box sx={{ mt: "auto", display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          {days.length > 0 ? (
            days.map((day) => (
              <Chip
                key={day}
                label={day}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ borderRadius: 10 }}
              />
            ))
          ) : (
            <Chip label="Sin ejercicios" size="small" color="warning" variant="outlined" />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {routine.exercises.length} ejercicio{routine.exercises.length === 1 ? "" : "s"}
        </Typography>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(null);
            onEdit();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(null);
            onDuplicate();
          }}
        >
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicar
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(null);
            onDelete();
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>
    </Card>
  );
}
