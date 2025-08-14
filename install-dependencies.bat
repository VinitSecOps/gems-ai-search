@echo off
echo Installing dependencies and starting the application...
echo.

set PROJECT_DIR=%USERPROFILE%\Projects\gems-ai-search

REM Check if the directory exists
if not exist "%PROJECT_DIR%" (
    echo Error: Project directory not found at %PROJECT_DIR%
    echo Please run setup-local-repo.bat first.
    exit /b 1
)

REM Install root dependencies
echo Installing root dependencies...
cd /d "%PROJECT_DIR%"
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install root dependencies.
    exit /b 1
)

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd /d "%PROJECT_DIR%\backend"
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend dependencies.
    exit /b 1
)

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd /d "%PROJECT_DIR%\frontend"
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install frontend dependencies.
    exit /b 1
)

echo.
echo All dependencies installed successfully!
echo.
echo To start the backend:
echo   cd %PROJECT_DIR%\backend
echo   npm start
echo.
echo To start the frontend:
echo   cd %PROJECT_DIR%\frontend
echo   npm start
echo.
echo Done!
