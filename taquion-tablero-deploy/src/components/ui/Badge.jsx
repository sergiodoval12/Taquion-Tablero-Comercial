export default function Badge({ text, color }) {
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: color + "20", color: color, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {text}
    </span>
  );
}
