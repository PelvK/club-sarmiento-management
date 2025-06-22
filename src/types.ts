export interface Quote {
  id?: string;
  name: string;
  price: number;
  description: string;
  duration: number; // in months
  participants?: number;
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  quotes?: Quote[];
  selectedQuote?: Quote; //this is used in details member modal
  isPrincipal? : boolean;
  quoteId?: string /** @TODO refactor in the future, this is used in the edit modal */
  quoteName?: string /** @TODO refactor in the future, this is used in the view more modal */
}

export interface Member {
  id: string,
  dni: string,
  name: string,
  second_name: string,
  birthdate: string,
  active?: boolean,
  phone_number?: string,
  email?: string,
  sports?: Sport[],
  sports_submit?: SportSelection[],
  societary_cuote?: Quote,
  familyGroupStatus?: FAMILY_STATUS
  familyHeadId?: string,
}

export interface Payment {
  id: string;
  memberId: string;
  memberName?: string;
  sportId: string;
  sportName?: string;
  quoteId: string;
  quoteName?: string;
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

export interface PartialPayment {
  id: string;
  amount: number;
  paidDate: string;
  notes?: string;
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

export interface PaymentFilter {
  member: string;
  sport: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  type: string;
}

export interface GenerationConfig {
  month: number;
  year: number;
  includeSocietary: boolean;
  selectedMembers: string[];
  selectedSports: string[];
  notes: string;
  customAmounts: Record<string, number>;
}

export interface Payment {
  id: string;
  memberId: string;
  sportId: string;
  quoteId: string;
  amount: number;
  status: PAYMENT_STATUS ;
  dueDate: string;
  paidDate?: string;
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

export interface SportSelection {
  id: string;
  isPrimary: boolean;
  quoteId?: string;
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

export enum FAMILY_STATUS {
  HEAD = 'HEAD',
  MEMBER = 'MEMBER',
  NONE = 'NONE'
}