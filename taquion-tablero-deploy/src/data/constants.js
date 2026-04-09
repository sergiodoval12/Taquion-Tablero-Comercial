// ═══════════════════════════════════════════════════════════════
// TABLERO COMERCIAL — GRUPO TAQUION
// Constantes de diseño y configuración
// ═══════════════════════════════════════════════════════════════

export const COLORS = {
  dark: "#1A1A2E",
  accent: "#E94560",
  light: "#F5F5F5",
  blue: "#0F3460",
  teal: "#16C79A",
  warning: "#F5A623",
  orange: "#E8751A",
  purple: "#7C3AED",
  green: "#10B981",
  red: "#EF4444",
  gray: "#6B7280",
  lightGray: "#E5E7EB",
};

export const CHART_COLORS = [
  "#E94560", "#0F3460", "#16C79A", "#F5A623", "#7C3AED",
  "#E8751A", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B",
];

export const STAGE_COLORS = {
  Commit: "#10B981",
  Forecast: "#3B82F6",
  Upside: "#F5A623",
  Pipeline: "#6B7280",
};

export const STAGE_ORDER = { Commit: 0, Forecast: 1, Upside: 2, Pipeline: 3 };

export const TABS = [
  { id: "resumen", label: "Resumen Ejecutivo", icon: "+" },
  { id: "revenue", label: "Revenue & Quarters", icon: "$" },
  { id: "cuentas", label: "Cuentas & Industrias", icon: "#" },
  { id: "pipeline", label: "Pipeline & Funnel", icon: ">" },
  { id: "equipo", label: "Equipo Comercial", icon: "*" },
  { id: "alertas", label: "Alertas & Upselling", icon: "!" },
];
