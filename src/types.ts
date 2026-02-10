


export interface PaymentMovement {
  id: string;
  paymentId: string;
  memberName: string;
  memberDni: string;
  sportName: string;
  quoteName: string;
  movementType: MOVEMENT_TYPE;
  previousStatus?: PAYMENT_STATUS;
  newStatus: PAYMENT_STATUS;
  amount: number;
  partialAmount?: number;
  timestamp: string;
  notes?: string;
  userId?: string;
  userName?: string;
}

/* export interface PaymentGeneration {
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
} */

export interface PaymentFilter {
  memberName: string;
  memberDni: string;
  sport: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  type: string;
}

export interface MovementFilter {
  memberName: string;
  memberDni: string;
  sport: string;
  movementType: string;
  dateFrom: string;
  dateTo: string;
  type: string;
}


export interface User {
  email: string;
  password: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export enum MOVEMENT_TYPE {
  CREATED = 'created',
  PARTIAL_PAYMENT = 'partial_payment',
  FULL_PAYMENT = 'full_payment',
  STATUS_CHANGE = 'status_change',
  AMOUNT_MODIFIED = 'amount_modified',
  REVERTED = 'reverted',
}