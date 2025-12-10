# Frontend - Sistema de Rutinas de Gimnasio

Aplicación React (Vite + TypeScript) para crear, buscar, visualizar y editar rutinas de gimnasio con feedback en tiempo real.

## Requisitos previos
- Node.js 18+ (recomendado 18 LTS)
- npm (incluido con Node) o yarn

## Instalación
```bash
cd frontend
npm install
```

## Configuración
- Define la URL del backend con la variable de entorno `VITE_API_URL` (la API responde en snake_case).
- Crea el archivo `.env` a partir del ejemplo:
  ```bash
  cp .env.example .env
  ```
- Ejemplo:
  ```
  VITE_API_URL=http://localhost:8000/api
  ```

## Ejecución
- Modo desarrollo (puerto 5173):
  ```bash
  npm run dev -- --host
  ```
- Build producción:
  ```bash
  npm run build
  ```
- Previsualización del build:
  ```bash
  npm run preview
  ```

## Tecnologías utilizadas
- React + TypeScript (Vite)
- Material UI (MUI)
- Axios para llamadas HTTP
- React Router DOM para navegación
- @hello-pangea/dnd para drag & drop
- file-saver para descargas

## Estructura del proyecto
```
frontend/
├─ src/
│  ├─ api/           # Cliente axios y helpers de rutinas
│  ├─ components/    # UI reutilizable (formularios, listas, tarjetas, buscador)
│  ├─ hooks/         # Hooks utilitarios (debounce)
│  ├─ pages/         # Pantallas Home y Detalle
│  ├─ types.ts       # Tipos compartidos (Rutina, Ejercicio)
│  ├─ theme.ts       # Tema MUI personalizado
│  └─ main.tsx / App.tsx
├─ .env.example
├─ package.json
└─ vite.config.ts
```

## Funcionalidades clave
- CRUD completo de rutinas y ejercicios.
- Búsqueda en vivo por nombre (case-insensitive) con mensaje de “sin resultados”.
- Formularios con validación en cliente y reordenamiento de ejercicios (drag & drop).
- Paginación y filtro por día de la semana en el listado.
- Duplicar rutina, exportar CSV, estadísticas básicas y visualización por día.
- Vista de detalle con calendario semanal de la rutina.
- Confirmación antes de eliminar y feedback visual de éxito/error.
