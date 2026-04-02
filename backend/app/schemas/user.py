from typing import Optional, List
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(UserBase):
    id: str
    
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    phone: Optional[str] = None
    skills: List[str] = []
    preferred_roles: List[str] = []
    github_link: Optional[str] = None
    linkedin_link: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    
    class Config:
        from_attributes = True
