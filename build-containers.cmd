@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-containers.ps1" %*
exit /b %errorlevel%
