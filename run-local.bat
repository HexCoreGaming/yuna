@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:8000"
  echo YUNA LOCAL PREVIEW - http://localhost:8000
  py -m http.server 8000 --bind 127.0.0.1
  goto :end
)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:8000"
  echo YUNA LOCAL PREVIEW - http://localhost:8000
  python -m http.server 8000 --bind 127.0.0.1
  goto :end
)
echo Python not found. Install Python or open this project with VS Code Live Server.
pause
:end
