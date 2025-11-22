"""
FastAPI dependencies for dependency injection.
"""
from functools import lru_cache
from fastapi import Depends
from .services import VectorDB, ITTGraph
from .config import Settings


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Returns:
        Settings instance
    """
    return Settings()


def get_vector_db(settings: Settings = Depends(get_settings)) -> VectorDB:
    """
    Get VectorDB instance with injected settings.
    
    Args:
        settings: Injected Settings instance
        
    Returns:
        VectorDB instance
    """
    return VectorDB(settings)


def get_graph(
    settings: Settings = Depends(get_settings),
    vector_db: VectorDB = Depends(get_vector_db)
) -> ITTGraph:
    """
    Get ITTGraph instance with injected dependencies.
    
    Args:
        settings: Injected Settings instance
        vector_db: Injected VectorDB instance
        
    Returns:
        ITTGraph instance
    """
    return ITTGraph(settings, vector_db)
