import { useState } from "react";

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

  const enviarPergunta = async () => {
    if (!pergunta.trim() || isLoading) return;

    const msgUser: Mensagem = { autor: "user", texto: pergunta };
    setMensagens((m) => [...m, msgUser]);

    const perguntaTexto = pergunta;
    setPergunta("");

    // Adiciona mensagem de loading
    const loadingMsg: Mensagem = {
      autor: "assistant",
      texto: "Analisando a pergunta, aguarde um momento..."
    };
    setMensagens((m) => [...m, loadingMsg]);
    setIsLoading(true);

    const resposta = await consultarBackend(perguntaTexto);

    // Substitui a mensagem de loading pela resposta real
    setMensagens((m) =>
      m.map((msg) =>
        msg === loadingMsg ? { autor: "assistant", texto: resposta } : msg
      )
    );

    setIsLoading(false);
  };

  const consultarBackend = async (texto: string): Promise<string> => {
    try {
      const res = await fetch("https://chatbot-itt-5lbt.onrender.com/chat/query", {
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
      return "Erro de conexão com o servidor.";
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
          <button onClick={onLogout} style={logoutBtn}>Sair</button>
        </header>

        <div style={chatBox}>
          {mensagens.map((m, i) => (
            <div
              key={i}
              style={{
                ...(m.autor === "user" ? msgUser : msgAssistant)
              }}
            >
              {m.texto}
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
          <button style={{ ...sendBtn, opacity: isLoading ? 0.5 : 1 }} onClick={enviarPergunta} disabled={isLoading}>
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
};

const chatBox = {
  flexGrow: 1,
  padding: "25px",
  overflowY: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: "14px",
};

/* BOLHAS */

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

/* INPUT */

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
