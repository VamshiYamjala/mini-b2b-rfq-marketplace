# Production Deployment Guide: Mini B2B RFQ Marketplace

This guide details the exact steps to deploy the application in production matching Section 17 of the Engineering Specification.

---

## 1. Architecture & Services

- **Frontend**: Hosted on [Vercel](https://vercel.com) (React 18 Single Page Application built with Vite)
- **Backend**: Hosted on [Render](https://render.com) (Node.js Express REST API)
- **Database**: Cloud MySQL 8.x / MariaDB (e.g., [Aiven](https://aiven.io), [TiDB Cloud](https://tidbcloud.com), or [Railway](https://railway.app))

---

## 2. Step 1: Cloud MySQL Database Setup

1. Create a free MySQL database on **Aiven** (Free 1GB) or **TiDB Cloud Serverless** (Free 5GB).
2. Note down the connection parameters:
   - Host: e.g. `mysql-xxxx.aivencloud.com`
   - Port: `3306` (or `4000` for TiDB)
   - User: `avnadmin` (or root)
   - Password: `<your_password>`
   - Database: `b2b_rfq_db` (or defaultdb)
   - SSL: `true` (if required by provider)
3. Run the schema migration script against the cloud database:
   ```bash
   cd backend
   DB_HOST=<cloud_host> DB_PORT=3306 DB_USER=<cloud_user> DB_PASSWORD=<cloud_pass> DB_NAME=b2b_rfq_db DB_SSL=true npm run db:migrate
   ```
4. Verify that `users`, `rfqs`, `quotations`, and `sessions` tables are created with all constraints and performance indexes.

---

## 3. Step 2: Deploy Backend to Render

1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/VamshiYamjala/mini-b2b-rfq-marketplace.git`.
4. Configure the service:
   - **Name**: `mini-b2b-rfq-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `SESSION_SECRET`: `<generate a random 32-character key>`
   - `CORS_ORIGIN`: `https://<your-vercel-frontend-domain>.vercel.app`
   - `DB_HOST`: `<your_cloud_mysql_host>`
   - `DB_PORT`: `3306`
   - `DB_USER`: `<your_cloud_mysql_user>`
   - `DB_PASSWORD`: `<your_cloud_mysql_password>`
   - `DB_NAME`: `b2b_rfq_db`
   - `DB_SSL`: `true`
6. Click **Deploy Web Service**.
7. Once deployed, test `https://<your-render-url>.onrender.com/api/health` to confirm 200 `{ status: "ok", db: "connected" }`.

---

## 4. Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `https://github.com/VamshiYamjala/mini-b2b-rfq-marketplace`.
4. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://<your-render-url>.onrender.com`
6. Click **Deploy**.
7. Copy your assigned Vercel URL (e.g., `https://mini-b2b-rfq.vercel.app`) and ensure it is listed in the Render backend `CORS_ORIGIN` environment variable.

---

## 5. Step 4: Verification & Live Evaluation

Follow the 15-step evaluator test script in `SUBMISSION.md` against your live Vercel URL to verify registration, login, RFQ creation, supplier quotation, duplicate prevention, and closed states.
