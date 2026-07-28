@echo off
echo Stopping existing servers...
taskkill /F /IM python.exe 2>nul

echo Starting backend server...
cd backend
start cmd /k "python app.py"

echo Backend started on http://localhost:5000
echo.
echo Now run frontend with: python -m http.server 8000
pause
