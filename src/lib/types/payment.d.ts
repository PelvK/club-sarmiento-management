import { PAYMENT_STATUS, PAYMENT_TYPE } from "../enums/PaymentStatus";
import { Member } from "./member";
import { Sport } from "./sport";


export interface BreakdownItem {
  type: BREAKDOWN_TYPE;                    // societary | principal-sport | secondary-sport
  memberId: number;                        // ID del miembro al que pertenece este item
  memberName: string;                      // Nombre completo (snapshot)
  concept: string;                         // "Cuota Societaria" | "Fútbol" | "Tenis"
  description?: string;                    // Descripción adicional opcional
  amount: number;                          // Monto de ESTE item específico
}

export interface PreviewData {
  onlySocietaryCount: number;
  onlySocietaryAmount: number;
  principalSportsCount: number;
  principalSportsAmount: number;
  secondarySportsCount: number;
  secondarySportsAmount: number;
  totalPayments: number;
  totalAmount: number;
  breakdown: MemberPaymentBreakdown[];     // Por miembro en la preview
}

/**
 * Pago parcial realizado sobre una cuota
 * @TODO feat/partial_payments no interesa pagos parciales aun
 */

/* export type PartialPayment = {
  id: number;
  paymentId: number;
  amount: number;
  paidDate: string;
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other';
  notes?: string;
  createdAt: string;
};
 */

export interface Payment {
  id: number;
  generationId: string;
  member: Member;
  month: number;
  year: number;
  dueDate: string;
  type: PAYMENT_TYPE;
  sport?: Sport;
  amount: number;
  description: string;
  status: PAYMENT_STATUS;
  paidDate?: string;
  paidAmount: number;
  breakdown?: BreakdownItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export interface MemberPaymentBreakdown {
  member: Member;
  payments: {
    type: PAYMENT_TYPE;
    sportId?: number;
    sportName?: string;
    amount: number;
    description: string;
    breakdown: {
      items: BreakdownItem[];              // Lista plana de items
      total: number;                       // Suma de items
    };
  }[];
  totalAmount: number;
}


/**
 * Generación de cuotas (metadata)
 */
export interface PaymentGeneration {
  id: string;                              // gen-2024-04
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
  stats: {
    onlySocietaryCount: number;
    onlySocietaryAmount: number;
    principalSportsCount: number;
    principalSportsAmount: number;
    secondarySportsCount: number;
    secondarySportsAmount: number;
  };
  configSnapshot?: unknown;                // GenerationConfig serializado
}

/**
 * Respuesta de la API al generar cuotas
 */
export interface GeneratePaymentsResponse {
  generation: PaymentGeneration;
  payments: Payment[];
  success: boolean;
  message?: string;
}

/**
 * Filtros para consultar cuotas
 */
export interface PaymentFilter {
  generationId?: string;
  memberId?: number;
  memberName?: string;
  memberDni?: string;
  sportId?: number;
  status?: PAYMENT_STATUS | '';
  type?: PAYMENT_TYPE | '';
  month?: number;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Resumen de pagos para dashboard
 */
export interface PaymentSummary {
  total: number;
  pending: number;
  partial: number;
  paid: number;
  cancelled: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

