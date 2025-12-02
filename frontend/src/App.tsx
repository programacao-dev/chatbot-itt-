import { useState } from "react";
import Login from "./Login";
import Chat from "./Chat";

export default function App() {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const handleLogin = (token: string, email: string) => {
    setIdToken(token);
    setEmail(email);
  };

  const logout = () => {
    setIdToken(null);
    setEmail(null);
  };

  return (
    <div style={appStyle}>
      {!idToken || !email ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat idToken={idToken} email={email} onLogout={logout} />
      )}
    </div>
  );
}

/* Tema escuro global */

const appStyle = {
  background: "#0c0c0f",
  minHeight: "100vh",
  color: "#e5e7eb",
};
