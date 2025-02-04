from pydantic import BaseModel
from typing import Optional
from functools import lru_cache
import os

class Settings(BaseModel):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "arab_emergency_tickets"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
