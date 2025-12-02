import { useEffect } from "react";

interface LoginProps {
  onLogin: (token: string, email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  useEffect(() => {
    /* @ts-ignore */
    window.google?.accounts.id.initialize({
      client_id: "961077150905-dsdb9plq43u7akdb4c77g3ai3ch1budm.apps.googleusercontent.com",
      callback: (response: any) => {
        const cred = response.credential;
        const payload = JSON.parse(atob(cred.split(".")[1]));
        onLogin(cred, payload.email);
      },
    });

    /* @ts-ignore */
    window.google?.accounts.id.renderButton(document.getElementById("googleBtn"), {
      theme: "filled_black",
      size: "large",
      width: 300,
    });
  }, []);

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>Acessar Assistente ITT</h1>
        <p style={subtitle}>Faça login com sua conta Google institucional</p>

        <div id="googleBtn" />

        <footer style={footer}>
          <small>Instituto Tadao Takahashi</small>
        </footer>
      </div>
    </div>
  );
}

/* ---------------- ESTILOS DARK MODE ---------------- */
const page = {
  background: "#0c0c0f",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  color: "#e5e7eb",
};

const card = {
  background: "#1a1a1d",
  padding: "40px",
  width: "100%",
  maxWidth: "420px",
  borderRadius: "14px",
  border: "1px solid #2a2a2d",
  boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  display: "flex",
  flexDirection: "column" as const,
  gap: "25px",
};

const title = {
  fontSize: "26px",
  margin: 0,
  fontWeight: "600",
};

const subtitle = {
  opacity: 0.7,
  marginBottom: "10px",
};

const footer = {
  marginTop: "20px",
  opacity: 0.4,
  textAlign: "center" as const,
};
