@echo off
title Smart Finance Manager Starter
echo ==========================================================
echo   Smart Personal Finance Manager - Startup Utility
echo ==========================================================
echo.

:: Change directory to the folder where this batch file is located
cd /d "%~dp0"
echo Running from: %cd%
echo.

:: 1. Check if backend python virtual environment exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found in backend\venv\
    echo Please make sure the backend is set up correctly.
    pause
    exit /b
)

:: 2. Check if frontend package.json exists
if not exist "frontend\package.json" (
    echo [ERROR] frontend\package.json not found!
    echo Please ensure this batch file is in the project root folder.
    pause
    exit /b
)

:: Start Backend in a new window (uses cmd /k to keep window open if error occurs)
echo Starting FastAPI Backend...
start "Finance Manager Backend (Port 8000)" cmd /k "backend\venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --reload"

:: Start Frontend in a new window (uses cmd /k to keep window open if error occurs)
echo Starting Vite/React Frontend...
start "Finance Manager Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 5 seconds for servers to initialize...
ping 127.0.0.1 -n 6 >nul

echo.
echo Opening the application in your default browser...
start http://localhost:5173

echo.
echo ==========================================================
echo   All servers launched!
echo   Please keep the two command prompt windows open.
echo   You can close this launcher window now.
echo ==========================================================
echo.
pause
