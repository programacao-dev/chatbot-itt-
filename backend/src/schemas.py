"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class QueryRequest(BaseModel):
    """Request model for query endpoint."""
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User query message",
        example="Como faço para solicitar um certificado?"
    )
    user_id: Optional[str] = Field(
        None,
        description="Optional user identifier for tracking",
        example="user_123"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Como faço para solicitar um certificado?",
                "user_id": "user_123"
            }
        }


class SourceDocument(BaseModel):
    """Model for source document information."""
    content: str = Field(..., description="Document content")
    page: Optional[int] = Field(None, description="Page number if applicable")


class QueryResponse(BaseModel):
    """Response model for query endpoint."""
    response: str = Field(..., description="AI-generated response")
    source_documents: List[str] = Field(
        default_factory=list,
        description="List of source documents used"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Para solicitar um certificado...",
                "source_documents": ["Documento 1 content...", "Documento 2 content..."]
            }
        }

class ErrorResponse(BaseModel):
    """Response model for errors."""
    detail: str = Field(..., description="Error description")
    error_code: Optional[str] = Field(None, description="Error code for tracking")
