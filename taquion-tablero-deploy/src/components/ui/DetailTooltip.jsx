import { COLORS, STAGE_COLORS } from "../../data/constants.js";
import { fmtM } from "../../utils/formatters.js";

/**
 * Rich tooltip that shows a breakdown of items composing a bar value.
 * Pass `details` array in the chart data item: [{nombre, total, stage?}]
 * Falls back to the standard value display if no details present.
 */
export default function DetailTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0]?.payload; // the full data object from the chart
  const details = entry?._details;

  return (
    <div style={{
      background: "white",
      border: "1px solid " + COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      maxWidth: 340,
      maxHeight: 320,
      overflowY: "auto",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, color: COLORS.dark }}>
        {label || entry?.name}
      </div>

      {/* Standard values from recharts payload */}
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color, fontWeight: 600, marginBottom: details ? 8 : 2 }}>
          {p.name}: {fmtM(p.value)}
        </div>
      ))}

      {/* Detail breakdown if available */}
      {details && details.length > 0 && (
        <div style={{ borderTop: "1px solid " + COLORS.lightGray, paddingTop: 6, marginTop: 2 }}>
          <div style={{ fontSize: 10, color: COLORS.gray, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Compuesto por:
          </div>
          {details.map((d, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              padding: "3px 0",
              fontSize: 12,
              borderBottom: i < details.length - 1 ? "1px solid " + COLORS.lightGray + "80" : "none",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: COLORS.dark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                  {d.nombre}
                </span>
              </div>
              {d.stage && (
                <span style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: (STAGE_COLORS[d.stage] || COLORS.gray) + "20",
                  color: STAGE_COLORS[d.stage] || COLORS.gray,
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}>
                  {d.stage}
                </span>
              )}
              <span style={{ fontWeight: 600, whiteSpace: "nowrap", color: COLORS.dark }}>
                {fmtM(d.total)}
              </span>
            </div>
          ))}
          {entry?._moreCount > 0 && (
            <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4, fontStyle: "italic" }}>
              + {entry._moreCount} mas...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
