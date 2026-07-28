@echo off
echo Starting Safar AI...
echo.

echo Starting Backend Server...
start cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "python serve.py"

timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo Safar AI is running!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8000
echo.
echo Press any key to open browser...
pause > nul

start http://localhost:8000

echo.
echo Close both command windows to stop servers.
