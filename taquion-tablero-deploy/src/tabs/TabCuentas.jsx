import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORS, CHART_COLORS } from "../data/constants.js";
import { CUENTAS_ACTIVAS } from "../data/accounts.js";
import { KPICard, Badge, SectionTitle } from "../components/ui/index.js";

export default function TabCuentas() {
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
