# Railway Deployment Guide

Deploy your full-stack app (React + Express + MySQL) on Railway in 15–20 minutes.

## Prerequisites
- GitHub repo with your code pushed (✅ done: https://github.com/ManojReyya/PJM)
- Railway account (free tier works): https://railway.app
- Railway CLI (optional, recommended for testing)

## Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **New Project**
3. Select **Create New**
4. Name: `team-task-manager` (or your choice)
5. Click **Create**

## Step 2: Add MySQL Database Service

1. In your project dashboard, click **+ New**
2. Select **Database** → **MySQL**
3. Railway auto-generates:
   - `MYSQL_URL` (connection string)
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
4. **Do NOT close this page** — copy these values for later.

Example format:
```
mysql://user:password@host:port/database
```

## Step 3: Deploy Backend Service

1. Click **+ New** → **Service** → **GitHub Repo**
2. Authorize GitHub if needed
3. Select repo: `ManojReyya/PJM`
4. Root directory: `backend`
5. Click **Deploy**

Railway will auto-detect `package.json` and start building.

## Step 4: Configure Backend Environment Variables

While backend is building, click on the **backend service** in your project.

Go to **Variables** tab and add:

| Name | Value | Notes |
|------|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `3000` | Railway assigns automatically, but set for clarity |
| `MYSQL_URL` | `mysql://user:pass@host:port/db` | Copy from MySQL service (Step 2) |
| `DB_SSL` | `true` | Railway MySQL requires SSL |
| `JWT_SECRET` | `your-super-secret-key-min-32-chars` | Generate a strong random string |
| `FRONTEND_URL` | `https://your-frontend-domain.railway.app` | Set after deploying frontend |

**Generate JWT_SECRET example:**
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Run Database Schema

Backend needs the MySQL schema to be created before it works.

### Option A: Railway CLI (Recommended)
```bash
npm install -g @railway/cli
railway login
railway link
railway run mysql -u <user> -p < backend/sql/schema.sql
```

### Option B: Manual via phpMyAdmin
1. In Railway, click **MySQL** service
2. Go to **Connect** tab
3. Use MySQL credentials to connect via your MySQL client or online tool
4. Run SQL from `backend/sql/schema.sql` manually

After schema is created, your backend should be healthy (green).

## Step 6: Get Backend URL

1. Click on **backend service**
2. Go to **Deployments** tab
3. Click the live deployment
4. Copy the **public URL** (e.g., `https://pjm-backend-prod.railway.app`)
5. Keep it handy for Step 9

## Step 7: Deploy Frontend Service

1. Back in your Railway project, click **+ New** → **Service** → **GitHub Repo**
2. Select repo: `ManojReyya/PJM`
3. Root directory: `frontend`
4. Click **Deploy**

## Step 8: Configure Frontend Environment Variables

Click on **frontend service** → **Variables** tab → Add:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://your-backend-url.railway.app/api` |

Example:
```
VITE_API_BASE_URL=https://pjm-backend-prod.railway.app/api
```

## Step 9: Update Backend FRONTEND_URL

Go back to **backend service** → **Variables** → Edit `FRONTEND_URL`:

| Name | Value |
|------|-------|
| `FRONTEND_URL` | `https://your-frontend-domain.railway.app` |

Example:
```
FRONTEND_URL=https://pjm-frontend-prod.railway.app
```

Both services should now auto-redeploy with correct CORS settings.

## Step 10: Test Live App

1. Open frontend URL in browser
2. Sign up with email/password
3. Verify password is hashed (not plain text)
4. Create a project
5. Add a team member
6. Create a task
7. Check dashboard for totals and overdue tasks

If login fails or 500 errors appear:
- Check backend logs: **backend service** → **Logs** tab
- Verify `MYSQL_URL` in backend variables
- Verify schema was created: `mysql -u user -p < backend/sql/schema.sql`

## Step 11: Submission URLs

### Live URLs (for demo):
- Frontend: `https://your-frontend-domain.railway.app`
- Backend: `https://your-backend-url.railway.app/api/health`
- GitHub: `https://github.com/ManojReyya/PJM`

### Final Submission Checklist:
- ✅ Live frontend URL (from Step 7)
- ✅ Live backend URL (from Step 6)
- ✅ GitHub repo URL
- ✅ README.md
- ⏳ 2–5 min demo video (screen record signup → create project → assign task → dashboard)

## Quick Troubleshooting

### Backend returns 500 on login/signup
- **Cause**: MySQL schema not created or `MYSQL_URL` invalid
- **Fix**: Re-run `backend/sql/schema.sql` in your MySQL instance

### Frontend shows "API error"
- **Cause**: `VITE_API_BASE_URL` incorrect or backend not running
- **Fix**: Verify backend URL matches exactly, check backend **Logs** tab

### CORS errors in console
- **Cause**: `FRONTEND_URL` not set in backend or mismatch
- **Fix**: Re-set backend `FRONTEND_URL` to exact frontend domain

### Build fails on Railway
- **Cause**: Missing dependencies or syntax error
- **Fix**: Check **Logs** tab; run `npm install && npm run build` locally to validate

## Next: Demo Video

Record a 2–5 minute video showing:
1. Open app → Login page
2. Signup new user
3. Create project
4. Add team member
5. Create task + assign
6. Update task status
7. View dashboard (KPIs + overdue)

Use screen recording tool (Windows Snip & Sketch, OBS, or https://screencastify.com).

---

Need help? Visit Railway docs: https://docs.railway.app
