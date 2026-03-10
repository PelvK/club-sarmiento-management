/**
 * Quote type definition
 */
export type Quote = {
  /** Unique identifier for the quote */
  id: number;
  /** Name of the quote */
  name: string;
  /** Price of the quote */
  price: number;
  /** Description of the quote */
  description: string;
  /** Duration of the quote - in months */
  duration: number;
  /** Number of participants for the quote */
  participants?: number;
}

export type GenerationConfig = {
  month: number;
  year: number;
  includeSocietary: boolean; // Si generar cuotas para socios sin disciplinas
  includeNonPrincipalSports: boolean; // Si generar cuotas deportivas secundarias
  selectedMembers: number[];
  selectedSports: number[];
  notes: string;
  customAmounts: Record<string, number>;
  generatedBy?: string | null; // ID del usuario que genera las cuotas
  revertedBy?: string | null; // ID del usuario que revierte la generación
  revertedDate?: string | null; // Fecha de reversión
  customAdditions?: CustomAddition[]; // <-- NUEVO
}

// ─── Agregar estas definiciones al archivo lib/types/quote.ts ───

export interface CustomAddition {
  id: string;               // UUID local, solo frontend
  description: string;
  amount: number;
  type: "NORMAL" | "VENCIMIENTO";
}

// Agregar el campo customAdditions a GenerationConfig:
// customAdditions?: CustomAddition[];
//
// Ejemplo de GenerationConfig actualizado:
//
// export interface GenerationConfig {
//   month: number;
//   year: number;
//   includeSocietary: boolean;
//   selectedMembers: number[];
//   selectedSports: number[];
//   notes: string;
//   customAmounts: Record<string, number>;
//   includeNonPrincipalSports: boolean;
//   customAdditions?: CustomAddition[];   // <-- NUEVO
//   generatedBy?: string;
// }