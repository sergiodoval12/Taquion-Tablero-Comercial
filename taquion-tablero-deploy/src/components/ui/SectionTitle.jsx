import { COLORS } from "../../data/constants.js";

export default function SectionTitle({ children }) {
  return <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.dark, margin: "32px 0 16px", borderBottom: "2px solid " + COLORS.accent, paddingBottom: 8 }}>{children}</h2>;
}
