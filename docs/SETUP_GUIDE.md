# Complete Setup Guide - Intelligent Book Management System

This guide provides step-by-step instructions to set up and run the complete application locally.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [AWS Deployment](#aws-deployment)

---

## System Requirements

### Hardware
- CPU: 2+ cores
- RAM: 4 GB minimum (8 GB recommended)
- Storage: 5 GB free space

### Software
- **Python**: 3.10 or higher
- **Node.js**: 16 or higher
- **npm**: 8 or higher
- **PostgreSQL**: 12 or higher
- **Git**: Latest version

### Optional
- Docker (for containerization)
- AWS CLI (for deployment)
- Redis (for caching)

---

## Backend Setup

### Step 1: Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -e ".[dev]"
```

### Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Required:
# - DATABASE_URL: postgresql+asyncpg://user:password@localhost:5432/book_management
# - SECRET_KEY: Generate a secure key (at least 32 characters)
# - OPENROUTER_API_KEY: Get from https://openrouter.ai/
# - LLAMA_MODEL: meta-llama/llama-3-8b-instruct
```

### Step 3: Set Up PostgreSQL Database

```bash
# Create database
createdb book_management

# Or using psql:
psql -U postgres -c "CREATE DATABASE book_management;"

# Test connection
psql -U postgres -d book_management -c "SELECT version();"
```

### Step 4: Initialize Database Schema

```bash
# The database schema will be created automatically on first run
# Or manually:
python -c "from app.core import init_db; import asyncio; asyncio.run(init_db())"
```

### Step 5: Run Backend Server

```bash
# Start the development server
python main.py

# Or using uvicorn directly:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### Step 6: Run Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/unit/test_user_service.py -v

# Run in watch mode
pytest-watch
```

---

## Frontend Setup

### Step 1: Install Node Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# The default VITE_API_URL=http://localhost:8000 should work
# If backend is on different host, update it
```

### Step 3: Run Frontend Development Server

```bash
# Start development server
npm run dev

# Or with yarn
yarn dev
```

The frontend will be available at `http://localhost:3000`

### Step 4: Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

### Step 5: Run Frontend Tests

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run test:coverage

# Open test UI
npm run test:ui
```

### Step 6: Code Quality Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

---

## Running the Application

### Complete Setup (All Services)

```bash
# Terminal 1: Start PostgreSQL (if not running as service)
# On Windows: pg_ctl -D "C:\Program Files\PostgreSQL\data" start
# On macOS: brew services start postgresql
# On Linux: sudo systemctl start postgresql

# Terminal 2: Start Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### Verify Everything Works

1. **Backend API**: Visit `http://localhost:8000/docs`
   - Should see Swagger UI with all endpoints

2. **Frontend**: Visit `http://localhost:3000`
   - Should see home page
   - Click "Sign Up" and create account
   - Should redirect to login
   - Login with created credentials
   - Should see "Books" page

3. **Database**: Check PostgreSQL connection
   ```bash
   psql -U postgres -d book_management -c "SELECT * FROM users;"
   ```

---

## Testing

### Backend Testing

```bash
# Unit tests only
pytest tests/unit/

# Integration tests only
pytest tests/integration/

# Specific test
pytest tests/unit/test_user_service.py::test_create_user_success -v

# With detailed output
pytest -vv --tb=short

# Stop on first failure
pytest -x
```

### Frontend Testing

```bash
# Run Vitest
npm run test

# Watch mode
npm run test -- --watch

# UI mode (interactive)
npm run test:ui

# Coverage
npm run test:coverage
```

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use**
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**PostgreSQL connection error**
```bash
# Check PostgreSQL is running
sudo service postgresql status  # Linux
brew services list | grep postgres  # macOS
# Windows: Check Services in Task Manager

# Check connection string in .env
# Format: postgresql+asyncpg://username:password@localhost:5432/database_name

# Test connection
psql -U postgres -h localhost -d book_management
```

**Module not found errors**
```bash
# Reinstall dependencies
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
```

**Database errors**
```bash
# Drop and recreate database
dropdb book_management
createdb book_management

# Or in psql:
DROP DATABASE book_management;
CREATE DATABASE book_management;
```

### Frontend Issues

**Port 3000 already in use**
```bash
# macOS/Linux
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**npm dependencies issues**
```bash
# Clear cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API calls not working**
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify frontend .env has correct API URL
cat .env

# Check browser console for CORS errors
# If CORS error, check CORS_ORIGINS in backend .env
```

---

## AWS Deployment

### Prerequisites
- AWS account
- AWS CLI configured
- Docker (optional)

### Database Setup (RDS)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier book-management-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-secure-password \
  --allocated-storage 20

# Wait for DB to be available
aws rds describe-db-instances --db-instance-identifier book-management-db
```

### Backend Deployment (EC2)

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name your-key-pair

# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# On EC2 instance:
sudo yum update -y
sudo yum install python3 python3-pip git -y

# Clone repository
git clone <your-repo-url>
cd Intelligent\ Management/backend

# Setup backend (same as local setup)
python3 -m venv venv
source venv/bin/activate
pip install -e ".[dev]"

# Copy and configure .env
cp .env.example .env
# Edit .env with RDS database URL

# Start application
python main.py
```

### Frontend Deployment (S3 + CloudFront)

```bash
# Build frontend
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://book-management-frontend

# Upload build files
aws s3 sync dist/ s3://book-management-frontend

# Configure S3 for static website hosting
aws s3 website s3://book-management-frontend \
  --index-document index.html \
  --error-document index.html

# Create CloudFront distribution (via AWS Console recommended)
```

### CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # Deploy backend to EC2/Lambda
          
      - name: Deploy Frontend
        run: |
          # Deploy frontend to S3
```

See [AWS Deployment Guide](AWS_DEPLOYMENT.md) for detailed instructions.

---

## Production Checklist

- [ ] Environment variables configured securely
- [ ] Database backups configured
- [ ] HTTPS/SSL certificates installed
- [ ] Database migrations run
- [ ] Logs configured and monitored
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Performance monitoring setup
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] API documentation generated
- [ ] Disaster recovery plan in place

---

## Performance Optimization

### Backend
- Enable query caching with Redis
- Use connection pooling
- Implement pagination
- Add database indexes
- Monitor slow queries

### Frontend
- Code splitting with React Router
- Lazy load images
- Enable compression
- Minify assets
- Cache static files
- Use CDN

---

## Support and Documentation

- **API Documentation**: http://localhost:8000/docs
- **Backend README**: `/backend/README.md`
- **Frontend README**: `/frontend/README.md`
- **AWS Deployment Guide**: `/docs/AWS_DEPLOYMENT.md`

---

## Next Steps

1. Complete setup using this guide
2. Run tests to verify installation
3. Explore API documentation
4. Create test data
5. Deploy to production

Happy coding! 🚀
