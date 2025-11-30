import os
import io
import json # Importante para ler a variável de ambiente
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from typing import List
import logging

logger = logging.getLogger(__name__)

class DriveService:
    def __init__(self, credentials_path: str, folder_id: str, download_path: str):
        self.scopes = ['https://www.googleapis.com/auth/drive.readonly']
        self.folder_id = folder_id
        self.download_path = download_path
        
        # --- LÓGICA DE AUTENTICAÇÃO HÍBRIDA (LOCAL vs DEPLOY) ---
        
        # 1. Tenta carregar do arquivo físico (Ideal para sua máquina local)
        if os.path.exists(credentials_path):
            print(f"DEBUG: Carregando credenciais do arquivo: {credentials_path}")
            self.creds = service_account.Credentials.from_service_account_file(
                credentials_path, scopes=self.scopes
            )
            
        # 2. Se não achar o arquivo, tenta ler da Variável de Ambiente (Ideal para Vercel/Deploy)
        else:
            print("DEBUG: Arquivo não encontrado. Tentando variável de ambiente GOOGLE_CREDENTIALS_JSON...")
            json_creds = os.getenv("GOOGLE_CREDENTIALS_JSON")
            
            if json_creds:
                try:
                    # Converte a string JSON em um dicionário Python
                    creds_dict = json.loads(json_creds)
                    self.creds = service_account.Credentials.from_service_account_info(
                        creds_dict, scopes=self.scopes
                    )
                except json.JSONDecodeError as e:
                    raise ValueError(f"Erro ao ler JSON da variável de ambiente. Verifique a formatação: {e}")
            else:
                # Se não achar nem o arquivo e nem a variável, dá erro fatal
                raise FileNotFoundError(
                    f"Credenciais não encontradas! O arquivo '{credentials_path}' não existe "
                    "e a variável de ambiente 'GOOGLE_CREDENTIALS_JSON' não foi definida."
                )
        # --------------------------------------------------------

        print(f"DEBUG: ESTOU LOGADO COMO: {self.creds.service_account_email}")
        
        self.service = build('drive', 'v3', credentials=self.creds)

        # Garante que a pasta de download existe
        if not os.path.exists(self.download_path):
            os.makedirs(self.download_path)

    def list_files(self) -> List[dict]:
        """Lista arquivos PDF na pasta especificada."""
        # Logs de debug mantidos para segurança
        print(f"DEBUG: Tentando acessar a pasta com ID: {self.folder_id}")
        
        query = f"'{self.folder_id}' in parents and mimeType='application/pdf' and trashed=false"
        
        # Mantendo supportsAllDrives=True pois sua pasta é compartilhada
        results = self.service.files().list(
            q=query, 
            pageSize=100, 
            fields="nextPageToken, files(id, name)",
            supportsAllDrives=True,        
            includeItemsFromAllDrives=True 
        ).execute()
        
        arquivos = results.get('files', [])
        
        print(f"DEBUG: O Google respondeu que encontrou: {arquivos}")
        
        return arquivos

    def download_files(self) -> List[str]:
        """Baixa todos os arquivos da pasta do Drive para a pasta local."""
        files = self.list_files()
        downloaded_files = []

        logger.info(f"Encontrados {len(files)} arquivos no Drive.")

        if not files:
            print("DEBUG: A lista de arquivos veio vazia! Verifique as permissões de compartilhamento.")

        for file in files:
            file_id = file['id']
            file_name = file['name']
            file_path = os.path.join(self.download_path, file_name)

            # Baixa o arquivo
            request = self.service.files().get_media(fileId=file_id)
            fh = io.FileIO(file_path, 'wb')
            downloader = MediaIoBaseDownload(fh, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            logger.info(f"Download concluído: {file_name}")
            downloaded_files.append(file_path)
            
        return downloaded_files