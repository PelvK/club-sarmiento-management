// utils.ts
import { AppTextProps, Variant } from "./types";

export function getVariantTag(variant?: Variant): keyof JSX.IntrinsicElements {
  switch (variant) {
    case "H1": return "h1";
    case "H2": return "h2";
    case "H3": return "h3";
    case "L1":
    case "L2":
    case "L3": return "span";
    case "T1":
    case "T2":
    case "T3": return "span";
    case "P1":
    case "P2":
    case "P3": return "p";
    default: return "span";
  }
}

export function getVariantClass(variant?: Variant): string {
  switch (variant) {
    case "H1": return "app-text-h1";
    case "H2": return "app-text-h2";
    case "H3": return "app-text-h3";
    case "L1": return "app-text-label-large";
    case "L2": return "app-text-label-medium";
    case "L3": return "app-text-label-small";
    case "T1": return "app-text-title-large";
    case "T2": return "app-text-title-medium";
    case "T3": return "app-text-title-small";
    case "P1": return "app-text-body-large";
    case "P2": return "app-text-body-medium";
    case "P3": return "app-text-body-small";
    default: return "";
  }
}

export function getFontWeight(weight?: AppTextProps["weight"]): React.CSSProperties["fontWeight"] {
  if (!weight) return undefined;
  if (weight === "bold") return 700;
  if (weight === "normal") return 400;
  return weight;
}
