import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORS, CHART_COLORS, STAGE_COLORS, STAGE_ORDER } from "../data/constants.js";
import { useData } from "../data/DataProvider.jsx";
import { COMERCIALES, BO_PHANTOM, TODOS_COMERCIALES, MODELO_COMERCIAL } from "../data/commercials.js";
import { fmtM } from "../utils/formatters.js";
import { KPICard, ProgressBar, Badge, SectionTitle, CustomTooltip } from "../components/ui/index.js";

const monthsElapsed = 4; // YTD Apr 2026

function getRoleLabel(m) {
  if (m === "CEO") return "CEO";
  if (m === "GC") return "Gerente Comercial";
  if (m === "BO") return "Business Owner";
  return m;
}

function getRoleColor(m) {
  if (m === "CEO") return COLORS.accent;
  if (m === "GC") return COLORS.blue;
  if (m === "BO") return COLORS.purple;
  return COLORS.gray;
}

export default function TabSeguimiento() {
  const { opportunities: OPPORTUNITIES, won2026: WON_2026, accounts: CUENTAS_ACTIVAS } = useData();
  const [selected, setSelected] = useState(COMERCIALES[0].nombre);

  const person = TODOS_COMERCIALES.find(c => c.nombre === selected) || COMERCIALES[0];

  const stats = useMemo(() => {
    // Won deals donde participó en algún rol
    const wonAsCerrador = WON_2026.filter(w => w.cerrador === selected);
    const wonAsOriginador = WON_2026.filter(w => w.originador === selected);
    const wonAsBO = WON_2026.filter(w => w.bo === selected);

    // Use Q1 monthly revenue (not deal total) — matches company $533M Q1
    const revenueCerrador = wonAsCerrador.reduce((s, w) => s + (w.q1 || 0), 0);
    const revenueOriginador = wonAsOriginador.reduce((s, w) => s + (w.q1 || 0), 0);
    const revenueBO = wonAsBO.reduce((s, w) => s + (w.q1 || 0), 0);

    // Pipeline opportunities donde participa
    const pipelineAsCerrador = OPPORTUNITIES.filter(o => o.cerrador === selected);
    const pipelineAsOriginador = OPPORTUNITIES.filter(o => o.originador === selected);
    const pipelineAsBO = OPPORTUNITIES.filter(o => o.bo === selected);

    // Unión de oportunidades donde participa
    const pipelineAll = OPPORTUNITIES.filter(o =>
      o.cerrador === selected || o.originador === selected || o.bo === selected
    );

    const pipelineValue = pipelineAll.reduce((s, o) => s + o.total, 0);

    // Cuentas activas donde es AM
    const cuentasAM = CUENTAS_ACTIVAS.filter(c => c.am === selected);

    // Won by industry
    const wonByIndustry = {};
    wonAsOriginador.forEach(w => {
      const val = w.q1 || w.total || 0;
      if (val > 0) {
        wonByIndustry[w.industria] = (wonByIndustry[w.industria] || 0) + val;
      }
    });

    // Pipeline by stage (all roles)
    const pipelineByStage = {};
    pipelineAll.forEach(o => {
      pipelineByStage[o.stage] = (pipelineByStage[o.stage] || { count: 0, value: 0 });
      pipelineByStage[o.stage].count++;
      pipelineByStage[o.stage].value += o.total;
    });

    // Cumplimiento mensual (para GC)
    const cumplimientoMensual = {};
    wonAsCerrador.forEach(w => {
      const m = w.fecha.slice(5, 7);
      const label = { "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr" }[m] || m;
      cumplimientoMensual[label] = (cumplimientoMensual[label] || 0) + (w.q1 || w.total || 0);
    });

    return {
      wonAsCerrador, wonAsOriginador, wonAsBO,
      revenueCerrador, revenueOriginador, revenueBO,
      pipelineAsCerrador, pipelineAsOriginador, pipelineAsBO, pipelineAll,
      pipelineValue,
      cuentasAM,
      wonByIndustry, pipelineByStage, cumplimientoMensual,
    };
  }, [selected]);

  // Determinar el "revenue principal" según el rol
  const revenueRelevante = person.modelRole === "GC" ? stats.revenueCerrador : stats.revenueOriginador;
  const targetToDate = person.targetMensual * monthsElapsed;
  const pctTarget = targetToDate > 0 ? (revenueRelevante / targetToDate * 100) : 0;

  // Fee como porcentaje según rol
  let feeLabel = "";
  let feePct = 0;
  const isPhantom = BO_PHANTOM.some(b => b.nombre === selected);
  if (person.modelRole === "CEO") {
    feeLabel = "17.5% (BO origina + cierra)";
    feePct = 17.5;
  } else if (person.modelRole === "GC") {
    const pctCumplimiento = targetToDate > 0 ? (stats.revenueCerrador / targetToDate) : 0;
    if (isPhantom) {
      // Phantom GC: comisión fija por deal, sin target
      feeLabel = (person.comisionPct || 7.5) + "% por deal (Phantom)";
      feePct = person.comisionPct || 7.5;
    } else if (pctCumplimiento >= 0.6) {
      feeLabel = "7.5% (cumple > 60% target)";
      feePct = 7.5;
    } else {
      feeLabel = "0% (no alcanza 60% target)";
      feePct = 0;
    }
  } else if (person.modelRole === "BO") {
    if (isPhantom) {
      feeLabel = (person.comisionPct || 2.5) + "% ownership vertical";
      feePct = person.comisionPct || 2.5;
    } else {
      feeLabel = "2.5% ownership + 7.5% origen";
      feePct = 10;
    }
  }

  // ─── Cálculo de comisión a pagar ───
  const comisionDesglose = useMemo(() => {
    const items = [];
    let totalComision = 0;

    if (person.modelRole === "CEO") {
      // CEO: 2.5% ownership de su vertical + 15% cuando origina y cierra
      const ownershipRev = stats.revenueBO;
      const ownershipFee = ownershipRev * 0.025;
      items.push({ concepto: "Ownership vertical (2.5%)", base: ownershipRev, pct: 2.5, monto: ownershipFee });

      // Deals donde originó Y cerró
      const originaYCierra = WON_2026.filter(w => w.originador === selected && w.cerrador === selected);
      const revOyC = originaYCierra.reduce((s, w) => s + (w.q1 || 0), 0);
      const feeOyC = revOyC * 0.15;
      items.push({ concepto: "Performance origina+cierra (15%)", base: revOyC, pct: 15, monto: feeOyC });

      // Deals donde originó pero otro cerró
      const originaSolo = WON_2026.filter(w => w.originador === selected && w.cerrador !== selected);
      const revOS = originaSolo.reduce((s, w) => s + (w.q1 || 0), 0);
      const feeOS = revOS * 0.075;
      items.push({ concepto: "Origen sin cierre (7.5%)", base: revOS, pct: 7.5, monto: feeOS });

      totalComision = ownershipFee + feeOyC + feeOS;
    } else if (person.modelRole === "GC") {
      if (isPhantom) {
        // Phantom GC: comisión flat por deal cerrado
        const pct = (person.comisionPct || 7.5) / 100;
        const rev = stats.revenueCerrador;
        const fee = rev * pct;
        items.push({ concepto: `Comisión Phantom GC (${person.comisionPct || 7.5}%)`, base: rev, pct: person.comisionPct || 7.5, monto: fee });
        totalComision = fee;
      } else {
        // GC operativo: 7.5% si cumple >60% target
        const pctCumplimiento = targetToDate > 0 ? (stats.revenueCerrador / targetToDate) : 0;
        const habilitado = pctCumplimiento >= 0.6;
        const fijoTotal = (person.fijoMensual || 0) * monthsElapsed;
        if (fijoTotal > 0) {
          items.push({ concepto: "Fijo mensual × " + monthsElapsed, base: person.fijoMensual, pct: null, monto: fijoTotal });
        }
        if (habilitado) {
          const comisionVar = stats.revenueCerrador * 0.075;
          items.push({ concepto: "Variable 7.5% (habilitado)", base: stats.revenueCerrador, pct: 7.5, monto: comisionVar });
          totalComision = fijoTotal + comisionVar;
        } else {
          items.push({ concepto: "Variable 7.5% (NO habilitado — <60%)", base: stats.revenueCerrador, pct: 0, monto: 0 });
          totalComision = fijoTotal;
        }
        // New business originado por GC
        const originadoPorGC = WON_2026.filter(w => w.originador === selected && w.cerrador === selected);
        const revNB = originadoPorGC.reduce((s, w) => s + (w.q1 || 0), 0);
        if (revNB > 0) {
          const feeNB = revNB * 0.075;
          items.push({ concepto: "New business originado+cerrado (7.5%)", base: revNB, pct: 7.5, monto: feeNB });
          totalComision += feeNB;
        }
      }
    } else if (person.modelRole === "BO") {
      if (isPhantom) {
        // BO externo: solo ownership de su vertical
        const pct = (person.comisionPct || 2.5) / 100;
        const rev = stats.revenueBO + stats.revenueOriginador;
        const fee = rev * pct;
        items.push({ concepto: `Ownership vertical (${person.comisionPct || 2.5}%)`, base: rev, pct: person.comisionPct || 2.5, monto: fee });
        totalComision = fee;
      } else {
        // BO interno (COO, etc): ownership + origen
        const ownershipFee = stats.revenueBO * 0.025;
        items.push({ concepto: "Ownership vertical (2.5%)", base: stats.revenueBO, pct: 2.5, monto: ownershipFee });
        const origenFee = stats.revenueOriginador * 0.075;
        items.push({ concepto: "Origen oportunidad (7.5%)", base: stats.revenueOriginador, pct: 7.5, monto: origenFee });
        totalComision = ownershipFee + origenFee;
      }
    }

    return { items, totalComision };
  }, [selected, stats, person, isPhantom]);

  const sortedOpps = [...stats.pipelineAll].sort((a, b) => (STAGE_ORDER[a.stage] || 99) - (STAGE_ORDER[b.stage] || 99));

  const industryPieData = Object.entries(stats.wonByIndustry)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const cumplimientoData = Object.entries(stats.cumplimientoMensual).map(([mes, total]) => ({
    mes,
    total,
    target: person.targetMensual,
    pct: ((total / person.targetMensual) * 100).toFixed(0),
  }));

  return (
    <div>
      {/* Selector de comercial — Equipo principal */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark }}>Equipo Comercial:</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {COMERCIALES.map(c => (
              <button
                key={c.nombre}
                onClick={() => setSelected(c.nombre)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: selected === c.nombre ? "2px solid " + getRoleColor(c.modelRole) : "1px solid " + COLORS.lightGray,
                  background: selected === c.nombre ? getRoleColor(c.modelRole) + "10" : "white",
                  color: selected === c.nombre ? getRoleColor(c.modelRole) : COLORS.dark,
                  fontWeight: selected === c.nombre ? 700 : 400,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {c.nombre.split(" ").slice(0, 2).join(" ")}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.purple }}>BOs & Phantom:</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {BO_PHANTOM.map(c => (
              <button
                key={c.nombre}
                onClick={() => setSelected(c.nombre)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: selected === c.nombre ? "2px solid " + (c.modelRole === "GC" ? COLORS.blue : COLORS.purple) : "1px solid " + COLORS.lightGray,
                  background: selected === c.nombre ? (c.modelRole === "GC" ? COLORS.blue : COLORS.purple) + "10" : "white",
                  color: selected === c.nombre ? (c.modelRole === "GC" ? COLORS.blue : COLORS.purple) : COLORS.dark,
                  fontWeight: selected === c.nombre ? 700 : 400,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {c.nombre.split(" ").slice(0, 2).join(" ")}
                <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.6 }}>{c.vertical?.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header con info del perfil */}
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24, borderLeft: "4px solid " + getRoleColor(person.modelRole) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.dark }}>{person.nombre}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: COLORS.gray }}>{person.role}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: getRoleColor(person.modelRole) + "15", color: getRoleColor(person.modelRole), fontWeight: 600 }}>
                {getRoleLabel(person.modelRole)}
              </span>
            </div>
            {(person.verticales?.length > 0 || person.vertical) && (
              <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>
                {person.vertical ? "Vertical: " + person.vertical : "Verticales: " + person.verticales.join(", ")}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: COLORS.gray }}>Fee aplicable</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: feePct > 0 ? COLORS.teal : COLORS.warning }}>{feeLabel}</div>
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="kpi-grid">
        <KPICard
          title="Revenue Q1 como Originador"
          value={fmtM(stats.revenueOriginador)}
          subtitle={stats.wonAsOriginador.filter(w => (w.q1 || w.total) > 0).length + " deals originados"}
          color={COLORS.green}
        />
        <KPICard
          title="Revenue Q1 como Cerrador"
          value={fmtM(stats.revenueCerrador)}
          subtitle={stats.wonAsCerrador.filter(w => (w.q1 || w.total) > 0).length + " deals cerrados"}
          color={COLORS.blue}
        />
        <KPICard
          title="Revenue Q1 como BO"
          value={fmtM(stats.revenueBO)}
          subtitle={stats.wonAsBO.filter(w => (w.q1 || w.total) > 0).length + " en su vertical"}
          color={COLORS.purple}
        />
        <KPICard
          title="Pipeline (todos los roles)"
          value={fmtM(stats.pipelineValue)}
          subtitle={stats.pipelineAll.length + " oportunidades"}
          color={COLORS.warning}
        />
      </div>

      {/* Progress bar vs target */}
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark }}>Avance vs Target Q1 — {fmtM(targetToDate)}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: pctTarget >= 100 ? COLORS.green : pctTarget >= 60 ? COLORS.warning : COLORS.red }}>
            {pctTarget.toFixed(0)}%
          </div>
        </div>
        <ProgressBar value={revenueRelevante} max={targetToDate} label={fmtM(revenueRelevante) + " / " + fmtM(targetToDate)} />
        {person.modelRole === "GC" && (
          <div style={{ display: "flex", gap: 24, marginTop: 12, fontSize: 11, color: COLORS.gray }}>
            <span style={{ color: pctTarget < 60 ? COLORS.red : COLORS.gray }}>0-59%: Sin variable</span>
            <span style={{ color: pctTarget >= 60 && pctTarget <= 100 ? COLORS.green : COLORS.gray, fontWeight: pctTarget >= 60 ? 600 : 400 }}>60-100%: Comision 7.5%</span>
            <span style={{ color: pctTarget > 100 ? COLORS.accent : COLORS.gray }}>{">"}100%: Overachievement Pool</span>
          </div>
        )}
      </div>

      {/* Comisión a pagar — Revenue × % del rol */}
      <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24, border: "2px solid " + (comisionDesglose.totalComision > 0 ? COLORS.teal : COLORS.lightGray) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>Comisión Estimada a Pagar</div>
            <div style={{ fontSize: 11, color: COLORS.gray }}>Basado en revenue atribuido × porcentaje del rol</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: comisionDesglose.totalComision > 0 ? COLORS.teal : COLORS.gray }}>
              {fmtM(comisionDesglose.totalComision)}
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray }}>YTD {monthsElapsed} meses</div>
          </div>
        </div>
        {comisionDesglose.items.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
                <th style={{ textAlign: "left", padding: 8 }}>Concepto</th>
                <th style={{ textAlign: "right", padding: 8 }}>Base Revenue</th>
                <th style={{ textAlign: "center", padding: 8 }}>%</th>
                <th style={{ textAlign: "right", padding: 8 }}>Comisión</th>
              </tr>
            </thead>
            <tbody>
              {comisionDesglose.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                  <td style={{ padding: 8 }}>{item.concepto}</td>
                  <td style={{ padding: 8, textAlign: "right", fontFamily: "monospace" }}>{fmtM(item.base)}</td>
                  <td style={{ padding: 8, textAlign: "center", fontWeight: 600, color: COLORS.gray }}>
                    {item.pct != null ? item.pct + "%" : "—"}
                  </td>
                  <td style={{ padding: 8, textAlign: "right", fontWeight: 700, color: item.monto > 0 ? COLORS.teal : COLORS.gray, fontFamily: "monospace" }}>
                    {fmtM(item.monto)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid " + COLORS.dark, background: COLORS.teal + "06" }}>
                <td colSpan={3} style={{ padding: 8, fontWeight: 700 }}>Total a pagar</td>
                <td style={{ padding: 8, textAlign: "right", fontWeight: 800, fontSize: 14, color: COLORS.teal, fontFamily: "monospace" }}>
                  {fmtM(comisionDesglose.totalComision)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Cumplimiento mensual (para GC) o Revenue por mes */}
      <div className="grid-2col-even">
        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: COLORS.dark }}>
            {person.modelRole === "GC" ? "Cumplimiento Mensual vs Target" : "Revenue Originado por Mes"}
          </h3>
          {cumplimientoData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cumplimientoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Revenue" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill={COLORS.lightGray} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {person.modelRole === "GC" && (
                <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {cumplimientoData.map(d => (
                    <div key={d.mes} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, background: Number(d.pct) >= 60 ? COLORS.green + "15" : COLORS.red + "15", color: Number(d.pct) >= 60 ? COLORS.green : COLORS.red }}>
                      {d.mes}: <strong>{d.pct}%</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.gray, fontSize: 13 }}>
              Sin deals registrados
            </div>
          )}
        </div>

        {/* Industry breakdown */}
        <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: COLORS.dark }}>Revenue Originado por Industria</h3>
          {industryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={industryPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => (name.length > 15 ? name.slice(0, 13) + ".." : name) + ": " + fmtM(value)} labelLine={{ strokeWidth: 1 }}>
                  {industryPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtM(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.gray, fontSize: 13 }}>
              Sin datos de industria
            </div>
          )}
        </div>
      </div>

      {/* TABLA DE ATRIBUCIÓN — Revenue y quien lo trae */}
      <SectionTitle>Atribucion de Revenue — Deals Won 2026</SectionTitle>
      <div className="table-responsive" style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24, overflowX: "auto" }}>
        {stats.wonAsOriginador.length > 0 || stats.wonAsCerrador.length > 0 || stats.wonAsBO.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
                <th style={{ textAlign: "left", padding: 8 }}>Deal</th>
                <th style={{ textAlign: "right", padding: 8 }}>Monto</th>
                <th style={{ textAlign: "left", padding: 8 }}>Industria</th>
                <th style={{ textAlign: "center", padding: 8 }}>Originador</th>
                <th style={{ textAlign: "center", padding: 8 }}>Cerrador</th>
                <th style={{ textAlign: "center", padding: 8 }}>BO</th>
                <th style={{ textAlign: "left", padding: 8 }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Mostrar todos los deals donde esta persona tiene algún rol
                const allDeals = WON_2026.filter(w =>
                  w.cerrador === selected || w.originador === selected || w.bo === selected
                ).sort((a, b) => b.total - a.total);
                return allDeals.map((w, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                    <td style={{ padding: 8, fontWeight: 500 }}>{w.nombre}</td>
                    <td style={{ padding: 8, textAlign: "right", fontWeight: 600, color: (w.q1 || w.total) > 0 ? COLORS.green : COLORS.gray }}>{(w.q1 || w.total) > 0 ? fmtM(w.q1 || w.total) : "—"}</td>
                    <td style={{ padding: 8, fontSize: 11 }}>{w.industria}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>
                      {w.originador === selected ? (
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: COLORS.green + "15", color: COLORS.green, fontWeight: 600 }}>Originador</span>
                      ) : (
                        <span style={{ fontSize: 10, color: COLORS.gray }}>{w.originador.split(" ")[0]}</span>
                      )}
                    </td>
                    <td style={{ padding: 8, textAlign: "center" }}>
                      {w.cerrador === selected ? (
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: COLORS.blue + "15", color: COLORS.blue, fontWeight: 600 }}>Cerrador</span>
                      ) : (
                        <span style={{ fontSize: 10, color: COLORS.gray }}>{w.cerrador.split(" ")[0]}</span>
                      )}
                    </td>
                    <td style={{ padding: 8, textAlign: "center" }}>
                      {w.bo === selected ? (
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: COLORS.purple + "15", color: COLORS.purple, fontWeight: 600 }}>BO</span>
                      ) : (
                        <span style={{ fontSize: 10, color: COLORS.gray }}>{w.bo.split(" ")[0]}</span>
                      )}
                    </td>
                    <td style={{ padding: 8, fontSize: 11, color: COLORS.gray }}>{w.fecha}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", color: COLORS.gray, padding: 24 }}>
            Sin deals con participacion registrada
          </div>
        )}
      </div>

      {/* Oportunidades en pipeline */}
      <SectionTitle>Oportunidades en Pipeline</SectionTitle>
      <div className="table-responsive" style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24, overflowX: "auto" }}>
        {/* Mini badges de stage summary */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {Object.entries(stats.pipelineByStage).sort((a, b) => (STAGE_ORDER[a[0]] || 99) - (STAGE_ORDER[b[0]] || 99)).map(([stage, data]) => (
            <div key={stage} style={{ padding: "4px 12px", borderRadius: 6, background: (STAGE_COLORS[stage] || COLORS.gray) + "12", fontSize: 11 }}>
              <span style={{ fontWeight: 600, color: STAGE_COLORS[stage] || COLORS.gray }}>{stage}</span>
              <span style={{ color: COLORS.gray, marginLeft: 6 }}>{data.count} opps • {fmtM(data.value)}</span>
            </div>
          ))}
        </div>
        {sortedOpps.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + COLORS.dark }}>
                <th style={{ textAlign: "left", padding: 8 }}>Oportunidad</th>
                <th style={{ textAlign: "left", padding: 8 }}>Etapa</th>
                <th style={{ textAlign: "right", padding: 8 }}>Monto</th>
                <th style={{ textAlign: "left", padding: 8 }}>Industria</th>
                <th style={{ textAlign: "center", padding: 8 }}>Rol</th>
              </tr>
            </thead>
            <tbody>
              {sortedOpps.map((o, i) => {
                const roles = [];
                if (o.originador === selected) roles.push({ label: "Orig", color: COLORS.green });
                if (o.cerrador === selected) roles.push({ label: "Cerr", color: COLORS.blue });
                if (o.bo === selected) roles.push({ label: "BO", color: COLORS.purple });
                return (
                  <tr key={i} style={{ borderBottom: "1px solid " + COLORS.lightGray }}>
                    <td style={{ padding: 8, fontWeight: 500 }}>{o.nombre}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: (STAGE_COLORS[o.stage] || COLORS.gray) + "15", color: STAGE_COLORS[o.stage] || COLORS.gray, fontWeight: 600 }}>
                        {o.stage}
                      </span>
                    </td>
                    <td style={{ padding: 8, textAlign: "right", fontWeight: 600 }}>{o.total > 0 ? fmtM(o.total) : "—"}</td>
                    <td style={{ padding: 8, fontSize: 11, color: COLORS.gray }}>{o.industria}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        {roles.map((r, j) => (
                          <span key={j} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: r.color + "15", color: r.color, fontWeight: 600 }}>{r.label}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", color: COLORS.gray, padding: 24 }}>
            Sin oportunidades con participacion
          </div>
        )}
      </div>

      {/* Modelo comercial aplicable */}
      <SectionTitle>Modelo Comercial Aplicable</SectionTitle>
      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {person.modelRole === "CEO" && (
            <>
              <div style={{ padding: 16, background: COLORS.purple + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.purple }}>2.5%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Ownership Vertical</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>BO of Record</div>
              </div>
              <div style={{ padding: 16, background: COLORS.accent + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>15%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Performance</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Origina + cierra</div>
              </div>
              <div style={{ padding: 16, background: COLORS.teal + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.teal }}>7.5%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Origen (si GC cierra)</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>BO origina / GC cierra</div>
              </div>
            </>
          )}
          {person.modelRole === "GC" && (
            <>
              <div style={{ padding: 16, background: COLORS.blue + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.blue }}>7.5%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Comision GC</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Si origina y cierra (sin tope)</div>
              </div>
              <div style={{ padding: 16, background: COLORS.green + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.green }}>{fmtM(person.fijoMensual)}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Fijo Mensual</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Tope total: $6.25M</div>
              </div>
              <div style={{ padding: 16, background: COLORS.warning + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.warning }}>60%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Umbral Variable</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Min para habilitar comision</div>
              </div>
            </>
          )}
          {person.modelRole === "BO" && (
            <>
              <div style={{ padding: 16, background: COLORS.purple + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.purple }}>2.5%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Ownership Vertical</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>BO of Record</div>
              </div>
              <div style={{ padding: 16, background: COLORS.teal + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.teal }}>7.5%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Origen Oportunidad</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Cuando BO origina / GC cierra</div>
              </div>
              <div style={{ padding: 16, background: COLORS.accent + "08", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>hasta 2.5%</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Participacion Intelectual</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>Requiere aprobacion Direccion</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
