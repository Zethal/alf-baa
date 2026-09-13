@echo off
setlocal
cd /d "%~dp0"
set "ALF_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "ALF_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%ALF_NODE%" if not "%ALF_NODE%"=="node" (
  echo Install the free LTS version of Node.js from https://nodejs.org/
  echo Then reopen this file.
  pause
  exit /b 1
)
if not exist "dist\index.html" (
  echo Build the project first. Open PowerShell in this folder and run:
  echo npm.cmd install
  echo npm.cmd run build
  pause
  exit /b 1
)
start "" "http://localhost:4173"
"%ALF_NODE%" scripts\serve.mjs
pause
