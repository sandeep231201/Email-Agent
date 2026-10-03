#!/bin/bash
# Email Agent - Quick Start Script
# This script sets up and runs the Email Agent on your machine

set -e  # Exit on error

echo "╔════════════════════════════════════════════╗"
echo "║    📧 Email Agent - Quick Start Setup     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."
echo ""

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "   npm should come with Node.js"
    exit 1
fi

if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not installed locally${NC}"
    echo "   You can:"
    echo "   1. Install MongoDB: https://www.mongodb.com/try/download/community"
    echo "   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    echo "   3. Skip if using Docker"
    echo ""
    read -p "Continue without local MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify Node and npm versions
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"
echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"
echo ""

# Get API Key
echo "🔑 Setting up API Key..."
echo ""
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Please enter your Anthropic API key (from https://console.anthropic.com)"
    echo "(It starts with 'sk-ant-')"
    read -s API_KEY
    echo ""
    export ANTHROPIC_API_KEY=$API_KEY
else
    echo -e "${GREEN}✅ API Key found in environment${NC}"
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}❌ No API key provided${NC}"
    exit 1
fi

echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend
echo "   Installing dependencies..."
npm install --silent
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../
echo "   Installing dependencies..."
npm install --silent
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Create .env file for backend
echo "⚙️  Configuring backend..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created .env file${NC}"
fi
echo ""

# Start services
echo "🚀 Starting services..."
echo ""
echo "Open two terminal windows:"
echo ""
echo "Terminal 1 - Backend (API on port 3001):"
echo "   cd backend && npm start"
echo ""
echo "Terminal 2 - Frontend (UI on port 3000):"
echo "   npm start"
echo ""
echo "Or run everything with Docker:"
echo "   docker-compose up -d"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📖 Documentation:"
echo "   - Setup: README.md"
echo "   - Deployment: DEPLOYMENT.md"
echo "   - Production Checklist: PRODUCTION_CHECKLIST.md"
echo "   - Implementation: IMPLEMENTATION_SUMMARY.md"
echo ""
echo "🌐 Access the app at: http://localhost:3000"
echo "📚 API Docs at: http://localhost:3001/api/docs"
echo ""
echo -e "${GREEN}Happy emailing! 🎉${NC}"
