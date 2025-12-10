"""
Script de seeds para poblar la base con datos de ejemplo.
Ejecutar con el entorno configurado (DATABASE_URL apuntando a PostgreSQL):

    python scripts/seed.py
"""
from datetime import datetime

from sqlmodel import Session

from app.database import engine, init_db
from app.models import DayOfWeek, Exercise, Routine


def main() -> None:
    init_db()
    with Session(engine) as session:
        if session.query(Routine).count() > 0:
            print("La base ya tiene datos, no se agregan seeds.")
            return

        rutina = Routine(
            name="Fuerza 3x",
            description="Full body fuerza 3 veces por semana",
            created_at=datetime.utcnow(),
            exercises=[
                Exercise(
                    name="Sentadilla",
                    day_of_week=DayOfWeek.LUNES,
                    series=5,
                    repetitions=5,
                    weight=80,
                    notes="Progresión semanal",
                    order=1,
                ),
                Exercise(
                    name="Press banca",
                    day_of_week=DayOfWeek.MIERCOLES,
                    series=5,
                    repetitions=5,
                    weight=70,
                    order=1,
                ),
                Exercise(
                    name="Peso muerto",
                    day_of_week=DayOfWeek.VIERNES,
                    series=3,
                    repetitions=5,
                    weight=100,
                    order=1,
                ),
            ],
        )

        session.add(rutina)
        session.commit()
        print("Seeds creados: rutina 'Fuerza 3x'")


if __name__ == "__main__":
    main()
