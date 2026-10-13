from typing import Any, Optional
from fastapi import HTTPException, status


class AegisError(Exception):
    """Base exception for AEGIS domain errors."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.details = details


class EntityNotFoundError(AegisError):
    pass


class ValidationError(AegisError):
    pass


class ScanExecutionError(AegisError):
    pass


class OfficialAssetConflictError(AegisError):
    pass


def not_found_exception(entity_name: str, entity_id: Any) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{entity_name} with identifier '{entity_id}' was not found."
    )


def bad_request_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail
    )


def conflict_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=detail
    )
