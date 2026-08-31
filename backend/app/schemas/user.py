from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = ""
    created_at: Optional[datetime] = None
