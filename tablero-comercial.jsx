import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";

// ═══════════════════════════════════════════════════════════════
// TABLERO COMERCIAL — GRUPO TAQUION
// Datos conectados a Notion CRM | Actualización: 8 Abril 2026
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  dark: "#1A1A2E",
  accent: "#E94560",
  light: "#F5F5F5",
  blue: "#0F3460",
  teal: "#16C79A",
  warning: "#F5A623",
  orange: "#E8751A",
  purple: "#7C3AED",
  green: "#10B981",
  red: "#EF4444",
  gray: "#6B7280",
  lightGray: "#E5E7EB",
};

const CHART_COLORS = ["#E94560", "#0F3460", "#16C79A", "#F5A623", "#7C3AED", "#E8751A", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B"];

const STAGE_COLORS = {
  Commit: "#10B981",
  Forecast: "#3B82F6",
  Upside: "#F5A623",
  Pipeline: "#6B7280",
};

const STAGE_ORDER = { Commit: 0, Forecast: 1, Upside: 2, Pipeline: 3 };

// ─── REAL DATA FROM NOTION CRM ─────────────────────────────────

const REVENUE_2026 = [
  { mes: "Ene", real: 337983179, target: 200000000, r2025: 209011098 },
  { mes: "Feb", real: 207055020, target: 200000000, r2025: 217275060 },
  { mes: "Mar", real: 506975760, target: 250000000, r2025: 153419862 },
  { mes: "Abr", real: 632476000, target: 250000000, r2025: 317194478, projected: true },
  { mes: "May", real: 573726000, target: 300000000, r2025: 418486049, projected: true },
  { mes: "Jun", real: 399943000, target: 300000000, r2025: 568628212, projected: true },
  { mes: "Jul", real: 369126000, target: 350000000, r2025: 274576633, projected: true },
  { mes: "Ago", real: 351526000, target: 400000000, r2025: 303543693, projected: true },
  { mes: "Sep", real: 341743000, target: 450000000, r2025: 386670781, projected: true },
  { mes: "Oct", real: 311448000, target: 450000000, r2025: 529918949, projected: true },
  { mes: "Nov", real: 324648000, target: 500000000, r2025: 675721830, projected: true },
  { mes: "Dic", real: 324665000, target: 550000000, r2025: 642425597, projected: true },
];

const OPPORTUNITIES = [
  // COMMIT
  { nombre: "Pauta + San Luis", stage: "Commit", total: 0, industria: "Public Affairs", upselling: true, cerrador: "Sin asignar", duracion: "One shot" },
  { nombre: "Ola Palermo + BSD (Investments)", stage: "Commit", total: 0, industria: "Real Estate", upselling: false, cerrador: "Gisela Bongiorni", duracion: "Recurrente" },
  // FORECAST
  { nombre: "Investigacion/Creatividad + Camara Arg. Medios Pago", stage: "Forecast", total: 177000000, industria: "Public Affairs", upselling: false, cerrador: "Diego Kupferberg", duracion: "Recurrente" },
  { nombre: "Investigacion + Gob. Cordoba", stage: "Forecast", total: 8980000, industria: "Public Affairs", upselling: false, cerrador: "Diego Kupferberg", duracion: "One shot" },
  { nombre: "Social Listening + LOTBA", stage: "Forecast", total: 150000000, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Personal Pay", stage: "Forecast", total: 25000000, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Comunicacion + ALEA 2026", stage: "Forecast", total: 0, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "" },
  // UPSIDE
  { nombre: "Estrategia salida & Campanas + ALEA", stage: "Upside", total: 10200000, industria: "Otro", upselling: true, cerrador: "Sin asignar", duracion: "Campana" },
  { nombre: "Estrategia pauta + Rosbaco", stage: "Upside", total: 0, industria: "Real Estate", upselling: true, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "Manual marca + Potrero Encanta", stage: "Upside", total: 0, industria: "Turismo", upselling: true, cerrador: "Sin asignar", duracion: "One shot" },
  { nombre: "Investigacion + BIND PSP", stage: "Upside", total: 18700000, industria: "Banca & Fintech", upselling: true, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Investigacion + Partido Politico", stage: "Upside", total: 10000000, industria: "Public Affairs", upselling: false, cerrador: "Diego Kupferberg", duracion: "" },
  { nombre: "Comunidades + Farmapay", stage: "Upside", total: 100000000, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", duracion: "Recurrente", velocityDays: 50 },
  { nombre: "Creatividad/SL + Mundo GEA", stage: "Upside", total: 100000000, industria: "Entretenimiento / Deportes", upselling: true, cerrador: "Diego Kupferberg", duracion: "Recurrente" },
  { nombre: "Investigacion + E. Gigena (Wallet B2B)", stage: "Upside", total: 19500000, industria: "Consumo Masivo", upselling: false, cerrador: "Diego Kupferberg", duracion: "One shot" },
  { nombre: "Comunidades + RESTART", stage: "Upside", total: 45000000, industria: "Tecnologia / IA", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Comunidad + Lotba", stage: "Upside", total: 70000000, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "Exploracion + On City", stage: "Upside", total: 30000000, industria: "Otro", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Investigacion + Lotba", stage: "Upside", total: 41000000, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Mapa Fintech + Alianza Fintech Iberoamerica", stage: "Upside", total: 150000000, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Comunidad Vecinos + GCBA", stage: "Upside", total: 300000000, industria: "Public Affairs", upselling: false, cerrador: "Diego Lajst", duracion: "", velocityDays: 0 },
  { nombre: "Estrategia + Creatividad + Ejecucion + Restart", stage: "Upside", total: 150000000, industria: "Tecnologia / IA", upselling: false, cerrador: "Sin asignar", duracion: "", velocityDays: 0 },
  { nombre: "Comunidad AI + GCBA", stage: "Upside", total: 150000000, industria: "Tecnologia / IA", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Estrategia / Creatividad + Pet Food Saladillo", stage: "Upside", total: 100000000, industria: "Consumo Masivo", upselling: false, cerrador: "Diego Lajst", duracion: "" },
  { nombre: "Upselling + Aerolineas Argentinas", stage: "Upside", total: 0, industria: "Turismo", upselling: true, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Upselling + La Pampa", stage: "Upside", total: 0, industria: "Public Affairs", upselling: true, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "Upselling + Finadina", stage: "Upside", total: 0, industria: "Banca & Fintech", upselling: true, cerrador: "Sin asignar", duracion: "", velocityDays: 0 },
  { nombre: "Campana + ALEA", stage: "Upside", total: 0, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Estudios cuantitativos + MELI", stage: "Upside", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Zeta Belgrano + BSD (Investments)", stage: "Upside", total: 0, industria: "Real Estate", upselling: false, cerrador: "Gisela Bongiorni", duracion: "" },
  { nombre: "SL Analisis Reputacion + Promperu", stage: "Upside", total: 0, industria: "Turismo", upselling: false, cerrador: "Diego Kupferberg", duracion: "" },
  { nombre: "Escucha Social + Aerolineas Argentinas", stage: "Upside", total: 61200000, industria: "Turismo", upselling: true, cerrador: "Sol Rios", duracion: "Recurrente" },
  // PIPELINE
  { nombre: "Estrategia y Creatividad 75 anos + Aerolineas", stage: "Pipeline", total: 6000000, industria: "Turismo", upselling: true, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Posicionamiento estrategico + Suterh", stage: "Pipeline", total: 11000000, industria: "Public Affairs", upselling: true, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "Posicionamiento + Farmapay", stage: "Pipeline", total: 0, industria: "Laboratorios", upselling: true, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "SL y Comunicacion + Aerolineas", stage: "Pipeline", total: 0, industria: "Turismo", upselling: true, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "SL + Moiguer", stage: "Pipeline", total: 1800000, industria: "Otro", upselling: false, cerrador: "Diego Kupferberg", duracion: "" },
  { nombre: "Investigacion + Restart", stage: "Pipeline", total: 60000000, industria: "Tecnologia / IA", upselling: false, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "Investigacion + Montemar", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Estudio B&F + ReSimple", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Estudio B&F + PREX", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "MAPA + CUF (Camara Uruguaya Fintech)", stage: "Pipeline", total: 63000000, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", duracion: "Campana" },
  { nombre: "Upselling + Bind", stage: "Pipeline", total: 67000000, industria: "Banca & Fintech", upselling: true, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Exploracion + Farmapay", stage: "Pipeline", total: 0, industria: "Laboratorios", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Campana + Naranja X", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Exploracion + Huawei", stage: "Pipeline", total: 0, industria: "Tecnologia / IA", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Exploracion + Supervielle", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Exploracion + Al Mundo", stage: "Pipeline", total: 25000000, industria: "Turismo", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Campana Concientizacion + ALEA", stage: "Pipeline", total: 25000000, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Solucion B&F + Personal Pay", stage: "Pipeline", total: 30000000, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Comunidad + Grupo Gaman", stage: "Pipeline", total: 100000000, industria: "Seguros", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Comunidades + Agencia Nac. Inversiones", stage: "Pipeline", total: 0, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Campana + AFA", stage: "Pipeline", total: 75000000, industria: "Entretenimiento / Deportes", upselling: false, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "Comunidades + Corrientes", stage: "Pipeline", total: 0, industria: "Public Affairs", upselling: false, cerrador: "Sin asignar", duracion: "" },
  { nombre: "Talk About + Philip Morris", stage: "Pipeline", total: 0, industria: "Consumo Masivo", upselling: false, cerrador: "Diego Kupferberg", duracion: "" },
  { nombre: "Exploracion + Provincia Net", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "Recurrente" },
  { nombre: "Leasing Argentina", stage: "Pipeline", total: 18000000, industria: "Banca & Fintech", upselling: false, cerrador: "Sin asignar", duracion: "" },
];

const CUENTAS_ACTIVAS = [
  { nombre: "GCBA", industria: "Hype / Public Affairs", am: "Alejo" },
  { nombre: "Credicuotas", industria: "Banca & Fintech", am: "Victoria Lupo" },
  { nombre: "La Pampa", industria: "Hype / Public Affairs", am: "Sol Rios" },
  { nombre: "Banco Ciudad", industria: "Banca & Fintech", am: "Matias Fermin" },
  { nombre: "Aerolineas Argentinas", industria: "Turismo", am: "Matias Fermin" },
  { nombre: "BEM (Because Energy Matters)", industria: "Energia / Mineria", am: "Sol Rios" },
  { nombre: "Boca Juniors", industria: "Deportes", am: "Sergio Doval" },
  { nombre: "Farmapay", industria: "Laboratorios", am: "Sol Rios" },
  { nombre: "CAF (Camara Arg. Fintech)", industria: "Banca & Fintech", am: "Sol Rios" },
  { nombre: "Suterh", industria: "Sindicatos", am: "Sol Rios" },
  { nombre: "Ecosistema San Luis", industria: "Hype / Public Affairs", am: "Victoria Lupo" },
  { nombre: "MercadoPago", industria: "Banca & Fintech", am: "Matias Fermin" },
  { nombre: "ALEA", industria: "Hype / Public Affairs", am: "Sol Rios" },
  { nombre: "Banco Galicia / Nave", industria: "Banca & Fintech", am: "Victoria Lupo" },
  { nombre: "EY", industria: "Banca & Fintech", am: "Victoria Lupo" },
  { nombre: "Rosbaco", industria: "Real Estate", am: "Sol Rios" },
  { nombre: "YPF / YDi", industria: "Energia / Mineria", am: "Sol Rios" },
  { nombre: "Froneri", industria: "Alimentaria", am: "Solana Cuevas" },
  { nombre: "IGNIS (Pfizer)", industria: "Farmaceutica", am: "Victoria Lupo" },
  { nombre: "Getnet", industria: "Banca & Fintech", am: "Solana Cuevas" },
  { nombre: "Noble", industria: "Seguros", am: "Sol Rios" },
  { nombre: "LOTBA", industria: "Public Affairs", am: "Sin asignar" },
  { nombre: "Potrero Encanta", industria: "Hype / Public Affairs", am: "Victoria Lupo" },
  { nombre: "Ola Palermo", industria: "Real Estate", am: "Sin asignar" },
  { nombre: "Zeta Belgrano", industria: "Real Estate", am: "Sin asignar" },
  { nombre: "Nueva Organizacion", industria: "Sin clasificar", am: "Sin asignar" },
];

const COMERCIALES = [
  { nombre: "Diego Kupferberg", targetMensual: 50000000, role: "Cerrador" },
  { nombre: "Diego Lajst", targetMensual: 50000000, role: "Cerrador" },
  { nombre: "Matias Fermin", targetMensual: 50000000, role: "GC Banca & Fintech" },
  { nombre: "Sol Rios", targetMensual: 50000000, role: "COO" },
  { nombre: "Gisela Bongiorni", targetMensual: 50000000, role: "Steward Modelo" },
];

const WON_2026 = [
  { nombre: "Investigacion + Rosbaco", total: 8000000, cerrador: "Sergio Doval", fecha: "2026-03" },
  { nombre: "Estudio B&F + Naranja X", total: 20660000, cerrador: "Diego Kupferberg", fecha: "2026-01" },
  { nombre: "Investigacion + Getnet", total: 5800000, cerrador: "Sin asignar", fecha: "2026-02" },
  { nombre: "Pauta + San Luis", total: 0, cerrador: "Sin asignar", fecha: "2026-03" },
];

// ─── FORMATTERS ─────────────────────────────────────────────────

const fmtM = (n) => {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(0) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + n;
};

// ─── LOGIN SCREEN ───────────────────────────────────────────────

function LoginScreen({ onLogin }) {
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

// ─── COMPONENTS ─────────────────────────────────────────────────

function KPICard({ title, value, subtitle, color }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", borderLeft: "4px solid " + (color || COLORS.accent), boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 12, color: COLORS.gray, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.dark }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: color || COLORS.gray, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = color || (pct >= 100 ? COLORS.green : pct >= 70 ? COLORS.warning : COLORS.red);
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: COLORS.dark, fontWeight: 500 }}>{label}</span>
        <span style={{ color: barColor }}>{pct.toFixed(0)}%</span>
      </div>}
      <div style={{ height: 8, background: COLORS.lightGray, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: barColor, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.dark, margin: "32px 0 16px", borderBottom: "2px solid " + COLORS.accent, paddingBottom: 8 }}>{children}</h2>;
}

function Badge({ text, color }) {
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: color + "20", color: color, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {text}
    </span>
  );
}

function StageIndicator({ stage }) {
  return <Badge text={stage} color={STAGE_COLORS[stage] || COLORS.gray} />;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div style={{ background: "white", border: "1px solid " + COLORS.lightGray, borderRadius: 8, padding: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color }}>{p.name}: {fmtM(p.value)}</div>
      ))}
    </div>
  );
}

// ─── TAB: RESUMEN EJECUTIVO ─────────────────────────────────────

function TabResumen() {
  const q1Real = REVENUE_2026.slice(0, 3).reduce((s, m) => s + m.real, 0);
  const q1Target = REVENUE_2026.slice(0, 3).reduce((s, m) => s + m.target, 0);
  const projected = REVENUE_2026.reduce((s, m) => s + m.real, 0);
  const annualTarget = REVENUE_2026.reduce((s, m) => s + m.target, 0);

  const commitValue = OPPORTUNITIES.filter(o => o.stage === "Commit").reduce((s, o) => s + o.total, 0);
  const forecastValue = OPPORTUNITIES.filter(o => o.stage === "Forecast").reduce((s, o) => s + o.total, 0);
  const upsideValue = OPPORTUNITIES.filter(o => o.stage === "Upside").reduce((s, o) => s + o.total, 0);
  const pipelineValue = OPPORTUNITIES.filter(o => o.stage === "Pipeline").reduce((s, o) => s + o.total, 0);
  const totalPipeline = commitValue + forecastValue + upsideValue + pipelineValue;

  const stageData = [
    { name: "Commit", value: OPPORTUNITIES.filter(o => o.stage === "Commit").length, monto: commitValue },
    { name: "Forecast", value: OPPORTUNITIES.filter(o => o.stage === "Forecast").length, monto: forecastValue },
    { name: "Upside", value: OPPORTUNITIES.filter(o => o.stage === "Upside").length, monto: upsideValue },
    { name: "Pipeline", value: OPPORTUNITIES.filter(o => o.stage === "Pipeline").length, monto: pipelineValue },
  ];

  const industryMap = {};
  OPPORTUNITIES.forEach(o => {
    if (!industryMap[o.industria]) industryMap[o.industria] = { count: 0, value: 0 };
    industryMap[o.industria].count++;
    industryMap[o.industria].value += o.total;
  });
  const industryData = Object.entries(industryMap)
    .map(([name, d]) => ({ name: name.length > 20 ? name.slice(0, 18) + "..." : name, value: d.value, count: d.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const upsellingCount = OPPORTUNITIES.filter(o => o.upselling).length;
  const newCount = OPPORTUNITIES.filter(o => !o.upselling).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard title="Revenue Q1 2026 (Real)" value={fmtM(q1Real)} subtitle={(q1Real / q1Target * 100).toFixed(0) + "% del target Q1"} color={COLORS.green} />
        <KPICard title="Proyeccion Anual" value={fmtM(projected)} subtitle={(projected / annualTarget * 100).toFixed(0) + "% de " + fmtM(annualTarget) + " target"} color={projected > annualTarget ? COLORS.green : COLORS.warning} />
        <KPICard title={"Pipeline Total (" + OPPORTUNITIES.length + " opps)"} value={fmtM(totalPipeline)} subtitle="Commit a Pipeline activo" color={COLORS.blue} />
        <KPICard title="Cuentas Activas" value={CUENTAS_ACTIVAS.length} subtitle={upsellingCount + " opps upselling | " + newCount + " nuevas"} color={COLORS.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 16 }}>Revenue Mensual 2026 vs Target vs 2025</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={REVENUE_2026}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtM} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="real" name="2026 Real/Proj" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill={COLORS.lightGray} radius={[4, 4, 0, 0]} />
              <Bar dataKey="r2025" name="2025 Real" fill={COLORS.blue + "60"} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>* Abril en adelante incluye proyeccion segun forecast Notion</div>
        </div>

        <div>
          <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 16 }}>Funnel por Etapa</h3>
            {stageData.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + COLORS.lightGray }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: STAGE_COLORS[s.name] }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtM(s.monto)}</div>
                  <div style={{ fontSize: 11, color: COLORS.gray }}>{s.value} opps</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Upselling vs Nuevas</h3>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, textAlign: "center", padding: 12, background: COLORS.teal + "10", borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.teal }}>{upsellingCount}</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Upselling</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: 12, background: COLORS.blue + "10", borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.blue }}>{newCount}</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Nuevas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionTitle>Distribucion por Industria (Pipeline Activo)</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={industryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tickFormatter={fmtM} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
            <Tooltip formatter={(v) => fmtM(v)} />
            <Bar dataKey="value" name="Valor" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── TAB: REVENUE & QUARTERS ────────────────────────────────────

function TabRevenue() {
  const quarters = [
    { name: "Q1", months: [0, 1, 2] },
    { name: "Q2", months: [3, 4, 5] },
    { name: "Q3", months: [6, 7, 8] },
    { name: "Q4", months: [9, 10, 11] },
  ];

  const qData = quarters.map(q => {
    const real = q.months.reduce((s, i) => s + REVENUE_2026[i].real, 0);
    const target = q.months.reduce((s, i) => s + REVENUE_2026[i].target, 0);
    const r2025 = q.months.reduce((s, i) => s + REVENUE_2026[i].r2025, 0);
    const yoy = r2025 > 0 ? ((real / r2025 - 1) * 100) : 0;
    return { ...q, real, target, r2025, yoy, pct: (real / target * 100) };
  });

  const cumulativeData = REVENUE_2026.map((m, i) => ({
    mes: m.mes,
    realAcum: REVENUE_2026.slice(0, i + 1).reduce((s, x) => s + x.real, 0),
    targetAcum: REVENUE_2026.slice(0, i + 1).reduce((s, x) => s + x.target, 0),
    r2025Acum: REVENUE_2026.slice(0, i + 1).reduce((s, x) => s + x.r2025, 0),
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {qData.map(q => (
          <div key={q.name} style={{ background: "white", borderRadius: 12, padding: 20, borderTop: "3px solid " + (q.pct >= 100 ? COLORS.green : q.pct >= 80 ? COLORS.warning : COLORS.red) }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>{q.name} 2026</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.dark }}>{fmtM(q.real)}</div>
            <ProgressBar value={q.real} max={q.target} label={"Target: " + fmtM(q.target)} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.gray, marginTop: 4 }}>
              <span>2025: {fmtM(q.r2025)}</span>
              <span style={{ color: q.yoy >= 0 ? COLORS.green : COLORS.red }}>YoY: {q.yoy >= 0 ? "+" : ""}{q.yoy.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Evolucion Acumulada Anual</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="realAcum" name="2026 Acumulado" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="targetAcum" name="Target Acumulado" stroke={COLORS.gray} strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="r2025Acum" name="2025 Acumulado" stroke={COLORS.blue} strokeWidth={2} opacity={0.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>Revenue Mensual Detallado</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 8 }}>Mes</th>
              <th style={{ textAlign: "right", padding: 8 }}>Real 2026</th>
              <th style={{ textAlign: "right", padding: 8 }}>Target</th>
              <th style={{ textAlign: "right", padding: 8 }}>% Target</th>
              <th style={{ textAlign: "right", padding: 8 }}>Real 2025</th>
              <th style={{ textAlign: "right", padding: 8 }}>YoY</th>
            </tr>
          </thead>
          <tbody>
            {REVENUE_2026.map((m) => {
              const pct = m.target > 0 ? (m.real / m.target * 100) : 0;
              const yoy = m.r2025 > 0 ? ((m.real / m.r2025 - 1) * 100) : 0;
              return (
                <tr key={m.mes} style={{ borderBottom: "1px solid " + COLORS.lightGray, opacity: m.projected ? 0.7 : 1 }}>
                  <td style={{ padding: 8 }}>{m.mes} {m.projected ? " (proj)" : ""}</td>
                  <td style={{ textAlign: "right", padding: 8, fontWeight: 600 }}>{fmtM(m.real)}</td>
                  <td style={{ textAlign: "right", padding: 8, color: COLORS.gray }}>{fmtM(m.target)}</td>
                  <td style={{ textAlign: "right", padding: 8, color: pct >= 100 ? COLORS.green : pct >= 80 ? COLORS.warning : COLORS.red }}>{pct.toFixed(0)}%</td>
                  <td style={{ textAlign: "right", padding: 8, color: COLORS.gray }}>{fmtM(m.r2025)}</td>
                  <td style={{ textAlign: "right", padding: 8, color: yoy >= 0 ? COLORS.green : COLORS.red }}>{yoy >= 0 ? "+" : ""}{yoy.toFixed(0)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TAB: CUENTAS & INDUSTRIAS ──────────────────────────────────

function TabCuentas() {
  const [filter, setFilter] = useState("all");

  const industryCount = {};
  CUENTAS_ACTIVAS.forEach(c => {
    industryCount[c.industria] = (industryCount[c.industria] || 0) + 1;
  });
  const industryPieData = Object.entries(industryCount)
    .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + "..." : name, value }))
    .sort((a, b) => b.value - a.value);

  const industries = [...new Set(CUENTAS_ACTIVAS.map(c => c.industria))].sort();
  const filtered = filter === "all" ? CUENTAS_ACTIVAS : CUENTAS_ACTIVAS.filter(c => c.industria === filter);

  const amCount = {};
  CUENTAS_ACTIVAS.forEach(c => { amCount[c.am] = (amCount[c.am] || 0) + 1; });
  const amData = Object.entries(amCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard title="Cuentas Activas" value={CUENTAS_ACTIVAS.length} color={COLORS.blue} />
        <KPICard title="Industrias" value={Object.keys(industryCount).length} color={COLORS.purple} />
        <KPICard title="Con AM Asignado" value={CUENTAS_ACTIVAS.filter(c => c.am !== "Sin asignar").length} color={COLORS.green} />
        <KPICard title="Sin AM" value={CUENTAS_ACTIVAS.filter(c => c.am === "Sin asignar").length} subtitle="Requiere asignacion" color={COLORS.warning} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Distribucion por Industria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={industryPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => name + ": " + value} labelLine={{ strokeWidth: 1 }}>
                {industryPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Cuentas por Account Manager</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={amData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="value" name="Cuentas" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SectionTitle>Listado de Cuentas Activas</SectionTitle>
      <div style={{ marginBottom: 16 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.lightGray, fontSize: 13 }}>
          <option value="all">Todas las industrias</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div style={{ background: "white", borderRadius: 12, padding: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 8 }}>Cuenta</th>
              <th style={{ textAlign: "left", padding: 8 }}>Industria</th>
              <th style={{ textAlign: "left", padding: 8 }}>Account Manager</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                <td style={{ padding: 8, fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ padding: 8 }}><Badge text={c.industria} color={COLORS.blue} /></td>
                <td style={{ padding: 8 }}>{c.am}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TAB: PIPELINE & FUNNEL ─────────────────────────────────────

function TabPipeline() {
  const [stageFilter, setStageFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const sorted = useMemo(() => {
    let f = [...OPPORTUNITIES];
    if (stageFilter !== "all") f = f.filter(o => o.stage === stageFilter);
    if (industryFilter !== "all") f = f.filter(o => o.industria === industryFilter);
    if (typeFilter === "upselling") f = f.filter(o => o.upselling);
    if (typeFilter === "new") f = f.filter(o => !o.upselling);
    f.sort((a, b) => (STAGE_ORDER[a.stage] || 99) - (STAGE_ORDER[b.stage] || 99));
    return f;
  }, [stageFilter, industryFilter, typeFilter]);

  const industries = [...new Set(OPPORTUNITIES.map(o => o.industria))].sort();
  const totalFiltered = sorted.reduce((s, o) => s + o.total, 0);

  const velocityOpps = OPPORTUNITIES.filter(o => o.velocityDays !== undefined && o.velocityDays > 0);
  const avgVelocity = velocityOpps.length > 0 ? velocityOpps.reduce((s, o) => s + o.velocityDays, 0) / velocityOpps.length : 0;

  const funnelData = [
    { stage: "Pipeline", count: OPPORTUNITIES.filter(o => o.stage === "Pipeline").length, value: OPPORTUNITIES.filter(o => o.stage === "Pipeline").reduce((s, o) => s + o.total, 0) },
    { stage: "Upside", count: OPPORTUNITIES.filter(o => o.stage === "Upside").length, value: OPPORTUNITIES.filter(o => o.stage === "Upside").reduce((s, o) => s + o.total, 0) },
    { stage: "Forecast", count: OPPORTUNITIES.filter(o => o.stage === "Forecast").length, value: OPPORTUNITIES.filter(o => o.stage === "Forecast").reduce((s, o) => s + o.total, 0) },
    { stage: "Commit", count: OPPORTUNITIES.filter(o => o.stage === "Commit").length, value: OPPORTUNITIES.filter(o => o.stage === "Commit").reduce((s, o) => s + o.total, 0) },
  ];

  const pipeIndustry = {};
  OPPORTUNITIES.forEach(o => {
    if (!pipeIndustry[o.industria]) pipeIndustry[o.industria] = { Pipeline: 0, Upside: 0, Forecast: 0, Commit: 0 };
    pipeIndustry[o.industria][o.stage] = (pipeIndustry[o.industria][o.stage] || 0) + o.total;
  });
  const industryStackData = Object.entries(pipeIndustry)
    .map(([name, stages]) => ({
      name: name.length > 16 ? name.slice(0, 14) + "..." : name,
      ...stages,
      total: Object.values(stages).reduce((s, v) => s + v, 0)
    }))
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard title="Total Pipeline" value={fmtM(OPPORTUNITIES.reduce((s, o) => s + o.total, 0))} subtitle={OPPORTUNITIES.length + " oportunidades"} color={COLORS.accent} />
        {funnelData.map(f => (
          <KPICard key={f.stage} title={f.stage} value={fmtM(f.value)} subtitle={f.count + " opps"} color={STAGE_COLORS[f.stage]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Funnel de Conversion</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtM(v)} />
              <Bar dataKey="value" name="Valor" radius={[4, 4, 0, 0]}>
                {funnelData.map((f, i) => <Cell key={i} fill={STAGE_COLORS[f.stage]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Pipeline por Industria</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={industryStackData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={fmtM} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
              <Tooltip formatter={(v) => fmtM(v)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Commit" stackId="a" fill={STAGE_COLORS.Commit} />
              <Bar dataKey="Forecast" stackId="a" fill={STAGE_COLORS.Forecast} />
              <Bar dataKey="Upside" stackId="a" fill={STAGE_COLORS.Upside} />
              <Bar dataKey="Pipeline" stackId="a" fill={STAGE_COLORS.Pipeline} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {avgVelocity > 0 && (
        <div style={{ background: COLORS.blue + "08", border: "1px solid " + COLORS.blue + "30", borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: COLORS.blue, margin: 0 }}>
            Pipeline Velocity: Promedio {avgVelocity.toFixed(0)} dias (Pipeline a Upside)
          </h3>
          <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 4 }}>
            {velocityOpps.map(o => o.nombre + ": " + o.velocityDays + "d").join(" | ")}
          </div>
        </div>
      )}

      <SectionTitle>{"Oportunidades Activas (" + sorted.length + ")"}</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + COLORS.lightGray, fontSize: 12 }}>
          <option value="all">Todas las etapas</option>
          <option value="Commit">Commit</option>
          <option value="Forecast">Forecast</option>
          <option value="Upside">Upside</option>
          <option value="Pipeline">Pipeline</option>
        </select>
        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + COLORS.lightGray, fontSize: 12 }}>
          <option value="all">Todas las industrias</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + COLORS.lightGray, fontSize: 12 }}>
          <option value="all">Todas</option>
          <option value="upselling">Solo Upselling</option>
          <option value="new">Solo Nuevas</option>
        </select>
        <span style={{ fontSize: 12, color: COLORS.gray, alignSelf: "center" }}>
          Total filtrado: {fmtM(totalFiltered)}
        </span>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 6 }}>Etapa</th>
              <th style={{ textAlign: "left", padding: 6 }}>Oportunidad</th>
              <th style={{ textAlign: "right", padding: 6 }}>$ Estimado</th>
              <th style={{ textAlign: "left", padding: 6 }}>Industria</th>
              <th style={{ textAlign: "center", padding: 6 }}>Tipo</th>
              <th style={{ textAlign: "left", padding: 6 }}>Cerrador</th>
              <th style={{ textAlign: "left", padding: 6 }}>Duracion</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o, i) => (
              <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                <td style={{ padding: 6 }}><StageIndicator stage={o.stage} /></td>
                <td style={{ padding: 6, fontWeight: 500, maxWidth: 250 }}>{o.nombre}</td>
                <td style={{ textAlign: "right", padding: 6, fontWeight: 600, fontFamily: "monospace" }}>{o.total > 0 ? fmtM(o.total) : "—"}</td>
                <td style={{ padding: 6 }}><Badge text={o.industria} color={COLORS.blue} /></td>
                <td style={{ textAlign: "center", padding: 6 }}>
                  {o.upselling ? <Badge text="Upselling" color={COLORS.teal} /> : <Badge text="Nueva" color={COLORS.purple} />}
                </td>
                <td style={{ padding: 6, color: o.cerrador === "Sin asignar" ? COLORS.warning : COLORS.dark }}>{o.cerrador}</td>
                <td style={{ padding: 6, color: COLORS.gray }}>{o.duracion || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TAB: EQUIPO COMERCIAL ──────────────────────────────────────

function TabEquipo() {
  const wonByCerrador = {};
  WON_2026.forEach(w => {
    if (!wonByCerrador[w.cerrador]) wonByCerrador[w.cerrador] = 0;
    wonByCerrador[w.cerrador] += w.total;
  });

  const pipelineByCerrador = {};
  OPPORTUNITIES.forEach(o => {
    const c = o.cerrador;
    if (!pipelineByCerrador[c]) pipelineByCerrador[c] = { count: 0, value: 0 };
    pipelineByCerrador[c].count++;
    pipelineByCerrador[c].value += o.total;
  });

  const monthsElapsed = 3;
  const teamData = COMERCIALES.map(c => {
    const won = wonByCerrador[c.nombre] || 0;
    const targetToDate = c.targetMensual * monthsElapsed;
    const pipe = pipelineByCerrador[c.nombre] || { count: 0, value: 0 };
    return {
      ...c,
      won,
      targetToDate,
      pctTarget: targetToDate > 0 ? (won / targetToDate * 100) : 0,
      pipelineCount: pipe.count,
      pipelineValue: pipe.value,
    };
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard title="Target mensual / comercial" value="$50M" subtitle="$150M acumulado Q1" color={COLORS.blue} />
        <KPICard title="Won Q1 Total" value={fmtM(WON_2026.reduce((s, w) => s + w.total, 0))} color={COLORS.green} />
        <KPICard title="Opps sin cerrador asignado" value={OPPORTUNITIES.filter(o => o.cerrador === "Sin asignar").length} subtitle={"De " + OPPORTUNITIES.length + " oportunidades activas"} color={COLORS.warning} />
      </div>

      <SectionTitle>Performance por Comercial — Target $50M/mes</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        {teamData.map(t => (
          <div key={t.nombre} style={{ background: "white", borderRadius: 12, padding: 20, borderLeft: "4px solid " + (t.pctTarget >= 100 ? COLORS.green : t.pctTarget >= 50 ? COLORS.warning : COLORS.red) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>{t.nombre}</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>{t.role}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Won Q1</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.won > 0 ? COLORS.green : COLORS.gray }}>{fmtM(t.won)}</div>
              </div>
            </div>
            <ProgressBar value={t.won} max={t.targetToDate} label={"vs Target Q1: " + fmtM(t.targetToDate)} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.gray, marginTop: 8 }}>
              <span>Pipeline: {t.pipelineCount} opps</span>
              <span>Valor pipeline: {fmtM(t.pipelineValue)}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Pipeline por Cerrador</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamData.filter(t => t.pipelineValue > 0 || t.won > 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="won" name="Won Q1" fill={COLORS.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="pipelineValue" name="Pipeline Activo" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="targetToDate" name="Target Q1" fill={COLORS.lightGray} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>Matriz Ansoff — Roles de Crecimiento</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, maxWidth: 600, margin: "0 auto" }}>
          {[
            { label: "Cliente Conocido / Producto Conocido", person: "Sol Rios (COO)", color: COLORS.green },
            { label: "Cliente Nuevo / Producto Conocido", person: "Diego Kupferberg (Cerrador)", color: COLORS.blue },
            { label: "Cliente Conocido / Producto Nuevo", person: "Matias Fermin (GC B&F)", color: COLORS.warning },
            { label: "Cliente Nuevo / Producto Nuevo", person: "Sergio Doval (CEO)", color: COLORS.accent },
          ].map((cell, i) => (
            <div key={i} style={{ background: cell.color + "10", border: "2px solid " + cell.color, borderRadius: 8, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: COLORS.gray, marginBottom: 8 }}>{cell.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: cell.color }}>{cell.person}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>Modelo Comercial — Pool 20%</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { role: "Business Owner", pct: "2.5%", desc: "Del revenue del vertical", color: COLORS.purple },
            { role: "Referral", pct: "7.5%", desc: "Sin tope, por oportunidad generada", color: COLORS.teal },
            { role: "Cerrador", pct: "Comision con cap", desc: "Cierra el deal", color: COLORS.blue },
            { role: "Abre + Cierra", pct: "15%", desc: "Misma persona genera y cierra", color: COLORS.accent },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", padding: 16, background: m.color + "08", borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.pct}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{m.role}</div>
              <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: ALERTAS & UPSELLING ───────────────────────────────────

function TabAlertas() {
  const upsellingOpps = OPPORTUNITIES.filter(o => o.upselling).sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]);
  const newOpps = OPPORTUNITIES.filter(o => !o.upselling);
  const upsellingValue = upsellingOpps.reduce((s, o) => s + o.total, 0);
  const newValue = newOpps.reduce((s, o) => s + o.total, 0);

  const noCerrador = OPPORTUNITIES.filter(o => o.cerrador === "Sin asignar" && (o.stage === "Forecast" || o.stage === "Commit"));
  const highValueNoCerrador = OPPORTUNITIES.filter(o => o.cerrador === "Sin asignar" && o.total >= 50000000);

  const upsellingByIndustry = {};
  upsellingOpps.forEach(o => {
    if (!upsellingByIndustry[o.industria]) upsellingByIndustry[o.industria] = { count: 0, value: 0 };
    upsellingByIndustry[o.industria].count++;
    upsellingByIndustry[o.industria].value += o.total;
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard title="Opps Upselling" value={upsellingOpps.length} subtitle={fmtM(upsellingValue)} color={COLORS.teal} />
        <KPICard title="Opps Nuevas" value={newOpps.length} subtitle={fmtM(newValue)} color={COLORS.purple} />
        <KPICard title="Forecast/Commit sin cerrador" value={noCerrador.length} subtitle="Requiere accion inmediata" color={COLORS.red} />
        <KPICard title="Opps >$50M sin cerrador" value={highValueNoCerrador.length} subtitle="Alto valor sin asignar" color={COLORS.warning} />
      </div>

      {(noCerrador.length > 0 || highValueNoCerrador.length > 0) && (
        <div>
          <SectionTitle>Alertas Comerciales</SectionTitle>

          {noCerrador.length > 0 && (
            <div style={{ background: COLORS.red + "08", border: "1px solid " + COLORS.red + "40", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: COLORS.red, margin: "0 0 8px" }}>
                Oportunidades en Forecast/Commit SIN cerrador asignado
              </h4>
              {noCerrador.map((o, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid " + COLORS.red + "20", fontSize: 13 }}>
                  <span><StageIndicator stage={o.stage} /> {o.nombre}</span>
                  <span style={{ fontWeight: 600 }}>{o.total > 0 ? fmtM(o.total) : "—"}</span>
                </div>
              ))}
            </div>
          )}

          {highValueNoCerrador.length > 0 && (
            <div style={{ background: COLORS.warning + "08", border: "1px solid " + COLORS.warning + "40", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: COLORS.orange, margin: "0 0 8px" }}>
                Oportunidades de alto valor (mas de $50M) sin cerrador
              </h4>
              {highValueNoCerrador.map((o, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid " + COLORS.warning + "20", fontSize: 13 }}>
                  <span><StageIndicator stage={o.stage} /> {o.nombre}</span>
                  <span style={{ fontWeight: 600 }}>{fmtM(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <SectionTitle>{"Oportunidades de Upselling (" + upsellingOpps.length + ")"}</SectionTitle>
          <div style={{ background: "white", borderRadius: 12, padding: 16, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid " + COLORS.teal }}>
                  <th style={{ textAlign: "left", padding: 6 }}>Etapa</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Oportunidad</th>
                  <th style={{ textAlign: "right", padding: 6 }}>$</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Industria</th>
                </tr>
              </thead>
              <tbody>
                {upsellingOpps.map((o, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                    <td style={{ padding: 6 }}><StageIndicator stage={o.stage} /></td>
                    <td style={{ padding: 6, fontWeight: 500 }}>{o.nombre}</td>
                    <td style={{ textAlign: "right", padding: 6, fontFamily: "monospace" }}>{o.total > 0 ? fmtM(o.total) : "—"}</td>
                    <td style={{ padding: 6 }}><Badge text={o.industria} color={COLORS.blue} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionTitle>Upselling por Industria</SectionTitle>
          <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
            {Object.entries(upsellingByIndustry)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([ind, data], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + COLORS.lightGray }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{ind}</span>
                    <span style={{ fontSize: 11, color: COLORS.gray, marginLeft: 8 }}>{data.count} opps</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtM(data.value)}</span>
                </div>
              ))}
          </div>

          <SectionTitle>Nota sobre Alertas a 45 dias</SectionTitle>
          <div style={{ background: COLORS.blue + "08", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.dark }}>
              La base de cuentas activas en Notion no tiene un campo de "fecha de terminacion de proyecto" directo.
              Se recomienda agregar este campo para habilitar alertas automaticas a 45 dias del vencimiento.
              Las oportunidades marcadas como <strong>Upselling</strong> son las senales de renovacion/expansion activa.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────

const TABS = [
  { id: "resumen", label: "Resumen Ejecutivo", icon: "+" },
  { id: "revenue", label: "Revenue & Quarters", icon: "$" },
  { id: "cuentas", label: "Cuentas & Industrias", icon: "#" },
  { id: "pipeline", label: "Pipeline & Funnel", icon: ">" },
  { id: "equipo", label: "Equipo Comercial", icon: "*" },
  { id: "alertas", label: "Alertas & Upselling", icon: "!" },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.light, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, " + COLORS.dark + " 0%, " + COLORS.blue + " 100%)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>TAQUION</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Tablero del Director Comercial</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Datos Notion CRM | 8 Abr 2026</span>
          <button onClick={() => setLoggedIn(false)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
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

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "resumen" && <TabResumen />}
        {activeTab === "revenue" && <TabRevenue />}
        {activeTab === "cuentas" && <TabCuentas />}
        {activeTab === "pipeline" && <TabPipeline />}
        {activeTab === "equipo" && <TabEquipo />}
        {activeTab === "alertas" && <TabAlertas />}
      </div>

      <div style={{ padding: "16px 32px", textAlign: "center", fontSize: 11, color: COLORS.gray, borderTop: "1px solid " + COLORS.lightGray }}>
        Tablero Comercial Taquion | Datos desde Notion CRM | Target Anual: $4,200M ARS | Modelo Comercial MVP 2026
      </div>
    </div>
  );
}
