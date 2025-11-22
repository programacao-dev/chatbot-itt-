from typing import Literal, List
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain

from ..config import Settings

TRIAGE_PROMPT = (
    "Você é um classificador de perguntas para um assistente de IA do Instituto Tadao Takahashi (ITT). "
    "Sua função é decidir se uma pergunta pode ser respondida buscando informações no estatuto do ITT ou se ela é incompleta. "
    "Dada a mensagem do usuário, retorne SOMENTE um JSON com:\n"
    "{\n"
    '  "decisao": "AUTO_RESOLVER" | "PEDIR_INFO",\n'
    '  "campos_faltantes": ["..."]\n'
    "}\n"
    "Regras:\n"
    '- **AUTO_RESOLVER**: Perguntas claras sobre regras ou procedimentos descritos nas políticas.\n'
    '- **PEDIR_INFO**: Mensagens vagas ou que faltam informações.\n'
    "Analise a mensagem e decida a ação mais apropriada."
)

class TriageOutput(BaseModel):
    decisao: Literal["AUTO_RESOLVER", "PEDIR_INFO"]
    campos_faltantes: List[str] = Field(default_factory=list)

def get_triage_chain(settings: Settings):

    llm = ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL,
        temperature=settings.LLM_TEMPERATURE,
        api_key=settings.GOOGLE_API_KEY
    )
    return llm.with_structured_output(TriageOutput)

RAG_PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system",
     "Você é um assistente especialista sobre o Instituto Tadao Takahashi (ITT). "
     "Sua missão é responder às perguntas do usuário de forma clara, completa e útil. "
     "Use o estatuto do ITT, fornecido no 'Contexto', como sua principal fonte de verdade, seguindo estas regras rigorosamente:\n\n"
     "--- PRINCÍPIO DE RACIOCÍNIO ---\n\n"
     "1. **Analise o Tipo de Pergunta:**\n"
     "   - **a) Perguntas Específicas:** Se a pergunta for sobre regras, políticas, finanças, procedimentos ou detalhes operacionais (geralmente com 'como', 'qual', 'pode', 'deve'), você deve se basear **ESTRITAMENTE** no contexto fornecido.\n"
     "   - **b) Perguntas Gerais:** Se a pergunta for introdutória ('o que é o ITT?', 'qual o objetivo do instituto?'), o contexto pode ser insuficiente. Neste caso, **VOCÊ PODE** usar seu conhecimento geral para dar uma resposta informativa, mas sempre priorize e integre qualquer informação relevante que encontrar no contexto.\n\n"
     "--- REGRAS DE EXECUÇÃO DA RESPOSTA ---\n\n"
     "2. **Sintetize a Informação:** Combine informações de diferentes partes do contexto para construir uma resposta coesa e completa. Não se limite a extrair trechos isolados.\n\n"
     "3. **Seja Direto e Formate Bem:** Responda diretamente à pergunta do usuário. Use listas (bullet points) para organizar informações complexas e facilitar a leitura.\n\n"
     "4. **Quando não souber:** Se a resposta para uma pergunta específica (tipo 1a) não puder ser encontrada no contexto, responda de forma educada: 'Com base no estatuto do ITT que tenho acesso, não encontrei uma resposta para sua pergunta.'"),
    ("human", "Pergunta do Usuário: {input}\n\nContexto do Estatuto do ITT:\n{context}")
])

def get_rag_chain(settings: Settings):
    """
    Creates RAG chain for question answering.
    
    How it works:
    1. Graph passes {"input": question, "context": docs} to chain
    2. ChatPromptTemplate formats the prompt with input/context
    3. LLM generates text response (NOT JSON, just plain text)
    4. create_stuff_documents_chain combines docs and returns string
    5. Graph receives plain string response
    """
    llm = ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL,
        temperature=settings.LLM_TEMPERATURE,
        api_key=settings.GOOGLE_API_KEY
    )
    return create_stuff_documents_chain(llm, RAG_PROMPT_TEMPLATE)