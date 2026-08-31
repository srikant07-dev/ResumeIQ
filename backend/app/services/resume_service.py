import uuid
from fastapi import UploadFile, HTTPException, status
from app.db.supabase import get_supabase_client
from app.utils.validators import validate_pdf_upload
from app.services.pdf_parser import extract_text_from_pdf
from app.schemas.resume import ResumeCreateResponse, ResumeListItem
from app.schemas.common import ErrorResponse
from app.config import get_settings

async def upload_and_process_resume(file: UploadFile, user_id: str) -> ResumeCreateResponse:
    """
    Validates PDF, uploads to Supabase storage under user's folder,
    extracts text, and stores database record.
    """
    settings = get_settings()
    pdf_bytes = await validate_pdf_upload(file)
    extracted_text, is_extractable = extract_text_from_pdf(pdf_bytes)
    
    file_id = str(uuid.uuid4())
    safe_filename = file.filename or "resume.pdf"
    storage_path = f"{user_id}/{file_id}.pdf"
    
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        # Mock/Demo Mode fallback
        return ResumeCreateResponse(
            id=file_id,
            file_name=safe_filename,
            extracted_text_preview=extracted_text[:200] if extracted_text else "Resume text preview (Demo Mode)"
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
        # If storage upload fails, log and continue or raise
        pass

    # 2. Insert into PostgreSQL resumes table
    try:
        data = {
            "id": file_id,
            "user_id": user_id,
            "file_name": safe_filename,
            "storage_path": storage_path,
            "extracted_text": extracted_text
        }
        res = supabase.table("resumes").insert(data).execute()
        
        return ResumeCreateResponse(
            id=file_id,
            file_name=safe_filename,
            extracted_text_preview=extracted_text[:200] if extracted_text else "No text extracted (scanned/image PDF)"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to save resume record.",
                details={"error": str(e)}
            ).model_dump()
        )

async def list_user_resumes(user_id: str) -> list[ResumeListItem]:
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        return [
            ResumeListItem(
                id="demo-resume-1111-2222-3333-444444444444",
                file_name="John_Doe_FullStack_Resume.pdf"
            )
        ]
        
    supabase = get_supabase_client()
    try:
        res = supabase.table("resumes")\
            .select("id, file_name, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return [ResumeListItem(**row) for row in (res.data or [])]
    except Exception as e:
        return []

async def delete_user_resume(resume_id: str, user_id: str) -> dict:
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        return {"status": "deleted", "id": resume_id}

    supabase = get_supabase_client()
    try:
        # Retrieve storage path before deletion
        row = supabase.table("resumes").select("storage_path").eq("id", resume_id).eq("user_id", user_id).single().execute()
        if row and row.data and "storage_path" in row.data:
            supabase.storage.from_("resumes").remove([row.data["storage_path"]])
            
        supabase.table("resumes").delete().eq("id", resume_id).eq("user_id", user_id).execute()
        return {"status": "deleted", "id": resume_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DELETE_FAILED",
                message="Failed to delete resume.",
                details={"error": str(e)}
            ).model_dump()
        )
