import { useState } from "react";
import { COLORS } from "./data/constants.js";
import LoginScreen from "./components/LoginScreen.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { TabResumen, TabRevenue, TabCuentas, TabPipeline, TabEquipo, TabAlertas } from "./tabs/index.js";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.light, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setLoggedIn(false)} />

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "resumen" && <TabResumen />}
        {activeTab === "revenue" && <TabRevenue />}
        {activeTab === "cuentas" && <TabCuentas />}
        {activeTab === "pipeline" && <TabPipeline />}
        {activeTab === "equipo" && <TabEquipo />}
        {activeTab === "alertas" && <TabAlertas />}
      </div>

      <Footer />
    </div>
  );
}
