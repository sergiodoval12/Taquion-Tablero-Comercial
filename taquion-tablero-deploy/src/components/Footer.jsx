import { COLORS } from "../data/constants.js";

export default function Footer() {
  return (
    <div style={{ padding: "16px 32px", textAlign: "center", fontSize: 11, color: COLORS.gray, borderTop: "1px solid " + COLORS.lightGray }}>
      Tablero Comercial Taquion | Datos desde Notion CRM | Target Anual: $4,200M ARS | Modelo Comercial MVP 2026
    </div>
  );
}
