# Lumina Library - PowerShell Setup Script
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  LUMINA LIBRARY - LOCAL SETUP" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python not found! Please install Python 3.8+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Navigate to project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Step 1: Create/Activate Virtual Environment
Write-Host "[1/6] Setting up Python virtual environment..." -ForegroundColor Yellow

if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Gray
    python -m venv .venv
    Write-Host "[OK] Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "[OK] Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
& ".\.venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to activate virtual environment" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Virtual environment activated" -ForegroundColor Green

# Step 2: Install backend dependencies
Write-Host ""
Write-Host "[2/6] Installing backend dependencies..." -ForegroundColor Yellow

$backendPath = "Intelligent Management\backend"
Set-Location $backendPath

if (Test-Path "requirements.txt") {
    pip install -r requirements.txt -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Some packages may not have installed correctly" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARNING] requirements.txt not found" -ForegroundColor Yellow
}

# Step 3: Create backend .env file
Write-Host "[3/6] Checking backend configuration..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Gray
    $envContent = @"
ENVIRONMENT=development
DATABASE_URL=sqlite:///./data.db
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=INFO
"@
    Set-Content -Path ".env" -Value $envContent
    Write-Host "[OK] Backend .env created" -ForegroundColor Green
} else {
    Write-Host "[OK] Backend .env already exists" -ForegroundColor Green
}

# Step 4: Install frontend dependencies
Write-Host ""
Write-Host "[4/6] Installing frontend dependencies..." -ForegroundColor Yellow

$frontendPath = "..\frontend"
Set-Location $frontendPath

npm install --no-audit --no-fund | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[WARNING] npm install had some issues" -ForegroundColor Yellow
}

# Step 5: Create frontend .env.local file
Write-Host "[5/6] Checking frontend configuration..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Gray
    $envContent = @"
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=Lumina Library
NEXT_PUBLIC_ENABLE_TESTING=true
"@
    Set-Content -Path ".env.local" -Value $envContent
    Write-Host "[OK] Frontend .env.local created" -ForegroundColor Green
} else {
    Write-Host "[OK] Frontend .env.local already exists" -ForegroundColor Green
}

# Setup complete
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "[6/6] Ready to start servers" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "-----------" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open TWO new PowerShell terminals:" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd d:\Deepu\LuminaLib" -ForegroundColor Gray
Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "  cd 'Intelligent Management\backend'" -ForegroundColor Gray
Write-Host "  python main.py" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  cd 'd:\Deepu\LuminaLib\Intelligent Management\frontend'" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Then visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Docs available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to close this window"
