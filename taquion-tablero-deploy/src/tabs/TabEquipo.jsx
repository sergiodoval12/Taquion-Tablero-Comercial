import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../data/constants.js";
import { OPPORTUNITIES, WON_2026 } from "../data/opportunities.js";
import { COMERCIALES } from "../data/commercials.js";
import { fmtM } from "../utils/formatters.js";
import { KPICard, ProgressBar, SectionTitle, CustomTooltip } from "../components/ui/index.js";

export default function TabEquipo() {
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
