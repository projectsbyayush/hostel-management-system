@echo off
REM =====================================================================
REM  Hostel Management System - one-command launcher (Windows)
REM  Usage:  run-project.cmd   (from the project root, or double-click)
REM  Opens two windows: Spring Boot backend + React frontend.
REM  Prerequisite: MySQL running on localhost:3306 (XAMPP -> Start MySQL).
REM =====================================================================

REM ---- Backend (port 8080) ----
cd /d "%~dp0backend"
start "HostelMS Backend - port 8080 (keep open)" cmd /k "mvn spring-boot:run"

REM ---- Frontend (port 5173) ----
cd /d "%~dp0frontend"
if not exist "node_modules" (
  echo Installing frontend dependencies - first run only, takes 1-2 minutes...
  call npm install
)
start "HostelMS Frontend - port 5173 (keep open)" cmd /k "npm run dev"

echo.
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:5173  (login: ADMIN_USERNAME / ADMIN_PASSWORD in backend\.env)
echo  Two new windows were opened - keep them running while using the app.
echo  Opening the app in your browser...
timeout /t 12 /nobreak >nul
start "" "http://localhost:5173"
