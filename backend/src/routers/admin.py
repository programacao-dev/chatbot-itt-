from fastapi import APIRouter, Depends, HTTPException, status
from ..services import VectorDB
from ..dependencies import get_vector_db

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

@router.post("/sync-knowledge")
async def sync_knowledge_base(
    vector_db: VectorDB = Depends(get_vector_db)
):
    """
    Aciona a sincronização com o Google Drive e reindexação.
    """
    try:
        result = vector_db.refresh_knowledge_base()
        return result
    except Exception as e:
        # Logar o erro real aqui seria bom
        print(f"Erro na sincronização: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha ao atualizar base de conhecimento: {str(e)}"
        )