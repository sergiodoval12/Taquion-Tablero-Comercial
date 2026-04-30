import { COLORS, STAGE_ORDER } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { fmtM } from "../utils/formatters.js";
import { KPICard, Badge, StageIndicator, SectionTitle } from "../components/ui/index.js";

export default function TabAlertas() {
  const { opportunities: OPPORTUNITIES } = useData();
  const upsellingOpps = OPPORTUNITIES.filter(o => o.upselling).sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]);
  const newOpps = OPPORTUNITIES.filter(o => !o.upselling);
  const upsellingValue = upsellingOpps.reduce((s, o) => s + o.total, 0);
  const newValue = newOpps.reduce((s, o) => s + o.total, 0);

  const noCerrador = OPPORTUNITIES.filter(o => o.cerrador === "Sin asignar" && (o.stage === "Forecast" || o.stage === "Commit"));
  const highValueNoCerrador = OPPORTUNITIES.filter(o => o.cerrador === "Sin asignar" && o.total >= 50000000);
  const staleDeals = OPPORTUNITIES.filter(o => o.staleDays != null && o.staleDays > 15)
    .sort((a, b) => (b.staleDays || 0) - (a.staleDays || 0));
  const criticalStale = staleDeals.filter(o => o.staleDays > 30);

  const upsellingByIndustry = {};
  upsellingOpps.forEach(o => {
    if (!upsellingByIndustry[o.industria]) upsellingByIndustry[o.industria] = { count: 0, value: 0 };
    upsellingByIndustry[o.industria].count++;
    upsellingByIndustry[o.industria].value += o.total;
  });

  return (
    <div>
      <div className="kpi-grid-5">
        <KPICard title="Opps Upselling" value={upsellingOpps.length} subtitle={fmtM(upsellingValue)} color={COLORS.teal} />
        <KPICard title="Opps Nuevas" value={newOpps.length} subtitle={fmtM(newValue)} color={COLORS.purple} />
        <KPICard title="Sin cerrador (F/C)" value={noCerrador.length} subtitle="Requiere accion" color={COLORS.red} />
        <KPICard title="Stale >15 dias" value={staleDeals.length} subtitle={criticalStale.length + " criticos (>30d)"} color={staleDeals.length > 0 ? COLORS.red : COLORS.green} />
        <KPICard title=">$50M sin cerrador" value={highValueNoCerrador.length} subtitle="Alto valor" color={COLORS.warning} />
      </div>

      {(noCerrador.length > 0 || highValueNoCerrador.length > 0) && (
        <div>
          <SectionTitle>Alertas Comerciales</SectionTitle>

          {noCerrador.length > 0 && (
            <div style={{ background: COLORS.red + "08", border: "1px solid " + COLORS.red + "40", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: COLORS.red, margin: "0 0 8px" }}>
                Oportunidades en Forecast/Commit SIN cerrador asignado
              </h4>
              {noCerrador.map((o, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid " + COLORS.red + "20", fontSize: 13 }}>
                  <span><StageIndicator stage={o.stage} /> {o.nombre}</span>
                  <span style={{ fontWeight: 600 }}>{o.total > 0 ? fmtM(o.total) : "\u2014"}</span>
                </div>
              ))}
            </div>
          )}

          {highValueNoCerrador.length > 0 && (
            <div style={{ background: COLORS.warning + "08", border: "1px solid " + COLORS.warning + "40", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: COLORS.orange, margin: "0 0 8px" }}>
                Oportunidades de alto valor (mas de $50M) sin cerrador
              </h4>
              {highValueNoCerrador.map((o, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid " + COLORS.warning + "20", fontSize: 13 }}>
                  <span><StageIndicator stage={o.stage} /> {o.nombre}</span>
                  <span style={{ fontWeight: 600 }}>{fmtM(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {staleDeals.length > 0 && (
        <div>
          <SectionTitle>{"Deals Stale — Sin movimiento >15 dias (" + staleDeals.length + ")"}</SectionTitle>
          <div style={{ background: COLORS.warning + "08", border: "1px solid " + COLORS.warning + "40", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 10 }}>
              Estas oportunidades no cambiaron de etapa en mas de 15 dias. Requieren follow-up o decision de mover/descartar.
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid " + COLORS.warning }}>
                  <th style={{ textAlign: "left", padding: 6 }}>Oportunidad</th>
                  <th style={{ textAlign: "center", padding: 6 }}>Etapa</th>
                  <th style={{ textAlign: "right", padding: 6 }}>Monto</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Cerrador</th>
                  <th style={{ textAlign: "right", padding: 6 }}>Dias stale</th>
                </tr>
              </thead>
              <tbody>
                {staleDeals.map((o, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray, background: o.staleDays > 30 ? COLORS.red + "08" : "transparent" }}>
                    <td style={{ padding: 6, fontWeight: 500 }}>{o.nombre}</td>
                    <td style={{ padding: 6, textAlign: "center" }}><StageIndicator stage={o.stage} /></td>
                    <td style={{ textAlign: "right", padding: 6, fontFamily: "monospace" }}>{o.total > 0 ? fmtM(o.total) : "—"}</td>
                    <td style={{ padding: 6 }}>{o.cerrador}</td>
                    <td style={{ textAlign: "right", padding: 6, fontWeight: 700, color: o.staleDays > 30 ? COLORS.red : COLORS.warning }}>{o.staleDays}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid-2col-even">
        <div>
          <SectionTitle>{"Oportunidades de Upselling (" + upsellingOpps.length + ")"}</SectionTitle>
          <div className="table-responsive" style={{ background: "white", borderRadius: 12, padding: 16, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid " + COLORS.teal }}>
                  <th style={{ textAlign: "left", padding: 6 }}>Etapa</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Oportunidad</th>
                  <th style={{ textAlign: "right", padding: 6 }}>$</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Industria</th>
                </tr>
              </thead>
              <tbody>
                {upsellingOpps.map((o, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                    <td style={{ padding: 6 }}><StageIndicator stage={o.stage} /></td>
                    <td style={{ padding: 6, fontWeight: 500 }}>{o.nombre}</td>
                    <td style={{ textAlign: "right", padding: 6, fontFamily: "monospace" }}>{o.total > 0 ? fmtM(o.total) : "\u2014"}</td>
                    <td style={{ padding: 6 }}><Badge text={o.industria} color={COLORS.blue} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionTitle>Upselling por Industria</SectionTitle>
          <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
            {Object.entries(upsellingByIndustry)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([ind, data], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + COLORS.lightGray }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{ind}</span>
                    <span style={{ fontSize: 11, color: COLORS.gray, marginLeft: 8 }}>{data.count} opps</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtM(data.value)}</span>
                </div>
              ))}
          </div>

          <SectionTitle>Nota sobre Alertas a 45 dias</SectionTitle>
          <div style={{ background: COLORS.blue + "08", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.dark }}>
              La base de cuentas activas en Notion no tiene un campo de "fecha de terminacion de proyecto" directo.
              Se recomienda agregar este campo para habilitar alertas automaticas a 45 dias del vencimiento.
              Las oportunidades marcadas como <strong>Upselling</strong> son las senales de renovacion/expansion activa.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
