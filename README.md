# Project README

Complete Intelligent Book Management System with RAG and Llama3 Integration

## 🎯 Overview

A production-ready, full-stack application for intelligent book management featuring:

- **Backend**: FastAPI with PostgreSQL, async/await, JWT authentication
- **Frontend**: React 18 with TypeScript, Zustand state management
- **AI**: Llama3 integration via OpenRouter for summarization and Q&A
- **Database**: SQLAlchemy ORM with async support
- **Testing**: Comprehensive unit tests for both backend and frontend
- **Deployment**: AWS-ready with CI/CD pipelines

## 📁 Project Structure

```
Intelligent Management/
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── core/                # Configuration, security, database
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Business logic (User, Book, Review, Llama)
│   │   ├── api/routes/          # API endpoints
│   │   ├── utils/               # Utilities and exceptions
│   │   └── main.py              # FastAPI application factory
│   ├── tests/
│   │   ├── unit/                # Unit tests
│   │   ├── integration/         # Integration tests
│   │   └── conftest.py          # Shared fixtures
│   ├── pyproject.toml           # Project configuration
│   ├── main.py                  # Entry point
│   └── README.md                # Backend documentation
│
├── frontend/                     # React TypeScript frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer
│   │   ├── store/               # Zustand state management
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript definitions
│   │   ├── styles/              # CSS stylesheets
│   │   ├── utils/               # Utility functions
│   │   ├── __tests__/           # Unit tests
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── package.json             # Dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── README.md                # Frontend documentation
│
└── docs/                         # Documentation
    ├── SETUP_GUIDE.md           # Complete setup instructions
    └── AWS_DEPLOYMENT.md        # AWS deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- OpenRouter API Key

### 5-Minute Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -e ".[dev]"
cp .env.example .env
# Edit .env with your configuration
python main.py

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📚 Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Role-based access control (user, admin)
- ✅ Secure password hashing

### Book Management
- ✅ Add, update, delete books
- ✅ Browse and search books
- ✅ View book details and summaries
- ✅ Manage book collections

### Reviews & Ratings
- ✅ Submit reviews and ratings
- ✅ View all reviews for a book
- ✅ Aggregate ratings
- ✅ Delete reviews

### AI Features
- ✅ AI-generated summaries using Llama3
- ✅ Book recommendations based on preferences
- ✅ RAG-based Q&A interface
- ✅ Embeddings for semantic search

### Technical Excellence
- ✅ Async/await patterns throughout
- ✅ Comprehensive error handling and logging
- ✅ Full test coverage
- ✅ API documentation with Swagger/OpenAPI
- ✅ Modular, scalable architecture
- ✅ Production-ready code quality

## 🔧 Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/book_management
DATABASE_ECHO=false

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI
OPENROUTER_API_KEY=your-openrouter-api-key
LLAMA_MODEL=meta-llama/llama-3-8b-instruct

# Application
DEBUG=true
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest --cov=app               # With coverage
pytest tests/unit/             # Unit tests only
pytest -v -s                   # Verbose with output
```

### Frontend Tests
```bash
cd frontend
npm run test                    # Run tests
npm run test:coverage          # With coverage
npm run test:ui                # Interactive UI
```

## 📖 API Documentation

### Access API Docs
> **⚠️ Important**: Backend must be running to access API documentation!

**After starting the backend** (`python main.py`), visit:
- **Swagger UI**: http://localhost:8000/docs (interactive testing)
- **ReDoc**: http://localhost:8000/redoc (read-only documentation)
- **OpenAPI JSON**: http://localhost:8000/openapi.json (raw schema)

**Troubleshooting**: If you get an error, see [API_DOCUMENTATION_TROUBLESHOOTING.md](API_DOCUMENTATION_TROUBLESHOOTING.md)

### Main Endpoints

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

**Books**
- `GET /books` - List all books
- `POST /books` - Create book
- `GET /books/{id}` - Get book details
- `PUT /books/{id}` - Update book
- `DELETE /books/{id}` - Delete book
- `GET /books/{id}/summary` - Get book summary

**Reviews**
- `GET /books/{book_id}/reviews` - List reviews
- `POST /books/{book_id}/reviews` - Add review
- `DELETE /books/{book_id}/reviews/{review_id}` - Delete review

**AI**
- `POST /ai/generate-summary` - Generate summary
- `POST /ai/recommendations` - Get recommendations
- `POST /ai/qa` - Ask question (RAG)

## 🚢 Deployment

### Local Development
See [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

### AWS Production
See [AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md)

### Docker

```bash
# Backend
cd backend
docker build -t book-management-backend .
docker run -p 8000:8000 book-management-backend

# Frontend
cd frontend
docker build -t book-management-frontend .
docker run -p 3000:3000 book-management-frontend
```

## 🏗️ Architecture

### Backend Architecture
```
Request → CORS Middleware → Router → Authentication
  → Service Layer → Database ORM → PostgreSQL
```

### Database Schema
```
users (id, username, email, hashed_password, role, ...)
  ├── books (id, owner_id, title, author, ...)
  │   └── reviews (id, book_id, user_id, rating, ...)
  └── documents (id, owner_id, filename, ingestion_status, ...)
```

### Frontend Architecture
```
App Router → Protected Route → Layout
  → Pages → Components → Services → Zustand Store → API
```

## 📊 Code Quality

- **Type Safety**: Full TypeScript coverage
- **Testing**: Unit tests for all services
- **Documentation**: Comprehensive docstrings
- **Linting**: ESLint, Flake8
- **Formatting**: Black, Prettier
- **Security**: CORS, XSS protection, secure headers

## 🔐 Security Features

- JWT authentication with expiration
- Bcrypt password hashing
- SQL injection prevention via ORM
- CORS configuration
- XSS protection via React
- Environment variable management
- Secure session handling

## 📈 Performance Optimizations

- Database connection pooling
- Async/await for non-blocking I/O
- Pagination for list endpoints
- CSS minification
- Code splitting
- Response compression
- Caching headers

## 🛠️ Development Tools

### Backend
- FastAPI - Modern web framework
- SQLAlchemy - ORM
- Pydantic - Data validation
- Pytest - Testing framework
- Black - Code formatter
- MyPy - Type checker

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Zustand - State management
- Axios - HTTP client
- Vitest - Test framework
- Vite - Build tool

## 📝 Documentation

- [Complete Setup Guide](docs/SETUP_GUIDE.md)
- [AWS Deployment Guide](docs/AWS_DEPLOYMENT.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [API Documentation](http://localhost:8000/docs)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Write tests for new code
3. Follow code style guidelines
4. Submit pull request

## 📄 License

MIT

## 👥 Support

For issues, questions, or suggestions:
1. Check the documentation
2. Review existing issues
3. Create new issue with details
4. Contact development team

---

**Built with ❤️ for production-ready applications**

Last Updated: January 2026
