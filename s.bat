@echo off
title MediKiosk Smart Healthcare Platform
cls
echo ====================================================================
echo                 MediKiosk Healthcare Platform                      
echo         Universal Server and Multi-Device Edge Launcher            
echo ====================================================================
echo.

echo [1/4] Clearing previous server instances on ports 8000, 5173, 5175...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 :5173 :5175" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

set LOCAL_IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

echo [2/4] Initializing Database and Starting Python Backend Server...
where python >nul 2>&1
if errorlevel 1 goto no_python

python -c "import sys, os; sys.path.insert(0, os.path.abspath('backend')); from database.seed_data import seed_database; seed_database()" >nul 2>&1
start "MediKiosk Python Backend (Port 8000)" python backend/server.py
echo       [OK] Python Backend Server is running on port 8000.
goto backend_done

:no_python
echo       [!] Python not detected in PATH.
:backend_done

echo [3/4] Checking Frontend dependencies...
if not exist node_modules\.bin\vite.cmd (
    echo       Installing npm packages...
    call npm install
)

echo [4/4] Launching MediKiosk Tri-Portal Frontend...
echo.
echo ====================================================================
echo  MediKiosk is LIVE and ACCESSIBLE!
echo ====================================================================
echo.
echo  [1] THIS COMPUTER:
echo      http://localhost:5173
echo.
echo  [2] LOCAL NETWORK OR TOUCHSCREEN KIOSK:
echo      http://%LOCAL_IP%:5173
echo.
echo  [3] BACKEND API:
echo      http://127.0.0.1:8000/api/v1/patient/doctors/available
echo.
echo ====================================================================
echo.

start http://localhost:5173

npm run dev -- --host 0.0.0.0 --port 5173
