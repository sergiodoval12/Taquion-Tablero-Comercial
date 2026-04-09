import { COLORS, TABS } from "../data/constants.js";

export default function Header({ activeTab, setActiveTab, onLogout }) {
  return (
    <>
      <div style={{ background: "linear-gradient(135deg, " + COLORS.dark + " 0%, " + COLORS.blue + " 100%)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>TAQUION</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Tablero del Director Comercial</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Datos Notion CRM | 8 Abr 2026</span>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ background: "white", borderBottom: "1px solid " + COLORS.lightGray, padding: "0 32px", display: "flex", gap: 0, overflowX: "auto" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? COLORS.accent : COLORS.gray,
              borderBottom: activeTab === tab.id ? "2px solid " + COLORS.accent : "2px solid transparent",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            [{tab.icon}] {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
