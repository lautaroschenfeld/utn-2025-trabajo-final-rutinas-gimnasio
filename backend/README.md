# Backend - Sistema de Rutinas de Gimnasio

API RESTful para gestionar rutinas de entrenamiento y sus ejercicios diarios. Construida con FastAPI, SQLModel y PostgreSQL.

## Requisitos previos
- Python 3.10 o superior
- PostgreSQL (local o en contenedor Docker)
- Opcional: `docker-compose` para levantar PostgreSQL rápidamente

## Instalación
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Configuración de la Base de Datos
- **String de conexión**: `postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DBNAME`
- Variable de entorno: `DATABASE_URL`
- **API key opcional**: `API_KEY` (si se define, las peticiones deben enviar header `X-API-Key`)
- Orígenes permitidos para CORS: `CORS_ORIGINS` (lista en formato JSON: `["http://localhost:5173"]`)
- Copia el archivo de ejemplo y ajusta valores:
  ```bash
  cp .env.example .env
  ```
- Ejemplo de `.env`:
  ```
  DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/gimnasio
  CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
  API_KEY=tu_clave_opcional
  ```
- Crear base de datos (si usas Docker):
  ```bash
  docker-compose up -d db
  # La base se crea con nombre "gimnasio" y usuario postgres/postgres
  ```
- Las tablas se crean automáticamente en el arranque (`init_db()`), no se requiere migración manual.

## Ejecución
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
- La API queda en `http://localhost:8000`
- Documentación interactiva Swagger: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`

## Endpoints disponibles
- `GET /api/rutinas` – Listar rutinas (paginadas, filtros por día)  
  Parámetros: `page`, `page_size`, `dia`
- `GET /api/rutinas/{id}` – Detalle de una rutina
- `GET /api/rutinas/buscar?nombre=texto` – Búsqueda parcial (case-insensitive, paginada, filtro por día)
- `POST /api/rutinas` – Crear rutina (con ejercicios opcionales)
- `PUT /api/rutinas/{id}` – Editar rutina y ejercicios (agregar, actualizar, eliminar, reordenar)
- `DELETE /api/rutinas/{id}` – Eliminar rutina (cascada ejercicios)
- `POST /api/rutinas/{id}/duplicar` – Duplicar una rutina
- `GET /api/rutinas/estadisticas` – Totales y ejercicios por día
- `GET /api/rutinas/export/csv` – Exportar todas las rutinas/ejercicios en CSV
- `POST /api/rutinas/{id}/ejercicios` – Agregar ejercicio a una rutina
- `PUT /api/ejercicios/{id}` – Editar ejercicio
- `DELETE /api/ejercicios/{id}` – Eliminar ejercicio

### Ejemplo de payload (snake_case)
```json
{
  "name": "Fuerza 3x",
  "description": "Full body",
  "exercises": [
    {
      "name": "Sentadilla",
      "day_of_week": "Lunes",
      "series": 5,
      "repetitions": 5,
      "weight": 100,
      "notes": "Progresión semanal",
      "order": 1
    }
  ]
}
```

## Validaciones clave
- Nombre de rutina único (case-insensitive)
- Series y repeticiones > 0
- Peso opcional, debe ser positivo si se envía
- Día de la semana validado contra el enum permitido
- Eliminación en cascada de ejercicios al borrar una rutina

## Estructura del proyecto
```
backend/
├─ app/
│  ├─ main.py            # Configuración FastAPI y rutas
│  ├─ config.py          # Settings via variables de entorno (API key opcional)
│  ├─ database.py        # Motor y sesión SQLModel
│  ├─ models.py          # Modelos SQLModel (Rutina, Ejercicio)
│  ├─ schemas.py         # Esquemas Pydantic para requests/responses
│  ├─ routers/
│  │  └─ routines.py     # Endpoints CRUD
│  ├─ security.py        # API key sencilla
│  └─ tests/             # Pruebas de API con TestClient
├─ requirements.txt
├─ .env.example
├─ scripts/seed.py       # Seeds de ejemplo
└─ pytest.ini
```

## Pruebas
Con el entorno virtual activado:
```bash
cd backend
pytest
```
Las pruebas usan SQLite en memoria, por lo que no tocan tu base de datos PostgreSQL.

## Seeds
```bash
cd backend
python scripts/seed.py
```
Si la base ya tiene datos, el script no los duplica.
