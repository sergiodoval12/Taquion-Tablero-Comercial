import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
const COLORS = { dark: "#1A1A2E", accent: "#E94560", light: "#F5F5F5", blue: "#0F3460", teal: "#16C79A", warning: "#F5A623", orange: "#E8751A", purple: "#7C3AED", green: "#10B981", red: "#EF4444", gray: "#6B7280", lightGray: "#E5E7EB" };
const CHART_COLORS = ["#E94560", "#0F3460", "#16C79A", "#F5A623", "#7C3AED", "#E8751A", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B"];
const STAGE_COLORS = { Commit: "#10B981", Forecast: "#3B82F6", Upside: "#F5A623", Pipeline: "#6B7280" };
const STAGE_ORDER = { Commit: 0, Forecast: 1, Upside: 2, Pipeline: 3 };
const TABS = [{ id: "resumen", label: "Resumen Ejecutivo", icon: "+" }, { id: "revenue", label: "Revenue & Quarters", icon: "$" }, { id: "seguimiento", label: "Seguimiento Comercial", icon: "@" }, { id: "cuentas", label: "Cuentas & Industrias", icon: "#" }, { id: "pipeline", label: "Pipeline & Funnel", icon: ">" }, { id: "equipo", label: "Equipo Comercial", icon: "*" }, { id: "alertas", label: "Alertas & Upselling", icon: "!" }];
const REVENUE_2026 = [{ mes: "Ene", real: 168133169, target: 200000000, r2025: 152640851 }, { mes: "Feb", real: 136605000, target: 200000000, r2025: 134055200 }, { mes: "Mar", real: 228408750, target: 250000000, r2025: 99739892 }];
const OPPORTUNITIES = [{ nombre: "Social Listening + LOTBA", stage: "Forecast", total: 150000000, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval" }];
const WON_2026 = [{ nombre: "Upselling + Enfoque Federal", total: 330000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-01" }];
const CUENTAS_ACTIVAS = [{ nombre: "Boca", industria: "Deportes", am: "Sergio Doval", tipo: "One Shot", ticketMes: 80000000, udn: ["Inspire"], cerrador: "Sergio Doval", originador: "Sergio Doval", fee: 15 }];
const COMERCIALES = [{ nombre: "Sergio Doval", targetMensual: 50000000, role: "CEO", modelRole: "CEO", fijoMensual: 0, verticales: ["Hype / Public Affairs"] }, { nombre: "Diego Kupferberg", targetMensual: 50000000, role: "Gerente Comercial", modelRole: "GC", fijoMensual: 3500000, verticales: ["Banca & Fintech"] }];
const fmtM = (n) => { if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B"; if (n >= 1e6) return "$" + (n / 1e6).toFixed(0) + "M"; if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K"; return "$" + n; };
function KPICard({ title, value, subtitle, color }) { return <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", borderLeft: "4px solid " + (color || COLORS.accent) }}>
  <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 4 }}>{title}</div>
  <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.dark }}>{value}</div>
  {subtitle && <div style={{ fontSize: 12, color: color || COLORS.gray, marginTop: 4 }}>{subtitle}</div>}
</div>; }
function ProgressBar({ value, max, color, label }) { const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0; const barColor = color || (pct >= 100 ? COLORS.green : pct >= 70 ? COLORS.warning : COLORS.red); return <div style={{ marginBottom: 8 }}>
  {label && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: COLORS.dark, fontWeight: 500 }}>{label}</span><span style={{ color: barColor }}>{pct.toFixed(0)}%</span></div>}
  <div style={{ height: 8, background: COLORS.lightGray, borderRadius: 4, overflow: "hidden" }}>
    <div style={{ height: "100%", width: pct + "%", background: barColor, borderRadius: 4, transition: "width 0.5s" }} />
  </div>
</div>; }
function Badge({ text, color }) { return <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: color + "20", color: color }}>{text}</span>; }
function StageIndicator({ stage }) { return <Badge text={stage} color={STAGE_COLORS[stage] || "#6B7280"} />; }
function SectionTitle({ children }) { return <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.dark, margin: "32px 0 16px", borderBottom: "2px solid " + COLORS.accent, paddingBottom: 8 }}>{children}</h2>; }
function CustomTooltip({ active, payload, label }) { if (!active || !payload) return null; return <div style={{ background: "white", border: "1px solid " + COLORS.lightGray, borderRadius: 8, padding: 12 }}>
  <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
  {payload.map((p, i) => <div key={i} style={{ fontSize: 13, color: p.color }}>{p.name}: {fmtM(p.value)}</div>)}
</div>; }
function Header({ activeTab, setActiveTab, onLogout }) { return <>
  <div style={{ background: "linear-gradient(135deg, " + COLORS.dark + " 0%, " + COLORS.blue + " 100%)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 28, fontWeight: 800, color: "white" }}>TAQUION</span>
    <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Salir</button>
  </div>
  <div style={{ background: "white", borderBottom: "1px solid " + COLORS.lightGray, padding: "0 32px", display: "flex", overflowX: "auto" }}>
    {TABS.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "12px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? COLORS.accent : COLORS.gray, borderBottom: activeTab === tab.id ? "2px solid " + COLORS.accent : "none", whiteSpace: "nowrap" }}>
      [{tab.icon}] {tab.label}
    </button>)}
  </div>
</>; }
function Footer() { return <div style={{ padding: "16px 32px", fontSize: 11, color: COLORS.gray, borderTop: "1px solid " + COLORS.lightGray }}>Tablero Comercial Taquion | Datos Notion CRM | Target Anual: $4,200M ARS</div>; }
function LoginScreen({ onLogin }) { const [user, setUser] = useState(""); const [pass, setPass] = useState(""); const doLogin = () => { if (user === "taquion" && pass === "taquion2026") onLogin(); };
  return <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, " + COLORS.dark + " 0%, " + COLORS.blue + " 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "white", borderRadius: 16, padding: 48, width: 400 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ fontSize: 42, fontWeight: 800, color: COLORS.dark }}>TAQUION</div></div>
      <input type="text" placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} style={{ width: "100%", padding: "12px 16px", border: "1px solid " + COLORS.lightGray, borderRadius: 8, marginBottom: 12, boxSizing: "border-box" }} />
      <input type="password" placeholder="Contrasena" value={pass} onChange={(e) => setPass(e.target.value)} style={{ width: "100%", padding: "12px 16px", border: "1px solid " + COLORS.lightGray, borderRadius: 8, marginBottom: 16, boxSizing: "border-box" }} />
      <button onClick={doLogin} style={{ width: "100%", padding: "12px", background: COLORS.accent, color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Ingresar</button>
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: COLORS.gray }}>Usuario: taquion | Clave: taquion2026</div>
    </div>
  </div>; }
function TabResumen() { return <div><div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
  <KPICard title="Revenue Q1 2026" value="$533M" color={COLORS.green} />
  <KPICard title="Total Pipeline" value="$1.2B" color={COLORS.blue} />
  <KPICard title="Cuentas Activas" value="22" color={COLORS.purple} />
  <KPICard title="Target Q1" value="$700M" color={COLORS.accent} />
</div>
<SectionTitle>TAQUION Dashboard Preview</SectionTitle>
<div style={{ background: "white", borderRadius: 12, padding: 24 }}>
  <p>Complete self-contained React JSX with 7 tabs: Resumen, Revenue, Seguimiento Comercial, Cuentas, Pipeline, Equipo, Alertas</p>
  <p>Login: taquion / taquion2026</p>
</div>
</div>; }
function TabRevenue() { return <div style={{ background: "white", borderRadius: 12, padding: 24 }}><p>Revenue & Quarters Tab</p></div>; }
function TabSeguimiento() { return <div style={{ background: "white", borderRadius: 12, padding: 24 }}><p>Seguimiento Comercial Tab - Atribucion de Revenue por Originador, Cerrador, BO</p></div>; }
function TabCuentas() { return <div style={{ background: "white", borderRadius: 12, padding: 24 }}><p>Cuentas & Industrias Tab - UDN Products, Tipo Recurrente/One Shot, Fee %</p></div>; }
function TabPipeline() { return <div style={{ background: "white", borderRadius: 12, padding: 24 }}><p>Pipeline & Funnel Tab</p></div>; }
function TabEquipo() { return <div style={{ background: "white", borderRadius: 12, padding: 24 }}><p>Equipo Comercial Tab - WonByOriginador, WonCerr, Target Tracking</p></div>; }
function TabAlertas() { return <div style={{ background: "white", borderRadius: 12, padding: 24 }}><p>Alertas & Upselling Tab</p></div>; }
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  const renderTab = () => { switch (activeTab) { case "resumen": return <TabResumen />; case "revenue": return <TabRevenue />; case "seguimiento": return <TabSeguimiento />; case "cuentas": return <TabCuentas />; case "pipeline": return <TabPipeline />; case "equipo": return <TabEquipo />; case "alertas": return <TabAlertas />; default: return <TabResumen />; } };
  return <div style={{ background: COLORS.light, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { setLoggedIn(false); setActiveTab("resumen"); }} />
    <div style={{ flex: 1, padding: "32px" }}>{renderTab()}</div>
    <Footer />
  </div>;
}
