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
**See detailed step-by-step guide: [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)**

Quick summary:
1. Create Railway project + MySQL service
2. Deploy backend from `/backend` folder
3. Set backend env vars: `MYSQL_URL`, `DB_SSL=true`, `JWT_SECRET`, `FRONTEND_URL`
4. Run `backend/sql/schema.sql` on MySQL
5. Deploy frontend from `/frontend` folder
6. Set frontend env var: `VITE_API_BASE_URL=backend-url/api`
7. Test live app: signup → create project → create task → dashboard

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
