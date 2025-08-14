@echo off
echo Setting up a local working copy from the clean repository...
echo.

set REPO_URL=https://github.com/VinitSecOps/gems-ai-search.git
set LOCAL_DIR=%USERPROFILE%\Projects\gems-ai-search

REM Ask for confirmation
echo This script will:
echo 1. Clone the clean repository from %REPO_URL%
echo 2. Set up the repository in %LOCAL_DIR%
echo 3. Create empty .env files in backend and frontend folders
echo.
set /p CONFIRM="Do you want to continue? (Y/N): "
if /i "%CONFIRM%" NEQ "Y" (
    echo Setup cancelled.
    exit /b
)

REM Create directory if it doesn't exist
if not exist "%LOCAL_DIR%" (
    echo Creating directory %LOCAL_DIR%...
    mkdir "%LOCAL_DIR%"
) else (
    echo Directory %LOCAL_DIR% already exists.
    set /p OVERWRITE="Do you want to overwrite it? (Y/N): "
    if /i "%OVERWRITE%" EQU "Y" (
        echo Removing existing directory...
        rmdir /s /q "%LOCAL_DIR%"
        mkdir "%LOCAL_DIR%"
    ) else (
        echo Setup cancelled.
        exit /b
    )
)

REM Clone the repository
echo Cloning repository...
git clone %REPO_URL% "%LOCAL_DIR%"

REM Verify clone was successful
if not exist "%LOCAL_DIR%\.git" (
    echo Failed to clone repository. Please check your internet connection and permissions.
    exit /b
)

REM Create .env files
echo Creating empty .env files...
echo # Add your environment variables here > "%LOCAL_DIR%\backend\.env"
echo # Add your environment variables here > "%LOCAL_DIR%\frontend\.env"

REM Remind user to set up .env files
echo.
echo Repository cloned successfully to %LOCAL_DIR%
echo.
echo IMPORTANT: Remember to update the .env files with your environment variables:
echo - %LOCAL_DIR%\backend\.env
echo - %LOCAL_DIR%\frontend\.env
echo.
echo Done!
