@echo off
REM GEMS AI Search Enhancements Verification Script

echo 🔍 GEMS AI Search Enhancements Verification

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ❌ Node.js is not installed. Please install Node.js and try again.
  exit /b 1
)

REM Install required packages if they don't exist
echo Installing required packages...
cd %~dp0
npm list axios >nul 2>&1 || npm install axios chalk --no-save

REM Check if the backend server is running
echo Checking if backend server is running...
set "API_URL=http://localhost:3001/api"
node -e "const http=require('http');const req=http.get('%API_URL%/suggestions?query=test',{timeout:3000},(res)=>{process.exit(0)});req.on('error',()=>{console.log('❌ Backend server is not running. Please start it first.');process.exit(1)});req.end()" || (
  echo Run the backend server first with these commands:
  echo cd backend
  echo npm start
  exit /b 1
)

REM Run the verification script
echo Running verification tests...
node verify_enhancements.js

echo.
echo ✅ Verification complete
