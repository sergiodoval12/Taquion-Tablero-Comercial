// ─── EQUIPO COMERCIAL (Actualizado 2026-05-18) ──────────────────
// Roles corregidos según estructura real de Taquion:
// - Diego Kupferberg es el UNICO Gerente Comercial (GC)
// - Sergio Doval = CEO
// - Sol Rios Brinatti = COO
// - Diego Lajst = COO
// - Ciro Garcia Resta = Business Owner
// Target mensual GC: $50M (según modelo comercial Taquion)

// ─── EQUIPO COMERCIAL PRINCIPAL ──────────────────────────────
// Personas que integran la fuerza comercial directa de Taquion
export const COMERCIALES = [
  { nombre: "Sergio Doval", targetMensual: 50000000, role: "CEO", modelRole: "CEO", fijoMensual: 0, verticales: ["Hype / Public Affairs", "Entretenimiento / Deportes"] },
  { nombre: "Diego Lajst", targetMensual: 50000000, role: "COO", modelRole: "BO", fijoMensual: 0, verticales: ["Advisory Board"] },
  { nombre: "Diego Kupferberg", targetMensual: 50000000, role: "Gerente Comercial", modelRole: "GC", fijoMensual: 3500000, verticales: [] },
  { nombre: "Sol Rios Brinatti", targetMensual: 50000000, role: "COO", modelRole: "BO", fijoMensual: 0, verticales: [] },
  { nombre: "Martin Villanueva", targetMensual: 50000000, role: "Comercial", modelRole: "GC", fijoMensual: 0, verticales: [] },
  { nombre: "Julian Cordova", targetMensual: 50000000, role: "Comercial", modelRole: "GC", fijoMensual: 0, verticales: [] },
  { nombre: "Agustina Ferreyra", targetMensual: 50000000, role: "Comercial", modelRole: "GC", fijoMensual: 0, verticales: [] },
];

// ─── BUSINESS OWNERS & PHANTOM GCs ──────────────────────────
// BOs cobran 2.5% del revenue de su vertical
// Phantom GC cobra comisión por deal sin ser full-time
export const BO_PHANTOM = [
  { nombre: "Pablo Juanes Roig", role: "Business Owner", modelRole: "BO", vertical: "Banca & Fintech", comisionPct: 2.5, status: "activo" },
  { nombre: "Ciro Garcia Resta", role: "Business Owner", modelRole: "BO", vertical: "Real Estate / Urbanismo", comisionPct: 2.5, status: "activo" },
  { nombre: "Mariana Gallo Sacerdote", role: "Business Owner", modelRole: "BO", vertical: "Consumo Masivo", comisionPct: 2.5, status: "activo" },
  { nombre: "Matías Fermín", role: "Phantom GC", modelRole: "GC", vertical: "Banca & Fintech", comisionPct: 7.5, status: "activo" },
  { nombre: "Eugenio Gigena", role: "Business Owner", modelRole: "BO", vertical: "por asignar", comisionPct: 2.5, status: "activo" },
];

// ─── TODOS LOS COMERCIALES (para selectors y búsquedas) ─────
export const TODOS_COMERCIALES = [...COMERCIALES, ...BO_PHANTOM];

// Asignación de Business Owners a verticales (actualizado 27/04/2026)
export const BO_VERTICALES = {
  "Pablo Juanes Roig": { vertical: "Banca & Fintech", status: "activo" },
  "Ciro Garcia Resta": { vertical: "Real Estate / Urbanismo", status: "activo" },
  "Mariana Gallo Sacerdote": { vertical: "Consumo Masivo", status: "activo" },
  "Matías Fermín": { vertical: "Banca & Fintech (Phantom GC)", status: "activo" },
  "Eugenio Gigena": { vertical: "por asignar", status: "activo" },
};

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
