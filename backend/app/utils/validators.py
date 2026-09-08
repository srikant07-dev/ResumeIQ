from fastapi import UploadFile, HTTPException, status
from app.schemas.common import ErrorResponse

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

async def validate_pdf_upload(file: UploadFile) -> bytes:
    """
    Validates uploaded resume files for format, size, and header integrity.
    Returns the read bytes if valid; raises HTTPException otherwise.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="INVALID_FILE_TYPE",
                message="Only PDF documents (.pdf) are supported. Please upload a valid PDF resume."
            ).model_dump()
        )

    CHUNK_SIZE = 64 * 1024  # 64 KB
    chunks = []
    total_bytes = 0

    while True:
        chunk = await file.read(CHUNK_SIZE)
        if not chunk:
            break
        total_bytes += len(chunk)
        if total_bytes > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=ErrorResponse(
                    code="FILE_TOO_LARGE",
                    message="File exceeds maximum allowed size of 5 MB."
                ).model_dump()
            )
        chunks.append(chunk)

    content = b"".join(chunks)

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="EMPTY_FILE",
                message="The uploaded file is empty."
            ).model_dump()
        )

    # Verify magic bytes for PDF (%PDF-)
    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="INVALID_FILE_INTEGRITY",
                message="The file does not have a valid PDF header structure."
            ).model_dump()
        )

    return content
