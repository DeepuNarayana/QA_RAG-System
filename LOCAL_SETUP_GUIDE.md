# 🚀 Lumina Library - Local Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: v16+ (for frontend)
- **Python**: 3.8+ (for backend)
- **Git**: Latest version
- **npm/pip**: Package managers

### Check Your System
```powershell
# Check Node.js
node --version
npm --version

# Check Python
python --version

# Check Git
git --version
```

---

## Project Structure

```
d:\Deepu\LuminaLib\
├── Intelligent Management/
│   ├── frontend/               (Next.js + React)
│   ├── backend/                (Python + FastAPI)
│   ├── mock_llm/               (Mock LLM service)
│   ├── docs/                   (Documentation)
│   └── ... configuration files
│
└── .venv/                       (Python virtual environment)
```

---

## Step 1: Clone/Setup Project

If not already done:
```powershell
# Navigate to project directory
cd d:\Deepu\LuminaLib

# Verify structure
ls -R
```

---

## Step 2: Setup Python Virtual Environment

```powershell
# Navigate to project root
cd d:\Deepu\LuminaLib

# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# If you get execution policy error, run this first:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify activation (should show (.venv) prefix)
```

---

## Step 3: Install Backend Dependencies

```powershell
# Ensure you're in project root with .venv activated
cd d:\Deepu\LuminaLib\Intelligent\ Management\backend

# Install Python dependencies
pip install -r requirements.txt

# Or using pyproject.toml if available
pip install -e .
```

---

## Step 4: Setup Backend Environment Variables

Create `.env` file in `backend/` directory:

```env
# Environment
ENVIRONMENT=development

# Database
DATABASE_URL=sqlite:///./data.db

# Redis (if using)
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM (Mock or Real)
LLM_API_KEY=mock-key-for-testing
LLM_MODEL=gpt-4

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
```

---

## Step 5: Run Backend Server

**Terminal 1 - Backend:**
```powershell
# Activate virtual environment
cd d:\Deepu\LuminaLib
.\.venv\Scripts\Activate.ps1

# Navigate to backend
cd Intelligent\ Management\backend

# Start the server
python main.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**API available at**: `http://localhost:8000`
**API Docs**: `http://localhost:8000/docs` (Swagger)

---

## Step 6: Setup Frontend Environment Variables

Create `.env.local` file in `frontend/` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# App Configuration
NEXT_PUBLIC_APP_NAME=Lumina Library
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_TESTING=true
```

---

## Step 7: Install Frontend Dependencies

**Terminal 2 - Frontend:**
```powershell
# Navigate to frontend
cd d:\Deepu\LuminaLib\Intelligent\ Management\frontend

# Install dependencies
npm install

# Or with specific flags
npm install --no-audit --no-fund
```

**First time?** This may take 2-5 minutes.

---

## Step 8: Run Frontend Development Server

**Terminal 2 - Frontend (continued):**
```powershell
# Start development server
npm run dev

# Or specify custom port
npm run dev -- -p 3001

# Or with specific host
npm run dev -- -p 3000 -H 0.0.0.0
```

**Expected output:**
```
> next dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Frontend available at**: `http://localhost:3000`

---

## Step 9: Verify Everything is Running

### Check Backend
```powershell
# Open another terminal and test
curl http://localhost:8000/docs

# Or in PowerShell
Invoke-WebRequest http://localhost:8000/docs
```

### Check Frontend
```powershell
# Visit in browser
http://localhost:3000
```

### Check API Connection
```powershell
# Test API endpoint
curl http://localhost:8000/api/health

# Or
Invoke-WebRequest http://localhost:8000/api/health
```

---

## Complete Terminal Setup

### Terminal 1: Backend Server
```powershell
cd d:\Deepu\LuminaLib
.\.venv\Scripts\Activate.ps1
cd "Intelligent Management\backend"
python main.py
```

### Terminal 2: Frontend Server
```powershell
cd "d:\Deepu\LuminaLib\Intelligent Management\frontend"
npm run dev
```

### Terminal 3: Optional - Testing/Debugging
```powershell
# Can use for running tests or additional commands
cd "d:\Deepu\LuminaLib"
```

---

## Access the Application

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000 | REST API endpoints |
| API Docs | http://localhost:8000/docs | Swagger documentation |
| API ReDoc | http://localhost:8000/redoc | Alternative API docs |

---

## Default Test Credentials

```
Email:    user@example.com
Password: password123

# Or for admin:
Email:    admin@example.com
Password: admin123
```

*(Check backend setup for actual seed data)*

---

## Build for Production

### Frontend Build
```powershell
cd "d:\Deepu\LuminaLib\Intelligent Management\frontend"

# Build production bundle
npm run build

# Start production server
npm start

# Or preview production build
npm run build
npm run start
```

### Backend Production
```powershell
cd "d:\Deepu\LuminaLib\Intelligent Management\backend"

# Run with gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

---

## Run Tests

### Frontend Tests
```powershell
cd "d:\Deepu\LuminaLib\Intelligent Management\frontend"

# Run all tests
npm test

# Run specific test file
npm test auth.test.tsx

# Run with coverage
npm test -- --coverage
```

### Backend Tests
```powershell
cd "d:\Deepu\LuminaLib\Intelligent Management\backend"

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/unit/test_auth.py
```

---

## Troubleshooting

### Issue: Port Already in Use

**Frontend (Port 3000):**
```powershell
# Use different port
npm run dev -- -p 3001
```

**Backend (Port 8000):**
```powershell
# Use different port
uvicorn app.main:app --port 8001
```

---

### Issue: Virtual Environment Not Activating

```powershell
# Try explicit path
& "d:\Deepu\LuminaLib\.venv\Scripts\Activate.ps1"

# Or if you get policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\.venv\Scripts\Activate.ps1
```

---

### Issue: Module Not Found (Backend)

```powershell
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Or clear cache and reinstall
pip cache purge
pip install -r requirements.txt
```

---

### Issue: npm ERR! (Frontend)

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
rmdir node_modules -Recurse -Force

# Reinstall
npm install
```

---

### Issue: API Connection Refused

**Check if backend is running:**
```powershell
# List processes on port 8000
netstat -ano | findstr :8000

# If nothing, backend isn't running
# Start backend in Terminal 1
```

**Check environment variables:**
```powershell
# Verify .env.local has correct API_URL
cat frontend\.env.local | findstr API_URL

# Should be: http://localhost:8000 (for local)
```

---

### Issue: Database Error (Backend)

```powershell
# Check database file exists
ls "Intelligent Management\backend\data.db"

# If not, backend should create it on first run

# Or manually create database:
cd "Intelligent Management\backend"
python -c "from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)"
```

---

## Using Docker (Alternative)

### Option 1: Run with Docker Compose
```powershell
cd "d:\Deepu\LuminaLib\Intelligent Management"

# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Run Individual Containers
```powershell
# Backend
docker build -t lumina-backend ./backend
docker run -p 8000:8000 lumina-backend

# Frontend
docker build -t lumina-frontend ./frontend
docker run -p 3000:3000 lumina-frontend
```

---

## Development Workflow

### 1. Start Everything
```powershell
# Terminal 1
cd d:\Deepu\LuminaLib
.\.venv\Scripts\Activate.ps1
cd "Intelligent Management\backend"
python main.py

# Terminal 2
cd "d:\Deepu\LuminaLib\Intelligent Management\frontend"
npm run dev
```

### 2. Make Changes
- Edit files in your IDE
- Frontend: Auto-refreshes on save (hot reload)
- Backend: Auto-reloads if `--reload` flag used

### 3. Test Changes
```powershell
# Frontend tests
npm test

# Backend tests
pytest

# Manual testing at http://localhost:3000
```

### 4. Commit Changes
```powershell
git add .
git commit -m "Feature: description"
git push
```

---

## Common Commands Reference

```powershell
# Frontend
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm test                # Run tests
npm run type-check      # Check TypeScript
npm run lint            # Run linter

# Backend
pip install -r requirements.txt    # Install dependencies
python main.py                     # Start server
pytest                             # Run tests
pytest --cov=app                   # Tests with coverage
python -m mypy app                 # Type checking

# Both
git status              # Check git status
git pull                # Pull latest changes
git push                # Push your changes
```

---

## Performance Tips

1. **Frontend**:
   - Use React DevTools for debugging
   - Check Network tab for API calls
   - Use Chrome DevTools Performance tab

2. **Backend**:
   - Check logs at `http://localhost:8000/docs`
   - Use FastAPI's built-in profiling
   - Monitor database queries

3. **Database**:
   - Keep SQLite for development
   - Use PostgreSQL for production
   - Regular backups recommended

---

## Next Steps

1. ✅ **Setup complete?** → Start using the application
2. 📚 **Need more info?** → See FRONTEND_DOCUMENTATION_INDEX.md
3. 🐛 **Found an issue?** → Check Troubleshooting section
4. 🧪 **Ready to test?** → Run `npm test` and `pytest`
5. 🚀 **Ready to deploy?** → See deployment guides in docs/

---

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  LUMINA LIBRARY - QUICK START               │
├─────────────────────────────────────────────┤
│                                             │
│  Backend: python main.py                    │
│  Port: 8000                                 │
│  Docs: http://localhost:8000/docs          │
│                                             │
│  Frontend: npm run dev                      │
│  Port: 3000                                 │
│  URL: http://localhost:3000                │
│                                             │
│  Both running? → Visit http://localhost:3000│
│                                             │
└─────────────────────────────────────────────┘
```

---

## Support

- **Frontend Issues**: Check PHASE_3_IMPLEMENTATION.md
- **Backend Issues**: Check backend/README.md
- **General Questions**: See FRONTEND_DOCUMENTATION_INDEX.md
- **API Documentation**: Visit http://localhost:8000/docs when backend is running

---

**Ready to run? Follow the steps above and enjoy building! 🚀**
