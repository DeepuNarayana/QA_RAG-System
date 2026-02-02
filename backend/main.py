"""
Main entry point for the application.
"""

import uvicorn
from app.core.di import initialize_container

if __name__ == "__main__":
    # Initialize dependency injection container
    initialize_container()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
