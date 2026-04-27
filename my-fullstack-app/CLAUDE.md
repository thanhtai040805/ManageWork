# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

**Root (concurrent) scripts**
- `npm start` – Runs both backend and frontend concurrently (uses `concurrently`).
- `npm run dev` – Alias for `npm start` in the root.

**Backend** (located in `backend/`)
- `npm run dev` – Starts the Express server with hot‑reload via `nodemon` (`backend/src/server.js`).
- `npm run start` – Starts the server without hot‑reload.
- `npm run setup-db` – Executes the database migration/setup script (`backend/scripts/setup-db.js`).
- `npm run migrate` – Alias for `setup-db`.

**Frontend** (located in `frontend/`)
- `npm run dev` – Starts the Vite development server (`http://localhost:3000`).
- `npm run build` – Builds the production bundle.
- `npm run lint` – Runs ESLint across the frontend code.
- `npm run preview` – Serves the built bundle locally.

**Docker / Dev Environment** (see `README.md`)
- `docker compose -f docker-compose.dev.yml up -d` – Spins up Redis and PostgreSQL containers for local development.
- `docker compose up -d --build` – Starts the full stack (frontend, backend, DB, Redis) in production mode.

**Running a single test / API check**
- No test framework is defined, but you can manually test API endpoints with `curl` or a tool like Postman, e.g.:
  ```bash
  curl http://localhost:8888/v1/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"user","password":"pass"}'
  ```

## High‑Level Architecture

### Backend (Node/Express)
- **Entry point**: `backend/src/server.js` creates an Express app, attaches HTTP & WebSocket servers, and applies middleware.
- **Configuration**: `backend/src/config/` contains database (`database.js`) and view engine (`viewEngine.js`) setup.
- **Models**: `backend/src/models/` define PostgreSQL entities (e.g., `user.js`, `project.js`, `task.js`, `chatRoom.js`). They are plain objects used with `pg` queries and parameterized statements for SQL‑injection safety.
- **Services**: Business‑logic layer in `backend/src/services/` (e.g., `authService.js`, `taskService.js`, `chatRoomService.js`). Controllers delegate to these services.
- **Controllers & Routes**: Controllers in `backend/src/controllers/` handle request validation and response formatting; routes in `backend/src/routes/` map URL paths to controllers.
- **WebSockets**: Real‑time features (presence, chat) are managed by `backend/src/sockets/` (`socket.js`, `socketService.js`, `socketEvents.js`, `presenceSubscriber.js`). Uses `socket.io` with a Redis adapter for scaling.
- **Auth**: JWT based, with middleware in `backend/src/middlewares/auth.js`. Password hashing via `bcryptjs`.
- **Cron Jobs**: Defined in `backend/src/cron/` (e.g., `taskOverdue.job.js`) and scheduled with `node-cron`.
- **Error handling / Security**: Central error middleware (`errorHandler.js`), CORS, Helmet, and input validation via `express-validator`.

### Frontend (React + Vite)
- **Entry point**: `frontend/src/main.jsx` renders `<App />` inside a root element.
- **Routing**: `react-router-dom` drives page navigation (`pages/` folder contains route components such as `Login.jsx`, `Register.jsx`, `Chat.jsx`, `Projects.jsx`).
- **State Management**: Zustand stores located in `frontend/src/stores/` (e.g., `chatStore.js`). Context providers for auth, theme, and socket (`authContext.jsx`, `themeContext.jsx`, `socketContext.jsx`).
- **UI Library**: Tailwind CSS with `tailwind-merge` for class composition; component primitives from Radix UI (avatar, dialog, tooltip, etc.).
- **Features**:
  - **Chat** – Real‑time chat UI (`features/chat/`), integrates with backend sockets.
  - **Tasks & Calendar** – Task cards, status indicators, and calendar views (`features/tasks/`, `features/calendar/`).
  - **Authentication** – Forms and validation (`pages/auth/`, `authContext`).
- **API Layer**: Calls to backend via `axios` (configured with proxy `http://localhost:8888`).
- **Styling**: Tailwind configuration via `tailwind.config.js` (not shown) and `@tailwindcss/vite` plugin.

### Docker Compose
- `docker-compose.dev.yml` defines services for Redis and PostgreSQL used during local development.
- Full stack Docker compose (`docker compose up -d --build`) runs both frontend and backend containers along with DB/Redis.

### Project Roots
- **Root `package.json`** – Provides a concurrent start script that runs both backend and frontend dev servers.
- **Backend `package.json`** – Handles server scripts and DB setup.
- **Frontend `package.json`** – Manages Vite, linting, and build scripts.

## Important Project‑Specific Notes
- Environment variables are defined in `backend/.env` (see README for required keys: DB connection details, JWT secret, CORS origin, etc.).
- API base path is `/v1/api/`; swagger UI is exposed at `/v1/api/` when the server is running.
- Real‑time events are namespaced under Socket.IO and rely on Redis for scaling.
- The codebase uses ES modules (`"type": "module"` in the root `package.json`).
- No dedicated test framework is configured; developers typically use manual API testing or add a framework as needed.
