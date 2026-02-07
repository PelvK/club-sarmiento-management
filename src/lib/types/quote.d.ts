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
}

export type PaymentBreakdown = {
  // Socios sin disciplinas (solo societaria)
  onlySocietaryCount: number;
  onlySocietaryAmount: number;
  
  // Disciplinas principales (con societaria incluida)
  principalSportsCount: number;
  principalSportsAmount: number;
  
  // Disciplinas secundarias (sin societaria)
  secondarySportsCount: number;
  secondarySportsAmount: number;
  
  // Totales
  totalPayments: number;
  totalAmount: number;
}