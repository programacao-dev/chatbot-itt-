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

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return;
    
    const msgUser: Mensagem = { autor: "user", texto: pergunta };
    setMensagens((m) => [...m, msgUser]);

    const textoPergunta = pergunta;
    setPergunta("");

    const resposta = await consultarBackend(textoPergunta);

    setMensagens((m) => [...m, { autor: "assistant", texto: resposta }]);
  };

  const consultarBackend = async (texto: string): Promise<string> => {
    try {
      const res = await fetch("https://SEU_BACKEND.cloudrun.app/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ pergunta: texto }),
      });

      const data = await res.json();
      return data.resposta ?? "Erro ao gerar resposta.";
    } catch (e) {
      return "Erro de conexão com o servidor.";
    }
  };

  return (
    <div style={wrapper}>
      <header style={header}>
        <h2>💬 Assistente ITT</h2>
        <div>{email}</div>
        <button onClick={onLogout} style={logoutBtn}>Sair</button>
      </header>

      <div style={chatBox}>
        {mensagens.map((m, i) => (
          <div
            key={i}
            style={{
              ...msg,
              alignSelf: m.autor === "user" ? "flex-end" : "flex-start",
              background: m.autor === "user" ? "#DCF8C6" : "#EEE",
            }}
          >
            {m.texto}
          </div>
        ))}
      </div>

      <div style={inputArea}>
        <input
          type="text"
          value={pergunta}
          placeholder="Digite sua pergunta..."
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarPergunta()}
          style={input}
        />
        <button onClick={enviarPergunta} style={btn}>Enviar</button>
      </div>
    </div>
  );
}

const wrapper = {
  height: "100vh",
  display: "flex",
  flexDirection: "column" as const,
};

const header = {
  padding: "15px",
  background: "#1a73e8",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const logoutBtn = {
  background: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 12px",
  cursor: "pointer",
};

const chatBox = {
  flexGrow: 1,
  padding: "20px",
  overflowY: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: "10px",
};

const msg = {
  maxWidth: "60%",
  padding: "10px",
  borderRadius: "10px",
  fontSize: "14px",
};

const inputArea = {
  display: "flex",
  padding: "10px",
  gap: "10px",
  borderTop: "1px solid #ddd",
};

const input = {
  flexGrow: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const btn = {
  padding: "10px 15px",
  borderRadius: "8px",
  background: "#1a73e8",
  color: "white",
  cursor: "pointer",
  border: "none",
};
