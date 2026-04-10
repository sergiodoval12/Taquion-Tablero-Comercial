import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { fmtM } from "../utils/formatters.js";
import { ProgressBar, SectionTitle, CustomTooltip } from "../components/ui/index.js";

export default function TabRevenue() {
  const { revenue: REVENUE_2026 } = useData();
  const quarters = [
    { name: "Q1", months: [0, 1, 2] },
    { name: "Q2", months: [3, 4, 5] },
    { name: "Q3", months: [6, 7, 8] },
    { name: "Q4", months: [9, 10, 11] },
  ];

  const qData = quarters.map(q => {
    const projected = q.months.reduce((s, i) => s + (REVENUE_2026[i]?.projected || 0), 0);
    const real = q.months.reduce((s, i) => s + (REVENUE_2026[i]?.real || 0), 0);
    const target = q.months.reduce((s, i) => s + (REVENUE_2026[i]?.target || 0), 0);
    const r2025 = q.months.reduce((s, i) => s + (REVENUE_2026[i]?.r2025 || 0), 0);
    const yoy = r2025 > 0 ? ((projected / r2025 - 1) * 100) : 0;
    return { ...q, projected, real, target, r2025, yoy, pct: target > 0 ? (projected / target * 100) : 0 };
  });

  const cumulativeData = REVENUE_2026.map((m, i) => ({
    mes: m.mes,
    ponderadoAcum: REVENUE_2026.slice(0, i + 1).reduce((s, x) => s + (x.projected || 0), 0),
    targetAcum: REVENUE_2026.slice(0, i + 1).reduce((s, x) => s + x.target, 0),
    r2025Acum: REVENUE_2026.slice(0, i + 1).reduce((s, x) => s + x.r2025, 0),
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {qData.map(q => (
          <div key={q.name} style={{ background: "white", borderRadius: 12, padding: 20, borderTop: "3px solid " + (q.pct >= 100 ? COLORS.green : q.pct >= 80 ? COLORS.warning : COLORS.red) }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>{q.name} 2026</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.dark }}>{fmtM(q.projected)}</div>
            <ProgressBar value={q.projected} max={q.target} label={"Target: " + fmtM(q.target)} />
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
            <Line type="monotone" dataKey="ponderadoAcum" name="2026 Ponderado" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 4 }} />
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
              <th style={{ textAlign: "right", padding: 8 }}>Ponderado 2026</th>
              <th style={{ textAlign: "right", padding: 8 }}>Target</th>
              <th style={{ textAlign: "right", padding: 8 }}>% Target</th>
              <th style={{ textAlign: "right", padding: 8 }}>Real 2025</th>
              <th style={{ textAlign: "right", padding: 8 }}>YoY</th>
            </tr>
          </thead>
          <tbody>
            {REVENUE_2026.map((m) => {
              const pond = m.projected || 0;
              const pct = m.target > 0 ? (pond / m.target * 100) : 0;
              const yoy = m.r2025 > 0 ? ((pond / m.r2025 - 1) * 100) : 0;
              return (
                <tr key={m.mes} style={{ borderBottom: "1px solid " + COLORS.lightGray, opacity: m.isFuture ? 0.7 : 1 }}>
                  <td style={{ padding: 8 }}>{m.mes}{m.isFuture ? " *" : ""}</td>
                  <td style={{ textAlign: "right", padding: 8, fontWeight: 600 }}>{fmtM(pond)}</td>
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
