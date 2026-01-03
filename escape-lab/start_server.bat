@echo off
echo ========================================
echo   Escape Room Server Launcher
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo Python found! Checking dependencies...
echo.

REM Install required packages if not already installed
echo Installing Flask and Flask-CORS...
pip install flask flask-cors --quiet

if errorlevel 1 (
    echo.
    echo WARNING: Could not install packages automatically
    echo Please run: pip install flask flask-cors
    echo.
    pause
    exit /b 1
)

echo.
echo Starting server...
echo.
echo ========================================
echo  Server will start in a moment...
echo  Your browser will open automatically
echo ========================================
echo.

REM Start the Python server
start http://localhost:5000
python code/server.py

pause