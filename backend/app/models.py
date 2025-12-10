import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


class DayOfWeek(str, enum.Enum):
    LUNES = "Lunes"
    MARTES = "Martes"
    MIERCOLES = "Miércoles"
    JUEVES = "Jueves"
    VIERNES = "Viernes"
    SABADO = "Sábado"
    DOMINGO = "Domingo"


class Exercise(SQLModel, table=True):
    __tablename__ = "exercise"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    day_of_week: DayOfWeek = Field(index=True, nullable=False)
    series: int = Field(nullable=False)
    repetitions: int = Field(nullable=False)
    weight: Optional[float] = Field(default=None, nullable=True)
    notes: Optional[str] = Field(default=None)
    order: int = Field(default=1, nullable=False)
    routine_id: int = Field(foreign_key="routine.id", nullable=False)

    routine: Optional["Routine"] = Relationship(back_populates="exercises")


class Routine(SQLModel, table=True):
    __tablename__ = "routine"
    __table_args__ = (UniqueConstraint("name", name="uq_routine_name"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    exercises: list[Exercise] = Relationship(
        back_populates="routine",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "order_by": "Exercise.order",
        },
    )
