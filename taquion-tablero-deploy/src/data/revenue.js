// ─── REVENUE DATA FROM NOTION CRM (Actualizado 2026-04-09) ──────
// Fuente: "General 2026" > gráfico "Real VS Target" en Notion.
// Real = Won (verde), Target = azul, Costos = rojo.
// Targets NO son planos: van de $200M a $550M según el mes.
// Meses Abr-Dic 2026: "Real" es proyección (Won + Forecast + Upside + Pipeline).
// r2025: datos comparativos del año anterior (pendiente de validar con General 2025).

export const REVENUE_2026 = [
  { mes: "Ene", real: 168133169, target: 200000000, r2025: 152640851 },
  { mes: "Feb", real: 136605000, target: 200000000, r2025: 134055200 },
  { mes: "Mar", real: 228408750, target: 250000000, r2025: 99739892 },
  { mes: "Abr", real: 169876000, target: 250000000, r2025: 271063038, projected: true },
  { mes: "May", real: 165476000, target: 300000000, r2025: 305970442, projected: true },
  { mes: "Jun", real: 135976000, target: 300000000, r2025: 418941766, projected: true },
  { mes: "Jul", real: 126476000, target: 350000000, r2025: 160254020, projected: true },
  { mes: "Ago", real: 118376000, target: 400000000, r2025: 181436120, projected: true },
  { mes: "Sep", real: 118376000, target: 450000000, r2025: 209728905, projected: true },
  { mes: "Oct", real: 116898000, target: 450000000, r2025: 322613132, projected: true },
  { mes: "Nov", real: 116898000, target: 500000000, r2025: 223321865, projected: true },
  { mes: "Dic", real: 116898000, target: 550000000, r2025: 302270961, projected: true },
];
