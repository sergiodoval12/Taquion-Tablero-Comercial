import { STAGE_COLORS } from "../../data/constants.js";
import Badge from "./Badge.jsx";

export default function StageIndicator({ stage }) {
  return <Badge text={stage} color={STAGE_COLORS[stage] || "#6B7280"} />;
}
