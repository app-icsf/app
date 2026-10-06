import Pill from "./Pill";

// Insignia de nivel de acreditación (Certified/Master/Fellow/MCC) leída del catálogo `Tier` en BD.
export default function TierBadge({ tier, className = "" }: { tier: { name: string; colorKey: string } | null | undefined; className?: string }) {
  if (!tier) return null;
  return <Pill tone={tier.colorKey === "tertiary" ? "amber" : "secondary"} className={className}>{tier.name}</Pill>;
}
