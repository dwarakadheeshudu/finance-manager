# Permanent Production Deployment Guide

This guide explains how to deploy your **Smart Personal Finance Manager** to the cloud permanently, making it accessible to anyone with a link.

We will use the best industry-standard **free hosting tiers** available:
- **Database:** Supabase (Free PostgreSQL database)
- **Backend API:** Render (Free tier for FastAPI python backend)
- **Frontend App:** Vercel (Free tier for Vite/React frontend)

---

## Step 1: Upload Your Code to GitHub

Cloud platforms deployment relies on your codebase being hosted in a GitHub repository.

1. Create a free account on [GitHub](https://github.com/) if you don't have one.
2. Install [Git](https://git-scm.com/) on your computer.
3. In your project root folder, open a command prompt and run:
   ```bash
   git init
   git add .
   git commit -m "Prepare codebase for deployment"
   ```
4. Create a new repository on GitHub (name it something like `smart-finance-manager`).
5. Run the commands provided by GitHub to link your local folder and push it:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Set up a Database (Supabase PostgreSQL)

Because SQLite stores data in a local file (`finance.db`), it is not suited for cloud deployments where servers restart and wipe the local drive. We will set up a permanent PostgreSQL database.

1. Sign up/Log in at [Supabase](https://supabase.com/).
2. Create a **New Project**.
3. Set your Database Password (remember it!) and wait for the database to provision.
4. Once ready, go to **Project Settings** > **Database** and copy the **URI Connection String** under **Connection string** (choose the "Transaction" or "Session" pooler tab).
   - The URI will look like: `postgresql://postgres.[username]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - **Important:** Replace `[password]` with the actual database password you chose.
5. Keep this database URL handy.

---

## Step 3: Deploy the Backend (Render)

1. Sign up/Log in at [Render](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub account and select your `smart-finance-manager` repository.
4. Configure the Web Service settings:
   - **Name:** `finance-manager-backend`
   - **Root Directory:** `backend` (Important: This points Render to the backend folder)
   - **Language:** `Python 3`
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Scroll down and click **Advanced** to add Environment Variables:
   - `DATABASE_URL`: *(Paste your Supabase database URI here)*
   - `SECRET_KEY`: *(Put a long random string of letters and numbers)*
6. Click **Deploy Web Service**.
7. Once deployed, Render will show a public URL for your backend (e.g. `https://finance-manager-backend.onrender.com`). Copy this URL.

---

## Step 4: Deploy the Frontend (Vercel)

1. Sign up/Log in at [Vercel](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Import your `smart-finance-manager` repository.
4. Configure the project:
   - **Framework Preset:** `Vite` (it will auto-detect Vite)
   - **Root Directory:** `frontend` (Important: Point to the frontend folder)
5. Under **Environment Variables**, add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api` *(Make sure to replace this with your actual Render URL and append `/api` to the end!)*
6. Click **Deploy**.
7. In a few minutes, Vercel will give you a public URL (e.g., `https://smart-finance-manager.vercel.app`).

**That's it! Your application is now live and public permanently!** 🚀
