@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:\=/%"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

where bash >nul 2>&1
if errorlevel 1 (
  echo [reset.bat][error] Git Bash not found. Install Git for Windows, then run reset.bat again.
  exit /b 1
)

bash "%SCRIPT_DIR%/reset.sh" %*
exit /b %ERRORLEVEL%
