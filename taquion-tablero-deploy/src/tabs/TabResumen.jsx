import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS, STAGE_COLORS } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { fmtM } from "../utils/formatters.js";
import { KPICard, SectionTitle, CustomTooltip } from "../components/ui/index.js";

export default function TabResumen() {
  const { revenue: REVENUE_2026, opportunities: OPPORTUNITIES, accounts: CUENTAS_ACTIVAS } = useData();

  const q1Real = REVENUE_2026.slice(0, 3).reduce((s, m) => s + m.real, 0);
  const q1Target = REVENUE_2026.slice(0, 3).reduce((s, m) => s + m.target, 0);
  // Revenue Won anual: suma de Monto Mensual solo para deals Won (revenue confirmado)
  const annualWon = REVENUE_2026.reduce((s, m) => s + (m.real || 0), 0);
  const annualTarget = REVENUE_2026.reduce((s, m) => s + m.target, 0);

  // Chart data: solo Won (real) por mes
  const chartData = REVENUE_2026;

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
        <KPICard title="Revenue Q1 2026 (Real)" value={fmtM(q1Real)} subtitle={q1Target > 0 ? (q1Real / q1Target * 100).toFixed(0) + "% del target Q1" : "Target pendiente"} color={COLORS.green} />
        <KPICard title="Revenue Anual Won" value={fmtM(annualWon)} subtitle={annualTarget > 0 ? (annualWon / annualTarget * 100).toFixed(0) + "% de " + fmtM(annualTarget) + " target" : "Target pendiente"} color={annualWon > annualTarget ? COLORS.green : COLORS.warning} />
        <KPICard title={"Pipeline Total (" + OPPORTUNITIES.length + " opps)"} value={fmtM(totalPipeline)} subtitle="Commit a Pipeline activo" color={COLORS.blue} />
        <KPICard title="Cuentas Activas" value={CUENTAS_ACTIVAS.length} subtitle={upsellingCount + " opps upselling | " + newCount + " nuevas"} color={COLORS.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 16 }}>Revenue Mensual 2026 vs Target vs 2025</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtM} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="real" name="2026 Real (Won)" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill={COLORS.lightGray} radius={[4, 4, 0, 0]} />
              <Bar dataKey="r2025" name="2025 Real" fill={COLORS.blue + "60"} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>* Solo revenue de deals Won (Monto Mensual)</div>
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
