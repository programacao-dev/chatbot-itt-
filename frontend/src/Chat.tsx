import { useState } from "react";
import ReactMarkdown from "react-markdown";

// MUDANÇA IMPORTANTE:
// Se estiver rodando localmente (backend na sua máquina), use localhost.
// Se for subir para produção, você pode trocar aqui ou usar variável de ambiente.
// Sugestão: Deixar localhost enquanto desenvolvemos.
// const API_URL = "http://localhost:8000"; 
const API_URL = "https://chatbot-itt-5lbt.onrender.com"; // URL antiga

interface ChatProps {
  idToken: string;
  email: string;
  onLogout: () => void;
}

interface Mensagem {
  autor: "user" | "assistant";
  texto: string;
}

export default function Chat({ idToken, email, onLogout }: ChatProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [pergunta, setPergunta] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para o botão de sincronização
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const enviarPergunta = async () => {
    if (!pergunta.trim() || isLoading) return;

    const msgUser: Mensagem = { autor: "user", texto: pergunta };
    setMensagens((m) => [...m, msgUser]);

    const perguntaTexto = pergunta;
    setPergunta("");

    const loadingMsg: Mensagem = {
      autor: "assistant",
      texto: "Analisando a pergunta, aguarde um momento..."
    };
    setMensagens((m) => [...m, loadingMsg]);
    setIsLoading(true);

    const resposta = await consultarBackend(perguntaTexto);

    setMensagens((m) =>
      m.map((msg) =>
        msg === loadingMsg ? { autor: "assistant", texto: resposta } : msg
      )
    );

    setIsLoading(false);
  };

  const consultarBackend = async (texto: string): Promise<string> => {
    try {
      const res = await fetch(`${API_URL}/chat/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: texto,
          user_id: email
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        return `Erro do servidor: ${err.detail ?? "Desconhecido"}`;
      }

      const data = await res.json();
      return data.response ?? "Erro ao gerar resposta.";
    } catch (e) {
      return "Erro de conexão com o servidor. " + e;
    }
  };

  // --- NOVA FUNÇÃO: Sincronizar Google Drive ---
  const sincronizarConhecimento = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      const res = await fetch(`${API_URL}/admin/sync-knowledge`, {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Falha na sincronização');

      setSyncStatus('success');
      // Volta ao normal depois de 3 segundos
      setTimeout(() => setSyncStatus('idle'), 3000);
      
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={page}>
      <div style={container}>
        <header style={header}>
          <div>
            <h2 style={title}>Assistente ITT</h2>
            <span style={emailStyle}>{email}</span>
          </div>
          
          {/* GRUPO DE BOTÕES NO CABEÇALHO */}
          <div style={{ display: 'flex', gap: '10px' }}>
            
            {/* --- NOVO BOTÃO DE SINCRONIZAÇÃO --- */}
            <button 
              onClick={sincronizarConhecimento} 
              style={{
                ...syncBtn,
                background: syncStatus === 'error' ? '#ef4444' : 
                           syncStatus === 'success' ? '#22c55e' : '#2563eb',
                opacity: isSyncing ? 0.7 : 1,
                cursor: isSyncing ? 'wait' : 'pointer'
              }}
              title="Atualizar base de conhecimento com arquivos do Google Drive"
            >
              {isSyncing ? '⏳ Atualizando...' : 
               syncStatus === 'success' ? '✅ Docs Atualizados!' : 
               syncStatus === 'error' ? '❌ Erro' : 
               '🔄 Atualizar Docs'}
            </button>

            <button onClick={onLogout} style={logoutBtn}>Sair</button>
          </div>
        </header>

        <div style={chatBox}>
          {mensagens.map((m, i) => (
            <div
              key={i}
              style={m.autor === "user" ? msgUser : msgAssistant}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p style={{ marginBottom: "8px", lineHeight: "1.6" }}>{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: "#fff" }}>{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ opacity: 0.85 }}>{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul style={{ marginLeft: "20px", marginBottom: "8px" }}>{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li style={{ marginBottom: "4px" }}>{children}</li>
                  )
                }}
              >
                {m.texto}
              </ReactMarkdown>
            </div>
          ))}
        </div>

        <div style={inputArea}>
          <input
            style={input}
            value={pergunta}
            placeholder={isLoading ? "Aguarde a resposta..." : "Digite sua pergunta..."}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarPergunta()}
            disabled={isLoading}
          />
          <button
            style={{ ...sendBtn, opacity: isLoading ? 0.5 : 1 }}
            onClick={enviarPergunta}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ DARK UI MODERN ------------------ */

const page = {
  height: "100vh",
  background: "#0c0c0f",
  color: "#e5e7eb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const container = {
  width: "100%",
  maxWidth: "900px",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  background: "#1a1a1d",
  borderRadius: "14px",
  border: "1px solid #2b2b2e",
  boxShadow: "0 0 25px rgba(0,0,0,0.4)",
  overflow: "hidden",
};

const header = {
  padding: "20px",
  borderBottom: "1px solid #2b2b2e",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const title = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 500,
};

const emailStyle = {
  fontSize: "13px",
  opacity: 0.5,
};

const logoutBtn = {
  background: "#2b2b2e",
  color: "#e5e7eb",
  borderRadius: "8px",
  padding: "8px 12px",
  border: "none",
  cursor: "pointer",
  fontWeight: 500,
};

// Estilo novo para o botão de sync
const syncBtn = {
  color: "white",
  borderRadius: "8px",
  padding: "8px 12px",
  border: "none",
  fontWeight: 500,
  fontSize: "13px",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "140px"
};

const chatBox = {
  flexGrow: 1,
  padding: "25px",
  overflowY: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: "14px",
};

const msgUser = {
  alignSelf: "flex-end",
  background: "#3b82f6",
  color: "white",
  padding: "12px 15px",
  borderRadius: "10px",
  maxWidth: "70%",
  fontSize: "15px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

const msgAssistant = {
  alignSelf: "flex-start",
  background: "#2a2a2d",
  padding: "12px 15px",
  borderRadius: "10px",
  maxWidth: "75%",
  fontSize: "15px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

const inputArea = {
  display: "flex",
  padding: "18px",
  gap: "12px",
  borderTop: "1px solid #2b2b2e",
  background: "#1a1a1d",
};

const input = {
  flexGrow: 1,
  background: "#0f0f12",
  border: "1px solid #2b2b2e",
  borderRadius: "10px",
  padding: "12px",
  color: "#e5e7eb",
  fontSize: "15px",
};

const sendBtn = {
  padding: "12px 18px",
  background: "#3b82f6",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: 500,
  boxShadow: "0 0 10px rgba(59,130,246,0.5)",
};