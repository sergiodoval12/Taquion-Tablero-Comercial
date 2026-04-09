import { COLORS } from "../../data/constants.js";

export default function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = color || (pct >= 100 ? COLORS.green : pct >= 70 ? COLORS.warning : COLORS.red);
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: COLORS.dark, fontWeight: 500 }}>{label}</span>
        <span style={{ color: barColor }}>{pct.toFixed(0)}%</span>
      </div>}
      <div style={{ height: 8, background: COLORS.lightGray, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: barColor, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}
