import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORS, CHART_COLORS } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { fmtM } from "../utils/formatters.js";
import { KPICard, Badge, SectionTitle } from "../components/ui/index.js";

const UDN_COLORS = { Inspire: "#E94560", Insights: "#0F3460", Ignite: "#F5A623" };

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

  const recurrentes = CUENTAS_ACTIVAS.filter(c => c.tipo === "Recurrente");
  const oneShot = CUENTAS_ACTIVAS.filter(c => c.tipo === "One Shot");
  const totalTicketMes = CUENTAS_ACTIVAS.reduce((s, c) => s + (c.ticketMes || 0), 0);

  // UDN distribution
  const udnCount = { Inspire: 0, Insights: 0, Ignite: 0 };
  CUENTAS_ACTIVAS.forEach(c => (c.udn || []).forEach(u => { udnCount[u] = (udnCount[u] || 0) + 1; }));
  const udnData = Object.entries(udnCount).map(([name, value]) => ({ name, value }));

  const filtered = CUENTAS_ACTIVAS
    .filter(c => filter === "all" || c.industria === filter)
    .filter(c => tipoFilter === "all" || c.tipo === tipoFilter);

  const amCount = {};
  CUENTAS_ACTIVAS.forEach(c => { amCount[c.am] = (amCount[c.am] || 0) + 1; });
  const amData = Object.entries(amCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard title="Cuentas Activas" value={CUENTAS_ACTIVAS.length} color={COLORS.blue} />
        <KPICard title="Recurrentes" value={recurrentes.length} subtitle={((recurrentes.length / CUENTAS_ACTIVAS.length) * 100).toFixed(0) + "% del total"} color={COLORS.green} />
        <KPICard title="One Shot" value={oneShot.length} color={COLORS.warning} />
        <KPICard title="Ticket Mensual Total" value={fmtM(totalTicketMes)} color={COLORS.accent} />
        <KPICard title="Industrias" value={Object.keys(industryCount).length} color={COLORS.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
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
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Productos UDN</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={udnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Cuentas" radius={[4, 4, 0, 0]}>
                {udnData.map((entry, i) => <Cell key={i} fill={UDN_COLORS[entry.name] || COLORS.gray} />)}
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

      <SectionTitle>Indicadores Comerciales por Cuenta</SectionTitle>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.lightGray, fontSize: 13 }}>
          <option value="all">Todas las industrias</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.lightGray, fontSize: 13 }}>
          <option value="all">Todos los tipos</option>
          <option value="Recurrente">Recurrente</option>
          <option value="One Shot">One Shot</option>
        </select>
      </div>
      <div style={{ background: "white", borderRadius: 12, padding: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 8 }}>Cuenta</th>
              <th style={{ textAlign: "left", padding: 8 }}>Industria</th>
              <th style={{ textAlign: "center", padding: 8 }}>Tipo</th>
              <th style={{ textAlign: "right", padding: 8 }}>Ticket/Mes</th>
              <th style={{ textAlign: "center", padding: 8 }}>UDN</th>
              <th style={{ textAlign: "left", padding: 8 }}>Cerrador</th>
              <th style={{ textAlign: "left", padding: 8 }}>Originador</th>
              <th style={{ textAlign: "center", padding: 8 }}>Fee %</th>
              <th style={{ textAlign: "left", padding: 8 }}>AM</th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => (b.ticketMes || 0) - (a.ticketMes || 0)).map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                <td style={{ padding: 8, fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ padding: 8 }}><Badge text={c.industria} color={COLORS.blue} /></td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  <span style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: c.tipo === "Recurrente" ? COLORS.green + "15" : COLORS.warning + "15",
                    color: c.tipo === "Recurrente" ? COLORS.green : COLORS.warning,
                    fontWeight: 600,
                  }}>
                    {c.tipo}
                  </span>
                </td>
                <td style={{ padding: 8, textAlign: "right", fontWeight: 600 }}>{c.ticketMes > 0 ? fmtM(c.ticketMes) : "—"}</td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                    {(c.udn || []).map(u => (
                      <span key={u} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: UDN_COLORS[u] + "15", color: UDN_COLORS[u], fontWeight: 600 }}>
                        {u}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: 8, fontSize: 11 }}>{c.cerrador}</td>
                <td style={{ padding: 8, fontSize: 11 }}>{c.originador}</td>
                <td style={{ padding: 8, textAlign: "center", fontWeight: 600, color: c.fee >= 7.5 ? COLORS.accent : c.fee > 0 ? COLORS.blue : COLORS.gray }}>
                  {c.fee > 0 ? c.fee + "%" : "—"}
                </td>
                <td style={{ padding: 8, fontSize: 11 }}>{c.am}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
