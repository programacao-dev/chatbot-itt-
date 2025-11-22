from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    FRONTEND_DEV_URL: str = "http://localhost:5173" #"chatbot-itt.vercel.app"
    FRONTEND_URL: str = "chatbot-itt.vercel.app"
    
    GOOGLE_API_KEY: str = ""
    
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_TEMPERATURE: float = 0.3
    
    FAISS_INDEX_PATH: str = "faiss_index"
    
