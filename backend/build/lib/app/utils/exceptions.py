"""
Exception Classes

Custom exceptions for better error handling and logging.
"""


class ApplicationError(Exception):
    """Base application error."""

    def __init__(self, message: str, status_code: int = 500):
        """
        Initialize exception.

        Args:
            message: Error message
            status_code: HTTP status code
        """
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AuthenticationError(ApplicationError):
    """Authentication-related error."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationError(ApplicationError):
    """Authorization-related error."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status_code=403)


class ValidationError(ApplicationError):
    """Validation-related error."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status_code=400)


class NotFoundError(ApplicationError):
    """Resource not found error."""

    def __init__(self, resource: str = "Resource"):
        super().__init__(f"{resource} not found", status_code=404)


class ConflictError(ApplicationError):
    """Resource conflict error."""

    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, status_code=409)


class AIServiceError(ApplicationError):
    """AI service-related error."""

    def __init__(self, message: str = "AI service error"):
        super().__init__(message, status_code=503)
