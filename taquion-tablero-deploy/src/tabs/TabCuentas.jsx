import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORS, CHART_COLORS } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { fmtM } from "../utils/formatters.js";
import { KPICard, Badge, SectionTitle } from "../components/ui/index.js";

const SECTOR_COLORS = { "PRIVADO": COLORS.blue, "PÚBLICO": COLORS.green, "Sin clasificar": COLORS.gray };

export default function TabCuentas() {
  const { accounts: CUENTAS_ACTIVAS } = useData();
  const [filter, setFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");

  const industryCount = {};
  CUENTAS_ACTIVAS.forEach(c => {
    industryCount[c.industria] = (industryCount[c.industria] || 0) + 1;
  });
  const industryPieData = Object.entries(industryCount)
    .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + "..." : name, value }))
    .sort((a, b) => b.value - a.value);

  const industries = [...new Set(CUENTAS_ACTIVAS.map(c => c.industria))].sort();

  // Case-insensitive tipo matching
  const recurrentes = CUENTAS_ACTIVAS.filter(c => c.tipo?.toLowerCase() === "recurrente");
  const oneShot = CUENTAS_ACTIVAS.filter(c => c.tipo?.toLowerCase() === "one shot");
  const campana = CUENTAS_ACTIVAS.filter(c => c.tipo?.toLowerCase().includes("campaña") || c.tipo?.toLowerCase().includes("tiempo limitado"));

  // Sector distribution (PRIVADO / PÚBLICO)
  const sectorCount = {};
  CUENTAS_ACTIVAS.forEach(c => {
    const s = c.sector || "Sin clasificar";
    sectorCount[s] = (sectorCount[s] || 0) + 1;
  });
  const sectorData = Object.entries(sectorCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const filtered = CUENTAS_ACTIVAS
    .filter(c => filter === "all" || c.industria === filter)
    .filter(c => {
      if (tipoFilter === "all") return true;
      return c.tipo?.toLowerCase() === tipoFilter.toLowerCase();
    });

  const amCount = {};
  CUENTAS_ACTIVAS.forEach(c => { amCount[c.am] = (amCount[c.am] || 0) + 1; });
  const amData = Object.entries(amCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Get unique tipo values for dropdown
  const tipos = [...new Set(CUENTAS_ACTIVAS.map(c => c.tipo).filter(Boolean))].sort();

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard title="Cuentas Activas" value={CUENTAS_ACTIVAS.length} color={COLORS.blue} />
        <KPICard title="Recurrentes" value={recurrentes.length} subtitle={CUENTAS_ACTIVAS.length > 0 ? ((recurrentes.length / CUENTAS_ACTIVAS.length) * 100).toFixed(0) + "% del total" : ""} color={COLORS.green} />
        <KPICard title="One Shot" value={oneShot.length} subtitle={campana.length > 0 ? campana.length + " campañas" : ""} color={COLORS.warning} />
        <KPICard title="Sector Privado" value={sectorCount["PRIVADO"] || 0} subtitle={(sectorCount["PÚBLICO"] || 0) + " público"} color={COLORS.accent} />
        <KPICard title="Industrias" value={Object.keys(industryCount).length} color={COLORS.purple} />
      </div>

      <div className="grid-2col-even">
        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Distribucion por Industria</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={industryPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => name + ": " + value} labelLine={{ strokeWidth: 1 }}>
                {industryPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Sector</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Cuentas" radius={[4, 4, 0, 0]}>
                {sectorData.map((entry, i) => <Cell key={i} fill={SECTOR_COLORS[entry.name] || COLORS.gray} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Cuentas por AM</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={amData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="value" name="Cuentas" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SectionTitle>Detalle de Cuentas Activas</SectionTitle>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.lightGray, fontSize: 13 }}>
          <option value="all">Todas las industrias</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.lightGray, fontSize: 13 }}>
          <option value="all">Todos los tipos</option>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="table-responsive" style={{ background: "white", borderRadius: 12, padding: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 8 }}>Cuenta</th>
              <th style={{ textAlign: "left", padding: 8 }}>Industria</th>
              <th style={{ textAlign: "center", padding: 8 }}>Tipo</th>
              <th style={{ textAlign: "center", padding: 8 }}>Sector</th>
              <th style={{ textAlign: "left", padding: 8 }}>AM</th>
              <th style={{ textAlign: "left", padding: 8 }}>Proyectos Activos</th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                <td style={{ padding: 8, fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ padding: 8 }}><Badge text={c.industria} color={COLORS.blue} /></td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  <span style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: c.tipo?.toLowerCase() === "recurrente" ? COLORS.green + "15" : COLORS.warning + "15",
                    color: c.tipo?.toLowerCase() === "recurrente" ? COLORS.green : COLORS.warning,
                    fontWeight: 600,
                  }}>
                    {c.tipo}
                  </span>
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  <span style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: (SECTOR_COLORS[c.sector] || COLORS.gray) + "15",
                    color: SECTOR_COLORS[c.sector] || COLORS.gray,
                    fontWeight: 600,
                  }}>
                    {c.sector}
                  </span>
                </td>
                <td style={{ padding: 8, fontSize: 11 }}>{c.am}</td>
                <td style={{ padding: 8, fontSize: 11, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.proyectosActivos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
