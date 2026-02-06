import { PAYMENT_STATUS } from "@src/lib/enums/PaymentStatus";
import { Member } from "./member";
import { Sport } from "./sport";

export type PartialPayment = {
  id: number;
  paymentId: number;
  amount: number;
  paidDate: string;
  notes?: string;
}

export type Payment = {
  id: number;
  member: Member;
  sport: Sport;
  amount: number;
  status: PAYMENT_STATUS;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  tags?: string[];
  type: 'sport' | 'societary';
  generationId?: string;
  partialPayments?: PartialPayment[];
}

export interface PaymentGeneration {
  id: string;
  month: number;
  year: number;
  generatedDate: string;
  totalAmount: number;
  totalPayments: number;
  status: 'active' | 'reverted';
  notes?: string;
  breakdown: {
    sportPayments: number;
    societaryPayments: number;
    totalSportAmount: number;
    totalSocietaryAmount: number;
  };
}
