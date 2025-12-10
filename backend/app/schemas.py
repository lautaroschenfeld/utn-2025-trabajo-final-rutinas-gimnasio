from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator

from .models import DayOfWeek


class ExerciseBase(BaseModel):
    name: str = Field(..., min_length=1)
    day_of_week: DayOfWeek
    series: int = Field(..., gt=0)
    repetitions: int = Field(..., gt=0)
    weight: Optional[float] = Field(default=None, gt=0)
    notes: Optional[str] = None
    order: int = Field(default=1, gt=0)

    @validator("name")
    def strip_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El nombre del ejercicio no puede estar vacío")
        return cleaned


class ExerciseIn(ExerciseBase):
    id: Optional[int] = Field(default=None)


class ExerciseRead(ExerciseBase):
    id: int
    routine_id: int

    class Config:
        orm_mode = True


class StatsRead(BaseModel):
    total_routines: int
    total_exercises: int
    exercises_per_day: Dict[str, int]


class RoutineBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None

    @validator("name")
    def strip_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El nombre de la rutina no puede estar vacío")
        return cleaned


class RoutineCreate(RoutineBase):
    exercises: List[ExerciseIn] = Field(default_factory=list)


class RoutineUpdate(RoutineBase):
    exercises: List[ExerciseIn] = Field(default_factory=list)


class RoutineRead(RoutineBase):
    id: int
    created_at: datetime
    exercises: List[ExerciseRead] = Field(default_factory=list)

    class Config:
        orm_mode = True


class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int


class PaginatedRoutineRead(BaseModel):
    items: List[RoutineRead]
    meta: PaginationMeta

    @classmethod
    def from_query(
        cls,
        items: List[RoutineRead],
        total: int,
        page: int,
        page_size: int,
        pages: int,
    ) -> "PaginatedRoutineRead":
        return cls(
            items=items,
            meta=PaginationMeta(total=total, page=page, page_size=page_size, pages=pages),
        )
