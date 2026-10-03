# Email Agent - Quick Start Setup Script (PowerShell)
# This script sets up and runs the Email Agent on Windows

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    📧 Email Agent - Quick Start Setup     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $NodeVersion = node --version
    Write-Host "✅ Node.js $NodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "   Please install Node.js v18+ from https://nodejs.org"
    exit 1
}

# Check npm
try {
    $NpmVersion = npm --version
    Write-Host "✅ npm $NpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Get API Key
Write-Host "🔑 Setting up API Key..." -ForegroundColor Yellow
Write-Host ""

if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "Please enter your Anthropic API key (from https://console.anthropic.com)"
    Write-Host "(It starts with 'sk-ant-')"
    $APIKey = Read-Host "API Key"
    $env:ANTHROPIC_API_KEY = $APIKey
} else {
    Write-Host "✅ API Key found in environment" -ForegroundColor Green
}

if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "❌ No API key provided" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Setup Backend
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
Set-Location backend
Write-Host "   Installing dependencies..."
npm install
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup Frontend
Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location ..
Write-Host "   Installing dependencies..."
npm install
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env file for backend
Write-Host "⚙️  Configuring backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
}
Write-Host ""

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Open two PowerShell windows:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Window 1 - Backend (API on port 3001):" -ForegroundColor Cyan
Write-Host "   cd backend; npm start" -ForegroundColor White
Write-Host ""
Write-Host "Window 2 - Frontend (UI on port 3000):" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "Or run everything with Docker:" -ForegroundColor Cyan
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - Setup: README.md"
Write-Host "   - Deployment: DEPLOYMENT.md"
Write-Host "   - Production Checklist: PRODUCTION_CHECKLIST.md"
Write-Host "   - Implementation: IMPLEMENTATION_SUMMARY.md"
Write-Host ""
Write-Host "🌐 Access the app at: http://localhost:3000" -ForegroundColor Green
Write-Host "📚 API Docs at: http://localhost:3001/api/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Happy emailing! 🎉" -ForegroundColor Green
