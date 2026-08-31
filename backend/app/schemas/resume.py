from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeCreateResponse(BaseModel):
    id: str
    file_name: str
    extracted_text_preview: Optional[str] = ""
    created_at: Optional[datetime] = None

class ResumeListItem(BaseModel):
    id: str
    file_name: str
    created_at: Optional[datetime] = None

class ResumeDetail(BaseModel):
    id: str
    user_id: str
    file_name: str
    storage_path: str
    extracted_text: Optional[str] = ""
    created_at: Optional[datetime] = None
