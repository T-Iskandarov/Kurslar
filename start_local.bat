@echo off
echo Starting Backend...
start cmd /k "cd /d %~dp0 && venv\Scripts\activate.bat && python manage.py runserver"

echo Starting Frontend...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both servers started!
