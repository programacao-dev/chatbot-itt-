import { useState } from "react";
import Login from "./Login";
import Chat from "./Chat";

export default function App() {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [autorizado, setAutorizado] = useState<boolean>(false);

  const handleLogin = (token: string, emailDoUsuario: string) => {
    setEmail(emailDoUsuario);

    // Verifica domínio permitido
    const dominio = emailDoUsuario.split("@")[1];
    const permitido = dominio === "institutotadao-itt.org.br";

    setAutorizado(permitido);

    if (permitido) {
      setIdToken(token);
    }
  };

  const handleLogout = () => {
    setIdToken(null);
    setEmail(null);
    setAutorizado(false);
  };

  // Caso o usuário tente entrar com um domínio proibido
  if (email && !autorizado) {
    return (
      <div style={erroStyle}>
        <h2>Acesso negado</h2>
        <p>
          Esta aplicação só pode ser acessada por contas do domínio <b>@institutotadao-itt.org.br</b>.
        </p>
        <button onClick={handleLogout}>Voltar ao login</button>
      </div>
    );
  }

  return (
    <>
      {idToken ? (
        <Chat idToken={idToken} email={email!} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

const erroStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
};
