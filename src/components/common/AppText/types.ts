// types.ts
import React from "react";

export type Variant =
  | "H1"
  | "H2"
  | "H3"
  | "L1"
  | "L2"
  | "L3"
  | "P1"
  | "P2"
  | "P3"
  | "T1"
  | "T2"
  | "T3";

export interface AppTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: Variant;
  weight?: "normal" | "bold" | 400 | 500 | 600 | 700 | 800 | 900;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // Para override del tag si hace falta
}
