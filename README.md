# Team Task Manager (React + Express + MySQL)

Full-stack assignment project with role-based task management.

## Tech Stack
- Frontend: React (Vite)
- Styling: Tailwind CSS via CDN link
- Backend: Express.js REST API
- Database: MySQL
- Auth: JWT + bcrypt

## Features
- Signup/Login
- Project creation and listing
- Team member add/remove by project admin
- Task creation, listing, status updates
- Dashboard summary + overdue + my tasks
- Role-based access (project-level admin/member)

## Project Structure
- `/frontend` React app
- `/backend` Express API
- `/backend/sql/schema.sql` DB schema

## Local Setup
### 1) Database
Create database/tables:

```sql
SOURCE backend/sql/schema.sql;
```

### 2) Backend
```bash
cd backend
cp .env.example .env
# use either MYSQL_URL (hosted DB) OR DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME
# set DB_SSL=true if hosted provider requires TLS
# set JWT_SECRET
npm install
npm run dev
```

### 3) Frontend
```bash
cd frontend
cp .env.example .env
# set VITE_API_BASE_URL
npm install
npm run dev
```

## API Quick List
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/members`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`
- `POST /api/projects/:id/tasks`
- `GET /api/projects/:id/tasks`
- `GET /api/tasks/:taskId`
- `PUT /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId/status`
- `DELETE /api/tasks/:taskId`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/my-tasks`
- `GET /api/dashboard/overdue`

## Railway Deployment
1. Push repo to GitHub.
2. Create Railway project.
3. Add MySQL service.
4. Deploy backend service from `/backend`.
5. Set backend env vars from `.env.example` (prefer `MYSQL_URL` from Railway + `DB_SSL=true`).
6. Deploy frontend service from `/frontend`.
7. Set `VITE_API_BASE_URL` to backend Railway URL + `/api`.
8. Set backend `FRONTEND_URL` to frontend Railway domain.

## Note For This Workspace Path (Windows)
If npm scripts fail due to `&` in folder name, run tools directly:

```bash
cd frontend
node .\node_modules\vite\bin\vite.js build
```

## Submission Checklist
- Live URL (Railway)
- GitHub repo URL
- README
- 2-5 min demo video
