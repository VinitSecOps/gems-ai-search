@echo off
REM GEMS AI Search Setup Script for Windows
REM This script helps set up the development environment

echo 🔍 GEMS AI Search Setup
echo ======================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

echo ✅ npm detected
npm --version

REM Install root dependencies
echo.
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd backend
npm install
cd ..

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Check for environment files
echo.
echo 🔧 Checking environment configuration...

if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found
    echo    Please copy .env.example to backend\.env and configure your settings
    if exist ".env.example" copy ".env.example" "backend\.env.example" >nul 2>&1
)

if not exist "frontend\.env" (
    echo ⚠️  Frontend .env file not found
    echo    Creating basic frontend .env file...
    echo DANGEROUSLY_DISABLE_HOST_CHECK=true > frontend\.env
)

REM Create logs directory
echo.
echo 📁 Setting up directories...
if not exist "backend\logs" mkdir backend\logs
type nul > backend\logs\search.log 2>nul
type nul > backend\logs\database.log 2>nul
type nul > backend\logs\nlp.log 2>nul
type nul > backend\logs\server.log 2>nul

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Configure backend\.env with your database and OpenAI API key
echo 2. Start the backend: npm run dev:backend
echo 3. Start the frontend: npm run dev:frontend
echo 4. Visit http://localhost:3000
echo.
echo For more information, see README.md
echo.
pause
