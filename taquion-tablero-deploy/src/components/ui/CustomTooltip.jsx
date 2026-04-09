import { COLORS } from "../../data/constants.js";
import { fmtM } from "../../utils/formatters.js";

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div style={{ background: "white", border: "1px solid " + COLORS.lightGray, borderRadius: 8, padding: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color }}>{p.name}: {fmtM(p.value)}</div>
      ))}
    </div>
  );
}
