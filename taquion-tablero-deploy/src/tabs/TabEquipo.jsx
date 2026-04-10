import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { COMERCIALES, MODELO_COMERCIAL } from "../data/commercials.js";
import { fmtM } from "../utils/formatters.js";
import { KPICard, ProgressBar, SectionTitle, CustomTooltip } from "../components/ui/index.js";

export default function TabEquipo() {
  const { opportunities: OPPORTUNITIES, won2026: WON_2026 } = useData();
  // Revenue originado (rol principal para la atribución general)
  const wonByOriginador = {};
  WON_2026.forEach(w => {
    wonByOriginador[w.originador] = (wonByOriginador[w.originador] || 0) + (w.q1 || 0);
  });
  const wonByCerrador = {};
  WON_2026.forEach(w => {
    wonByCerrador[w.cerrador] = (wonByCerrador[w.cerrador] || 0) + (w.q1 || 0);
  });

  const pipelineByPerson = {};
  OPPORTUNITIES.forEach(o => {
    [o.cerrador, o.originador, o.bo].forEach(name => {
      if (name && name !== "Sin asignar") {
        if (!pipelineByPerson[name]) pipelineByPerson[name] = { count: 0, value: 0, seen: new Set() };
        if (!pipelineByPerson[name].seen.has(o.nombre)) {
          pipelineByPerson[name].count++;
          pipelineByPerson[name].value += o.total;
          pipelineByPerson[name].seen.add(o.nombre);
        }
      }
    });
  });

  const monthsElapsed = 3;
  const teamData = COMERCIALES.map(c => {
    const wonOrig = wonByOriginador[c.nombre] || 0;
    const wonCerr = wonByCerrador[c.nombre] || 0;
    const targetToDate = c.targetMensual * monthsElapsed;
    const pipe = pipelineByPerson[c.nombre] || { count: 0, value: 0 };
    return {
      ...c,
      won: wonOrig,
      wonCerr,
      targetToDate,
      pctTarget: targetToDate > 0 ? (wonOrig / targetToDate * 100) : 0,
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
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: COLORS.gray }}>{t.role}</span>
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: t.modelRole === "GC" ? COLORS.blue + "15" : COLORS.purple + "15", color: t.modelRole === "GC" ? COLORS.blue : COLORS.purple, fontWeight: 600 }}>
                    {t.modelRole}
                  </span>
                </div>
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
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24 }}>
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

      <SectionTitle>Modelo Comercial — Pool 20% por Oportunidad</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { role: "Marketing Taquion", pct: "2.5%", desc: "Residualidad compania (no distribuible)", color: COLORS.gray },
            { role: "Business Owner", pct: "2.5%", desc: "Ownership de vertical (BO of Record)", color: COLORS.purple },
            { role: "Pool New Deal", pct: "hasta 15%", desc: "Segun casuistica de origen/cierre", color: COLORS.accent },
            { role: "Pool Upsell", pct: "hasta 12.5%", desc: "Incluye holdback fondo operacion 2.5%", color: COLORS.teal },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", padding: 16, background: m.color + "08", borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.pct}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{m.role}</div>
              <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>{m.desc}</div>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: COLORS.dark }}>Casuisticas de Asignacion</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { caso: "BO origina y cierra", detalle: "Mktg 2.5% + BO 2.5% + Performance 15% = 20%", color: COLORS.accent },
            { caso: "GC origina y cierra", detalle: "7.5% comision (sin tope salarial)", color: COLORS.blue },
            { caso: "BO origina / GC cierra", detalle: "Mktg 2.5% + BO 2.5% + Origen BO 7.5% + GC segun esquema", color: COLORS.teal },
            { caso: "Referral + GC cierra", detalle: "Mktg 2.5% + Ownership 2.5% + Referral 7.5% + GC segun esquema", color: COLORS.warning },
          ].map((c, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 8, border: "1px solid " + c.color + "30", background: c.color + "05" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.caso}</div>
              <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>{c.detalle}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>Esquema GC — Compensacion</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          <div style={{ padding: 12, background: COLORS.blue + "08", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.blue }}>$2.5M</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Fijo Mensual</div>
          </div>
          <div style={{ padding: 12, background: COLORS.accent + "08", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent }}>$50M</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Target Mensual</div>
          </div>
          <div style={{ padding: 12, background: COLORS.warning + "08", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.warning }}>$6.25M</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Tope Salarial</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
              <th style={{ textAlign: "left", padding: 8 }}>Cumplimiento</th>
              <th style={{ textAlign: "center", padding: 8 }}>Comision Efectiva</th>
              <th style={{ textAlign: "left", padding: 8 }}>Nota</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
              <td style={{ padding: 8 }}>0% – 59%</td>
              <td style={{ padding: 8, textAlign: "center", fontWeight: 700, color: COLORS.red }}>0%</td>
              <td style={{ padding: 8, color: COLORS.gray }}>No habilita variable</td>
            </tr>
            <tr style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
              <td style={{ padding: 8 }}>60% – 100%</td>
              <td style={{ padding: 8, textAlign: "center", fontWeight: 700, color: COLORS.green }}>7.5%</td>
              <td style={{ padding: 8, color: COLORS.gray }}>Sujeto a tope salarial $6.25M (caso BO origina / GC cierra)</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>{">"} 100%</td>
              <td style={{ padding: 8, textAlign: "center", fontWeight: 700, color: COLORS.accent }}>Overachievement Pool</td>
              <td style={{ padding: 8, color: COLORS.gray }}>Fondo variable adicional al area comercial</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
