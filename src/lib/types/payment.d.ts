import { PAYMENT_STATUS } from "../enums/PaymentStatus";
import { Member } from "./member";
import { Sport } from "./sport";

/**
 * Breakdown individual de un miembro en una cuota agrupada
 */
export type PaymentBreakdownItem = {
  id: number;
  memberId: number;
  memberRole: 'head' | 'dependent';
  societaryAmount: number;
  sportAmount: number;
  memberNameSnapshot: string;
  sportNameSnapshot?: string;
};

/**
 * Pago parcial realizado sobre una cuota
 */
export type PartialPayment = {
  id: number;
  paymentId: number;
  amount: number;
  paidDate: string;
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other';
  notes?: string;
  createdAt: string;
};

/**
 * Cuota individual (representa un comprobante físico)
 */
export type Payment = {
  id: number;
  generationId: string;
  member: Member;
  
  // Período
  month: number;
  year: number;
  dueDate: string;
  
  // Tipo y deporte
  type: 'societary-only' | 'principal-sport' | 'secondary-sport';
  sport?: Sport;
  
  // Montos
  amount: number;
  description: string;
  
  // Estado de pago
  status: PAYMENT_STATUS;
  paidDate?: string;
  paidAmount: number;
  
  // Breakdown (si es cuota agrupada)
  breakdown?: PaymentBreakdownItem[];
  
  // Pagos parciales
  partialPayments?: PartialPayment[];
  
  // Notas
  notes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
};

/**
 * Estadísticas de una generación
 */
export type PaymentGenerationStats = {
  onlySocietaryCount: number;
  onlySocietaryAmount: number;
  principalSportsCount: number;
  principalSportsAmount: number;
  secondarySportsCount: number;
  secondarySportsAmount: number;
};

/**
 * Generación de cuotas (metadata)
 */
export type PaymentGeneration = {
  id: string;                                       // gen-2024-04
  month: number;
  year: number;
  generatedDate: string;
  generatedBy?: string;
  status: 'active' | 'reverted';
  revertedDate?: string;
  revertedBy?: string;
  notes?: string;
  
  // Estadísticas
  totalPayments: number;
  totalAmount: number;
  stats: PaymentGenerationStats;
  
  // Configuración usada (opcional)
  configSnapshot?: any;                             // GenerationConfig serializado
};

/**
 * Respuesta de la API al generar cuotas
 */
export type GeneratePaymentsResponse = {
  generation: PaymentGeneration;
  payments: Payment[];
  success: boolean;
  message?: string;
};

/**
 * Filtros para consultar cuotas
 */
export type PaymentFilter = {
  generationId?: string;
  memberId?: number;
  memberName?: string;
  memberDni?: string;
  sportId?: number;
  status?: PAYMENT_STATUS | '';
  type?: 'societary-only' | 'principal-sport' | 'secondary-sport' | '';
  month?: number;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Resumen de pagos para dashboard
 */
export type PaymentSummary = {
  total: number;
  pending: number;
  partial: number;
  paid: number;
  cancelled: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
};

