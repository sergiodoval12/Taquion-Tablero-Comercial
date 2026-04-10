import { useState } from "react";
import { COLORS } from "./data/constants.js";
import DataProvider, { useData } from "./data/DataProvider.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { TabResumen, TabRevenue, TabSeguimiento, TabCuentas, TabPipeline, TabEquipo, TabAlertas } from "./tabs/index.js";

function DataStatusBar() {
  const { loading, error, source, updatedAt, refresh } = useData();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 32px",
      background: source === "api" ? "#e8f5e9" : error ? "#fff3e0" : "#e3f2fd",
      fontSize: 11,
      color: COLORS.gray,
      borderBottom: "1px solid " + COLORS.lightGray,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: loading ? COLORS.warning : source === "api" ? COLORS.green : COLORS.orange,
          display: "inline-block",
        }} />
        {loading ? (
          <span>Cargando datos desde Notion...</span>
        ) : source === "api" ? (
          <span>Datos en vivo desde Notion CRM</span>
        ) : (
          <span>Datos locales (fallback) — {error || "API no disponible"}</span>
        )}
        {updatedAt && !loading && (
          <span style={{ marginLeft: 8, opacity: 0.7 }}>
            Actualizado: {new Date(updatedAt).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
          </span>
        )}
      </div>
      <button
        onClick={refresh}
        disabled={loading}
        style={{
          background: "transparent",
          border: "1px solid " + COLORS.lightGray,
          borderRadius: 4,
          padding: "2px 10px",
          fontSize: 11,
          cursor: loading ? "wait" : "pointer",
          color: COLORS.dark,
        }}
      >
        {loading ? "..." : "Actualizar"}
      </button>
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("resumen");

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => {}} />
      <DataStatusBar />

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "resumen" && <TabResumen />}
        {activeTab === "revenue" && <TabRevenue />}
        {activeTab === "seguimiento" && <TabSeguimiento />}
        {activeTab === "cuentas" && <TabCuentas />}
        {activeTab === "pipeline" && <TabPipeline />}
        {activeTab === "equipo" && <TabEquipo />}
        {activeTab === "alertas" && <TabAlertas />}
      </div>

      <Footer />
    </>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <DataProvider>
      <div style={{ minHeight: "100vh", background: COLORS.light, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Dashboard />
      </div>
    </DataProvider>
  );
}
