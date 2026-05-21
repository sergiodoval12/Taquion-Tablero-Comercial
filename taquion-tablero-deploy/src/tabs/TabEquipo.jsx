import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { COMERCIALES, MODELO_COMERCIAL, BO_VERTICALES } from "../data/commercials.js";
import { fmtM } from "../utils/formatters.js";
import { KPICard, ProgressBar, SectionTitle, CustomTooltip } from "../components/ui/index.js";

// Normalize name: strip accents, lowercase — prevents mismatch between Notion and local data
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function TabEquipo() {
  const { opportunities: OPPORTUNITIES, won2026: WON_2026, lostCount, lostByCerrador, avgVelocity, accounts } = useData();
  // Revenue originado (rol principal para la atribución general)
  const wonByOriginador = {};
  WON_2026.forEach(w => {
    wonByOriginador[norm(w.originador)] = (wonByOriginador[norm(w.originador)] || 0) + (w.q1 || 0);
  });
  const wonByCerrador = {};
  WON_2026.forEach(w => {
    wonByCerrador[norm(w.cerrador)] = (wonByCerrador[norm(w.cerrador)] || 0) + (w.q1 || 0);
  });
  const wonCountByCerrador = {};
  WON_2026.forEach(w => {
    wonCountByCerrador[norm(w.cerrador)] = (wonCountByCerrador[norm(w.cerrador)] || 0) + 1;
  });

  const pipelineByPerson = {};
  OPPORTUNITIES.forEach(o => {
    [o.cerrador, o.originador, o.bo].forEach(name => {
      if (name && name !== "Sin asignar") {
        const k = norm(name);
        if (!pipelineByPerson[k]) pipelineByPerson[k] = { count: 0, value: 0, seen: new Set() };
        if (!pipelineByPerson[k].seen.has(o.nombre)) {
          pipelineByPerson[k].count++;
          pipelineByPerson[k].value += o.total;
          pipelineByPerson[k].seen.add(o.nombre);
        }
      }
    });
  });

  // Win rate: Won / (Won + Lost) total and per cerrador
  const totalWonCount = WON_2026.length;
  const totalWinRate = (totalWonCount + lostCount) > 0 ? (totalWonCount / (totalWonCount + lostCount) * 100) : 0;

  const monthsElapsed = 4; // Updated to April 2026
  // Also normalize lostByCerrador keys for matching
  const lostByNorm = {};
  Object.entries(lostByCerrador).forEach(([k, v]) => { lostByNorm[norm(k)] = (lostByNorm[norm(k)] || 0) + v; });

  const teamData = COMERCIALES.map(c => {
    const nk = norm(c.nombre);
    const wonOrig = wonByOriginador[nk] || 0;
    const wonCerr = wonByCerrador[nk] || 0;
    const wonCount = wonCountByCerrador[nk] || 0;
    const lostPersonCount = lostByNorm[nk] || 0;
    const winRate = (wonCount + lostPersonCount) > 0 ? (wonCount / (wonCount + lostPersonCount) * 100) : null;
    const targetToDate = c.targetMensual * monthsElapsed;
    const pipe = pipelineByPerson[nk] || { count: 0, value: 0 };
    return {
      ...c,
      won: wonOrig,
      wonCerr,
      wonCount,
      lostCount: lostPersonCount,
      winRate,
      targetToDate,
      pctTarget: targetToDate > 0 ? (wonOrig / targetToDate * 100) : 0,
      pipelineCount: pipe.count,
      pipelineValue: pipe.value,
    };
  });

  // AM deployment: which AM has which accounts
  const amDeployment = {};
  (accounts || []).forEach(acc => {
    const am = acc.am || "Sin asignar";
    if (!amDeployment[am]) amDeployment[am] = [];
    amDeployment[am].push(acc);
  });

  // Stale deals (>15 days)
  const staleDeals = OPPORTUNITIES.filter(o => o.staleDays != null && o.staleDays > 15)
    .sort((a, b) => (b.staleDays || 0) - (a.staleDays || 0));

  return (
    <div>
      <div className="kpi-grid-5">
        <KPICard title="Target mensual / comercial" value="$50M" subtitle={"$" + (50 * monthsElapsed) + "M acumulado YTD"} color={COLORS.blue} />
        <KPICard title="Won YTD Total" value={fmtM(WON_2026.reduce((s, w) => s + w.total, 0))} color={COLORS.green} />
        <KPICard title="Win Rate" value={totalWinRate.toFixed(0) + "%"} subtitle={totalWonCount + " won / " + lostCount + " lost"} color={totalWinRate >= 50 ? COLORS.green : COLORS.warning} />
        <KPICard title="Velocity Promedio" value={avgVelocity != null ? avgVelocity + " días" : "—"} subtitle="Pipeline → Won" color={COLORS.blue} />
        <KPICard title="Deals Stale (>15d)" value={staleDeals.length} subtitle={"De " + OPPORTUNITIES.length + " activos"} color={staleDeals.length > 0 ? COLORS.red : COLORS.green} />
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
              <span>Pipeline: {t.pipelineCount} opps ({fmtM(t.pipelineValue)})</span>
              <span style={{ color: t.winRate != null ? (t.winRate >= 50 ? COLORS.green : COLORS.red) : COLORS.gray }}>
                {t.winRate != null ? "Win: " + t.winRate.toFixed(0) + "% (" + t.wonCount + "W/" + t.lostCount + "L)" : "Sin datos W/L"}
              </span>
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
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
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
        <div className="grid-2col-even">
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

      <SectionTitle>Cobertura de Verticales — Business Owners</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {Object.entries(BO_VERTICALES).map(([name, info]) => (
            <div key={name} style={{
              padding: 14, borderRadius: 8,
              border: "1px solid " + (info.status === "activo" ? COLORS.green : COLORS.warning) + "40",
              background: (info.status === "activo" ? COLORS.green : COLORS.warning) + "05",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.dark }}>{name}</div>
              <div style={{ fontSize: 12, color: info.status === "activo" ? COLORS.green : COLORS.warning, fontWeight: 600, marginTop: 2 }}>{info.vertical}</div>
              <div style={{ fontSize: 10, color: COLORS.gray, marginTop: 4 }}>
                <span style={{
                  padding: "1px 6px", borderRadius: 3,
                  background: info.status === "activo" ? COLORS.green + "15" : COLORS.warning + "15",
                  color: info.status === "activo" ? COLORS.green : COLORS.warning,
                  fontWeight: 600,
                }}>{info.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AM Deployment */}
      <SectionTitle>Despliegue de Account Managers</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        {Object.keys(amDeployment).length === 0 ? (
          <div style={{ fontSize: 13, color: COLORS.gray, textAlign: "center", padding: 20 }}>Sin datos de AMs. Verificar que la API de cuentas esté conectada.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {Object.entries(amDeployment).sort((a, b) => b[1].length - a[1].length).map(([am, cuentas]) => {
              // Check if any account has upselling opportunities
              const cuentaNames = cuentas.map(c => c.nombre);
              const upOps = OPPORTUNITIES.filter(o => o.upselling && cuentaNames.some(n => o.nombre.toLowerCase().includes(n.toLowerCase())));
              return (
                <div key={am} style={{ padding: 14, borderRadius: 8, border: "1px solid " + COLORS.lightGray, background: COLORS.light }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark }}>{am}</span>
                    <span style={{ fontSize: 11, color: COLORS.gray }}>{cuentas.length} cuentas</span>
                  </div>
                  {cuentas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((c, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12, borderBottom: i < cuentas.length - 1 ? "1px solid " + COLORS.lightGray : "none" }}>
                      <span>{c.nombre}</span>
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 3,
                        background: c.tipo?.toLowerCase() === "recurrente" ? COLORS.green + "15" : COLORS.warning + "15",
                        color: c.tipo?.toLowerCase() === "recurrente" ? COLORS.green : COLORS.warning,
                        fontWeight: 600,
                      }}>{c.tipo || "—"}</span>
                    </div>
                  ))}
                  {upOps.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: COLORS.teal, fontWeight: 600 }}>
                      {upOps.length} opp(s) de upselling detectadas
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SectionTitle>Esquema GC — Compensacion</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <div className="kpi-grid" style={{ marginBottom: 16 }}>
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
