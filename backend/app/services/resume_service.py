from datetime import datetime, timezone
import logging
import uuid
from fastapi import UploadFile, HTTPException, status
from app.db.supabase import get_supabase_client
from app.utils.validators import validate_pdf_upload
from app.services.pdf_parser import extract_text_from_pdf
from app.schemas.resume import ResumeCreateResponse, ResumeListItem
from app.schemas.common import ErrorResponse
from app.config import get_settings

logger = logging.getLogger(__name__)

MOCK_RESUME_ID = "11111111-1111-1111-1111-111111111111"

MAX_DEMO_STORE_SIZE = 100

# In-memory store for Demo Mode uploads
DEMO_RESUMES_STORE: list[ResumeListItem] = [
    ResumeListItem(
        id=MOCK_RESUME_ID,
        file_name="John_Doe_FullStack_Resume.pdf",
        created_at=datetime(2026, 3, 1, 10, 0, 0, tzinfo=timezone.utc)
    )
]

async def upload_and_process_resume(file: UploadFile, user_id: str) -> ResumeCreateResponse:
    """
    Validates PDF, uploads to Supabase storage under user's folder,
    extracts text, and stores database record.
    """
    settings = get_settings()
    pdf_bytes = await validate_pdf_upload(file)
    extracted_text, is_extractable, extraction_method = await extract_text_from_pdf(pdf_bytes)
    logger.info("PDF extraction for '%s': method=%s, extractable=%s, chars=%d",
                file.filename, extraction_method, is_extractable, len(extracted_text))
    
    # Reject files where PDF text parsing encountered an internal reader exception
    if not is_extractable and extracted_text.startswith("Error extracting PDF text:"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="PARSING_ERROR",
                message="Unable to parse or extract text from the PDF document. File may be corrupted or password-protected.",
                details={"error": extracted_text}
            ).model_dump()
        )
    
    file_id = str(uuid.uuid4())
    safe_filename = file.filename or "resume.pdf"
    storage_path = f"{user_id}/{file_id}.pdf"
    now_utc = datetime.now(timezone.utc)
    
    if (
        settings.DEMO_MODE
        or not settings.SUPABASE_URL
        or not settings.SUPABASE_SERVICE_ROLE_KEY
        or user_id == "00000000-0000-0000-0000-000000000000"
    ):
        # Mock/Demo Mode fallback with in-memory persistence
        item = ResumeListItem(id=file_id, file_name=safe_filename, created_at=now_utc)
        DEMO_RESUMES_STORE.insert(0, item)
        if len(DEMO_RESUMES_STORE) > MAX_DEMO_STORE_SIZE:
            DEMO_RESUMES_STORE.pop()
        return ResumeCreateResponse(
            id=file_id,
            file_name=safe_filename,
            extracted_text_preview=extracted_text[:200] if extracted_text else "Resume text preview (Demo Mode)",
            created_at=now_utc
        )

    supabase = get_supabase_client()
    
    # 1. Upload to Supabase Storage
    try:
        supabase.storage.from_("resumes").upload(
            path=storage_path,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf"}
        )
    except Exception as e:
        logger.error("Failed to upload resume to Supabase Storage at %s: %s", storage_path, e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="STORAGE_UPLOAD_ERROR",
                message="Failed to persist resume file into storage."
            ).model_dump()
        )

    # 2. Insert into PostgreSQL resumes table
    try:
        data = {
            "id": file_id,
            "user_id": user_id,
            "file_name": safe_filename,
            "storage_path": storage_path,
            "extracted_text": extracted_text
        }
        supabase.table("resumes").insert(data).execute()
        
        return ResumeCreateResponse(
            id=file_id,
            file_name=safe_filename,
            extracted_text_preview=extracted_text[:200] if extracted_text else "No text extracted (scanned/image PDF)",
            created_at=now_utc
        )
    except Exception as e:
        logger.error("Failed to insert resume record into database: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to save resume record."
            ).model_dump()
        )

async def list_user_resumes(user_id: str) -> list[ResumeListItem]:
    settings = get_settings()
    if (
        settings.DEMO_MODE
        or not settings.SUPABASE_URL
        or not settings.SUPABASE_SERVICE_ROLE_KEY
        or user_id == "00000000-0000-0000-0000-000000000000"
    ):
        return DEMO_RESUMES_STORE
        
    supabase = get_supabase_client()
    try:
        res = supabase.table("resumes")\
            .select("id, file_name, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        rows = res.data if isinstance(res.data, list) else []
        return [ResumeListItem(**dict(row)) for row in rows if isinstance(row, dict)]
    except Exception as e:
        logger.error("Failed to list resumes for user %s: %s", user_id, e)
        return []

async def delete_user_resume(resume_id: str, user_id: str) -> dict:
    settings = get_settings()
    if (
        settings.DEMO_MODE
        or not settings.SUPABASE_URL
        or not settings.SUPABASE_SERVICE_ROLE_KEY
        or user_id == "00000000-0000-0000-0000-000000000000"
    ):
        global DEMO_RESUMES_STORE
        DEMO_RESUMES_STORE = [r for r in DEMO_RESUMES_STORE if r.id != resume_id]
        return {"status": "deleted", "id": resume_id}

    supabase = get_supabase_client()
    
    # 1. Verify existence and retrieve storage path
    try:
        row = supabase.table("resumes").select("storage_path").eq("id", resume_id).eq("user_id", user_id).single().execute()
        if not row or not row.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="RESUME_NOT_FOUND",
                    message="Resume not found or access denied."
                ).model_dump()
            )
        storage_path = row.data.get("storage_path")
    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e) or "0 rows" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="RESUME_NOT_FOUND",
                    message="Resume not found or access denied."
                ).model_dump()
            )
        logger.error("Database query failed while fetching resume %s: %s", resume_id, e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DATABASE_ERROR",
                message="Database error while querying resume record."
            ).model_dump()
        )

    try:
        # 2. Cascading deletion of dependent analyses
        supabase.table("analyses").delete().eq("resume_id", resume_id).eq("user_id", user_id).execute()

        # 3. Clean up storage asset
        if storage_path:
            try:
                supabase.storage.from_("resumes").remove([storage_path])
            except Exception as storage_err:
                logger.warning("Failed to remove storage path %s: %s", storage_path, storage_err)
            
        # 4. Delete resume record
        supabase.table("resumes").delete().eq("id", resume_id).eq("user_id", user_id).execute()
        return {"status": "deleted", "id": resume_id}
    except Exception as e:
        logger.error("Failed to delete resume %s: %s", resume_id, e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DELETE_FAILED",
                message="Failed to complete resume deletion."
            ).model_dump()
        )

