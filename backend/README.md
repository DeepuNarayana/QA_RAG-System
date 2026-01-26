# Backend - Intelligent Book Management System

A production-ready Python FastAPI backend for intelligent book management with RAG and Llama3 integration.

## Features

- ✅ Asynchronous API with FastAPI
- ✅ PostgreSQL database with SQLAlchemy ORM
- ✅ JWT authentication and authorization
- ✅ Llama3 integration via OpenRouter for summarization
- ✅ RESTful API with full CRUD operations
- ✅ Comprehensive error handling and logging
- ✅ Unit tests with pytest
- ✅ API documentation with Swagger/OpenAPI
- ✅ Modular, scalable architecture

## Project Structure

```
backend/
├── app/
│   ├── core/              # Core configuration, database, security
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic validation schemas
│   ├── services/          # Business logic layer
│   ├── api/
│   │   └── routes/        # API endpoints (auth, books, reviews, ai)
│   ├── utils/             # Utilities and exceptions
│   └── main.py            # FastAPI app factory
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── conftest.py        # Shared test fixtures
├── pyproject.toml         # Project configuration
├── .env.example          # Environment variables template
└── main.py               # Entry point
```

## Setup Instructions

### 1. Prerequisites

- Python 3.10+
- PostgreSQL 12+
- OpenRouter API Key (for Llama3)
- Virtual environment (recommended)

### 2. Install Dependencies

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Update .env with your configuration
# - DATABASE_URL: PostgreSQL connection string
# - SECRET_KEY: Generate a secure key
# - OPENROUTER_API_KEY: Your OpenRouter API key
# - LLAMA_MODEL: Llama model to use
```

### 4. Database Setup

```bash
# Create database
createdb book_management

# Initialize schema (automatic on app startup)
python main.py
```

### 5. Run the Application

```bash
# Development mode
python main.py

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with documentation at `/docs`.

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token

### Books
- `GET /books` - List all books
- `POST /books` - Create book
- `GET /books/{id}` - Get book details
- `PUT /books/{id}` - Update book
- `DELETE /books/{id}` - Delete book
- `GET /books/{id}/summary` - Get book summary with ratings

### Reviews
- `GET /books/{book_id}/reviews` - List reviews
- `POST /books/{book_id}/reviews` - Add review
- `DELETE /books/{book_id}/reviews/{review_id}` - Delete review

### AI
- `POST /ai/generate-summary` - Generate content summary
- `POST /ai/recommendations` - Get book recommendations
- `POST /ai/qa` - Ask question (RAG-based)

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/unit/test_user_service.py

# Run in watch mode
pytest-watch
```

## Code Quality

```bash
# Format code
black app/

# Lint
flake8 app/
isort app/

# Type checking
mypy app/
```

## Deployment

### Docker

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY . .
RUN pip install -e .
CMD ["python", "main.py"]
```

### AWS Deployment

1. **RDS**: Create PostgreSQL database instance
2. **EC2/Lambda**: Deploy FastAPI application
3. **S3**: Store any model files or documents
4. **CloudWatch**: Monitor logs and metrics

See [AWS Deployment Guide](../docs/AWS_DEPLOYMENT.md) for detailed steps.

## Configuration

Key environment variables:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
DATABASE_ECHO=false

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI
OPENROUTER_API_KEY=your-key
LLAMA_MODEL=meta-llama/llama-3-8b-instruct

# Application
DEBUG=true
ENVIRONMENT=development
```

## Error Handling

The API returns structured error responses:

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

## Logging

Logs are written to `logs/app.log` with rotation:
- Max file size: 10 MB
- Backup count: 10
- Format: JSON-compatible structured logs

## Performance Considerations

- Connection pooling: 20 pool size, 30 max overflow
- Async/await for non-blocking I/O
- Pagination support for list endpoints
- Redis caching for recommendations (optional)

## Security

- Password hashing with bcrypt
- JWT token-based authentication
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration for frontend
- HTTPS recommended for production

## Contributing

1. Write tests for new features
2. Follow PEP 8 style guide
3. Use type hints
4. Update documentation

## License

MIT
