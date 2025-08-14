#!/bin/bash

# GEMS AI Search Setup Script
# This script helps set up the development environment

echo "🔍 GEMS AI Search Setup"
echo "======================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check for environment files
echo ""
echo "🔧 Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found"
    echo "   Please copy .env.example to backend/.env and configure your settings"
    cp .env.example backend/.env.example 2>/dev/null || echo "   Check .env.example for configuration template"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found"
    echo "   Creating basic frontend .env file..."
    echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" > frontend/.env
fi

# Create logs directory
echo ""
echo "📁 Setting up directories..."
mkdir -p backend/logs
touch backend/logs/search.log
touch backend/logs/database.log
touch backend/logs/nlp.log
touch backend/logs/server.log

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your database and OpenAI API key"
echo "2. Start the backend: npm run dev:backend"
echo "3. Start the frontend: npm run dev:frontend"
echo "4. Visit http://localhost:3000"
echo ""
echo "For more information, see README.md"
