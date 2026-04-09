import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import { COLORS, STAGE_COLORS, STAGE_ORDER } from "../data/constants.js";
import { OPPORTUNITIES } from "../data/opportunities.js";
import { fmtM } from "../utils/formatters.js";
import { KPICard, Badge, StageIndicator, SectionTitle } from "../components/ui/index.js";

export default function TabPipeline() {
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
                <td style={{ textAlign: "right", padding: 6, fontWeight: 600, fontFamily: "monospace" }}>{o.total > 0 ? fmtM(o.total) : "\u2014"}</td>
                <td style={{ padding: 6 }}><Badge text={o.industria} color={COLORS.blue} /></td>
                <td style={{ textAlign: "center", padding: 6 }}>
                  {o.upselling ? <Badge text="Upselling" color={COLORS.teal} /> : <Badge text="Nueva" color={COLORS.purple} />}
                </td>
                <td style={{ padding: 6, color: o.cerrador === "Sin asignar" ? COLORS.warning : COLORS.dark }}>{o.cerrador}</td>
                <td style={{ padding: 6, color: COLORS.gray }}>{o.duracion || "\u2014"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
