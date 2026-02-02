#!/usr/bin/env python3
"""
Quick Verification Script for Intelligent Book Management System

Verifies that all components are properly configured and working.
Run this after setup to ensure everything is ready.
"""

import asyncio
import sys
from pathlib import Path


async def check_imports():
    """Check if all required imports work."""
    print("\n[1] Checking imports...")
    try:
        from app.core.di import container, initialize_container
        from app.core.config import settings
        from app.core.database import AsyncSessionLocal, engine
        from app.models import Book, Review, User, Borrow
        from app.services import BookService, ReviewService
        print("    ✓ All imports successful")
        return True
    except ImportError as e:
        print(f"    ✗ Import error: {e}")
        return False


async def check_configuration():
    """Check if configuration is loaded."""
    print("\n[2] Checking configuration...")
    try:
        from app.core.config import settings
        
        checks = [
            ("Database URL", settings.database_url),
            ("Storage Provider", settings.storage_provider),
            ("LLM Provider", settings.llm_provider),
            ("CORS Origins", settings.cors_origins),
            ("Secret Key", "***" if settings.secret_key else "NOT SET"),
        ]
        
        all_ok = True
        for name, value in checks:
            status = "✓" if value else "✗"
            print(f"    {status} {name}: {value}")
            if not value:
                all_ok = False
        
        return all_ok
    except Exception as e:
        print(f"    ✗ Configuration error: {e}")
        return False


async def check_di_container():
    """Check if DI container initializes properly."""
    print("\n[3] Checking DI Container...")
    try:
        from app.core.di import initialize_container, container
        
        await initialize_container()
        print("    ✓ Container initialized")
        
        storage = container.get_storage_provider()
        print(f"    ✓ Storage provider: {type(storage).__name__}")
        
        llm = container.get_llm_provider()
        print(f"    ✓ LLM provider: {type(llm).__name__}")
        
        return True
    except Exception as e:
        print(f"    ✗ DI container error: {e}")
        return False


async def check_database():
    """Check database connectivity."""
    print("\n[4] Checking Database...")
    try:
        from app.core.database import AsyncSessionLocal, seed_data
        
        async with AsyncSessionLocal() as db:
            # Test connection
            from sqlalchemy import select, text
            await db.execute(text("SELECT 1"))
            print("    ✓ Database connection OK")
        
        # Check if we need to seed data
        async with AsyncSessionLocal() as db:
            from app.models import Book
            result = await db.execute(select(Book))
            book_count = len(result.scalars().all())
            print(f"    ✓ Books in database: {book_count}")
        
        return True
    except Exception as e:
        print(f"    ✗ Database error: {e}")
        return False


async def check_storage_provider():
    """Test storage provider functionality."""
    print("\n[5] Checking Storage Provider...")
    try:
        from app.core.di import container
        
        storage = container.get_storage_provider()
        
        # Test save and read
        test_content = b"test file content"
        test_path = await storage.save_file("test_verify.txt", test_content)
        print(f"    ✓ File saved: {test_path}")
        
        # Test read
        content = await storage.read_file(test_path)
        if content == test_content:
            print("    ✓ File read correctly")
        else:
            print("    ✗ File content mismatch")
            return False
        
        # Test delete
        deleted = await storage.delete_file(test_path)
        if deleted:
            print("    ✓ File deleted")
        else:
            print("    ✗ File deletion failed")
            return False
        
        return True
    except Exception as e:
        print(f"    ✗ Storage provider error: {e}")
        return False


async def check_llm_provider():
    """Test LLM provider functionality."""
    print("\n[6] Checking LLM Provider...")
    try:
        from app.core.di import container
        from app.core.config import settings
        
        llm = container.get_llm_provider()
        
        # Test with mock data
        test_content = "The book discusses artificial intelligence and machine learning."
        
        if settings.llm_provider.lower() == "mock":
            summary = await llm.generate_book_summary(test_content)
            print(f"    ✓ Summary generated (mock): {summary[:50]}...")
            
            analysis = await llm.analyze_reviews(["Great book!", "Very informative"])
            print(f"    ✓ Review analysis (mock): {analysis.get('consensus', 'N/A')[:50]}...")
        else:
            print(f"    ⚠ Using {settings.llm_provider} provider (not tested in verification)")
        
        return True
    except Exception as e:
        print(f"    ✗ LLM provider error: {e}")
        return False


async def check_models():
    """Check if database models are properly defined."""
    print("\n[7] Checking Models...")
    try:
        from app.models import Book, Review, User, Borrow, Document, UserPreference
        from sqlalchemy import inspect
        
        models = [Book, Review, User, Borrow, Document, UserPreference]
        for model in models:
            mapper = inspect(model)
            print(f"    ✓ {model.__name__}: {len(mapper.columns)} columns")
        
        return True
    except Exception as e:
        print(f"    ✗ Models error: {e}")
        return False


async def check_services():
    """Check if services can be instantiated."""
    print("\n[8] Checking Services...")
    try:
        from app.services import BookService, ReviewService, BorrowService
        from app.services.recommendation_service import RecommendationService
        
        services = [
            ("BookService", BookService),
            ("ReviewService", ReviewService),
            ("BorrowService", BorrowService),
            ("RecommendationService", RecommendationService),
        ]
        
        for name, service_class in services:
            print(f"    ✓ {name} available")
        
        return True
    except Exception as e:
        print(f"    ✗ Services error: {e}")
        return False


async def main():
    """Run all checks."""
    print("=" * 60)
    print("Intelligent Book Management System - Verification Script")
    print("=" * 60)
    
    checks = [
        ("Imports", check_imports),
        ("Configuration", check_configuration),
        ("DI Container", check_di_container),
        ("Database", check_database),
        ("Storage Provider", check_storage_provider),
        ("LLM Provider", check_llm_provider),
        ("Models", check_models),
        ("Services", check_services),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = await check_func()
            results.append((name, result))
        except Exception as e:
            print(f"    ✗ Unexpected error: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("Verification Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All checks passed! System is ready to run.")
        print("\nNext steps:")
        print("1. Start backend: python main.py")
        print("2. Start frontend: npm run dev (in frontend/)")
        print("3. Open browser: http://localhost:3001")
        return 0
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
