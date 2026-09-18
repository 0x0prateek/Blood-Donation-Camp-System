@echo off
setlocal

set ROOT=%~dp0
set BACKEND_DIR=%ROOT%backend
set FRONTEND_DIR=%ROOT%frontend

if not exist "%ROOT%.env" if exist "%ROOT%.env.example" copy "%ROOT%.env.example" "%ROOT%.env"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH. Install Node.js 20+ and try again.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not installed or not on PATH.
  exit /b 1
)

if not exist "%BACKEND_DIR%\node_modules" (
  echo Installing backend dependencies...
  pushd "%BACKEND_DIR%" && call npm install && popd
)

if not exist "%FRONTEND_DIR%\node_modules" (
  echo Installing frontend dependencies...
  pushd "%FRONTEND_DIR%" && call npm install && popd
)

set FRONTEND_URL=http://localhost:3000
set PORT=8081

start "Blood Donation Backend" cmd /k "cd /d "%BACKEND_DIR%" && set FRONTEND_URL=%FRONTEND_URL% && set PORT=%PORT% && npm start"
start "Blood Donation Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && set VITE_PORT=3000 && npm run dev -- --host 0.0.0.0 --port 3000"

echo.
echo Project started successfully.
echo Backend URL: http://localhost:8081/api
echo Frontend URL: http://localhost:3000
echo.
echo Admin login: http://localhost:3000/login
echo Donor login: http://localhost:3000/login then choose Normal User
