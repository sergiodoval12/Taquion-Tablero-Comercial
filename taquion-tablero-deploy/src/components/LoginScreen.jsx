import { useState } from "react";
import { COLORS } from "../data/constants.js";

export default function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const doLogin = () => {
    if (user === "taquion" && pass === "comercial2026") {
      onLogin();
    } else {
      setError("Credenciales incorrectas");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") doLogin();
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, " + COLORS.dark + " 0%, " + COLORS.blue + " 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 16, padding: 48, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: COLORS.dark, letterSpacing: -1 }}>TAQUION</div>
          <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>Tablero del Director Comercial</div>
        </div>
        <div>
          <input type="text" placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} onKeyDown={handleKey}
            style={{ width: "100%", padding: "12px 16px", border: "1px solid " + COLORS.lightGray, borderRadius: 8, fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />
          <input type="password" placeholder="Contrasena" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={handleKey}
            style={{ width: "100%", padding: "12px 16px", border: "1px solid " + COLORS.lightGray, borderRadius: 8, fontSize: 15, marginBottom: 16, boxSizing: "border-box" }} />
          {error && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button type="button" onClick={doLogin} style={{ width: "100%", padding: "12px", background: COLORS.accent, color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Ingresar
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: COLORS.gray }}>
          Usuario: taquion | Clave: comercial2026
        </div>
      </div>
    </div>
  );
}
