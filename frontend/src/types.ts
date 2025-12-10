export type DayOfWeek =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

export interface Exercise {
  id?: number;
  name: string;
  day_of_week: DayOfWeek;
  series: number;
  repetitions: number;
  weight?: number | null;
  notes?: string | null;
  order: number;
  routine_id?: number;
}

export interface Routine {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  exercises: Exercise[];
}

export interface RoutinePayload {
  name: string;
  description?: string | null;
  exercises: Exercise[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface PaginatedRoutines {
  items: Routine[];
  meta: PaginationMeta;
}

export interface Stats {
  total_routines: number;
  total_exercises: number;
  exercises_per_day: Record<string, number>;
}
