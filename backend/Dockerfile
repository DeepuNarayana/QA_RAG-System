# Backend Dockerfile - FastAPI Application
# Multi-stage build for optimization and smaller image size

FROM python:3.13-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy project files for installation
COPY backend/pyproject.toml backend/README.md ./
COPY backend/app ./app

# Install dependencies
RUN pip install --upgrade pip setuptools wheel && \
    pip install -e .

# ============================================
# Production stage
# ============================================
FROM python:3.13-slim

# Install runtime dependencies only (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Create non-root user for security
RUN useradd -m -u 1000 appuser

# Set working directory
WORKDIR /app

# Copy application code from builder stage
COPY --chown=appuser:appuser backend/app ./app
COPY --chown=appuser:appuser backend/main.py ./
COPY --chown=appuser:appuser backend/.env* ./

# Create necessary directories
RUN mkdir -p uploads data logs && \
    chown -R appuser:appuser /app

# Switch to non-root user for security
USER appuser

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

# Expose API port
EXPOSE 8000

# Run Uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
