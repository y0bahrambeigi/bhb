@echo off
chcp 65001 >nul
title Python Academy Offline - Yousef Bahram Beigi
cd /d "%~dp0"
echo Starting Python Academy Offline...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Windows.ps1"
if errorlevel 1 (
  echo.
  echo The launcher could not start. Please read README_FA.txt.
  pause
)
