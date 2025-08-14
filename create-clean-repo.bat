@echo off
REM Create a fresh repository without git history
echo Creating a fresh repository without git history...

REM Set paths
set CURRENT_REPO=D:\Matriks Projects\gems-ai-search
set NEW_REPO=D:\Matriks Projects\gems-ai-search-clean

REM Remove existing directory if it exists
if exist "%NEW_REPO%" (
    echo Removing existing directory...
    rmdir /S /Q "%NEW_REPO%"
)

REM Create the new directory
echo Creating new directory...
mkdir "%NEW_REPO%"
if %ERRORLEVEL% neq 0 (
    echo Failed to create new directory
    exit /b 1
)

REM Copy all files excluding .git directory
echo Copying files to new repository...
echo Creating exclude file...
echo .git\ > "%~dp0exclude-temp.txt"
echo node_modules\ >> "%~dp0exclude-temp.txt"
echo *.env >> "%~dp0exclude-temp.txt"
echo *.log >> "%~dp0exclude-temp.txt"

REM Use robocopy instead of xcopy for better handling of exclusions
robocopy "%CURRENT_REPO%" "%NEW_REPO%" /E /XD ".git" "node_modules" /XF "*.env" "*.log" ".gitattributes"
if %ERRORLEVEL% GEQ 8 (
    echo Failed to copy files
    exit /b 1
)

REM Go to the new repository
cd /d "%NEW_REPO%"
if %ERRORLEVEL% neq 0 (
    echo Failed to change directory
    exit /b 1
)

REM Initialize git
echo Initializing new git repository...
git init --initial-branch=main
if %ERRORLEVEL% neq 0 (
    echo Failed to initialize git
    git init
)

REM Add all files
echo Adding files to git...
git add .
if %ERRORLEVEL% neq 0 (
    echo Failed to add files
    exit /b 1
)

REM Commit
echo Creating first commit...
git commit -m "Initial commit: Clean version of GEMS AI Search"
if %ERRORLEVEL% neq 0 (
    echo Failed to commit
    exit /b 1
)

echo Verifying files were copied...
dir "%NEW_REPO%" /b
echo.
echo Successfully created clean repository at: %NEW_REPO%
echo.
echo Next steps:
echo 1. Create a new GitHub repository
echo 2. Run these commands:
echo    git remote add origin https://github.com/your-username/your-new-repo.git
echo    git push -u origin main
echo.
echo Done!
