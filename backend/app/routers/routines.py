from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from ..database import get_session
from ..models import DayOfWeek, Exercise, Routine
from ..schemas import (
    ExerciseIn,
    ExerciseRead,
    PaginatedRoutineRead,
    RoutineCreate,
    RoutineRead,
    RoutineUpdate,
    StatsRead,
)
from ..security import get_auth_dependency

router = APIRouter(
    prefix="/rutinas",
    tags=["Rutinas"],
    dependencies=[get_auth_dependency()],
)


def _paginate_query(
    session: Session,
    base_query,
    page: int,
    page_size: int,
):
    total = session.exec(select(func.count()).select_from(base_query.subquery())).one()
    items = (
        session.exec(
            base_query.offset((page - 1) * page_size).limit(page_size)
        ).unique().all()
    )
    pages = (total + page_size - 1) // page_size if total else 1
    return total, pages, items


@router.get("", response_model=PaginatedRoutineRead)
def list_routines(
    page: int = Query(1, gt=0),
    page_size: int = Query(20, gt=0, le=100),
    dia: Optional[DayOfWeek] = Query(default=None, description="Filtrar por día de la semana"),
    session: Session = Depends(get_session),
) -> PaginatedRoutineRead:
    base_query = select(Routine).options(selectinload(Routine.exercises))
    if dia:
        base_query = base_query.join(Routine.exercises).where(Exercise.day_of_week == dia)

    total, pages, routines = _paginate_query(session, base_query, page, page_size)
    return PaginatedRoutineRead.from_query(routines, total, page, page_size, pages)


@router.get("/buscar", response_model=PaginatedRoutineRead)
def search_routines(
    nombre: str = Query("", description="Texto a buscar (parcial, case-insensitive)"),
    page: int = Query(1, gt=0),
    page_size: int = Query(20, gt=0, le=100),
    dia: Optional[DayOfWeek] = Query(default=None, description="Filtrar por día de la semana"),
    session: Session = Depends(get_session),
) -> PaginatedRoutineRead:
    term = nombre.strip()
    if not term:
        return PaginatedRoutineRead.from_query([], 0, page, page_size, 0)

    base_query = (
        select(Routine)
        .options(selectinload(Routine.exercises))
        .where(func.lower(Routine.name).like(f"%{term.lower()}%"))
    )
    if dia:
        base_query = base_query.join(Routine.exercises).where(Exercise.day_of_week == dia)

    total, pages, routines = _paginate_query(session, base_query, page, page_size)
    return PaginatedRoutineRead.from_query(routines, total, page, page_size, pages)


@router.get("/estadisticas", response_model=StatsRead)
def get_stats(session: Session = Depends(get_session)) -> StatsRead:
    total_routines = session.exec(select(func.count(Routine.id))).one()
    total_exercises = session.exec(select(func.count(Exercise.id))).one()
    per_day = session.exec(
        select(Exercise.day_of_week, func.count(Exercise.id)).group_by(Exercise.day_of_week)
    ).all()
    return StatsRead(
        total_routines=total_routines,
        total_exercises=total_exercises,
        exercises_per_day={day.value: count for day, count in per_day},
    )


@router.get("/export/csv")
def export_csv(session: Session = Depends(get_session)) -> StreamingResponse:
    import csv
    import io

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "rutina_id",
            "rutina_nombre",
            "descripcion",
            "creada",
            "ejercicio_id",
            "ejercicio_nombre",
            "dia",
            "series",
            "repeticiones",
            "peso",
            "notas",
            "orden",
        ]
    )

    routines = session.exec(
        select(Routine).options(selectinload(Routine.exercises))
    ).all()
    for routine in routines:
        for exercise in routine.exercises:
            writer.writerow(
                [
                    routine.id,
                    routine.name,
                    routine.description or "",
                    routine.created_at.isoformat(),
                    exercise.id,
                    exercise.name,
                    exercise.day_of_week,
                    exercise.series,
                    exercise.repetitions,
                    exercise.weight or "",
                    exercise.notes or "",
                    exercise.order,
                ]
            )

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=rutinas.csv"},
    )


@router.get("/{routine_id}", response_model=RoutineRead)
def get_routine(routine_id: int, session: Session = Depends(get_session)) -> RoutineRead:
    routine = session.exec(
        select(Routine)
        .options(selectinload(Routine.exercises))
        .where(Routine.id == routine_id)
    ).first()

    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rutina no encontrada")

    return routine


@router.post("", response_model=RoutineRead, status_code=status.HTTP_201_CREATED)
def create_routine(
    payload: RoutineCreate, session: Session = Depends(get_session)
) -> RoutineRead:
    existing = session.exec(
        select(Routine).where(func.lower(Routine.name) == func.lower(payload.name))
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una rutina con ese nombre",
        )

    routine = Routine(name=payload.name, description=payload.description)
    for exercise_data in payload.exercises:
        routine.exercises.append(
            Exercise(
                name=exercise_data.name,
                day_of_week=exercise_data.day_of_week,
                series=exercise_data.series,
                repetitions=exercise_data.repetitions,
                weight=exercise_data.weight,
                notes=exercise_data.notes,
                order=exercise_data.order,
            )
        )

    session.add(routine)
    session.commit()
    session.refresh(routine)
    return routine


@router.put("/{routine_id}", response_model=RoutineRead)
def update_routine(
    routine_id: int, payload: RoutineUpdate, session: Session = Depends(get_session)
) -> RoutineRead:
    routine = session.exec(
        select(Routine)
        .options(selectinload(Routine.exercises))
        .where(Routine.id == routine_id)
    ).first()

    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rutina no encontrada")

    duplicate = session.exec(
        select(Routine).where(
            func.lower(Routine.name) == func.lower(payload.name), Routine.id != routine_id
        )
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe otra rutina con ese nombre",
        )

    routine.name = payload.name
    routine.description = payload.description

    existing_by_id = {exercise.id: exercise for exercise in routine.exercises if exercise.id}
    received_ids = set()

    for exercise_data in payload.exercises:
        if exercise_data.id:
            if exercise_data.id not in existing_by_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ejercicio con id {exercise_data.id} no pertenece a la rutina",
                )
            exercise = existing_by_id[exercise_data.id]
            exercise.name = exercise_data.name
            exercise.day_of_week = exercise_data.day_of_week
            exercise.series = exercise_data.series
            exercise.repetitions = exercise_data.repetitions
            exercise.weight = exercise_data.weight
            exercise.notes = exercise_data.notes
            exercise.order = exercise_data.order
            received_ids.add(exercise_data.id)
        else:
            routine.exercises.append(
                Exercise(
                    name=exercise_data.name,
                    day_of_week=exercise_data.day_of_week,
                    series=exercise_data.series,
                    repetitions=exercise_data.repetitions,
                    weight=exercise_data.weight,
                    notes=exercise_data.notes,
                    order=exercise_data.order,
                )
            )

    for exercise_id, exercise in existing_by_id.items():
        if exercise_id not in received_ids:
            session.delete(exercise)

    session.add(routine)
    session.commit()
    session.refresh(routine)
    return routine


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_routine(routine_id: int, session: Session = Depends(get_session)) -> Response:
    routine = session.get(Routine, routine_id)
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rutina no encontrada")

    session.delete(routine)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{routine_id}/duplicar",
    response_model=RoutineRead,
    status_code=status.HTTP_201_CREATED,
)
def duplicate_routine(
    routine_id: int,
    nuevo_nombre: Optional[str] = Query(default=None, description="Nombre opcional para la copia"),
    session: Session = Depends(get_session),
) -> RoutineRead:
    routine = session.exec(
        select(Routine)
        .options(selectinload(Routine.exercises))
        .where(Routine.id == routine_id)
    ).first()
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rutina no encontrada")

    base_name = nuevo_nombre.strip() if nuevo_nombre else f"{routine.name} (Copia)"

    candidate = base_name
    counter = 1
    while session.exec(
        select(Routine).where(func.lower(Routine.name) == func.lower(candidate))
    ).first():
        candidate = f"{base_name} #{counter}"
        counter += 1

    new_routine = Routine(name=candidate, description=routine.description)
    for exercise in routine.exercises:
        new_routine.exercises.append(
            Exercise(
                name=exercise.name,
                day_of_week=exercise.day_of_week,
                series=exercise.series,
                repetitions=exercise.repetitions,
                weight=exercise.weight,
                notes=exercise.notes,
                order=exercise.order,
            )
        )

    session.add(new_routine)
    session.commit()
    session.refresh(new_routine)
    return new_routine


@router.post(
    "/{routine_id}/ejercicios",
    response_model=ExerciseRead,
    status_code=status.HTTP_201_CREATED,
)
def add_exercise_to_routine(
    routine_id: int, exercise_data: ExerciseIn, session: Session = Depends(get_session)
) -> ExerciseRead:
    if exercise_data.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se debe enviar id al crear un ejercicio",
        )

    routine = session.get(Routine, routine_id)
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rutina no encontrada")

    exercise = Exercise(
        name=exercise_data.name,
        day_of_week=exercise_data.day_of_week,
        series=exercise_data.series,
        repetitions=exercise_data.repetitions,
        weight=exercise_data.weight,
        notes=exercise_data.notes,
        order=exercise_data.order,
        routine_id=routine_id,
    )

    session.add(exercise)
    session.commit()
    session.refresh(exercise)
    return exercise


@router.put("/ejercicios/{exercise_id}", response_model=ExerciseRead)
def update_exercise(
    exercise_id: int, exercise_data: ExerciseIn, session: Session = Depends(get_session)
) -> ExerciseRead:
    if exercise_data.id and exercise_data.id != exercise_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El id del ejercicio no coincide con la ruta",
        )

    exercise = session.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ejercicio no encontrado")

    exercise.name = exercise_data.name
    exercise.day_of_week = exercise_data.day_of_week
    exercise.series = exercise_data.series
    exercise.repetitions = exercise_data.repetitions
    exercise.weight = exercise_data.weight
    exercise.notes = exercise_data.notes
    exercise.order = exercise_data.order

    session.add(exercise)
    session.commit()
    session.refresh(exercise)
    return exercise


@router.delete("/ejercicios/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(exercise_id: int, session: Session = Depends(get_session)) -> Response:
    exercise = session.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ejercicio no encontrado")

    session.delete(exercise)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
