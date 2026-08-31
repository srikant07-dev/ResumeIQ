from fastapi import APIRouter, Depends, UploadFile, File, status
from app.utils.security import get_current_user
from app.services.resume_service import (
    upload_and_process_resume,
    list_user_resumes,
    delete_user_resume
)
from app.schemas.resume import ResumeCreateResponse, ResumeListItem

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("", response_model=ResumeCreateResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """Uploads and extracts plain text from a PDF resume."""
    return await upload_and_process_resume(file, user_id)

@router.get("", response_model=list[ResumeListItem])
async def get_resumes(user_id: str = Depends(get_current_user)):
    """Lists resumes uploaded by the authenticated user."""
    return await list_user_resumes(user_id)

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    user_id: str = Depends(get_current_user)
):
    """Deletes a resume and associated storage asset."""
    return await delete_user_resume(resume_id, user_id)
