from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pathlib import Path
import os
import shutil

from ..config import Settings
from .google_drive import DriveService 


class VectorDB: 
    def __init__(self, settings: Settings): 
        self.settings = settings
        self.embedder = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.GOOGLE_API_KEY
        )

    def query(self, message : str):

        if not os.path.exists(self.settings.FAISS_INDEX_PATH):
            raise ValueError("O índice FAISS não foi encontrado. Certifique-se de que o índice foi criado e salvo corretamente.")
        
        vectorstore = FAISS.load_local(self.settings.FAISS_INDEX_PATH, self.embedder, allow_dangerous_deserialization=True)

        retriever = vectorstore.as_retriever(search_type="similarity_score_threshold", 
                                        search_kwargs={"score_threshold": 0.3, "k":4})
        
        docs = retriever.invoke(message)

        return docs
        
    def create_faiss_index(self, parent_folder : str):

        if not os.path.exists(parent_folder):
            raise ValueError(f"O diretório {parent_folder} não existe. Verifique o caminho e tente novamente.")
        
        folder_path = Path(parent_folder)

        docs = []
        for file_path in folder_path.glob("*.pdf"):
            try:
                loader = PyMuPDFLoader(str(file_path))
                docs.extend(loader.load())
                print(f"Carregado com sucesso o arquivo {file_path.name}")

            except Exception as e:
                print(f"Erro ao carregar arquivo {file_path.name}: {e}")

        print(f"Total de documentos carregados: {len(docs)}")
        
        if not docs:
            print("Nenhum documento encontrado. O índice não será atualizado.")
            return
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )

        split_docs = splitter.split_documents(docs)

        vectorstore = FAISS.from_documents(split_docs, self.embedder)

        vectorstore.save_local(self.settings.FAISS_INDEX_PATH)


    def refresh_knowledge_base(self):
        """
        Método Mestre: Baixa do Drive e recria o índice.
        """
        # 1. Configurar caminhos
        # Vamos assumir que data/ fica na raiz do backend
        base_path = Path(os.getcwd()) 
        download_path = base_path / "data"
        
        # 2. Limpar pasta data antiga para não acumular lixo
        if download_path.exists():
            shutil.rmtree(download_path)
        os.makedirs(download_path)

        # 3. Baixar arquivos do Drive
        print("Iniciando download do Google Drive...")
        drive_service = DriveService(
            credentials_path=self.settings.GOOGLE_CREDENTIALS_PATH, # Vamos adicionar isso no settings
            folder_id=self.settings.GOOGLE_DRIVE_FOLDER_ID,         # E isso também
            download_path=str(download_path)
        )
        drive_service.download_files()

        # 4. Recriar o índice apontando para a pasta data
        print("Recriando índice vetorial...")
        self.create_faiss_index(str(download_path))
        
        return {"status": "success", "message": "Base de conhecimento atualizada com sucesso!"}