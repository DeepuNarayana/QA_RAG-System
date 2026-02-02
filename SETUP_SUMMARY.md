# 📋 Local Setup Guide Summary

## What You Need to Know

### Three Ways to Start

#### **Option 1: Fastest (Automated Setup)** ⚡
```powershell
.\setup.ps1
```
- Automatically installs everything
- Creates configuration files
- Takes ~3-5 minutes
- **Best for first-time setup**

#### **Option 2: Quick Manual** ⚡⚡
Follow [QUICK_START.md](QUICK_START.md) - 5 minute guide with just the essentials

#### **Option 3: Detailed Guide** 📖
Follow [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md) - Complete setup with explanations

---

## The 2-Terminal Method (If Already Installed)

### Terminal 1 - Backend
```powershell
cd d:\Deepu\LuminaLib
.\.venv\Scripts\Activate.ps1
cd "Intelligent Management\backend"
python main.py
```

### Terminal 2 - Frontend
```powershell
cd "d:\Deepu\LuminaLib\Intelligent Management\frontend"
npm run dev
```

### Then Visit
```
http://localhost:3000
```

**That's it!** ✅

---

## Pre-Requirements

Check you have these installed (run in PowerShell):

```powershell
python --version           # Should be 3.8+
node --version            # Should be 16+
npm --version             # Should be 8+
```

If missing, install them first:
- **Python**: https://python.org
- **Node**: https://nodejs.org
- **npm**: Comes with Node

---

## Files You'll Need

These are created automatically:

### `backend/.env`
```
ENVIRONMENT=development
DATABASE_URL=sqlite:///./data.db
SECRET_KEY=dev-key
ALGORITHM=HS256
ALLOWED_ORIGINS=http://localhost:3000
```

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Lumina Library
```

---

## Login Credentials

```
Email: user@example.com
Password: password123
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "python: not found" | Install Python 3.8+ |
| "node: not found" | Install Node.js 16+ |
| "Port 3000 already in use" | `npm run dev -- -p 3001` |
| "Port 8000 already in use" | Use different port in backend |
| "Cannot find module" | Run `npm install` again |
| "ModuleNotFoundError" | Run `pip install -r requirements.txt` again |

---

## What Gets Started

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:8000 | 8000 |
| API Docs | http://localhost:8000/docs | 8000 |

---

## Verify It's Working

### Backend Verification
```powershell
Invoke-WebRequest http://localhost:8000/docs
```

### Frontend Verification
- Open http://localhost:3000 in browser
- Should see Lumina Library home page

### API Verification
```powershell
Invoke-WebRequest http://localhost:8000/api/health
```

---

## First Things to Try

1. Browse books on home page
2. Upload document in Documents section
3. Monitor processing in Ingestion section
4. Ask questions in Q&A section
5. Explore Admin section if you're admin

---

## Daily Startup

Every time you want to work on the project:

1. **Terminal 1**: Backend
   ```powershell
   cd d:\Deepu\LuminaLib
   .\.venv\Scripts\Activate.ps1
   cd "Intelligent Management\backend"
   python main.py
   ```

2. **Terminal 2**: Frontend
   ```powershell
   cd "d:\Deepu\LuminaLib\Intelligent Management\frontend"
   npm run dev
   ```

3. **Browser**: Visit http://localhost:3000

---

## Directory Structure

```
d:\Deepu\LuminaLib\
├── Intelligent Management/
│   ├── frontend/              (React/Next.js)
│   ├── backend/               (Python/FastAPI)
│   ├── README_SETUP.md        (This file)
│   ├── QUICK_START.md         (5-min guide)
│   ├── LOCAL_SETUP_GUIDE.md   (Detailed guide)
│   ├── setup.ps1              (Auto setup)
│   └── setup.bat              (Batch setup)
└── .venv/                     (Python environment)
```

---

## Documentation Quick Links

- **README_SETUP.md** ← You are here
- **[QUICK_START.md](QUICK_START.md)** - 5 minute setup
- **[LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)** - Detailed instructions
- **[FRONTEND_DOCUMENTATION_INDEX.md](FRONTEND_DOCUMENTATION_INDEX.md)** - Feature docs
- **[PHASE_3_IMPLEMENTATION.md](PHASE_3_IMPLEMENTATION.md)** - Technical details

---

## Need Help?

1. **Stuck on setup?** → Read [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)
2. **Want quick start?** → Read [QUICK_START.md](QUICK_START.md)
3. **Error messages?** → Check troubleshooting in LOCAL_SETUP_GUIDE.md
4. **Feature questions?** → Check [FRONTEND_DOCUMENTATION_INDEX.md](FRONTEND_DOCUMENTATION_INDEX.md)

---

## Troubleshooting Checklist

- [ ] Python 3.8+ installed?
- [ ] Node.js 16+ installed?
- [ ] npm 8+ installed?
- [ ] Ports 3000 & 8000 free?
- [ ] Ran automated setup or manual setup?
- [ ] Backend running (terminal 1)?
- [ ] Frontend running (terminal 2)?
- [ ] Can access http://localhost:3000?
- [ ] Can login with test credentials?

---

## What's Running

### Frontend (Port 3000)
- User interface
- Document management
- Ingestion monitoring
- Q&A interface
- Admin dashboard

### Backend (Port 8000)
- REST API
- Authentication
- Document processing
- AI Q&A
- User management
- Database

---

## Quick Commands

```powershell
# Setup/Install
npm install                    # Install frontend deps
pip install -r requirements.txt # Install backend deps

# Running
npm run dev                    # Start frontend
python main.py                 # Start backend

# Testing
npm test                       # Frontend tests
pytest                         # Backend tests

# Building
npm run build                  # Build frontend
# Backend doesn't need building

# Debugging
npm run type-check            # Check TypeScript
pytest -v                     # Verbose backend tests
```

---

## Still Stuck?

**Option 1**: Run automated setup
```powershell
.\setup.ps1
```

**Option 2**: Delete and reinstall
```powershell
# Frontend
rmdir node_modules -Recurse -Force
npm install

# Backend
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

**Option 3**: Check ports are free
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

If ports show processes, change your port:
- Frontend: `npm run dev -- -p 3001`
- Backend: Edit port in main.py

---

## Success! 🎉

When you see this:

**Backend:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Frontend:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**And you can access:**
- http://localhost:3000 (Frontend)
- http://localhost:8000/docs (API)

✅ **You're all set!**


