# LuminaLib Architecture

This document describes the proposed production-grade architecture for "LuminaLib": a content-aware library system that manages actual book files (PDF/EPUB), extracts embeddings, uses a local LLM to synthesize reader sentiment, and provides ML-driven discovery. The design follows Clean Architecture and SOLID principles, emphasizes async I/O for responsiveness, and keeps heavy CPU work off the HTTP request path.

Goals
- Content-aware: operate on real book files, not just metadata
- Configurable providers: swap LLM, storage, or embedding backends via configuration
- Clean Architecture: strict separation between API, application logic (use-cases), domain entities, and infrastructure adapters
- Async-first: use asyncio-friendly libraries for I/O; offload CPU-bound tasks to workers
- Testable and observable: provider contracts, health checks, metrics

Table of contents
- High-level overview
- Architectural layers
- Core interfaces (ports) and example method signatures
- Data flows (ingest, query/RAG, feedback loop)
- Providers and configuration
- Async & worker strategy
- Embedding/Vector-store options
- Local LLM options and constraints
- Security, observability, and ops
- Recommended files to add or change (scaffold plan)

---

## High-level overview

Users interact via a FastAPI HTTP API (`backend/app/api/*`) and (optionally) a web UI (`frontend`). The backend orchestrates ingestion, storage, embedding generation, and retrieval. Core responsibilities:
- Receive and store uploaded book files
- Extract text and metadata from files
- Chunk content and generate embeddings
- Persist embeddings in a vector store and metadata in the DB
- Answer queries via RAG (retrieve candidate chunks → local LLM synthesizes answer and sentiment)
- Provide discovery and recommendation services driven by ML models

A minimal runtime topology:
- PostgreSQL: store metadata and user data
- Object storage: local filesystem or S3-compatible storage for file blobs
- Vector store: FAISS (local), Redis/Redis-Vector, or managed vector DB
- LLM: OpenRouter remote, local transformer, or mocked HTTP service for dev
- Worker: background queue (e.g., Celery/RQ) for heavy ingestion/training

---

## Architectural layers

1. API / Controllers (FastAPI)
   - Files: `backend/app/api/routes/*`
   - Responsibilities: validation, authentication, mapping requests to use-cases

2. Use-cases / Application Services
   - Files: `backend/app/services/*` (e.g., `document_ingest.py`, `search_service.py`)
   - Responsibilities: implement orchestration and business rules; depend only on ports (interfaces)

3. Domain / Entities
   - Files: `backend/app/models/*` and `backend/app/schemas/*`
   - Responsibilities: Pydantic schemas, SQLAlchemy ORM models

4. Ports / Interfaces (Adapters)
   - Files (suggested): `backend/app/ports/llm.py`, `.../storage.py`, `.../embedding_store.py`
   - Responsibilities: abstract external systems. Use cases depend on these.

5. Infrastructure / Adapters
   - Files (examples): `backend/app/adapters/llm_openrouter.py`, `.../llm_local.py`, `.../storage_local.py`, `.../faiss_store.py`
   - Responsibilities: concrete implementations of the ports

6. Composition Root / DI
   - Files: `backend/app/core/di.py` (factory functions reading `settings` and providing instances)

---

## Core interfaces (ports)

Keep interfaces small and stable. Example signatures (Python / asyncio):

- LLMProvider (backend/app/ports/llm.py)

```py
class LLMProvider(ABC):
    async def generate_summary(self, content: str, max_length: int = 500) -> str: ...
    async def generate_embeddings(self, text: str) -> list[float]: ...
    async def generate_sentiment(self, text: str) -> dict: ...  # {score, label}
    async def generate_recommendations(self, context: str, k: int = 5) -> str: ...
```

- StorageProvider (backend/app/ports/storage.py)

```py
class StorageProvider(ABC):
    async def save_file(self, path: str, file_stream: AsyncIterator[bytes]) -> str: ...  # returns object id/URL
    async def read_file(self, object_id: str) -> AsyncIterator[bytes]: ...
    async def stat(self, object_id: str) -> dict: ...
    def get_presigned_url(self, object_id: str, expires: int = 3600) -> str: ...
```

- EmbeddingStore (backend/app/ports/embedding_store.py)

```py
class EmbeddingStore(ABC):
    async def upsert(self, id: str, vector: list[float], metadata: dict) -> None: ...
    async def query(self, vector: list[float], top_k: int = 10) -> list[dict]: ...  # returns metadata + score
    async def remove(self, id: str) -> None: ...
    async def save_index(self, path: str) -> None: ...
    async def load_index(self, path: str) -> None: ...
```

- MetadataRepository (DB operations) — keep DB access behind an async repo

```py
class DocumentRepository(ABC):
    async def create(self, document: Document) -> Document: ...
    async def get(self, id: int) -> Document | None: ...
    async def list_pending_ingest(self) -> list[Document]: ...
```

---

## Data flows

### Ingest flow (async)
1. API receives file upload → Controller stores a temporary record (Document with status=queued) in PostgreSQL
2. Controller invokes `StorageProvider.save_file()` to persist blob (returns object_id)
3. Controller enqueues ingestion job (background worker or FastAPI BackgroundTasks)
4. Worker runs `DocumentIngestor`:
   - Extract text (PDF/EPUB): `pdfminer.six`, `textract`, or `ebooklib` (ensure stream processing)
   - Chunk text (configurable chunk_size & overlap)
   - Generate embeddings per chunk via `LLMProvider.generate_embeddings()` or a dedicated embedding model
   - Upsert vectors into `EmbeddingStore` with metadata pointing to document & chunk offsets
   - Update Document ingestion status in DB

### Query / RAG flow (fast path)
1. API receives query → `SearchService`
2. `SearchService` calls `LLMProvider.generate_embeddings()` for the query (or server-side embedding endpoint)
3. `EmbeddingStore.query()` returns nearest chunks (metadata + similarity score)
4. Controller fetches chunk text via `StorageProvider.read_file()` or from a text cache
5. Compose prompt using retrieved chunks and pass to `LLMProvider.generate_summary()` or `generate_sentiment()` to synthesize answer
6. Return answer + provenance (chunk ids, score, source file)

### Feedback/Model training flow (offline)
- Periodically (scheduled job) aggregate user feedback, retrain ranking/discovery models, update embeddings if needed
- Store model artifacts and index snapshots in `data/` or an object store

---

## Providers & configuration

Use environment-driven selection with the `Settings` object in `backend/app/core/config.py`. Example keys (add to `.env.example`):

```
LLM_PROVIDER=openrouter|mock|local
LLM_URL=http://mock-llm:5005  # when mock is used or local serves on HTTP
STORAGE_PROVIDER=local|s3
STORAGE_URL=/data/books or s3://bucket/path
EMBEDDING_BACKEND=faiss|redis
```

The composition root (`core/di.py`) should read `settings` and instantiate adapters:
- `get_llm_provider()` (openrouter/mock/local)
- `get_storage_provider()` (local/s3)
- `get_embedding_store()` (faiss/redis)

This pattern is implemented in `backend/app/services/llama_service.py` in a minimal form. Extend the same approach across all providers.

---

## Async & worker strategy

- I/O-bound operations (HTTP calls to remote LLM/OpenRouter, DB access via SQLAlchemy async, storage via async libs) must be `async`.
- CPU-bound operations (embedding generation with sentence-transformers on CPU, model inference for local LLM) should run in separate worker processes to avoid blocking the event loop.
- Recommended worker designs:
  - Small-scale: FastAPI `BackgroundTasks` for short jobs; spawn a separate service for heavy ingestion.
  - Production: Celery with Redis broker, or RQ, or a custom async worker using multiprocessing + queue.
- Job contract: ingestion endpoints return a `job_id` and the worker updates status via DB.

---

## Embedding / Vector store choices

- FAISS (local, persisted to disk): good for dev and single-node production
  - Use `faiss-cpu` (already in pyproject); persist index files under `data/faiss/` and save periodically
  - Provide a thread-safe or process-safe mechanism to serve queries (worker overloaded considerations)

- Redis (vector similarity module): easier to scale horizontally; good for production clusters

- Managed vector DB: Pinecone, Milvus, etc. Provide adapter implementing `EmbeddingStore`.

Design note: keep metadata (document id, chunk offset, text pointer) in metadata returned by the vector store rather than embedding store storing raw text.

---

## Local LLM options

- `LLM_PROVIDER=local` should support running an on-host inference engine (e.g., using `transformers` for small models or a gGML/llama.cpp bridge). Constraints:
  - Resource usage: document accordingly; warn about memory/CPU needs
  - Isolation: run local LLM in a separate process or container and talk over HTTP (keeps FastAPI responsive)

- The repository contains `mock_llm/` for development. Keep this as a simple reference implementation and a test-double.

---

## Security & privacy

- Store sensitive keys in environment variables via `.env` (Pydantic BaseSettings loads `.env` by default).
- Avoid logging user-provided content or PII in raw form.
- If using S3, use pre-signed URLs for downloads; if local storage, enforce RBAC and authenticated download routes.
- Ensure CORS and JWT settings are configured in `backend/app/core/config.py`.

---

## Observability & health

- Health endpoint `/health` should check:
  - DB connectivity
  - Embedding store availability (or at least can `load_index()` / ping)
  - LLM connectivity (when remote) and worker queue length
- Structured logs using existing `get_logger()`
- Expose Prometheus metrics (request counts, job durations, vector queries) via a `/metrics` endpoint

---

## Testing strategy

- Unit tests: adapters with small in-memory fixtures
- Contract tests: provider behavior (e.g., `tests/contracts/test_llm_contract.py`) that validate any new LLM provider implements expected behaviors
- Integration tests: docker-compose based tests (postgres + redis + mock-llm + backend) for end-to-end flows: ingest → query
- Add `pytest` markers and CI workflow that runs unit and smoke integration tests

---

## Recommended file scaffolding & next steps (implementation roadmap)

1. `docs/LUMINALIB_ARCHITECTURE.md` (this doc) — completed
2. `backend/app/core/di.py` — factory functions: `get_llm_provider()`, `get_storage_provider()`, `get_embedding_store()`
3. `backend/app/ports/` — add `llm.py`, `storage.py`, `embedding_store.py`, `repositories.py` (ABCs)
4. `backend/app/adapters/` — implement `storage_local.py`, `faiss_store.py`, `llm_openrouter.py`, `llm_local.py`, `mock_llm_client.py`
5. `backend/app/services/document_ingest.py` — ingestion orchestration (background job contract)
6. `backend/app/api/routes/uploads.py` — replace direct file handling with `StorageProvider` and enqueue job
7. Add `.env.example` entries for `LLM_PROVIDER`, `STORAGE_PROVIDER`, `EMBEDDING_BACKEND`
8. Add CI job that runs unit tests and builds a minimal docker-compose environment for smoke tests

---

## Implementation notes & rationale

- Favor composition over inheritance for adapters. Each provider should be a small class implementing a port.
- Keep business logic in services/use-cases to make it straightforward to test by mocking ports.
- Use dependency injection (`Depends(get_llm_provider)`) where appropriate so tests can inject test doubles.
- Keep heavy operations out of request thread by using a job queue and worker.
- Provide clear operator docs about resource needs for local LLMs and embedding pipelines.

---

If you approve this architecture, I will scaffold the DI skeleton (`backend/app/core/di.py`) and the minimal ports/adapters for `StorageProvider` and `EmbeddingStore` (deliverable B & C from the plan).