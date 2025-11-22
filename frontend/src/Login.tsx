import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface LoginProps {
  onLogin: (token: string, email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const googleButton = useRef<HTMLDivElement>(null);

  // Decodificador JWT simples (sem dependências)
  const decodeJwt = (token: string) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  useEffect(() => {
    if (!window.google || !googleButton.current) return;

    window.google.accounts.id.initialize({
      client_id: "SEU_CLIENT_ID_DO_GCP.apps.googleusercontent.com",
      callback: (response: any) => {
        const token = response.credential;
        const payload = decodeJwt(token);

        onLogin(token, payload.email);
      },
    });

    window.google.accounts.id.renderButton(googleButton.current, {
      theme: "filled_blue",
      size: "large",
      width: 300,
    });
  }, []);

  return (
    <div style={containerStyle}>
      <h1>Login com Google</h1>
      <div ref={googleButton}></div>
    </div>
  );
}

const containerStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
};
