import { COLORS } from "../../data/constants.js";

export default function KPICard({ title, value, subtitle, color }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", borderLeft: "4px solid " + (color || COLORS.accent), boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 12, color: COLORS.gray, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.dark }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: color || COLORS.gray, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}
