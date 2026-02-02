# System Architecture Diagram & Overview

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js + React)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Error Handling Layer                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │ ErrorBoundary│  │ ErrorContext │  │ ErrorDisplay Widget  │  │   │
│  │  │ (Catches UI  │  │ (Global      │  │ (Shows notifications)│  │   │
│  │  │  crashes)    │  │  error state)│  │                      │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  △                                       │
│                                  │                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Components Layer                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │BookList  │ │BookCard  │ │Reviews   │ │Recommendations   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │Upload    │ │Borrow    │ │Return    │ │Recommendations   │   │   │
│  │  │Form      │ │Button    │ │Button    │ │Sidebar           │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  △                                       │
│                                  │                                       │
│                    useErrorHandler() Hook                                │
│                            │                                             │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       API Service Layer                         │   │
│  │              (services/api.ts + Axios Client)                  │   │
│  │                                                                 │   │
│  │  • Centralized API endpoints                                   │   │
│  │  • Response interceptor for error handling                     │   │
│  │  • Type-safe API methods (Book, Review, Borrow, etc.)        │   │
│  │  • Auto-error display via useError() hook                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  △                                       │
│                                  │                                       │
│                         HTTP/JSON over TCP/IP                            │
│                                  │                                       │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             │
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI + Python)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │            Dependency Injection Container (DI)                │    │
│  │                                                                │    │
│  │  ┌──────────────────┐  ┌──────────────────────────────────┐   │    │
│  │  │ Container Class  │  │  Environment Variable Config     │   │    │
│  │  │                  │  │  STORAGE_PROVIDER=local          │   │    │
│  │  │ • get_storage()  │  │  LLM_PROVIDER=openrouter         │   │    │
│  │  │ • get_llm()      │  │  OPENROUTER_API_KEY=sk-xxx       │   │    │
│  │  └──────────────────┘  └──────────────────────────────────┘   │    │
│  │                                                                │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │           Provider Factories                            │ │    │
│  │  │                                                          │ │    │
│  │  │  • create_storage_provider(type, config)               │ │    │
│  │  │  • create_llm_provider(type, config)                   │ │    │
│  │  │  • initialize_container() - Called on startup          │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  △                                       │
│                                  │ Injected into                         │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │             API Routes Layer (app/api/routes/)                │    │
│  │                                                                │    │
│  │  • books.py - Book CRUD, upload, borrow, return             │    │
│  │  • reviews.py - Review creation and retrieval               │    │
│  │  • ai.py - AI recommendations                               │    │
│  │  • auth.py - JWT authentication                             │    │
│  │                                                                │    │
│  │  All routes receive injected providers:                      │    │
│  │  storage = container.get_storage_provider()                │    │
│  │  llm = container.get_llm_provider()                         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  △                                       │
│                                  │ Uses                                  │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │           Services Layer (app/services/)                      │    │
│  │                                                                │    │
│  │  • BookService - Book business logic                         │    │
│  │  • ReviewService - Review management                         │    │
│  │  • BorrowService - Borrow/return mechanics                  │    │
│  │  • RecommendationService - Collaborative filtering           │    │
│  │  • BackgroundTasks - Async summarization & analysis          │    │
│  │                                                                │    │
│  │  Services use injected providers:                            │    │
│  │  llm = container.get_llm_provider()                         │    │
│  │  summary = await llm.generate_book_summary(content)         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  △                                       │
│                                  │ Uses                                  │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │      Storage Providers (Pluggable via Config)                │    │
│  │                                                                │    │
│  │  ┌──────────────────────┐    ┌──────────────────────┐        │    │
│  │  │LocalStorageProvider  │    │S3StorageProvider     │        │    │
│  │  │(Files on disk)       │    │(AWS S3 cloud)        │        │    │
│  │  │✓ Production ready    │    │🔧 Needs boto3        │        │    │
│  │  └──────────────────────┘    └──────────────────────┘        │    │
│  │                                                                │    │
│  │  All implement StorageProvider protocol:                     │    │
│  │  • async save_file(filename, content)                       │    │
│  │  • async read_file(path)                                    │    │
│  │  • async delete_file(path)                                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │      LLM Providers (Pluggable via Config)                    │    │
│  │                                                                │    │
│  │  ┌─────────────────┐  ┌─────────────────┐ ┌──────────────┐   │    │
│  │  │MockLLMProvider  │  │OpenRouterLLM    │ │OpenAIProvider│   │    │
│  │  │(For testing)    │  │(Llama3 online)  │ │(OpenAI API)  │   │    │
│  │  │✓ Ready          │  │🔧 API call      │ │🔧 API key    │   │    │
│  │  └─────────────────┘  └─────────────────┘ └──────────────┘   │    │
│  │                                                                │    │
│  │  All implement LLMProvider protocol:                         │    │
│  │  • async generate_book_summary(content)                     │    │
│  │  • async analyze_reviews(review_list)                       │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │      Models Layer (app/models/)                              │    │
│  │                                                                │    │
│  │  SQLAlchemy ORM Models:                                       │    │
│  │  • Book - Title, author, ISBN, summary, ratings             │    │
│  │  • Review - User rating, text, analysis                      │    │
│  │  • Borrow - Track borrowed books, due dates                 │    │
│  │  • User - Account info, preferences                          │    │
│  │  • Document - Uploaded files                                 │    │
│  │  • UserPreference - Personalization data                     │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │      Database Layer (SQLite or PostgreSQL)                   │    │
│  │                                                                │    │
│  │  • Async SQLAlchemy with aiosqlite (SQLite)                 │    │
│  │  • asyncpg for PostgreSQL option                             │    │
│  │  • Database seeding on initialization                        │    │
│  │  • Relationships: Book → Review, Borrow → Book, etc.        │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### Example 1: Book Upload & Summarization Flow

```
User Action (Frontend)
    │
    ├─ Click "Upload File"
    │
    ▼
BookUpload Component
    │
    ├─ Collect file
    │
    ▼
API Call: uploadBookFile(bookId, file)
    │
    ├─ POST /books/{bookId}/upload
    │
    ▼
Backend Books Route
    │
    ├─ Extract DI Container: container.get_storage_provider()
    │
    ▼
Storage Provider (LocalStorageProvider or S3StorageProvider)
    │
    ├─ Save file to storage
    │
    ▼
Create Document Record
    │
    ├─ Queue background task: ingest_and_summarize_book()
    │
    ▼
Task Queue (async)
    │
    ├─ Read file from storage
    │
    ├─ Extract DI Container: container.get_llm_provider()
    │
    ├─ Call LLM: generate_book_summary(content)
    │
    ▼
LLM Provider (MockLLMProvider, OpenRouterLLM, or OpenAI)
    │
    ├─ Generate summary
    │
    ▼
Update Book Record
    │
    ├─ Save summary to database
    │
    ▼
Response to Frontend (via React Query)
    │
    ├─ Display "Summarization complete"
    │
    ▼
User Sees Updated Book Summary
```

---

### Example 2: Error Handling Flow

```
User Action (Frontend)
    │
    ├─ Try to fetch books
    │
    ▼
API Call (try/catch + axios interceptor)
    │
    ├─ Backend error or network failure
    │
    ▼
Axios Response Interceptor
    │
    ├─ handleError() catches and re-throws
    │
    ▼
Component's useQuery onError Handler
    │
    ├─ useErrorHandler() hook triggered
    │
    ▼
addError() to ErrorContext
    │
    ├─ Error added to global error state
    │
    ▼
ErrorDisplay Component Re-renders
    │
    ├─ Shows error notification (top-right)
    │
    ├─ Sets timer for 5-second auto-dismiss
    │
    ▼
User Sees Error Message
    │
    ├─ Can click [X] to dismiss manually
    │
    ├─ Or [Retry] to try again
    │
    ├─ Or wait 5 seconds for auto-dismiss
    │
    ▼
ErrorContext state clears
    │
    ├─ ErrorDisplay closes
    │
    ▼
Back to Normal UI State
```

---

### Example 3: Dependency Injection Flow

```
Application Startup (main.py)
    │
    ├─ Read .env file
    │
    ├─ STORAGE_PROVIDER=local
    ├─ LLM_PROVIDER=openrouter
    │
    ▼
initialize_container()
    │
    ├─ Read settings.storage_provider = "local"
    │
    ├─ Call create_storage_provider("local", ...)
    │
    │   ├─ Factory checks type
    │   │
    │   ├─ if type == "local":
    │   │     return LocalStorageProvider(base_path)
    │
    ├─ Read settings.llm_provider = "openrouter"
    │
    ├─ Call create_llm_provider("openrouter", ...)
    │
    │   ├─ Factory checks type
    │   │
    │   ├─ if type == "openrouter":
    │   │     return OpenRouterLLMProvider(api_key, model)
    │
    ├─ container.set_storage_provider(storage_instance)
    │
    ├─ container.set_llm_provider(llm_instance)
    │
    ▼
Container Ready
    │
    ├─ Services can call container.get_storage_provider()
    │
    ├─ Services can call container.get_llm_provider()
    │
    ▼
Throughout App Lifecycle
    │
    ├─ Always get LocalStorageProvider when needed
    │
    ├─ Always get OpenRouterLLM when needed
    │
    │   (No hard-coded class instantiation)
    │
    ▼
To Change Provider
    │
    ├─ Edit .env: STORAGE_PROVIDER=s3
    │
    ├─ Restart app
    │
    ├─ factory now returns S3StorageProvider
    │
    ├─ Zero code changes!
    │
    ▼
All Services Automatically Use S3
```

---

## Configuration Decision Tree

```
                    Start Application
                            │
                            ▼
                  Read .env STORAGE_PROVIDER
                            │
                    ┌───────┼───────┐
                    ▼       ▼       ▼
                   local   s3    custom
                    │       │       │
                    ▼       ▼       ▼
              LocalStor  S3Stor   Custom
              Provider   Provider Provider
                    │       │       │
                    └───────┼───────┘
                            │
                    ▼
            Set in Container
                    │
                    ▼
            Available to All Services
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    BookService RecommendSvc BackgroundTasks
        │           │           │
        ▼           ▼           ▼
    storage provider used throughout app!
```

---

## Provider Swapping Examples

### Before (Hard-coded)
```python
# In service
storage = S3StorageService()  # ❌ Always S3

# To change provider, must edit code
storage = LocalStorageService()  # ❌ Code change needed!
```

### After (Configuration-based)
```bash
# In .env - Change provider without touching code
STORAGE_PROVIDER=s3
# or
STORAGE_PROVIDER=local
```

```python
# In service
storage = container.get_storage_provider()  # ✅ Uses config!

# No code change needed, just restart app
```

---

## Error Handling Layers

### Layer 1: Render Errors (ErrorBoundary)
```
Component render fails
    ↓
JavaScript error thrown
    ↓
ErrorBoundary catches (componentDidCatch)
    ↓
Shows fallback UI
    ↓
User can click "Try Again"
```

### Layer 2: API Errors (useError Hook)
```
API request fails
    ↓
Axios interceptor catches
    ↓
useErrorHandler() adds to context
    ↓
ErrorDisplay shows notification
    ↓
Auto-dismiss after 5s or manual dismiss
```

### Layer 3: Component Errors (Try/Catch)
```
Business logic error in component
    ↓
useErrorHandler().handleError() called
    ↓
Error added to global context
    ↓
ErrorDisplay shows to user
```

---

## Deployment Checklist at a Glance

```
Pre-Launch (5-10 min)
  □ python verify_setup.py (all 8 checks pass)
  □ Backend runs: python main.py
  □ Frontend runs: npm run dev
  □ Books load in UI
  □ Error handling works

Configuration (5 min)
  □ .env configured correctly
  □ Storage provider ready (local/s3)
  □ LLM provider ready (mock/openrouter/openai)
  □ Database initialized

Features (10-15 min)
  □ Books view correctly
  □ Borrow/return works
  □ Upload works
  □ Reviews work
  □ Errors show in UI

Code Quality (5 min)
  □ black --check app/ (passes)
  □ isort --check-only app/ (passes)
  □ pylint app/ (no critical errors)
  □ mypy app/ (no type errors)

Deploy (As needed)
  □ Backup database
  □ Run migrations
  □ Start backend
  □ Start frontend
  □ Verify in browser
  □ Monitor logs
```

---

## Key Takeaways

1. **DI Container** - Centralized provider management
2. **Pluggable Providers** - Swap via configuration, not code
3. **Error Handling** - Three layers: UI boundary, global context, component level
4. **Clean Architecture** - Clear layers with single responsibility
5. **Documentation** - Comprehensive guides for extension
6. **Verified Working** - All systems tested and validated

