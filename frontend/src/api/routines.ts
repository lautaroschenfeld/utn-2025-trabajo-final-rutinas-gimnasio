import api from "./client";
import type {
  PaginatedRoutines,
  Routine,
  RoutinePayload,
  Stats,
  DayOfWeek,
} from "../types";

export const getRoutines = async (
  page = 1,
  pageSize = 10,
  day?: DayOfWeek
): Promise<PaginatedRoutines> => {
  const { data } = await api.get<PaginatedRoutines>("/rutinas", {
    params: { page, page_size: pageSize, dia: day },
  });
  return data;
};

export const searchRoutines = async (
  term: string,
  page = 1,
  pageSize = 10,
  day?: DayOfWeek
): Promise<PaginatedRoutines> => {
  const { data } = await api.get<PaginatedRoutines>("/rutinas/buscar", {
    params: { nombre: term, page, page_size: pageSize, dia: day },
  });
  return data;
};

export const getRoutineById = async (id: number): Promise<Routine> => {
  const { data } = await api.get<Routine>(`/rutinas/${id}`);
  return data;
};

export const createRoutine = async (payload: RoutinePayload): Promise<Routine> => {
  const { data } = await api.post<Routine>("/rutinas", payload);
  return data;
};

export const updateRoutine = async (
  id: number,
  payload: RoutinePayload
): Promise<Routine> => {
  const { data } = await api.put<Routine>(`/rutinas/${id}`, payload);
  return data;
};

export const deleteRoutine = async (id: number): Promise<void> => {
  await api.delete(`/rutinas/${id}`);
};

export const duplicateRoutine = async (id: number): Promise<Routine> => {
  const { data } = await api.post<Routine>(`/rutinas/${id}/duplicar`);
  return data;
};

export const getStats = async (): Promise<Stats> => {
  const { data } = await api.get<Stats>("/rutinas/estadisticas");
  return data;
};

export const exportCsv = async (): Promise<Blob> => {
  const { data } = await api.get("/rutinas/export/csv", { responseType: "blob" });
  return data;
};
