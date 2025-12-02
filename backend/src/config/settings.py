from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    FRONTEND_DEV_URL: str = "http://localhost:5173"
    FRONTEND_URL: str = "https://chatbot-itt.vercel.app"
    
    GOOGLE_API_KEY: str = ""
    
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_TEMPERATURE: float = 0.3
    
    FAISS_INDEX_PATH: str = "faiss_index"
    
    GOOGLE_DRIVE_FOLDER_ID: str = "" # ID da pasta (fica na URL do navegador)
    GOOGLE_CREDENTIALS_PATH: str = "credentials/service_account.json"
    local_data_path: str = "data" # Onde salvar os arquivos temporariamente
