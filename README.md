# Sistema de Gestión de Rutinas de Gimnasio

Proyecto full‑stack para crear, editar, buscar y administrar rutinas de entrenamiento con FastAPI + PostgreSQL en el backend y React + Vite + Material UI en el frontend.

## Stack principal
- Backend: Python 3.10+, FastAPI, SQLModel/SQLAlchemy, PostgreSQL, Pytest.
- Frontend: React + Vite (TypeScript), Material UI, Axios.
- Infra local: Docker Compose opcional para levantar Postgres.

## Estructura del repositorio
- `backend/`: API REST (FastAPI), modelos, rutas, tests y seeds.
- `frontend/`: aplicación web (React/Vite).
- `docker-compose.yml`: servicio PostgreSQL listo para desarrollo.

## Prerrequisitos
- Python 3.10+ y Node.js 18+.
- PostgreSQL (local o en contenedor).
- Git.

## Puesta en marcha rápida
### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # ajusta DATABASE_URL y CORS_ORIGINS
uvicorn app.main:app --reload --port 8000
```
Swagger: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev  # puerto 5173
```
Ajusta la URL del backend en `frontend/.env` (ej.: `VITE_API_URL=http://localhost:8000`).

## Configuración de base de datos
- Crea la base: `createdb gimnasio` (o con Docker Compose: `docker compose up -d`).
- Usa un string de conexión Postgres, por ejemplo:
  - `DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/gimnasio`
- Ejecuta seeds opcionales:
```bash
cd backend
python -m app.scripts.seed
```

## Scripts útiles
- Tests backend: `cd backend && pytest`
- Seed de datos: `cd backend && python -m app.scripts.seed`
- Build frontend: `cd frontend && npm run build`

## Documentación detallada
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`

## Capturas de pantalla
- Inicio  
  ![Inicio](screenshots/inicio.png)
- Rutina en detalle  
  ![Rutina en detalle](screenshots/detailed_routine.png)
- Rutina con calendario semanal  
  ![Calendario semanal](screenshots/detailed_routine_weekly_calendar.png)
