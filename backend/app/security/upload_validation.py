import os
import re
from typing import Tuple

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml"
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal or script injection."""
    base = os.path.basename(filename)
    # Strip any non-alphanumeric except dots, dashes, underscores
    clean = re.sub(r"[^\w\.-]", "_", base)
    return clean


def validate_file_upload(
    filename: str,
    content_type: str,
    file_size_bytes: int
) -> Tuple[bool, str]:
    """Validate uploaded image file size, extension, and content type."""
    if file_size_bytes > MAX_FILE_SIZE_BYTES:
        return False, f"File exceeds maximum size of {MAX_FILE_SIZE_BYTES // (1024*1024)}MB."

    ext = os.path.splitext(filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}."

    if content_type.lower() not in ALLOWED_MIME_TYPES:
        return False, f"Invalid content type '{content_type}'. Must be a supported image format."

    return True, "Upload is valid."
