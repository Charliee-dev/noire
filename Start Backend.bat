@echo off
title NOIRE Development Launcher

echo ==========================================
echo        NOIRE DEVELOPMENT SERVER
echo ==========================================
echo.

echo Starting Backend...
start "NOIRE Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "NOIRE Frontend" cmd /k "cd /d "%~dp0frontend" && npx --yes live-server --port=5500 --no-browser"

timeout /t 3 /nobreak >nul

echo Opening NOIRE...
start "" "http://127.0.0.1:5500/index.html"

echo.
echo ==========================================
echo Backend:  http://localhost:5001
echo Frontend: http://127.0.0.1:5500
echo ==========================================
pause