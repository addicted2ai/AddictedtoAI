@echo off
REM Scheduled Pulse launcher.
REM
REM Self-locating: %~dp0 is this file's directory (scripts\), so the repo root is
REM its parent. Nothing here hardcodes a machine path, which matters because this
REM file is committed and the rest of the project goes to some trouble to keep
REM machine specifics out of the tree.
REM
REM This is invoked by run-pulse-scheduled.vbs, which runs it with no window.
REM Running this .cmd directly is fine and shows the console, which is what you
REM want when debugging a failed scheduled run.

setlocal
set "REPO=%~dp0.."
set "LOGDIR=%REPO%\.pulse-logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

REM A sortable timestamp that does not depend on locale date formatting.
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%i"

node "%REPO%\pulse\run.mjs" >> "%LOGDIR%\pulse-%STAMP%.log" 2>&1
set "CODE=%ERRORLEVEL%"
echo exit=%CODE% >> "%LOGDIR%\pulse-%STAMP%.log"
endlocal & exit /b %CODE%
