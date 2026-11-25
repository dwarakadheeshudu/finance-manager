@echo off
chcp 65001 >nul
title MedicAI Clinical Intelligence Full-Stack Platform
color 0B
cls
echo =====================================================================
echo       MEDICAI: FULL-STACK ENTERPRISE CLINICAL PLATFORM LAUNCHER      
echo =====================================================================
echo.

cd /d "%~dp0"
echo Project folder: %~dp0
echo.

echo Freeing port 8000 if currently occupied...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

set "PY_EXE=%~dp0backend\venv\Scripts\python.exe"
if not exist "%PY_EXE%" (
    set "PY_EXE=python"
)

echo [1/2] Starting MedicAI Unified Server on Port 8000...
start "MedicAI Unified Server (Port 8000)" "%PY_EXE%" -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload

echo [2/2] Starting Optional React Hot-Reload Dev Server on Port 5173...
start "MedicAI React Dev Server (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Waiting 4 seconds for server to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Launching MedicAI Clinical Platform in your default browser...
start http://127.0.0.1:8000

echo.
echo =====================================================================
echo   MedicAI System is ACTIVE!
echo   - Primary Website URL:     http://127.0.0.1:8000
echo   - REST API & Swagger Docs: http://127.0.0.1:8000/docs
echo   - Dev Hot-Reload Server:   http://localhost:5173
echo   Please keep the server windows open while using the application.
echo =====================================================================
pause
