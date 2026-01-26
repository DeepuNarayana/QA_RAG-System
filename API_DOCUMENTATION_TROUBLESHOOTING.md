# API Documentation Troubleshooting Guide

**Issue**: When clicking on API Documentation link, page throws an error

**Date**: January 27, 2026

---

## ❌ Common Causes & Solutions

### 1. **Backend Not Running**

**Error**: `Failed to fetch` or `Connection refused`

**Solution**:
```bash
# Start backend
cd backend
python main.py

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. **Wrong Port/URL**

The API documentation links should be:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

❌ **Do NOT use**:
- `http://localhost:3000/docs` (that's the frontend)
- `http://localhost:8000/api/docs`
- `http://0.0.0.0:8000/docs` (if accessing locally)

### 3. **Database Connection Issue**

**Error**: `Connection refused` or `Database error`

**Solution**:
```bash
# Make sure PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Check DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL

# Expected format:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/book_management
```

### 4. **Missing Dependencies**

**Error**: `ModuleNotFoundError` or `ImportError`

**Solution**:
```bash
cd backend
python -m pip install --upgrade pip
pip install -e ".[dev]"
python main.py
```

### 5. **CORS Issues**

**Error**: `No 'Access-Control-Allow-Origin' header`

**Solution**: 
Already configured in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If still having issues, check `backend/.env`:
```
CORS_ORIGINS=["http://localhost:3000"]
```

### 6. **API Key/Environment Missing**

**Error**: `500 Internal Server Error`

**Solution**:
```bash
# Check backend/.env exists
cd backend
ls -la .env  # or 'dir .env' on Windows

# If missing:
cp .env.example .env

# Edit .env and add required values:
# - DATABASE_URL
# - SECRET_KEY
# - OPENROUTER_API_KEY (for AI features)
```

---

## ✅ Verification Steps

### Step 1: Verify Backend is Running
```bash
# In terminal with backend running, check:
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","version":"1.0.0"}
```

### Step 2: Access Root Endpoint
```bash
curl http://localhost:8000/

# Expected response:
# {
#   "message": "Intelligent Book Management System",
#   "version": "1.0.0",
#   "docs_url": "/docs",
#   "api_prefix": "/api/v1"
# }
```

### Step 3: Access API Documentation
```bash
# Test Swagger UI
curl http://localhost:8000/docs

# Should return HTML with Swagger UI
```

### Step 4: Check OpenAPI Schema
```bash
curl http://localhost:8000/openapi.json | python -m json.tool

# Should return JSON with all endpoints defined
```

---

## 🐳 Using Docker Compose (Recommended)

**Easiest solution** - starts all services at once:

```bash
cd "d:\Deepu\Intelligent Management"
docker-compose up
```

Then access:
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

**Troubleshoot Docker**:
```bash
# Check container logs
docker-compose logs backend

# Restart containers
docker-compose restart

# Full rebuild
docker-compose down
docker-compose up --build
```

---

## 📋 Complete Startup Checklist

### Prerequisites
- [ ] Python 3.10+ installed
- [ ] Node.js 16+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Git installed

### Backend Setup
```bash
cd backend
[ ] Virtual environment: python -m venv venv
[ ] Activate: source venv/bin/activate (or venv\Scripts\activate)
[ ] Dependencies: pip install -e ".[dev]"
[ ] Environment: cp .env.example .env
[ ] Edit .env with your values
[ ] Start: python main.py
[ ] Verify: curl http://localhost:8000/docs
```

### Frontend Setup
```bash
cd frontend
[ ] Dependencies: npm install
[ ] Environment: cp .env.example .env
[ ] Start: npm run dev
[ ] Open: http://localhost:3000
```

---

## 🔍 Debugging Commands

### View Backend Logs
```bash
# If running directly
# Logs appear in terminal where you ran: python main.py

# If running in background:
tail -f backend/app.log
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# List books (before authentication)
# This should return 401 Unauthorized (expected)
curl http://localhost:8000/books

# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

### Check Environment Variables
```bash
# Backend
cd backend
cat .env | grep -E "DATABASE_URL|SECRET_KEY|OPENROUTER"

# Frontend
cd frontend
cat .env | grep VITE_API_URL
```

---

## 🚨 Emergency Reset

If everything is broken:

```bash
# Clean up
docker-compose down -v  # Remove volumes
rm -rf backend/venv
rm backend/.env
rm frontend/node_modules
rm frontend/.env

# Fresh start
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -e ".[dev]"
cp .env.example .env
# Edit .env manually

cd ../frontend
npm install
cp .env.example .env
# Edit .env manually

# Start
cd ../backend
python main.py

# In another terminal
cd frontend
npm run dev
```

---

## 📞 If Problem Persists

### Collect Diagnostic Info
```bash
# 1. Python version
python --version

# 2. Backend dependencies
cd backend
pip list | grep -E "fastapi|sqlalchemy|pydantic"

# 3. Backend logs
python main.py 2>&1 | head -50

# 4. Environment check
echo $DATABASE_URL  # or 'echo %DATABASE_URL%' on Windows

# 5. Port check (verify 8000 is free)
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000
```

### Check File Integrity
```bash
# Verify backend structure
ls -R backend/app/

# Verify main.py exists and has content
ls -la backend/main.py
wc -l backend/main.py
```

---

## ✅ Success Indicators

When everything is working correctly:

✅ Terminal shows:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

✅ Browser shows (when visiting http://localhost:8000/docs):
- Swagger UI interface
- All endpoints listed
- Try-it-out functionality works

✅ Health check returns:
```json
{"status":"ok","version":"1.0.0"}
```

✅ Frontend loads at http://localhost:3000 without errors

---

## 📚 Related Documentation

- [Complete Setup Guide](docs/SETUP_GUIDE.md)
- [Backend README](backend/README.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

---

**Last Updated**: January 27, 2026

