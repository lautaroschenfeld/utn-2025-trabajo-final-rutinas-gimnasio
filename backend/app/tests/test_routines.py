import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from app.main import app  # noqa: E402
from app import database  # noqa: E402
from app.database import get_session  # noqa: E402
from app.models import DayOfWeek  # noqa: E402


@pytest.fixture(name="engine")
def engine_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    database.engine = engine
    SQLModel.metadata.create_all(engine)
    yield engine


@pytest.fixture(name="client")
def client_fixture(engine):
    def get_session_override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def test_create_routine_with_exercises(client: TestClient):
    payload = {
        "name": "Rutina Fuerza",
        "description": "Fuerza 3x semana",
        "exercises": [
            {
                "name": "Sentadilla",
                "day_of_week": DayOfWeek.LUNES.value,
                "series": 5,
                "repetitions": 5,
                "weight": 100,
                "notes": "Progresión semanal",
                "order": 1,
            },
            {
                "name": "Press banca",
                "day_of_week": DayOfWeek.MIERCOLES.value,
                "series": 5,
                "repetitions": 5,
                "weight": 80,
                "notes": None,
                "order": 1,
            },
        ],
    }
    response = client.post("/api/rutinas", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == payload["name"]
    assert len(data["exercises"]) == 2


def test_unique_routine_name(client: TestClient):
    payload = {
        "name": "Full Body",
        "description": None,
        "exercises": [],
    }
    first = client.post("/api/rutinas", json=payload)
    assert first.status_code == 201

    duplicate = client.post("/api/rutinas", json=payload)
    assert duplicate.status_code == 400
    assert "Ya existe" in duplicate.json()["detail"]


def test_update_routine_replaces_exercises(client: TestClient):
    create_payload = {
        "name": "Rutina Base",
        "description": "Inicial",
        "exercises": [
            {
                "name": "Remo",
                "day_of_week": DayOfWeek.LUNES.value,
                "series": 4,
                "repetitions": 10,
                "weight": 40,
                "notes": "",
                "order": 1,
            },
            {
                "name": "Curl",
                "day_of_week": DayOfWeek.LUNES.value,
                "series": 3,
                "repetitions": 12,
                "weight": 15,
                "notes": "",
                "order": 2,
            },
        ],
    }

    created = client.post("/api/rutinas", json=create_payload).json()
    routine_id = created["id"]
    first_exercise_id = created["exercises"][0]["id"]

    update_payload = {
        "name": "Rutina Base Editada",
        "description": "Editada",
        "exercises": [
            {
                "id": first_exercise_id,
                "name": "Remo con barra",
                "day_of_week": DayOfWeek.MARTES.value,
                "series": 4,
                "repetitions": 8,
                "weight": 50,
                "notes": "Subir peso",
                "order": 1,
            },
            {
                "name": "Peso muerto",
                "day_of_week": DayOfWeek.VIERNES.value,
                "series": 3,
                "repetitions": 5,
                "weight": 100,
                "notes": "",
                "order": 1,
            },
        ],
    }

    update_response = client.put(f"/api/rutinas/{routine_id}", json=update_payload)
    assert update_response.status_code == 200, update_response.text
    updated = update_response.json()
    assert updated["name"] == update_payload["name"]
    assert len(updated["exercises"]) == 2
    assert any(ex["name"] == "Peso muerto" for ex in updated["exercises"])
    assert all(ex["day_of_week"] != DayOfWeek.LUNES.value for ex in updated["exercises"])


def test_search_routines(client: TestClient):
    client.post(
        "/api/rutinas",
        json={"name": "Hipertrofia Pecho", "description": None, "exercises": []},
    )
    client.post(
        "/api/rutinas",
        json={"name": "Hipertrofia Pierna", "description": None, "exercises": []},
    )

    response = client.get("/api/rutinas/buscar", params={"nombre": "pecho"})
    assert response.status_code == 200
    body = response.json()
    assert body["meta"]["total"] == 1
    assert body["items"][0]["name"] == "Hipertrofia Pecho"


def test_pagination_and_stats(client: TestClient):
    for i in range(1, 6):
        client.post(
            "/api/rutinas",
            json={"name": f"Rutina {i}", "description": None, "exercises": []},
        )

    page1 = client.get("/api/rutinas", params={"page": 1, "page_size": 2})
    assert page1.status_code == 200
    data = page1.json()
    assert data["meta"]["total"] >= 5
    assert len(data["items"]) == 2

    stats = client.get("/api/rutinas/estadisticas")
    assert stats.status_code == 200
    stats_body = stats.json()
    assert stats_body["total_routines"] >= 5
