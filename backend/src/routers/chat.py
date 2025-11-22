"""
Chat router for handling conversational endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
import logging

from ..schemas import (
    QueryRequest,
    QueryResponse,
    ErrorResponse
)
from ..services import ITTGraph
from ..dependencies import get_graph

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)

@router.post(
    "/query",
    response_model=QueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Process user query",
    description="Process a user query and return AI-generated response with source documents",
    responses={
        200: {
            "description": "Successful response",
            "model": QueryResponse
        },
        400: {
            "description": "Bad request - invalid input",
            "model": ErrorResponse
        },
        500: {
            "description": "Internal server error",
            "model": ErrorResponse
        }
    }

)
async def query_response(
    request: QueryRequest,
    graph: ITTGraph = Depends(get_graph)
) -> QueryResponse:

    try:
        logger.info(f"Processing query from user: {request.user_id}")
        
        result = graph.invoke(request.message)
        
        response = QueryResponse(
            response=result["response"],
            source_documents=result["source_documents"]
        )
        
        logger.info(f"Query processed successfully for user: {request.user_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )