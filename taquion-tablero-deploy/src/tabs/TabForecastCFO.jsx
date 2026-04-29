import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { fmtM } from "../utils/formatters.js";
import { SectionTitle } from "../components/ui/index.js";

const STAGE_COLORS = {
  won: "#10B981",
  commit: "#3B82F6",
  forecast: "#F5A623",
  upside: "#7C3AED",
};

const STAGE_WEIGHTS = {
  won: { label: "Won", weight: "100%", color: STAGE_COLORS.won },
  commit: { label: "Commit", weight: "90%", color: STAGE_COLORS.commit },
  forecast: { label: "Forecast", weight: "75%", color: STAGE_COLORS.forecast },
  upside: { label: "Upside", weight: "40%", color: STAGE_COLORS.upside },
};

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const total = (data.won || 0) + (data.commit || 0) + (data.forecast || 0) + (data.upside || 0);

  return (
    <div style={{ background: "white", border: "1px solid " + COLORS.lightGray, borderRadius: 8, padding: 14, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 200 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{label}</div>
      {Object.entries(STAGE_WEIGHTS).map(([key, cfg]) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color, display: "inline-block" }} />
            {cfg.label} <span style={{ color: COLORS.gray, fontSize: 10 }}>({cfg.weight})</span>
          </span>
          <span style={{ fontWeight: 600 }}>{fmtM(data[key] || 0)}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid " + COLORS.lightGray, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
        <span>Total bruto</span>
        <span>{fmtM(total)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.accent, fontWeight: 700 }}>
        <span>Ponderado</span>
        <span>{fmtM(data.ponderado || 0)}</span>
      </div>
    </div>
  );
}

export default function TabForecastCFO() {
  const { forecastByStage, revenue } = useData();

  // Quarter aggregation
  const quarters = [
    { name: "Q1", months: ["Ene", "Feb", "Mar"] },
    { name: "Q2", months: ["Abr", "May", "Jun"] },
    { name: "Q3", months: ["Jul", "Ago", "Sep"] },
    { name: "Q4", months: ["Oct", "Nov", "Dic"] },
  ];

  const qData = quarters.map(q => {
    const qMonths = forecastByStage.filter(m => q.months.includes(m.mes));
    const won = qMonths.reduce((s, m) => s + (m.won || 0), 0);
    const commit = qMonths.reduce((s, m) => s + (m.commit || 0), 0);
    const forecast = qMonths.reduce((s, m) => s + (m.forecast || 0), 0);
    const upside = qMonths.reduce((s, m) => s + (m.upside || 0), 0);
    const ponderado = qMonths.reduce((s, m) => s + (m.ponderado || 0), 0);
    const target = q.months.reduce((s, mes) => {
      const revMonth = revenue.find(r => r.mes === mes);
      return s + (revMonth?.target || 0);
    }, 0);
    return { ...q, won, commit, forecast, upside, ponderado, target };
  });

  const totalAnual = {
    won: qData.reduce((s, q) => s + q.won, 0),
    commit: qData.reduce((s, q) => s + q.commit, 0),
    forecast: qData.reduce((s, q) => s + q.forecast, 0),
    upside: qData.reduce((s, q) => s + q.upside, 0),
    ponderado: qData.reduce((s, q) => s + q.ponderado, 0),
    target: qData.reduce((s, q) => s + q.target, 0),
  };

  // Scenarios
  const pesimista = totalAnual.won + totalAnual.commit * 0.9;
  const base = totalAnual.won + totalAnual.commit * 0.9 + totalAnual.forecast * 0.75;
  const optimista = totalAnual.won + totalAnual.commit * 0.9 + totalAnual.forecast * 0.75 + totalAnual.upside * 0.4;

  const hasData = forecastByStage.length > 0;

  if (!hasData) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: COLORS.gray }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Cargando datos de forecast...</div>
        <div style={{ fontSize: 13 }}>Los datos se cargan desde la API de Notion. Si no aparecen, probá hacer click en "Actualizar".</div>
      </div>
    );
  }

  return (
    <div>
      {/* Info callout */}
      <div style={{ background: COLORS.blue + "10", border: "1px solid " + COLORS.blue + "30", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: COLORS.dark, lineHeight: 1.6 }}>
        <strong>Vista para CFO</strong> — Distribución mensual del ingreso por estado de oportunidad. Won = cerrado (100%), Commit = por firmar (90%), Forecast = avanzado (75%), Upside = potencial (40%). El "Ponderado" aplica estas probabilidades al monto bruto de cada deal.
      </div>

      {/* KPI cards: 3 scenarios */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 20, borderTop: "3px solid " + COLORS.green }}>
          <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 4 }}>Pesimista (Won + Commit)</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.dark }}>{fmtM(pesimista)}</div>
          <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>
            {totalAnual.target > 0 ? (pesimista / totalAnual.target * 100).toFixed(0) + "% del target" : ""}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, borderTop: "3px solid " + COLORS.blue }}>
          <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 4 }}>Base (+ Forecast 75%)</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.dark }}>{fmtM(base)}</div>
          <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>
            {totalAnual.target > 0 ? (base / totalAnual.target * 100).toFixed(0) + "% del target" : ""}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, borderTop: "3px solid " + COLORS.purple }}>
          <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 4 }}>Optimista (+ Upside 40%)</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.dark }}>{fmtM(optimista)}</div>
          <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>
            {totalAnual.target > 0 ? (optimista / totalAnual.target * 100).toFixed(0) + "% del target" : ""}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, borderTop: "3px solid " + COLORS.accent }}>
          <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 4 }}>Target Anual</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.dark }}>{fmtM(totalAnual.target)}</div>
          <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>
            Gap vs base: {fmtM(Math.max(0, totalAnual.target - base))}
          </div>
        </div>
      </div>

      {/* Stacked bar chart: monthly by stage */}
      <SectionTitle>Proyección Mensual por Estado</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={forecastByStage} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
            <Tooltip content={<ForecastTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="won" name="Won (100%)" stackId="stack" fill={STAGE_COLORS.won} radius={[0, 0, 0, 0]} />
            <Bar dataKey="commit" name="Commit (90%)" stackId="stack" fill={STAGE_COLORS.commit} />
            <Bar dataKey="forecast" name="Forecast (75%)" stackId="stack" fill={STAGE_COLORS.forecast} />
            <Bar dataKey="upside" name="Upside (40%)" stackId="stack" fill={STAGE_COLORS.upside} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quarterly summary */}
      <SectionTitle>Resumen por Quarter</SectionTitle>
      <div className="table-responsive" style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 8 }}>Quarter</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.won }}>Won</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.commit }}>Commit</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.forecast }}>Forecast</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.upside }}>Upside</th>
              <th style={{ textAlign: "right", padding: 8, fontWeight: 700 }}>Ponderado</th>
              <th style={{ textAlign: "right", padding: 8, color: COLORS.gray }}>Target</th>
              <th style={{ textAlign: "right", padding: 8 }}>% Target</th>
            </tr>
          </thead>
          <tbody>
            {qData.map(q => {
              const pct = q.target > 0 ? (q.ponderado / q.target * 100) : 0;
              return (
                <tr key={q.name} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{q.name}</td>
                  <td style={{ textAlign: "right", padding: 8 }}>{fmtM(q.won)}</td>
                  <td style={{ textAlign: "right", padding: 8 }}>{fmtM(q.commit)}</td>
                  <td style={{ textAlign: "right", padding: 8 }}>{fmtM(q.forecast)}</td>
                  <td style={{ textAlign: "right", padding: 8 }}>{fmtM(q.upside)}</td>
                  <td style={{ textAlign: "right", padding: 8, fontWeight: 700 }}>{fmtM(q.ponderado)}</td>
                  <td style={{ textAlign: "right", padding: 8, color: COLORS.gray }}>{fmtM(q.target)}</td>
                  <td style={{ textAlign: "right", padding: 8, fontWeight: 600, color: pct >= 100 ? COLORS.green : pct >= 80 ? COLORS.warning : COLORS.red }}>{pct.toFixed(0)}%</td>
                </tr>
              );
            })}
            {/* Total row */}
            <tr style={{ borderTop: "2px solid " + COLORS.dark, fontWeight: 700 }}>
              <td style={{ padding: 8 }}>TOTAL</td>
              <td style={{ textAlign: "right", padding: 8 }}>{fmtM(totalAnual.won)}</td>
              <td style={{ textAlign: "right", padding: 8 }}>{fmtM(totalAnual.commit)}</td>
              <td style={{ textAlign: "right", padding: 8 }}>{fmtM(totalAnual.forecast)}</td>
              <td style={{ textAlign: "right", padding: 8 }}>{fmtM(totalAnual.upside)}</td>
              <td style={{ textAlign: "right", padding: 8, color: COLORS.accent }}>{fmtM(totalAnual.ponderado)}</td>
              <td style={{ textAlign: "right", padding: 8, color: COLORS.gray }}>{fmtM(totalAnual.target)}</td>
              <td style={{ textAlign: "right", padding: 8, color: totalAnual.target > 0 && (totalAnual.ponderado / totalAnual.target * 100) >= 80 ? COLORS.green : COLORS.red }}>
                {totalAnual.target > 0 ? (totalAnual.ponderado / totalAnual.target * 100).toFixed(0) + "%" : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Monthly detail table */}
      <SectionTitle>Detalle Mensual</SectionTitle>
      <div className="table-responsive" style={{ background: "white", borderRadius: 12, padding: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 8 }}>Mes</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.won }}>Won</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.commit }}>Commit</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.forecast }}>Forecast</th>
              <th style={{ textAlign: "right", padding: 8, color: STAGE_COLORS.upside }}>Upside</th>
              <th style={{ textAlign: "right", padding: 8, fontWeight: 700 }}>Ponderado</th>
            </tr>
          </thead>
          <tbody>
            {forecastByStage.map(m => (
              <tr key={m.mes} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                <td style={{ padding: 8, fontWeight: 500 }}>{m.mes}</td>
                <td style={{ textAlign: "right", padding: 8 }}>{fmtM(m.won)}</td>
                <td style={{ textAlign: "right", padding: 8 }}>{fmtM(m.commit)}</td>
                <td style={{ textAlign: "right", padding: 8 }}>{fmtM(m.forecast)}</td>
                <td style={{ textAlign: "right", padding: 8 }}>{fmtM(m.upside)}</td>
                <td style={{ textAlign: "right", padding: 8, fontWeight: 700 }}>{fmtM(m.ponderado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
