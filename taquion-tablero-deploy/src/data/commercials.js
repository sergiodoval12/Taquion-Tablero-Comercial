// ─── EQUIPO COMERCIAL (Actualizado 2026-04-09) ──────────────────
// Roles corregidos según estructura real de Taquion:
// - Diego Kupferberg es el UNICO Gerente Comercial (GC)
// - Sergio Doval = CEO
// - Sol Rios Brinatti = COO
// - Diego Lajst = COO
// - Ciro Garcia Resta = Business Owner
// Target mensual GC: $50M (según modelo comercial Taquion)

export const COMERCIALES = [
  { nombre: "Sergio Doval", targetMensual: 50000000, role: "CEO", modelRole: "CEO", fijoMensual: 0, verticales: ["Hype / Public Affairs", "Entretenimiento / Deportes"] },
  { nombre: "Diego Kupferberg", targetMensual: 50000000, role: "Gerente Comercial", modelRole: "GC", fijoMensual: 3500000, verticales: ["Banca & Fintech", "Consumo Masivo"] },
  { nombre: "Sol Rios Brinatti", targetMensual: 50000000, role: "COO", modelRole: "BO", fijoMensual: 0, verticales: ["Banca & Fintech", "Farmacéutica"] },
  { nombre: "Diego Lajst", targetMensual: 50000000, role: "COO", modelRole: "BO", fijoMensual: 0, verticales: [] },
  { nombre: "Ciro Garcia Resta", targetMensual: 50000000, role: "Business Owner", modelRole: "BO", fijoMensual: 0, verticales: [] },
];

// ─── REGLAS DEL MODELO COMERCIAL ──────────────────────────────
// Pool máximo distribuible: 20% del revenue por oportunidad
// Fuente: "Modelo Comercial Taquion – Arquitectura de Incentivos v2 MVP 2026"

export const MODELO_COMERCIAL = {
  poolMax: 0.20,
  marketingTaquion: 0.025,       // 2.5% — no distribuible, residualidad compañía
  ownershipVerticalBO: 0.025,    // 2.5% — Business Owner of Record
  poolPerformanceNewDeal: 0.15,  // hasta 15%
  poolPerformanceUpsell: 0.125,  // hasta 12.5%

  // Casuísticas principales
  casos: {
    boOriginaYCierra: { marketing: 0.025, bo: 0.025, boPerformance: 0.15, gc: 0, referral: 0 },
    gcOriginaYCierra: { comisionGC: 0.075, sinTope: true },
    boOriginaGcCierra: { marketing: 0.025, bo: 0.025, boOrigen: 0.075, gcSegunEsquema: true },
    referralConGcCierre: { marketing: 0.025, ownership: 0.025, referral: 0.075, gcSegunEsquema: true },
    upsellPorOperaciones: { operaciones: 0.10, residualidad: 0.025, ownership: 0.025, holdback: 0.025 },
    upsellPorGC: { gc: 0.075, operaciones: 0.05, ownership: 0.025, holdback: 0.025 },
  },

  // Esquema GC operativo (mes 4+)
  gcOperativo: {
    fijoMensual: 2500000,
    targetMensual: 50000000,
    topeSalarialMensual: 6250000,
    umbrales: [
      { min: 0, max: 0.59, comision: 0 },
      { min: 0.60, max: 1.0, comision: 0.075 },
      { min: 1.01, max: Infinity, comision: "overachievement" },
    ],
    newBusinessOriginadoPorGC: 0.075,
  },

  referralPasivo: { comision: 0.075, alcance: "primer cobro" },
  referralActivo: { comision: 0.15, alcance: "según participación efectiva" },
};
